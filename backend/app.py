from flask import *
from werkzeug import secure_filename
import os
import urllib
import shutil
from functools import wraps
import requests

#image processing
from PIL import Image
# at&t m2x
from m2x.client import M2XClient
#logging
import logging
from logging.handlers import RotatingFileHandler

from ConfigParser import SafeConfigParser

parser = SafeConfigParser()
parser.read('config.ini')

client = M2XClient(key=parser.get('m2x', 'key'))
# pux m2x
device = client.device(parser.get('m2x','device'))

stream_recycle = device.stream('recycle')
stream_garbage = device.stream('garbage')
stream_trash = device.stream('trash')
stream_electronics = device.stream('electonics')
stream_unrecognized = device.stream('unrecognized')

UPLOAD_FOLDER = '/Users/bis/att/backend'
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'max-age=300'
    return response

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files['file']
        if file:
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            im = Image.open(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            im.save(os.path.join(app.config['UPLOAD_FOLDER'], 'image.jpg'))
            return recognize() #jsonify({"status": recognize()})
    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form action="" method=post enctype=multipart/form-data>
      <p><input type=file name=file>
         <input type=submit value=Upload>
    </form>
    '''


def recognize():
    # for testing
    url = "http://requestb.in/15uht0q1"
    # for production
    url = "https://api.theidplatform.com/1/recognition/image?include=entity"

    # get token
    data = {"grant_type":"client_credentials","client_id": parser.get('id','client'),"client_secret":parser.get('id','secret')}
    res = requests.post(url="https://identity.theidplatform.com/identity/token", data=data)
    token =  "Bearer " + res.json()['access_token']

    data = open('./image.jpg', 'rb').read()
    res = requests.post(url=url,
                        data=data,
                        headers={'Content-Type': 'application/octet-stream',
                        'Authorization': token})
    r = res.json()
    app.logger.info(r)

    try:
        description = r['included'][0]['attributes']['description']
        blockchain(description)
        if description.lower() in "trash":
            app.logger.info("Adding 1 point to a trash stream")
            stream_trash.add_value(1)
        elif description.lower() in "recycle":
            app.logger.info("Adding 1 point to a recycle stream")
            # TODO
            stream_recycle.add_value(1)
        elif description.lower() in "electronics":
            app.logger.info("Adding 1 point to an electonics stream")
            # TODO
            stream_electronics.add_value(1)
        elif description.lower() in "garbage":
            app.logger.info("Adding 1 point to a garbage stream")
            # TODO
            stream_garbage.add_value(i+1)
        return description

    except:
        app.logger.info("Adding 1 point to an unrecognized stream")
        # TODO
        stream_unrecognized.add_value(1)
        return "Unrecognized"

def blockchain(data):
        DATASTORE_KEY= parser.get('tierion','_key')
        url = 'https://tierion.com/form/submit'
        payload = {'_key': DATASTORE_KEY, 'data': data}
        # verify = false if there is a problem with the https certificate
        r = requests.post(url, data = payload, verify = False)
        app.logger.info(r.status_code)

if __name__ == '__main__':
        handler = RotatingFileHandler('foo.log', maxBytes=100000, backupCount=1)
        handler.setLevel(logging.INFO)
        app.logger.addHandler(handler)
        app.run(host="0.0.0.0", port = 5000, debug=True)
