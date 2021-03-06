#  Developed by Nicholas Dehnen & Vincent Scharf.
#  Copyright (c) 2019 Deutsche Telekom Intellectual Property.
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#  http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.

import asyncio, uuid
from concurrent.futures import ThreadPoolExecutor

from utils.redis_layer import RedisId

process_pool = ThreadPoolExecutor(3)


async def subprocess_exec(args, id=None):
    # Create subprocess
    if id is None:
        exec_uuid = str(uuid.uuid1().hex)
    else:
        exec_uuid = id
    print(exec_uuid + " : subprocess_exec(" + ' '.join(args) + ")")
    r = RedisId(id).set_status('running').set_message("subprocess_exec(" + ' '.join(args) + ")")
    try:
        sout = serr = asyncio.subprocess.PIPE
        process = await asyncio.create_subprocess_exec(
            *args,
            # stdout must a pipe to be accessible as process.stdout
            stdout=sout,
            stderr=serr)
        # Wait for the subprocess to finish
        stdout, stderr = await process.communicate()
        # Return stdout
        d = {'status': 'success', 'message': 'target execution finished',
             'stdout': stdout.decode().strip(), 'stderr': stderr.decode().strip()}
        r.set(d)
        return d
    except Exception as e:
        d = {'status': 'error', 'message': 'uncaught exception starting subprocess', 'exception': repr(e)}
        r.set(d)
        return d


async def thread_exec(target, args=(), kwargs=None):
    exec_uuid = str(uuid.uuid1().hex)
    print(exec_uuid + " : thread_exec(" + ' '.join(args) + ' '.join(kwargs) + ")")
    RedisId(exec_uuid).set_status('starting').set_message("thread_exec(" + ' '.join(args) + ' '.join(kwargs) + ")")
    loop = asyncio.get_event_loop()
    asyncio.ensure_future(loop.run_in_executor(process_pool, __thread_exec_helper, *[target, args, kwargs, exec_uuid]))
    return exec_uuid


def __thread_exec_helper(target, args, kwargs, exec_uuid):
    print("hi")
    r = RedisId(exec_uuid).set_status('running')
    try:
        if not callable(target):
            r.set_status('error').set_message('target is not callable: ' + str(type(target)))
            return
        r.set_message("thread_exec(..) calling target")
        v = target(*args, **kwargs)
        r.set_message(" : target(..) finished.")
        r.set_status('success').set_message('target execution finished').set('return', repr(v))
    except Exception as e:
        print("Thread exec error! " + repr(e))
        r.set_status('error').set_message('uncaught exception in thread').set('exception', repr(e))
        return
