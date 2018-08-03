# coding=utf-8
import json, os, zipfile, asyncio, pytest, shutil, threading

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

    def pytest_sessionfinish(self, session, exitstatus):
        self.rl.set_status("Done!", 100, 'done')
        self.outcome['total'] = self.total
        self.rl.set_result(self.outcome)


async def run_tests(uid, path):
    rl = RedisRun(uid)
    rl.set_status("Unpacking zip file..", 5)
    dir = os.path.abspath(base_dir+uid+'/')
    await asyncio.sleep(2)
    if not os.path.exists(dir):
        os.makedirs(dir)
    with zipfile.ZipFile(path, "r") as zip:
        #zip.extractall(dir)
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
    await asyncio.sleep(1)
    asyncio.gather(__do_run(rl, uid, dir))


async def __do_run(rl, uid, dir):
    rl.set_status("Running pytest..", 20)
    abs_path = os.path.abspath("vvp-validation-scripts/ice_validator/")
    print("Starting pytest on scripts in: " + abs_path)
    pp = ProgressPlugin(rl, uid)
    # example:
    # pytest vvp-validation-scripts/ice_validator/ --tap-stream --template-directory=/home/nacho/clearwater-onap --html=report.html --self-contained-html
    thread = threading.Thread(target=pytest.main, kwargs={'args': [abs_path, '-p', 'no:terminal',
                                                                   '--template-directory=' + dir + '/',
                                                                   '--html=' + dir + '/report.html',
                                                                   '--self-contained-html'],
                                                          'plugins': [pp]})
    # run in another thread or it blocks our eventloop
    thread.start()