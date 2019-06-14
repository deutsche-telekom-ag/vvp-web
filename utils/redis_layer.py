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

import redis, json, os

redis_host = "redis"  # docker alias
redis = redis.StrictRedis(host=redis_host, port=6379, db=0, decode_responses=True)

'''
Basic storage object layout:

'<UUID>': { 'path': "<upload_path>",
            'status': { 'message': "Blah..",
                        'progress': 1,
                        'state': "running" },
            'result': { 'pass': 0,
                        'skip': 0,
                        'fail': 0,
                        'total': 0 },
            'tests': { '<ID>': { 'name': "Test 0",
                                 'result': "fail",
                                 'duration': 0.01 },
                        ...
                     }
           }
'''


class RedisRun:
    uid = None
    __d = None

    def __init__(self, uid) -> None:
        super().__init__()
        self.uid = uid

    def __jsonify(self):
        return json.dumps(self.__d)

    def __reload(self):
        v = redis.get("run_" + self.uid)
        # print("Reload: " + repr(v))
        self.__d = json.loads(v) if v else {'path': None,
                        'status': {
                            'message': "unknown run uuid",
                            'progress': 0,
                            'state': "error",
                        },
                        'result': {
                            'pass': 0,
                            'skip': 0,
                            'fail': 0,
                            'total': 0
                        },
                        'tests': {}}
        return self.__d

    def __store(self):
        redis.set("run_" + self.uid, self.__jsonify())
        #print("Stored as run_"+self.uid)

    def set_path(self, path):
        self.__reload()
        self.__d['path'] = path
        #print("Set path: " + repr(self.__d))
        self.__store()
        return self

    def get_path(self):
        self.__reload()
        #print("get path: " + repr(self.__d))
        return self.__d['path']

    def set_status(self, message="", progress=0, state="running", ):
        self.__reload()
        self.__d['status'] = {'message': message, 'progress': progress, 'state': state}
        self.__store()
        return self

    def get_status(self):
        self.__reload()
        return self.__d['status']

    def set_result(self, result_dict):
        self.__reload()
        self.__d['result'] = result_dict
        self.__store()
        return self

    def get_result(self):
        self.__reload()
        return self.__d['result']

    def add_test(self, name, log, result, duration):
        self.__reload()
        c = len(self.__d['tests'])
        self.__d['tests'][c] = {'name': name, 'log': log, 'result': result, 'duration': duration}
        self.__store()

    def get_tests(self):
        self.__reload()
        return self.__d['tests']

    def get(self):
        self.__reload()
        return self.__d

    def set(self, key, val):
        self.__reload()
        self.__d[key] = val
        self.__store()
        return self


class RedisGit:
    uid = None
    __d = None

    def __init__(self, uid) -> None:
        super().__init__()
        self.uid = uid

    def __jsonify(self):
        return json.dumps(self.__d)

    def __reload(self):
        v = redis.get("git_" + self.uid)
        self.__d = json.loads(v) if v else {'runs': {}}

    def __store(self):
        redis.set("git_" + self.uid, self.__jsonify())

    def add_run(self, uid):
        self.__reload()
        c = len(self.__d['runs'])
        self.__d['runs'][c] = uid
        self.__store()

    def get_runs(self):
        self.__reload()
        return self.__d['runs']


class RedisId:
    uid = None
    __d = None

    def __init__(self, id) -> None:
        super().__init__()
        self.uid = id

    def __jsonify(self):
        return json.dumps(self.__d)

    def __reload(self):
        v = redis.get("_" + self.uid)
        self.__d = json.loads(v) if v else {}

    def __store(self):
        redis.set("_" + self.uid, self.__jsonify())

    def set_status(self, status):
        return self.set('status', status)

    def set_message(self, message):
        return self.set('message', message)

    def get_status(self):
        return self.get('status')

    def get_message(self):
        return self.get('message')

    def set(self, key_or_dict, val=None):
        self.__reload()
        if val is None and key_or_dict is not None:
            self.__d = key_or_dict
        else:
            self.__d[key_or_dict] = val
        self.__store()
        return self

    def get(self, key=None):
        self.__reload()
        if key is None:
            return self.__d
        return self.__d[key] if key in self.__d.keys() else None
