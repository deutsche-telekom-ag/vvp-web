# coding=utf-8

from sanic import Sanic, exceptions, response
from jinja2 import Environment, PackageLoader

import os, uuid, json, asyncio
from utils import test_runner
from utils.git_provision import *
from utils.redis_layer import RedisRun, RedisGit, RedisId

from utils import redis_layer

app = Sanic(__name__)
env = Environment(loader=PackageLoader('app', 'templates'), trim_blocks=True)

upload_dir = "./uploads"
git_repo_dir = "./git"
app.static('/static', './static')


@app.route('/')
async def index(request):
    template = env.get_template('index.html')
    html = template.render()
    return response.html(html)


@app.route("/upload", methods=['POST'])
async def upload_file(request):
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)

    extension = os.path.splitext(request.files["file"][0].name)[1]
    if extension != '.zip':
        return response.json(False, 400)

    unique_id = str(uuid.uuid4())
    path = upload_dir + "/" + unique_id + "_" + request.files["file"][0].name
    f = open(path, "wb")
    f.write(request.files["file"][0].body)
    f.close()

    RedisRun(unique_id).set_path(path)
    print("Stored file '" + path + "' as: " + unique_id)
    return response.json({'image_url': '/static/images/zip-file_graphical.svg',
                          'uid': unique_id})


@app.route("/next/<uuid>", methods=['GET', 'POST'])
async def process_heat(request, uuid):
    rl = RedisRun(uuid)
    path = rl.get_path()
    if path:
        path = os.path.abspath(path)
        print(path)
        rl.set_status("Starting test run..", 1, "running")
        # TODO: Maybe take path out of this later on as its not required
        asyncio.ensure_future(test_runner.run_tests(uuid, path))
    else:
        return response.html(env.get_template('error.html').render(error="Could not find uuid."))
    return response.html(env.get_template('progress.html').render(uid=uuid))


@app.route("/status/<uuid>", methods=['GET'])
async def return_status(request, uuid):
    status = RedisRun(uuid).get_status()
    print(status)
    if not status:
        return response.json(False, 500)
    return response.json(status)


@app.route("/result/<uuid>", methods=['GET', 'POST'])
async def show_results(request, uuid):
    rl = RedisRun(uuid)
    res = rl.get_result()
    tests = rl.get_tests()
    if not res:
        return response.html(env.get_template('error.html').render(error="Could not find test results for uuid."))
    return response.html(env.get_template('results.html').render(result=res, items=tests))


@app.route("/delete/<uuid>", methods=['POST'])
async def upload_file(request, uuid):
    path = RedisRun(uuid).get_path()
    if not uuid or not path:
        print("Error: Could not get uuid '" + uuid + "' from Redis.")
        return response.json(False, 400)
    print("Deleting: '" + path + "' on user request.")
    os.remove(path)
    return response.json(True)


@app.route("/no_file_selected")
async def no_file_selected(request):
    template = env.get_template('error.html') #replace this with a nicer looking page later on
    html = template.render(error="No file selected.")
    return response.html(html)


@app.route("/git_init")  # TODO: Make this whole routine async as well.
async def git_init(request):
    v = create_repo()
    return response.json(v)


@app.route("/runs/<id>")
async def git_runs(request, id):
    return response.json(RedisGit(id).get_runs())


@app.route("/vincenthathunger/<id>")
async def run_result(request, id):
    return response.json(RedisRun(id).get_result())


@app.route("/commit/<id>")
async def git_commit(request, id):
    print("New commit in repo: " + id)
    unique_id = str(uuid.uuid4())
    print("Generated uuid for run: " + unique_id)
    return response.json(await checkout_repo(unique_id, id))


@app.route("/uuid/<id>")
async def get_uuid(request, id):
    v = RedisId(id).get()
    return response.json(v)

@app.exception(exceptions.SanicException)
async def server_error(request, exception):
    template = env.get_template('error.html')
    html = template.render(error=str(exception))
    return response.html(html)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8913, workers=2)
