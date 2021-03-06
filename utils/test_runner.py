# coding=utf-8

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

import json, os, zipfile, asyncio, pytest, shutil, threading

from utils import async_exec
from utils.redis_layer import RedisRun

base_dir = "tests/test"

class ProgressPlugin:
    def __init__(self, redis_layer: RedisRun, uid):
        self.rl = redis_layer
        self.uid = uid
        self.ran = 0
        self.outcome = {'pass': 0, 'skip': 0, 'fail': 0, 'total': 0}
        self.total = 0
        self.collected = 0

    def calc_status(self):
        stat = int(round((1.0*self.ran)/(1.0*self.total) * 50))
        return stat

    def calc_dur(self, report):
        return round(getattr(report, 'duration', 0.0), 3)

    def pytest_itemcollected(self, item):
        self.collected += 1
        self.rl.set_status("Collecting test items.. (" + str(self.collected) + ")", 40)

    def pytest_collection_finish(self, session):
        self.total = len(session.items)
        self.rl.set_status("Collected " + str(self.total) + " tests.", 50)

    def pytest_runtest_logreport(self, report):

        self.rl.set_status("Running tests.. (" + str(self.ran) + "/" + str(self.total) + ")", 50 + self.calc_status())

        if report.passed and report.when == "call":
            self.outcome['pass'] += 1
            self.ran += 1
            self.rl.add_test(os.path.basename(report.fspath), report.longreprtext, report.outcome,
                             self.calc_dur(report))
            # TODO: repetitions of this need to be reviewed.

        elif report.failed:
            self.outcome['fail'] += 1
            self.ran += 1
            self.rl.add_test(os.path.basename(report.fspath), report.longreprtext, report.outcome,
                             self.calc_dur(report))

        elif report.skipped:
            self.outcome['skip'] += 1
            self.ran += 1
            self.rl.add_test(os.path.basename(report.fspath), report.longreprtext, report.outcome,
                             self.calc_dur(report))

        # update outcome with every test so it can be displayed on the repo page..
        self.outcome['total'] = self.total
        self.rl.set_result(self.outcome)

        if self.ran >= self.total:
            self.rl.set_status("Done!", 100, 'success')

    # stopped working, should probably be fixed sometime..
    # def pytest_sessionfinish(self, session, exitstatus):
    #    self.rl.set_status("Done!", 100, 'success')
    #    self.outcome['total'] = self.total
    #    self.rl.set_result(self.outcome)


async def run_tests(uid, path):
    rl = RedisRun(uid)
    if rl.get_status()['progress'] > 20 or 'is_git' in rl.get():
        return False
    elif rl.get_status()['progress'] <= 20 and 'is_git' not in rl.get():
        rl.set_status("Unpacking zip file..", 5)
        dir = os.path.abspath(base_dir + uid + '/')
        await asyncio.sleep(2)
        if not os.path.exists(dir):
            os.makedirs(dir)
        with zipfile.ZipFile(path, "r") as zip:
            # zip.extractall(dir)
            # TODO: the following method eliminates all subdirectories, this needs to be reviewed
            for member in zip.namelist():
                filename = os.path.basename(member)
                # skip directories
                if not filename:
                    continue

                # copy file (taken from zipfile's extract)
                source = zip.open(member)
                target = open(os.path.join(dir, filename), "wb")
                with source, target:
                    shutil.copyfileobj(source, target)
            rl.set_status("Extracted " + str(len(zip.namelist())) + " file(s).", 10)
            rl.set_path(dir)
    await asyncio.sleep(1)
    asyncio.ensure_future(__do_run(uid))


async def __do_run(uid):
    rl = RedisRun(uid).set_status("Running pytest..", 20)
    abs_path = os.path.abspath("vvp-validation-scripts/ice_validator/")
    # print("Starting pytest on scripts in: " + abs_path)
    dir = rl.get_path()
    pp = ProgressPlugin(rl, uid)
    # example:
    # pytest vvp-validation-scripts/ice_validator/ --tap-stream --template-directory=/home/nacho/clearwater-onap --html=report.html --self-contained-html
    print("Ensuring future of pytest.main..")
    print("dir= " + dir)
    asyncio.ensure_future(async_exec.thread_exec(target=pytest.main, kwargs={'args': [abs_path, '-p', 'no:terminal',
                                                                                      '--template-directory=' + dir + '/',
                                                                                      '--html=' + dir + '/report.html',
                                                                                      '--self-contained-html'],
                                                                             'plugins': [pp]}))
    print("__do_run end")
    # run in another thread or it blocks our eventloop
    # thread.start()
    #print("Thread started. (" + repr(thread) + ')')
