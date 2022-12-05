from Flabstraction.Flabstraction import FlaskCFG, Pysqlalchemy, MailingService
from flask import Flask, jsonify
import time, random, pytz
from datetime import datetime, timedelta

app = Flask(__name__)



fcfg = FlaskCFG(app, "")
fcfg.config_cors( [ '*' ] )

staticPath = "/usr/share/nginx/html/plastfix_shop/"

mysql_pw = "3646633"
mysql_host = "localhost"
mysql_user = "root"
mysql_db = "CENTRAL_SHOP"

app = fcfg.get_app()
sql = Pysqlalchemy('mysql+pymysql', mysql_user, mysql_pw, mysql_host, mysql_db)
mail = MailingService()

def get_random():
    _t = time.time()
    return str(_t).replace(".", "")

def get_extension(_f):
    ext = str(_f.filename.split(".")[len(_f.filename.split(".")) - 1])
    if ext == "blob":
        return "jpg"
    else:
        return ext

def customAbort(status, message):
    return jsonify({
        "message" : message
    }), status

class FakeRequest:
    params = dict()
    def __init__(self, items):
        for i in items:
            self.params[i] = items[i]

def get_random_alphanumerical(_len = 16):
    asciiCodes = []
    alphanumerical = ""
    asciiCodes += random.sample(range(97, 122), int(round(0.375 * _len)))
    asciiCodes += random.sample(range(65, 90), int(round(0.375 * _len)))
    asciiCodes += random.sample(range(48, 57), int(round(0.25 * _len)))
    random.shuffle(asciiCodes)
    for char in asciiCodes:
        alphanumerical += chr(char)
    return alphanumerical

def make_request(request, instance):
    if request.method == "POST":
        return instance.create(request)
    elif request.method == "GET":
        return instance.read(request)
    elif request.method == "PUT":
        return instance.update(request)
    elif request.method == "DELETE":
        return instance.delete(request)
    else:
        return abort(405)
