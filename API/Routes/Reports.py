from Flabstraction.connect import staticPath, fcfg, sql
from flask import jsonify, request, abort, Response
from sqlalchemy import create_engine
import time, datetime, json, calendar, requests
from operator import itemgetter

def strToDate(str):
    example = datetime.datetime(2021, 6, 2, 9, 39)
    if str == None: 
        return False
    
    if type(str) == type(example):
        return str
    
    return datetime.datetime.strptime(str, "%Y-%m-%d %H:%M:%S")

def getEndOfNextMonth(currentDate):
    if(currentDate.month != 12):
        newDateString = str(currentDate.year) + '-' + str(currentDate.month+1) + '-' + str(calendar.monthrange(currentDate.year, currentDate.month + 1)[1]) + " 00:00:00"
    else:
        newDateString = str(currentDate.year + 1) + '-' + str(1) + '-' + str(calendar.monthrange(currentDate.year +1, 1)[1]) + " 23:59:59"
    return datetime.datetime.strptime(newDateString, "%Y-%m-%d %H:%M:%S")

def workDaysInRange(_range):
    FRI = 5; SAT = 6
    days = [datetime.date.fromordinal(d) for d in range( _range["from"].toordinal(), _range["to"].toordinal() + 1)]
    
    work_days = [d for d in days if d.weekday() not in (FRI,SAT)]
    
    return len(work_days)
    
