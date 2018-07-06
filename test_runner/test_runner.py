# coding=utf-8
import json, os, zipfile, asyncio, pytest, shutil, threading
base_dir = "tests/test"

class ProgressPlugin:
    def __init__(self, redis, uid):
        self.redis = redis
        self.uid = uid
        self.ran = 0
        self.outcome = {'pass': 0, 'skip': 0, 'fail': 0, 'total': 0}
        self.total = 0
        self.collected = 0
        self.tests = {}

    def calc_status(self):
        stat = int(round((1.0*self.ran)/(1.0*self.total) * 50))
        return stat

    def pytest_itemcollected(self, item):
        self.collected += 1
        self.redis.set("status_" + self.uid, json.dumps({'message': "Collecting test items.. (" + str(self.collected) + ")",
                                                         'progress': 40}))

    def pytest_collection_finish(self, session):
        self.total = len(session.items)
        self.redis.set("status_" + self.uid, json.dumps({'message': "Collected " + str(self.total) + " tests.",
                                                         'progress': 50}))

    def pytest_runtest_logreport(self, report):

        self.redis.set("status_" + self.uid, json.dumps({'message': "Running tests.. (" +str(self.ran)+"/" + str(self.total) + ")",
                                                         'progress': 50 + self.calc_status()}))
        if report.passed and report.when == "call":
            self.outcome['pass'] += 1
            self.ran += 1
            self.tests[self.ran - 1] = {'name': os.path.basename(report.fspath), 'log': report.longreprtext,
                                        'result': report.outcome,
                                        'duration': round(getattr(report, 'duration', 0.0), 3)}
        elif report.failed:
            self.outcome['fail'] += 1
            self.ran += 1
            self.tests[self.ran - 1] = {'name': os.path.basename(report.fspath), 'log': report.longreprtext,
                                        'result': report.outcome,
                                        'duration': round(getattr(report, 'duration', 0.0), 3)}
        elif report.skipped:
            self.outcome['skip'] += 1
            self.ran += 1
            self.tests[self.ran - 1] = {'name': os.path.basename(report.fspath), 'log': report.longreprtext,
                                        'result': report.outcome,
                                        'duration': round(getattr(report, 'duration', 0.0), 3)}

    def pytest_sessionfinish(self, session, exitstatus):
        self.redis.set("status_" + self.uid, json.dumps({'message': "Done!",
                                   'progress': 100, 'state': 'done'}))
        self.outcome['total'] = self.total
        self.redis.set("results_" + self.uid, json.dumps(self.outcome))
        self.redis.set("results_" + self.uid + "_tests", json.dumps(self.tests))

def set_status(redis, uid, message="", progress=0, state="running"):
    redis.set("status_" + uid, json.dumps({'message': message,
                                'progress': progress,
                                'state': state}) )

async def run_tests(uid, redis, path):
    set_status(redis, uid, "Unpacking zip file..", 5)
    dir = os.path.abspath(base_dir+uid+'/')
    await asyncio.sleep(2)
    if not os.path.exists(dir):
        os.makedirs(dir)
    with zipfile.ZipFile(path, "r") as zip:
        #zip.extractall(dir)
        #the following method eliminates all subdirectories, this needs to be reviewed
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
        set_status(redis, uid, "Extracted " + str(len(zip.namelist())) + " file(s).", 10)
    await asyncio.sleep(1)
    set_status(redis, uid, "Running pytest..", 20)
    abs_path = os.path.abspath("vvp-validation-scripts/ice_validator/")
    print("Starting pytest on scripts in: " + abs_path)
    pp = ProgressPlugin(redis, uid)
    #example:
    #pytest vvp-validation-scripts/ice_validator/ --tap-stream --template-directory=/home/nacho/clearwater-onap --html=report.html --self-contained-html
    thread = threading.Thread(target=pytest.main, kwargs={'args': [abs_path, '-p', 'no:terminal',
                                                                   '--template-directory=' + dir+'/',
                                                                   '--html='+dir+'/report.html',
                                                                   '--self-contained-html'],
                                                          'plugins': [pp]})
    thread.start() #run in another thread or it blocks our eventloop