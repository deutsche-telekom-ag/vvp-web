import uuid, io, subprocess, asyncio, os
from uuid import UUID
from pexpect import pxssh

from utils import test_runner
from utils.redis_layer import RedisRun

base_dir = "tests/test"

GIT_HOSTNAME = "10.11.0.3"
GIT_USERNAME = "root"
GIT_PASSWORD = "git_sshd"


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
        s.login(GIT_HOSTNAME, GIT_USERNAME, GIT_PASSWORD)
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
        s.login(GIT_HOSTNAME, GIT_USERNAME, GIT_PASSWORD)
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
        s.sendline("echo \"wget 10.11.0.4:8913/commit/" + uid + " -O- > /dev/null\" > post-receive")
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


async def get_repo(run_uid, git_uid):
    proc = subprocess.Popen(['git', 'clone',
                             "http://" + GIT_HOSTNAME + "/git/" + git_uid,
                             base_dir + run_uid],
                            shell=False, cwd='/vvp-web')

    out, err = proc.communicate()
    status = proc.wait()
    if 'fatal' in out:
        return {'status': 'error', 'uid': git_uid, 'run': run_uid, 'log': [out, err]}
    else:
        rl = RedisRun(run_uid).set_path(os.path.abspath(base_dir + run_uid + '/'))
        # asyncio.ensure_future(test_runner.__do_run(rl, run_uid))
        print("Should ensure_future now!")
        return {'status': 'success', 'uid': git_uid, 'run': run_uid, 'log': [out, err]}
