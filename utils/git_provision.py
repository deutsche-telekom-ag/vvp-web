import functools
import uuid, io, subprocess, asyncio, os, json
from uuid import UUID
from pexpect import pxssh

from utils import test_runner, async_exec, redis_layer
from utils.redis_layer import RedisRun, RedisId, RedisGit

base_dir = "tests/test"

# Use docker host alias
SSHD_HOSTNAME = "ssh-daemon"
SSHD_USERNAME = os.environ["SSHD_USERNAME"]
SSHD_PASSWORD = os.environ["SSHD_PASSWORD"]


def create_repo():
    v = setup_repo()
    if type(v) is dict and v["status"] is "success":
        return setup_commit_hook(v["uid"])
    else:
        return v


def setup_repo():
    uid = str(uuid.uuid4())
    flog = io.BytesIO(b"")
    try:
        s = pxssh.pxssh()
        s.logfile = flog
        s.login(SSHD_HOSTNAME, SSHD_USERNAME, SSHD_PASSWORD)
        s.sendline("cd /git")
        s.prompt()
        s.sendline("mkdir " + uid + ".git")
        s.prompt()
        s.sendline("cd " + uid + ".git")
        s.prompt()
        s.sendline(
            "git init --bare --shared")  # https://stackoverflow.com/questions/7132606/how-can-i-allow-anonymous-push-to-a-git-repository-over-http
        s.prompt()
        s.sendline("touch git-daemon-export-ok")
        s.prompt()
        s.logout()
        flog.flush()
        return {'status': 'success', 'uid': uid, 'log': flog.getvalue().decode("utf-8")}
    except pxssh.ExceptionPxssh as e:
        flog.write(bytes(repr(e), 'utf-8'))
        flog.flush()
        return {'status': 'error', 'uid': None, 'log': flog.getvalue().decode("utf-8")}


def setup_commit_hook(uid):
    flog = io.BytesIO(b"")
    try:
        val = UUID(uid, version=4)
        if not str(val) == uid:
            raise ValueError
        s = pxssh.pxssh()
        s.logfile = flog
        s.login(SSHD_HOSTNAME, SSHD_USERNAME, SSHD_PASSWORD)
        s.sendline("cd /git")
        s.prompt()
        s.sendline("if [ -d \"./" + uid + ".git\" ]; then echo DIR_OKAY; fi")
        s.prompt()
        if b"DIR_OKAY" not in s.before:
            return {'status': 'error', 'uid': uid, 'message': "repo does not exist",
                    's.before': s.before,
                    'log': flog.getvalue().decode("utf-8")}
        s.sendline("cd " + uid + ".git/hooks")
        s.prompt()
        # s.sendline("cat <<EOF > post-receive")
        # s.sendline("wget 10.11.0.4:8913/commit/" + uid + " -qO- > /dev/null")
        # s.sendline('echo "== vvp-web ==\n"')
        # s.sendline('echo "')
        s.sendline("echo \"wget 10.11.0.4:8913/commit/" + uid + " -qO-\" > post-receive")
        s.prompt()
        s.sendline("chmod +x ./post-receive")
        s.prompt()
        s.logout()
        flog.flush()
        return {'status': 'success', 'uid': uid, 'log': flog.getvalue().decode("utf-8")}
    except ValueError:
        return {'status': 'error', 'uid': None, 'message': "not a valid uuid",
                'log': flog.getvalue().decode("utf-8")}
    except pxssh.ExceptionPxssh as e:
        flog.write(bytes(repr(e), 'utf-8'))
        flog.flush()
        return {'status': 'error', 'uid': None, 'log': flog.getvalue().decode("utf-8")}


async def checkout_repo(run_uuid, git_uuid):
    id = str(uuid.uuid1().hex)
    asyncio.ensure_future(async_exec.subprocess_exec(args=['git', 'clone',
                                                           "http://" + GIT_HOSTNAME + "/git/" + git_uuid,
                                                           base_dir + run_uuid], id=id))
    asyncio.ensure_future(run_after_checkout(id, run_uuid))
    RedisGit(git_uuid).add_run(run_uuid)
    return {'status': 'created', 'status_uuid': id, 'git_uuid': git_uuid, 'run_uuid': run_uuid}


async def run_after_checkout(id, run_uuid):
    v, c = None, 0
    # wait max 15 secs before assuming the checkout failed
    while v not in ['success', 'error']:
        try:
            v = RedisId(id).get('status')
        except Exception as e:
            return
        await asyncio.sleep(1)
        c = c + 1
        if c >= 15:
            err_msg = 'git checkout did not start, or did not finish within the maximum amount of time'
            RedisId(id).set_status('error').set_message(err_msg)
            RedisRun(run_uuid).set_status(err_msg, 100, 'error')
            return
    if v is 'error':
        RedisRun(run_uuid).set_status("Git checkout failed.", 100, 'error')
        return
    # checkout succeeded, start test run now
    print("Clone finished, getting latest commit hash..")
    p = os.path.abspath(base_dir + run_uuid + '/')
    try:
        d = await async_exec.subprocess_exec(args=["git", "--git-dir=" + p + "/.git", "rev-parse", "--short", "HEAD"],
                                             id="testing_git_commit")
        assert type(d) is dict
        if d['status'] is 'success':
            RedisRun(run_uuid).set('commit_hash', d['stdout'])
        else:
            RedisRun(run_uuid).set_status("Could not get commit hash!", 100, 'error')
    except Exception as e:
        RedisRun(run_uuid).set_status("Exception occurred while trying to get commit hash! (%s)" % repr(e), 100,
                                      'error')
        return
    print("Clone finished, should start test run now.")
    RedisRun(run_uuid).set_status("Cloned git repository..", 20, 'running').set_path(p).set('is_git', True)
    asyncio.ensure_future(test_runner.__do_run(run_uuid))
