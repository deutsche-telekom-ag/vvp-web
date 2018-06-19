from sanic import Sanic, exceptions, response
from jinja2 import Environment, PackageLoader
import redis
import uuid
import os.path

app = Sanic(__name__)
env = Environment(loader=PackageLoader('app', 'templates'),
                  trim_blocks=True)
redis = redis.StrictRedis(host='localhost', port=6379, db=0)

upload_dir = "./uploads"
app.static('/static', './static')


@app.route('/')
async def index(request):
    template = env.get_template('index.html')
    html = template.render()
    return response.html(html)


@app.route("/upload", methods=['POST'])
async def upload_file(request):
    from sanic import response
    import os
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)

    extension = os.path.splitext(request.files["file"][0].name)[1]
    if extension != '.zip':
        return response.json(False, 400)

    unique_id = str(uuid.uuid4())
    path = upload_dir + "/" + request.files["file"][0].name + unique_id
    f = open(path, "wb")
    f.write(request.files["file"][0].body)
    f.close()

    redis.set("ul_" + unique_id, path)
    print("Stored file '" + path + "' as: " + unique_id)
    return response.json({'imageUrl': '/static/images/zip-file_graphical.svg'})


@app.exception(exceptions.NotFound)
async def not_found(request, exception):
    template = env.get_template('error.html')
    html = template.render(error=repr(exception))
    return response.html(html)


if __name__ == '__main__':
    app.run(host='localhost', port=8000)
