import jwt, datetime
from flask import Flask, abort
from flask_cors import CORS
from sqlalchemy import create_engine
from flask_request_params import bind_request_params
from time import time
from os.path import basename
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email.utils import COMMASPACE, formatdate
import smtplib
import pdfkit

def makepdf(_in, _out):
    try:
        pdfkit.from_file(_in, _out)
    except Exception as e:
        print(e)
        return False

class FlaskCFG:
    def __init__(self, app, secret_key):
        self.app = app
        self.secret_key = secret_key
        self.app.before_request(bind_request_params)
        self.app.config["SECRET_KEY"] = self.secret_key
        

    def encode(self, key):
        try:
            return key
        except Exception as e:
            print(e)
            raise e

    def config_cors(self, origins):
        config = {
            'ORIGINS': origins,
            'SECRET_KEY': self.secret_key
        }


        self.cors = CORS(self.app, resources={
                r'/api/*': {
                    "Access-Control-Allow-Origin": config["ORIGINS"],
                    "Access-Control-Allow-Credentials": True,
                    'supports_credentials': True
                },
            },
            supports_credentials = True,
            expose_headers = "*"
        )

    def get_app(self):
        return self.app


class Pysqlalchemy:
    def __init__(self, engine_name, user, password, host, database):
        uri = engine_name + "://" + user + ":" + password + "@" + host + "/" + database + "?&autocommit=false"
        self.engine = create_engine(uri, pool_size=8, max_overflow=0,  pool_recycle=1200)
        
    def validate_date(self, date_text, date_format):
        try:
            datetime.datetime.strptime(str(date_text), date_format)
            return True
        except ValueError:
            return False
            
    
    def prepare(self, dictionary, table, _type = "create", by = ""):
        if _type == "create":
            string_one = """INSERT INTO """ + table + """ ("""
            string_two = """) VALUES ("""

            iter_list = []
            
            n = len(dictionary)
            
            for i, obj in enumerate(dictionary):
                if i != n-1:
                    string_one = string_one + obj + """, """
                    string_two = string_two + """%s, """
                else:
                    string_one = string_one + obj
                    string_two = string_two + """%s"""
                
                if dictionary[obj] == None:
                    iter_list.append(None)
                else:
                    iter_list.append(dictionary[obj])

            query = dict()
            query["query_string"] = string_one + string_two + """)"""
            query["query_params"] = tuple(iter_list)

        elif _type == "update":
            by_value = dictionary.pop(by)

            string_one = """UPDATE """ + table + """ SET """
            string_two = """ WHERE """ + by + """ = %s"""
            iter_list = []
            n = len(dictionary)
            for i, obj in enumerate(dictionary):
                if i != n-1:
                    string_one = string_one + obj + """ = %s, """
                else:
                    string_one = string_one + obj + """ = %s"""
                
                if dictionary[obj] == None:
                    iter_list.append(None)
                else:
                    iter_list.append(dictionary[obj])
            
            iter_list.append(by_value)

            query = dict()
            query["query_string"] = string_one + string_two
            query["query_params"] = tuple(iter_list)

        return query

    def format_date(self, data):
        for row in data:
            for field in row:
                if type(row[field]) == type(datetime.datetime.now()) and not row[field] is None:
                    # row[field] = row[field].strftime("%Y-%m-%d %H:%M:%S")
                    row[field] = row[field].strftime("%d %b %Y %H:%M")
        
        return data

    def open(self):
        connection = self.engine.connect()
        transaction = connection.begin()
        return [connection, transaction]

    def close(self, conn):
        try:
            conn[1].commit()
            conn[0].close()
        except Exception as e:
            return False
        return True


    def execute(self, query_string, query_params = (), autocommit = True, conn = []):
        try:
            conn = self.open() if autocommit == True else conn
            try:
                if type(query_params) != type(tuple()):
                    query_params = [query_params]
                new_query_params = []
                
                for p in query_params:
                    if self.validate_date(p, "%d %b %Y %H:%M") == True:
                        p = datetime.datetime.strptime(p, "%d %b %Y %H:%M").strftime("%Y-%m-%d %H:%M:%S")
                    if self.validate_date(p, "%a, %-d %b %Y %H:%M:%S GMT") == True:
                        p = datetime.datetime.strptime(p, "%a, %-d %b %Y %H:%M:%S GMT").strftime("%Y-%m-%d %H:%M:%S")
                    new_query_params.append(p)
                
                new_query_params = tuple(new_query_params)
                conn[0].execute(query_string+""";""", new_query_params)
            except Exception as e:
                print(e)
                conn[1].rollback()
                disconnect = conn[0].close()
                return False
            
            disconnect = self.close(conn) if autocommit else False
        except Exception as e:
            raise Exception(e)
        finally:
            pass

    def read(self, query_string, query_params = (), fetchall = True, autocommit = True, conn = []):
        try:
            conn = self.open() if autocommit == True else conn
            try:
                result = conn[0].execute(query_string+""";""", query_params)
            except Exception as e:
                conn[1].rollback()
                disconnect = conn[0].close()
                print(e)
                return False

            if fetchall:
                data = result.fetchall()
            else:
                data = result.fetchone()

            result.close()
            disconnect = self.close(conn) if autocommit else False
            
            if data == None:
                return None
            
            if fetchall:
                data = [dict(row) for row in data]
                _continue = False if len(data) == 0 else True
            else:
                data = dict(data)
                _continue = False if data == None else True
                data = [data]

            if _continue:
                data = self.format_date(data)
                data = data if fetchall else data[0]
            else:
                return []

            return data
        except Exception as e:
            raise Exception(e)
        finally:
            pass
        
        
class MailingService:
    def __init__(self):
        pass
    
    def send_mail(self, credentials, receiver_mail, subject, msg_body, variables, files = []): 
        for var in variables:
            msg_body = msg_body.replace(("$(_" + var + ")"), variables[var])

        print(files)
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = credentials["email"]
            msg['To'] = receiver_mail
            msg.attach(MIMEText(msg_body, 'html'))
            
            for f in files:
                with open(f, "rb") as fil:
                    part = MIMEApplication(
                        fil.read(),
                        Name=basename(f)
                    )
                part['Content-Disposition'] = 'attachment; filename="%s"' % basename(f)
                msg.attach(part)
            
            server = smtplib.SMTP("smtp.office365.com", 587)
            server.starttls()
            server.login(credentials["email"], credentials["password"])
            server.sendmail(credentials["email"], receiver_mail, msg.as_string())
            server.quit()
            return True
        except Exception as e:
            print(e)
            return False