class TablesStructure:
    def getTableStructure(self, request): 

        # uri = "mysql+pymysql" + "://" + "dimitar" + ":" + "DimiTar123!@#" + "@" + "46.101.200.138"
        # db_name = "wm_4"
        # uri = "mysql+pymysql" + "://" + "root" + ":" + "3646633" + "@" + "0.0.0.0"
        # db_name = "WM_4"
        # uri = "mysql+pymysql" + "://" + "root" + ":" + "#?004005Tradie" + "@" + "165.232.172.7"
        # db_name = "WM"
        # uri = "mysql+pymysql" + "://" + "root" + ":" + "#?004005Tradie" + "@" + "104.248.112.235"
        # db_name = "WM"
        
        uri = "mysql+pymysql" + "://" + "root" + ":" + "3646633" + "@" + "0.0.0.0"
        db_name = "PLASTFIX_SHOP_2"
        
        engine = create_engine(uri, pool_size=8, max_overflow=0,  pool_recycle=1200)
        connection = engine.connect()
        transaction = connection.begin()
        queryTables = """SELECT COLUMN_KEY, COLUMN_NAME, DATA_TYPE, TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '""" + db_name + """';"""
        queryKeys = """SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = '""" + db_name + """' AND REFERENCED_TABLE_NAME != 'NULL' AND REFERENCED_COLUMN_NAME != 'NULL'"""
        queryTableNames = """SELECT DISTINCT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '""" + db_name + """'"""
        queryData = """SELECT * FROM """ + db_name + """._users"""
        try:
            tables = connection.execute(queryTables, ()).fetchall()
            tables = [dict(row) for row in tables]
            
            keys = connection.execute(queryKeys).fetchall()
            keys = [dict(row) for row in keys]
            
            tableNames = connection.execute(queryTableNames)
            tableNames = [dict(row) for row in tableNames]
            data = dict()
            for name in tableNames:
                query = """SELECT * FROM """ + db_name + """."""+name["TABLE_NAME"]
                tableData = connection.execute(query).fetchall()
                tableData = [dict(row) for row in tableData]
                data[name["TABLE_NAME"]] = tableData
        except Exception as e:
            transaction.rollback()
            connection.close()
            return abort(500)
        transaction.commit()
        connection.close()
        
        
        copy = tables
        tables = dict()
        for c in copy:
            if c["TABLE_NAME"] not in tables:
                tables[c["TABLE_NAME"]] = dict()
                
        for c in copy:
            field = dict()
            obj = dict()
            obj["key"] = c["COLUMN_KEY"]
            obj["type"] = c["DATA_TYPE"]
            refs = []
            for key in keys:
                k = dict()
                k["table"] = key["REFERENCED_TABLE_NAME"]
                k["column"] = key["REFERENCED_COLUMN_NAME"]
                if key["COLUMN_NAME"] == c["COLUMN_NAME"] and k not in refs:
                    refs.append(k)
            obj["refs"] = refs
            tables[c["TABLE_NAME"]][c["COLUMN_NAME"]] = obj
            # tables[c["TABLE_NAME"]].append(field)
        
        return {
            "tables" : tables,
            "data" : data
        }
          
    def stocks_report(self, request):
        database = self.getTableStructure(None)
        headers = json.loads(request.headers["data"])
        
        if "_instance_id" not in headers or headers["_instance_id"] == "undefined" or headers["_instance_id"] == []:
            _instance_id = None
        else:
            _instance_id = headers["_instance_id"]
            
        if "_category_id" not in headers or headers["_category_id"] == "undefined" or headers["_category_id"] == []:
            _category_id = None
        else:
            _category_id = headers["_category_id"]
        
        
        reportRows = []
        cols = dict()
        for product in database["data"]["_products"]:
            
            if _category_id is not None and product["_category_id"] not in _category_id:
                continue
            
            quantity = 0
            missing_quantity = 0
            
            for item in database["data"]["_warehouse_inventory"]:
                if _instance_id is not None and item["_instance_id"] not in _instance_id:
                    continue
                if item["_product_id"] == product["_id"]:
                    if int(item["_quantity"]) > 0:
                        quantity = quantity + int(item["_quantity"])
                    else: 
                        missing_quantity = missing_quantity + int(item["_quantity"]) * -1
                    
            
            row = dict()
            row["Serial Number"] = product["_id"]
            row["Product Number"] = product["_product_number"]
            row["Product Name"] = product["_name"]
            row["Available Quantity"] = quantity
            row["Missing Quantity"] = missing_quantity
            row["Unit Value"] = product["_price"]
            row["Total Value"] = round(float(product["_price"]) * quantity - float(product["_price"]) * missing_quantity, 3)
            
            
            _row = dict()
            for index, r in enumerate(row):
                cols[index] = r
                _row[index] = dict()
                _row[index]["value"] = row[r]
                _row[index]["name"] = r
                
            
            reportRows.append(_row)
                        
        return jsonify({
            "columns": cols,
            "rows": reportRows
        })
        
    def detailed_stocks_report(self, request):
        database = self.getTableStructure(None)
        headers = json.loads(request.headers["data"])
        
        if "_instance_id" not in headers or headers["_instance_id"] == "undefined" or headers["_instance_id"] == []:
            _instance_id = None
        else:
            _instance_id = headers["_instance_id"]
            
        if "_category_id" not in headers or headers["_category_id"] == "undefined" or headers["_category_id"] == []:
            _category_id = None
        else:
            _category_id = headers["_category_id"]
        
        
        reportRows = []
        cols = dict()
        for product in database["data"]["_products"]:
            
            if _category_id is not None and product["_category_id"] not in _category_id:
                continue
            
            quantity = 0
            missing_quantity = 0
            
            for item in database["data"]["_warehouse_inventory"]:
                if _instance_id is not None and item["_instance_id"] not in _instance_id:
                    continue
                if item["_product_id"] == product["_id"]:
                    instance = None
                    for i in database["data"]["_instances"]:
                        if i["_id"] == item["_instance_id"]:
                            instance = i
                    row = dict()
                    row["Product Name"] = product["_name"]
                    row["Location"] = instance["_name"]
                    row["Serial Number"] = product["_id"]
                    row["Product Number"] = product["_product_number"]
                    row["Available Quantity"] = item["_quantity"] if int(item["_quantity"]) > 0 else 0
                    row["Missing Quantity"] = item["_quantity"] * -1 if int(item["_quantity"]) < 0 else 0
                    row["Unit Value"] = product["_price"]
                    row["Total Value"] = round(float(product["_price"]) * int(item["_quantity"]), 3)
                    
                    
                    _row = dict()
                    for index, r in enumerate(row):
                        cols[index] = r
                        _row[index] = dict()
                        _row[index]["value"] = row[r]
                        _row[index]["name"] = r
                    reportRows.append(_row)
                    if int(item["_quantity"]) > 0:
                        quantity = quantity + int(item["_quantity"])
                    else: 
                        missing_quantity = missing_quantity + int(item["_quantity"]) * -1
                    
            
            total = dict()
            total["Product Name"] = product["_name"]+"~"
            total["Location"] = "Total~"
            total["Serial Number"] = product["_id"]
            total["Product Number"] = product["_product_number"]
            total["Available Quantity"] = quantity
            total["Missing Quantity"] = missing_quantity
            total["Unit Value"] = product["_price"]
            total["Total Value"] = round(float(product["_price"]) * quantity - float(product["_price"]) * missing_quantity, 3) 
            
            
            _row = dict()
            for index, r in enumerate(total):
                cols[index] = r
                _row[index] = dict()
                _row[index]["value"] = total[r]
                _row[index]["name"] = r
                
            
            reportRows.append(_row)
                        
        return jsonify({
            "columns": cols,
            "rows": reportRows
        })
        
    def orders_report(self, request):
        database = self.getTableStructure(None)
        headers = json.loads(request.headers["data"])
        
        _instance_id = None if "_instance_id" not in headers or headers["_instance_id"] == "undefined" or headers["_instance_id"] == [] else headers["_instance_id"]
        _customer_id = None if "_customer_id" not in headers or headers["_customer_id"] == "undefined" or headers["_customer_id"] == [] else headers["_customer_id"]
        _status_id = None if "_status_id" not in headers or headers["_status_id"] == "undefined" or headers["_status_id"] == [] else headers["_status_id"]
        _type_id = None if "_type_id" not in headers or headers["_type_id"] == "undefined" or headers["_type_id"] == [] else headers["_type_id"]
        
        _range = headers["Dates"]
        _range["from"] = strToDate(_range["from"])
        _range["to"] = strToDate(_range["to"])
        
        
        reportRows = []
        cols = dict()
        
        normalized_orders = dict()
        for order in database["data"]["_customer_orders"]:
            if order["_order_number"] not in normalized_orders:
                normalized_orders[order["_order_number"]] = []
            normalized_orders[order["_order_number"]].append(order)
            
        for _order in normalized_orders:
            
            order = normalized_orders[_order]
            
            if order[0]["_order_date"] > _range["to"] or order[0]["_order_date"] < _range["from"] or (_customer_id is not None and order[0]["_customer_id"] not in _customer_id):
                continue
            
            
            
            order_customer = None
            ordered_from = None
            order_invoice = None
            order_status = None
            
            
            for location in database["data"]["_instances"]:
                if location["_id"] == order[0]["_deliver_from_id"]:
                    ordered_from = location
                    
            if ordered_from is not None:
                if _instance_id is not None and ordered_from["_id"] not in _instance_id:
                    continue
            else:
                if _instance_id is not None and 4 not in _instance_id:
                    continue
            
            for user in database["data"]["_users"]:
                if user["_id"] == order[0]["_customer_id"]:
                    order_customer = user
            
            for inv in database["data"]["_invoices"]:
                if inv["_order_number"] == order[0]["_order_number"]:         
                    order_invoice = inv

            for item in order:
                if order_status is None or item["_status_id"] < order_status:
                    order_status = item["_status_id"]
                    
            if _status_id is not None and order_status not in _status_id:
                continue
                    
            for status in database["data"]["_order_statuses"]:
                if status["_id"] == order_status:
                    order_status = status
                    break
            
            row = dict()
            row["Order Number"] = order[0]["_order_number"]
            row["Invoice Number"] = "Not Invoiced" if order_invoice is None else order_invoice["_invoice_number"]
            row["Customer"] = order_customer["_name"]
            row["Ordered From"] = "Vendor" if ordered_from is None else ordered_from["_name"]
            row["Order Date"] = order[0]["_order_date"]
            row["Order Status"] = order_status["_name"]
            
            
            
            _row = dict()
            for index, r in enumerate(row):
                cols[index] = r
                _row[index] = dict()
                _row[index]["value"] = row[r]
                _row[index]["name"] = r
                
            
            reportRows.append(_row)
                        
        return jsonify({
            "columns": cols,
            "rows": reportRows
        })
        
    def sales_report(self, request):
        database = self.getTableStructure(None)
        headers = json.loads(request.headers["data"])
        
        _range = headers["Dates"]
        _range["from"] = strToDate(_range["from"])
        _range["to"] = strToDate(_range["to"])
        
        _type_id = [2, 4] if "_type_id" not in headers or headers["_type_id"] == "undefined" or headers["_type_id"] == [] else headers["_type_id"]
        _customer_id = None if "_customer_id" not in headers or headers["_customer_id"] == "undefined" or headers["_customer_id"] == [] else headers["_customer_id"]
        _instance_id = None if "_instance_id" not in headers or headers["_instance_id"] == "undefined" or headers["_instance_id"] == [] else headers["_instance_id"]
        _status_id = None if "_status_id" not in headers or headers["_status_id"] == "undefined" or headers["_status_id"] == [] else headers["_status_id"]
        
        overall_total = dict()
        overall_total["Customer"] = "~Overall Total~"
        overall_total["Order Number"] = ""
        overall_total["Ordered From"] = ""
        overall_total["Order Date"] = ""
        overall_total["Order Status"] = "Total:"
        overall_total["Ammount"] = 0
        
        reportRows = []
        cols = dict()
        for user in database["data"]["_users"]:
            if user["_type_id"] not in _type_id or (_customer_id is not None and user["_id"] not in _customer_id):
                continue
            
            normalized_orders = dict()
            for order in database["data"]["_customer_orders"]:
                if order["_customer_id"] != user["_id"] or (_instance_id is not None and order["_deliver_from_id"] not in _instance_id) or order["_order_date"] > _range["to"] or order["_order_date"] < _range["from"]:
                    continue
                if order["_order_number"] not in normalized_orders:
                    normalized_orders[order["_order_number"]] = []
                normalized_orders[order["_order_number"]].append(order)
            
            customer_total = dict()
            customer_total["Customer"] = user["_name"]
            customer_total["Order Number"] = ""
            customer_total["Ordered From"] = ""
            customer_total["Order Date"] = ""
            customer_total["Order Status"] = "Total:~"
            customer_total["Ammount"] = 0
            
            for _order in normalized_orders:
                order = normalized_orders[_order]
                ordered_from = None
                for ins in database["data"]["_instances"]:
                    if ins["_id"] == order[0]["_deliver_from_id"]:
                        ordered_from = ins
                row = dict()
                row["Customer"] = user["_name"]
                row["Order Number"] = order[0]["_order_number"]
                row["Ordered From"] = "Vendor" if ordered_from is None else ordered_from["_name"]
                row["Order Date"] = order[0]["_order_date"]
                row["Order Status"] = None
                row["Ammount"] = 0
                for item in order:
                    if row["Order Status"] is None or row["Order Status"] < item["_status_id"]:
                        row["Order Status"] = item["_status_id"]
                    
                    if item["_status_id"] != 1:
                        package = None
                        product = None
                        
                        for pkg in database["data"]["_product_packages"]:
                            if pkg["_id"] == item["_package_id"]:
                                package = pkg
                                
                        for prod in database["data"]["_products"]:
                            if prod["_id"] == package["_product_id"]:
                                product = prod
                                
                        row["Ammount"] = row["Ammount"] + int(item["_quantity"]) * int(package["_items_per_package"]) * float(product["_price"])
                
                customer_total["Ammount"] = customer_total["Ammount"] + row["Ammount"]
                overall_total["Ammount"] = overall_total["Ammount"] + row["Ammount"]
                
                for status in database["data"]["_order_statuses"]:
                    if status["_id"] == row["Order Status"]:
                        row["Order Status"] = status["_name"]
                        break
                
                _row = dict()
                for index, r in enumerate(row):
                    cols[index] = r
                    _row[index] = dict()
                    _row[index]["value"] = row[r]
                    _row[index]["name"] = r
                reportRows.append(_row)
                
            _row = dict()
            for index, r in enumerate(customer_total):
                cols[index] = r
                _row[index] = dict()
                _row[index]["value"] = customer_total[r]
                _row[index]["name"] = r
            reportRows.append(_row)
            
        _row = dict()
        for index, r in enumerate(overall_total):
            cols[index] = r
            _row[index] = dict()
            _row[index]["value"] = overall_total[r]
            _row[index]["name"] = r
        reportRows.append(_row)
        
        return jsonify({
            "columns": cols,
            "rows": reportRows
        })