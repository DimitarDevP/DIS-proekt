from Flabstraction.connect import staticPath, fcfg, sql, get_random, get_extension, customAbort, FakeRequest, get_random_alphanumerical, mail
from Flabstraction.Flabstraction import makepdf
from flask import jsonify, request
from flask import abort, Response
import datetime, random, json, time, flask, subprocess, os
from Routes.Templates import purchase_order_template, invoice_template, create_table_row

class Products:
    
    def __init__(self):
        pass
    
    def create(self, request):
        # Method : POST
        # Content Type: multipart/form-data
        # body: {
        #     _product_number:string,
        #     _name:string,
        #     _description:string,
        #     _category_id:int(_product_categories),
        #     _price:string,
        #     _available_quantity:integer,
        #     _reorder_quantity:integer,
        #     _package_sizes:array,
        #     image:file<jpg/jpeg/png>
        # }
        
        if "image" not in request.files:
            return customAbort(400, "Please attach an image")
        
        required_fields = ["_product_number", "_name", "_description", "_category_id", "_price", "_reorder_quantity", "_package_sizes", "_supplier_id", "_locations"]
        
        for field in required_fields:
            if field not in request.form:
                return customAbort(400, "Please make sure that all the required fields are filled in.")
        
        image = request.files["image"]
        extension = get_extension(image)
        rand = get_random()
        location = "images/product_image_"+rand+"."+extension
        save_path = staticPath + location
        image.save(save_path)
        
        product_dict = {
            "_product_number": request.form["_product_number"],
            "_name": request.form["_name"],
            "_description": request.form["_description"],
            "_category_id": request.form["_category_id"],
            "_price": request.form["_price"],
            "_reorder_quantity" : request.form["_reorder_quantity"],
            "_supplier_id" : request.form["_supplier_id"],
            "_is_internal" : request.form["_is_internal"],
            "_image_url": location
        }
        
        query = sql.prepare(product_dict, "_products")
        
        conn = sql.open()
        
        sql.execute(query["query_string"], query["query_params"], False, conn)
        product = sql.read("""SELECT * FROM _products WHERE _id = LAST_INSERT_ID()""", (), False, False, conn)
        for size in json.loads(request.form["_package_sizes"]):
            sql.execute("""INSERT INTO _product_packages (_product_id, _items_per_package) VALUES(%s, %s)""", (product["_id"], size), False, conn)
            
        if 1 not in json.loads(request.form["_package_sizes"]):
            sql.execute("""INSERT INTO _product_packages (_product_id, _items_per_package, _archived) VALUES(%s, %s, %s)""", (product["_id"], 1, 1), False, conn)
            
        for location in json.loads(request.form["_locations"]):
            sql.execute("""INSERT INTO _product_locations_availability (_product_id, _instance_id) VALUES(%s, %s)""", (product["_id"], location), False, conn)
        
        packages = sql.read("""SELECT * FROM _product_packages""", (), True, False, conn)
        locations_available = sql.read("""SELECT * FROM _product_locations_availability""", (), True, False, conn)
        
        if sql.close(conn) == False:
            return customAbort(500, "Internal server error occured. Please try again later. If this error consists, alert our support on support@worxmanager.com")
            
        return jsonify({
            "product": product,
            "packages": packages,
            "locations_available": locations_available
        })
        
    def read(self, request):
        # Method : GET
        # Content Type: application/json
        
        if "_instance_id" not in request.args:
            products = sql.read("""SELECT * FROM _products""", ())
            packages = sql.read("""SELECT * FROM _product_packages""", ())
            locations_available = sql.read("""SELECT * FROM _product_locations_availability""", ())
        else:
            locations_available = sql.read("""SELECT * FROM _product_locations_availability WHERE _instance_id = %s""", (int(request.args["_instance_id"])))
            products = []
            in_string = "("
            for loc in locations_available:
                product = sql.read("""SELECT * FROM _products WHERE _id = %s""", (loc["_product_id"]), False)
                products.append(product)
                in_string = in_string + str(loc["_product_id"]) + ", "
            in_string = in_string[:len(in_string)-2] + ")"
            packages = sql.read("""SELECT * FROM _product_packages WHERE _product_id IN """ + in_string, ())
            
        all_products = sql.read("""SELECT * FROM _products""", ())
        return jsonify({
            "products" : products,
            "all_products" : all_products,
            "packages" : packages,
            "locations_available": locations_available
        })
    
    def update(self, request):
        # Method : PUT
        # Content Type: multipart/form-data
        # body: {
        #     _id:integer,
        #     _product_number:string,
        #     _name:string,
        #     _description:string,
        #     _category_id:int(_product_categories),
        #     _price:string,
        #     image:file<jpg/jpeg/png> || null
        # }
        
        if "_id" not in request.form:
            return customAbort(404, "Specified product was not found")
        
        location = request.form["_image_url"]
        
        if "image" in request.files:
            image = request.files["image"]
            extension = get_extension(image)
            rand = get_random()
            location = "images/product_image_"+rand+"."+extension
            save_path = staticPath + location
            image.save(save_path)
        
        product_dict = {
            "_id" : request.form["_id"],
            "_product_number" : request.form["_product_number"],
            "_name" : request.form["_name"],
            "_description" : request.form["_description"],
            "_price" : request.form["_price"],
            "_supplier_id" : request.form["_supplier_id"],
            "_reorder_quantity" : request.form["_reorder_quantity"],
            "_is_internal" : request.form["_is_internal"],
            "_image_url": location
        }
        
        _id = request.form["_id"]
        
        query = sql.prepare(product_dict, "_products", "update", "_id")
        conn = sql.open()
        sql.execute(query["query_string"], query["query_params"], False, conn)
        product = sql.read("""SELECT * FROM _products WHERE _id = %s""", (_id), False, False, conn)
        
        if "_locations" in request.form:
            locations_available = sql.read("""SELECT * FROM _product_locations_availability WHERE _product_id = %s""", (_id), True, False, conn)
            locations_ids = []
            [locations_ids.append(l["_instance_id"]) for l in locations_available]
            for location in json.loads(request.form["_locations"]):
                if location not in locations_ids:
                    sql.execute("""INSERT INTO _product_locations_availability (_product_id, _instance_id) VALUES (%s, %s)""", (_id, location), False, conn)
                    locations_ids.append(location)
                    
            for location in locations_ids:
                if location not in json.loads(request.form["_locations"]):
                    sql.execute("""DELETE FROM _product_locations_availability WHERE _product_id = %s AND _instance_id = %s""", (_id, location), False, conn)

        locations_available = sql.read("""SELECT * FROM _product_locations_availability""", (), True, False, conn)
        if sql.close(conn) == False:
            return customAbort(500, "Internal server error occured. Please try again later. If this error persists, alert our support on support@worxmanager.com")
        
        return jsonify({
            "product" : product,
            "locations_available" : locations_available
        })
        
    def delete(self, request):
        # Method : DELETE
        # Content Type: application/json
        # request_arguments : {
        #     _id:integer
        # }
        
        if "_id" not in request.args:
            return customAbort(404, "Specified product was not found")
        
        conn = sql.open()
        
        if "_retrive" in request.args:
            sql.execute("""UPDATE _products SET _archived = 0 WHERE _id = %s""", (request.args["_id"]), False, conn)
        else:
            sql.execute("""UPDATE _products SET _archived = 1 WHERE _id = %s""", (request.args["_id"]), False, conn)
        
        
        product = sql.read("""SELECT * FROM _products WHERE _id = %s""", (request.args["_id"]), False, False, conn)
        if sql.close(conn) == False:
            return customAbort(500, "Internal server error occured. Please try again later. If this error consists, alert our support on support@worxmanager.com")
        
        return jsonify({
            "product" : product
        })

class Users:
    
    def __init__(self):
        pass
    
    def create(self, request):
        # Method : POST
        # Content Type: multipart/form-data
        # body: {
        #     _email:string,
        #     _name:string,
        #     _type_id:integer,
        #     _state_id:integer,
        #     _instance_id:string,
        #     _username:string,
        #     _password:string
        # }
        
        required_fields = ["_email", "_name", "_type_id", "_state_id", "_instance_id", "_username", "_password"]
        
        for key in required_fields:
            if key not in request.form:
                return customAbort(400, "Please make sure that all the fields are filled in.")
            
        
        if int(request.form["_type_id"]) == 2:        
            user_dict = {
                "_email" : request.form["_email"],
                "_name" : request.form["_name"],
                "_state_id" : request.form["_state_id"],
                "_type_id" : request.form["_type_id"],
                "_instance_id" : request.form["_instance_id"],
                "_username" : request.form["_username"],
                "_password" : request.form["_password"]
            }
        else:
            user_dict = {
                "_email" : request.form["_email"],
                "_name" : request.form["_name"],
                "_type_id" : request.form["_type_id"],
                "_username" : request.form["_username"],
                "_password" : request.form["_password"]
            }
        
        query = sql.prepare(user_dict, "_users")
        
        conn = sql.open()    
        
        sql.execute(query["query_string"], query["query_params"], False, conn)
        user = sql.read("""SELECT _id, _username, _name, _state_id, _instance_id, _type_id FROM _users WHERE _id = LAST_INSERT_ID()""", (), False, False, conn)
        
        if sql.close(conn) == False:
            return customAbort(500, "Internal server error occured. Please try again later. If this error consists, alert our support on support@worxmanager.com")
            
        return jsonify({
            "user": user
        })
        
    def read(self, request):
        users = sql.read("""SELECT _id, _name, _state_id, _instance_id, _type_id, _email, _username FROM _users WHERE _archived = 0""", (), True)
        
        return jsonify({
            "users" : users
        })
    
    def update(self, request):
        # Method : POST
        # Content Type: multipart/form-data
        # body: {
        #     _id:integer,
        #     _email:string,
        #     _name:string,
        #     _state_id:integer,
        #     _instance_id:string,
        #     _username:string,
        #     _password:string
        # }        
        
        
        _id = request.form["_id"]
        copy = dict()
        for key in request.form:
            copy[key] = request.form[key]
        query = sql.prepare(copy, "_users", "update", "_id")
        
        conn = sql.open()
        
        sql.execute(query["query_string"], query["query_params"], False, conn)
        user = sql.read("""SELECT _id, _name, _state_id, _instance_id, _type_id, _email, _username FROM _users WHERE _id = %s""", (_id), False, False, conn)
        
        if sql.close(conn) == False:
            return customAbort(500, "Internal server error occured. Please try again later. If this error consists, alert our support on support@worxmanager.com")
            
        return jsonify({
            "user": user
        })
    
    def delete(self, request):
        # Method : DELETE
        # Content Type: application/json
        # request_arguments : {
        #     _id:integer
        #     _retrive:optional || undefined
        # }
        
        if "_id" not in request.args:
            return customAbort(404, "Specified user was not found")
        
        conn = sql.open()
        
        if "_retrive" in request.args:
            sql.execute("""UPDATE _users SET _archived = 0 WHERE _id = %s""", (request.args["_id"]), False, conn)
        else:
            sql.execute("""UPDATE _users SET _archived = 1 WHERE _id = %s""", (request.args["_id"]), False, conn)
        
        if sql.close(conn) == False:
            return customAbort(500, "Internal server error occured. Please try again later. If this error consists, alert our support on support@worxmanager.com")
        
        return jsonify({
            "_id" : request.args["_id"]
        })
        
    def login(self, request):
        if "_username" not in request.form or "_password" not in request.form:
            return customAbort(403, "Username or password is incorrect.")
        
        user = sql.read("""SELECT _id, _name, _state_id, _instance_id, _type_id FROM _users WHERE _username = %s AND _password = %s""", (request.form["_username"], request.form["_password"]), False)
        
        if user is None:
            return customAbort(403, "Username or password is incorrect.")
        
        return jsonify({
            "user" : user
        })

class Inventory:
    
    def __init__(self):
        pass
    
    def create(self, request):
        pass
    
    def read(self, request):
        
        items = sql.read("""SELECT * FROM _inventory""", ())
        
        
        return jsonify({
            "items" : items
        })
    
    def update(self, request):
        pass
    
    def delete(self, request):
        pass  

class CustomerOrders:
    
    def __init__(self):
        pass
    
    def generate_purchase_order(self, conn, request, _order_number, omit_email = False):
        _delivery_info = sql.read("""SELECT * FROM _delivery_info WHERE _id = %s""", (request.form["_delivery_info_id"]), False, False, conn)
        date = request.form["date"]
        
        orders = request.form["orders"]
        _order = orders[0]
        
        po_html = po_html = purchase_order_template
        po_html = po_html.replace("${title}", _order_number)
        po_html = po_html.replace("${date}", date)
        po_html = po_html.replace("${order_number}", _order_number)
        
        po_html = po_html.replace("${vendor_name}", "Plastfix Industries")
        po_html = po_html.replace("${vendor_address}", "2064 Artarmon, NSW, Australia")
        po_html = po_html.replace("${vendor_phone}", "+61 1300 432 265")
        po_html = po_html.replace("${vendor_email}", "support@plastfix.com")
        
        po_html = po_html.replace("${reciever_name}", _delivery_info["_name"])
        po_html = po_html.replace("${reciever_address}", _delivery_info["_address"] + ", " +  _delivery_info["_post_code"] + " " + _delivery_info["_city"] + ", " + _delivery_info["_country"])
        po_html = po_html.replace("${reciever_phone}", _delivery_info["_contact_number"])
        po_html = po_html.replace("${reciever_email}", _delivery_info["_contact_email"])
        
        total = 0
        rows = ""
        for order in json.loads(request.form["orders"]):
            package = sql.read("""SELECT * FROM _product_packages WHERE _id = %s""", (order["_product_id"]), False, False, conn)
            product = sql.read("""SELECT * FROM _products WHERE _id = %s""", (package["_product_id"]), False, False, conn)
            
            rows = rows + create_table_row([
                product["_name"] + " x" + str(package["_items_per_package"]),
                product["_product_number"],
                order["_quantity"],
                product["_price"],
                float(product["_price"]) * int(order["_quantity"]) * int(package["_items_per_package"])
            ])
            
            total += float(product["_price"]) * int(order["_quantity"]) * int(package["_items_per_package"])
        
        po_html = po_html.replace("${rows}", rows)
        po_html = po_html.replace("${total}", str(total))
        po_html = po_html.replace("${shipping}", str(0.0))
        po_html = po_html.replace("${discount}", str(0.0))
        po_html = po_html.replace("${tax}", str(0.0))
        
        po_file = open(staticPath+"pos/"+_order_number+".html", "w+")
        po_file.write(po_html)
        po_file.close()
        os.system("xvfb-run wkhtmltopdf " + staticPath+"pos/"+_order_number+".html" + " " + staticPath+"pos/"+_order_number+".pdf")
        if omit_email == True:
            template = """
                <div style="width: 500px; padding: 0px; margin: 10px auto; background: #eff3f9">
                    <h3 style="color: #FFF; background: #0061f2; text-align: center; padding: 12px 0px 8px 0px;">Plastfix Shop</h3>
                    <p style="color: #333; padding: 0px 12px;">Dear customer</p>
                    
                    <p style="color: #333; padding: 0px 12px;">We have received your order with Order Number: (${_order_number})</p>
                    
                    <p style="color: #333; padding: 0px 12px;">Please find the attached purchase order below to review your order.</p>
                    
                    <p style="color: #333; padding: 0px 12px;">Kind regards,</p>
                    <p style="color: #333; padding: 0px 12px;">Plastfix Industries</p>
                </div>
            """.replace("(${_order_number})", _order_number)
            _mail_files = []
            _mail_files.append(staticPath+"pos/"+_order_number+".pdf")
            
            mail.send_mail(
                {"email": "special_meet@outlook.com", "password": "SpecialMeet123!@#"}, 
                _delivery_info["_contact_email"], 
                "Plastfix Industries Customer Service: Order has been received", 
                template, 
                {},
                _mail_files
            )
            
            template_admin = """
                <div style="width: 500px; padding: 0px; margin: 10px auto; background: #eff3f9">
                    <h3 style="color: #FFF; background: #0061f2; text-align: center; padding: 12px 0px 8px 0px;">Plastfix Shop</h3>
                    <p style="color: #333; padding: 0px 12px;">Dear admin</p>
                    
                    <p style="color: #333; padding: 0px 12px;">We have received an order with Order Number: (${_order_number})</p>
                    
                    <p style="color: #333; padding: 0px 12px;">Please follow through and process this order when possible..</p>
                    
                    <p style="color: #333; padding: 0px 12px;">Kind regards,</p>
                    <p style="color: #333; padding: 0px 12px;">Plastfix Shop</p>
                </div>
            """.replace("(${_order_number})", _order_number)
            
            admin_email = sql.read("""SELECT * FROM _settings WHERE _name = %s""", ("_admin_contact_email"), False, False, conn)["_value"]
            
            mail.send_mail(
                {"email": "special_meet@outlook.com", "password": "SpecialMeet123!@#"}, 
                admin_email, 
                "Plastfix Industries Customer Service: Order has been received", 
                template_admin, 
                {},
                _mail_files
            )
        
        return po_html
    
    def generate_invoice(self, conn, request, _instance_id):
        orders = sql.read("""SELECT * FROM _customer_orders WHERE _order_number = %s""", (json.loads(request.form["orders"])[0]["_order_number"]), True, False, conn)
        _order = orders[0]
        _delivery_info = sql.read("""SELECT * FROM _delivery_info WHERE _id = %s""", (_order["_delivery_info_id"]), False, False, conn)
        
        if _instance_id is not None:
            _shipping_info = sql.read("""SELECT * FROM _delivery_info WHERE _instance_id = %s""", (_instance_id), False, False, conn)
        else:
            _shipping_info = None
        inv_html = invoice_template
        
        invoices = sql.read("""SELECT * FROM _invoices""", (), True, False, conn)
        last_invoice = None if invoices is None or len(invoices) == 0 else invoices[len(invoices) - 1]
        inv_num = str(request.form["_date"][0:4]) + str(request.form["_date"][5:7]) + str(request.form["_date"][8:10]) + str(0 if last_invoice is None else int(str(last_invoice["_invoice_number"])[8:]) + 1)
        
        new_invoice = {
            "_order_number": _order["_order_number"],
            "_invoice_number": inv_num
        }
        
        
        query = sql.prepare(new_invoice, "_invoices")
        sql.execute(query["query_string"], query["query_params"], False, conn)
        
        inv_html = inv_html.replace("${seller_phone}", "+61 1300 432 265")
        inv_html = inv_html.replace("${seller_email}", "support@plastfix.com")
        inv_html = inv_html.replace("${seller_address}", "Artarmon")
        inv_html = inv_html.replace("${seller_city_country}", "NSW, Australia")
        inv_html = inv_html.replace("${seller_post}", "2064")
        
        inv_html = inv_html.replace("${buyer_name}", _delivery_info["_name"])
        inv_html = inv_html.replace("${buyer_address}", _delivery_info["_address"])
        inv_html = inv_html.replace("${buyer_city_country}", _delivery_info["_city"] + ", " + _delivery_info["_country"])
        inv_html = inv_html.replace("${buyer_post}", _delivery_info["_post_code"])
    
        inv_html = inv_html.replace("${invoice_number}", inv_num)
        inv_html = inv_html.replace("${date}", request.form["_date"])
    
        inv_html = inv_html.replace("${buyer_email}", _delivery_info["_contact_email"])
        inv_html = inv_html.replace("${buyer_phone}", _delivery_info["_contact_number"])
        
        rows = ""
        subtotal = 0
        discount = 0
        shipping = 0
        tax = 0
        
        
        for order in orders:
            if order["_status_id"] == 1:
                continue
            last_order = sql.read("""SELECT * FROM _customer_orders WHERE _id = %s""", (order["_id"]), False, False, conn)
            package = sql.read("""SELECT * FROM _product_packages WHERE _id = %s""", order["_package_id"], False, False, conn)
            product = sql.read("""SELECT * FROM _products WHERE _id = %s""", package["_product_id"], False, False, conn)
            
            rows = rows + create_table_row([
                product["_name"] + " x" + str(package["_items_per_package"]),
                product["_product_number"],
                order["_quantity"],
                product["_price"],
                float(product["_price"]) * int(order["_quantity"]) * int(package["_items_per_package"])
            ])
            
            price = float(product["_price"]) * int(order["_quantity"]) * int(package["_items_per_package"])
            tax += price / 10
            subtotal = subtotal + price
            discount = discount + price - (price * (1 - last_order["_discount"] * 0.01) )
            shipping = last_order["_shipping_cost"]
            
        inv_html = inv_html.replace("${rows}", rows)
        inv_html = inv_html.replace("${subtotal}", str(subtotal))
        inv_html = inv_html.replace("${shipping}", str(shipping))
        inv_html = inv_html.replace("${tax}", str(round(tax, 3)))
        inv_html = inv_html.replace("${discount}", str(round(discount, 3)))
        inv_html = inv_html.replace("${total}", str(round(subtotal - discount + shipping + tax, 3)))
        
        
        invoice_name = str(request.form["_order_number"]) + ".html"
        invoice_file = open(staticPath+"invoices/"+invoice_name, "w+")
        invoice_file.write(inv_html)
        invoice_file.close()
        os.system("xvfb-run wkhtmltopdf " + staticPath+"invoices/"+invoice_name + " " + staticPath+"invoices/"+invoice_name.replace("html", "pdf"))
        
        
        template = """
            <div style="width: 500px; padding: 0px; margin: 10px auto; background: #eff3f9">
                <h3 style="color: #FFF; background: #0061f2; text-align: center; padding: 12px 0px 8px 0px;">Plastfix Shop</h3>
                <p style="color: #333; padding: 0px 12px;">Dear customer</p>
                
                <p style="color: #333; padding: 0px 12px;">We have processed your order with Order Number: (${_order_number})</p>
                
                <p style="color: #333; padding: 0px 12px;">Please find the attached pre-invoice below and make the necessary payment in order to continue the ordering process.</p>
                
                <p style="color: #333; padding: 0px 12px;">Kind regards,</p>
                <p style="color: #333; padding: 0px 12px;">Plastfix Industries</p>
            </div>
        """.replace("(${_order_number})", _order["_order_number"])
        _mail_files = []
        _mail_files.append(staticPath+"invoices/"+invoice_name.replace("html", "pdf"))
        
        mail.send_mail(
            {"email": "special_meet@outlook.com", "password": "SpecialMeet123!@#"}, 
            _delivery_info["_contact_email"], 
            "Plastfix Industries Customer Service: Order has been processed", 
            template, 
            {},
            _mail_files
        )

        template = """
            <div style="width: 500px; padding: 0px; margin: 10px auto; background: #eff3f9">
                <h3 style="color: #FFF; background: #0061f2; text-align: center; padding: 12px 0px 8px 0px;">Plastfix Shop</h3>
                <p style="color: #333; padding: 0px 12px;">Dear Admin.</p>
                
                <p style="color: #333; padding: 0px 12px;">We have processed an order with Order Number: (${_order_number})</p>
                
                <p style="color: #333; padding: 0px 12px;">Please find and process the attached pre-invoice below in order to continue the ordering process.</p>
                
                <p style="color: #333; padding: 0px 12px;">Kind regards,</p>
                <p style="color: #333; padding: 0px 12px;">Plastfix Industries</p>
            </div>
        """.replace("(${_order_number})", _order["_order_number"])

        mail.send_mail(
            {"email": "special_meet@outlook.com", "password": "SpecialMeet123!@#"}, 
            "accounts@plastfix.com", 
            "Plastfix Industries Customer Service: Order has been processed", 
            template, 
            {},
            _mail_files
        )
        
        return inv_html
    
    def create(self, request):
        # Method : POST
        # Content Type: multipart/form-data
        # body: {
        #     _customer_id:integer,
        #     date:string,
        #     orders:array
        # }
        
        # indexOfOrdersArray: {
        #     _quantity:integer,
        #     _product_id:integer
        # }
        
        required_fields = ["_customer_id", "orders", "date", "_delivery_info_id"]
        
        for key in required_fields:
            if key not in request.form:
                return customAbort(400, "Please make sure that you have entered all the required fields.")
        
        
        orders = json.loads(request.form["orders"])
        _order_number = get_random_alphanumerical(8) if "_po_number" not in request.form else request.form["_po_number"]
        conn = sql.open()
        
        while sql.read("""SELECT * FROM _customer_orders WHERE _order_number = %s""", (_order_number), False, False, conn) is not None:
            _order_number = get_random_alphanumerical(8) if "_po_number" not in request.form else request.form["_po_number"]
            if "_po_number" in request.form:
                return customAbort(409, "The PO number you entered already exists. Please enter another one.")
        
        for order in orders:
            order_dict = {
                "_order_number" : _order_number,
                "_customer_id" : request.form["_customer_id"],
                "_quantity" : order["_quantity"],
                "_package_id" : order["_product_id"],
                "_order_date" : request.form["date"],
                "_status_id" : 2,
                "_delivery_info_id" : request.form["_delivery_info_id"]
            }
            query = sql.prepare(order_dict, "_customer_orders")
        
            sql.execute(query["query_string"], query["query_params"], False, conn)
        
        
        orders = sql.read("""SELECT * FROM _customer_orders WHERE _order_number = %s""", (_order_number), True, False, conn)
        
        
        self.generate_purchase_order(conn, request, _order_number)
        
        if sql.close(conn) == False:
            return customAbort(500, "Internal server error occured. Please try again later. If this error consists, alert our support on support@worxmanager.com")
            
        return jsonify({
            "orders": orders
        })
    
    def read(self, request):
        _customer_orders = sql.read("""SELECT * FROM _customer_orders""", (), True)
        
        return jsonify({
            "_customer_orders" : _customer_orders
        })
            
    def update(self, request):
        # Method : PUT
        # Content Type: multipart/form-data
        # body: {
        #     _order_number:string,
        #     _customer_id:integer
        #     orders:array
        # }
        
        # indexOfOrdersArray: {
        #     _id:integer,
        #     _quantity:integer,
        #     _product_id:integer
        #     _status_id:integer
        # }
        
        required_fields = ["_customer_id", "orders", "_by_id", "_date"]
        
        for key in required_fields:
            if key not in request.form:
                return customAbort(400, "Please make sure that you have entered all the required fields.")
        
        orders = json.loads(request.form["orders"])
        
        conn = sql.open()
        email_shipping_details = False
        for order in orders:
            last_order = sql.read("""SELECT * FROM _customer_orders WHERE _id = %s""", (order["_id"]), False, False, conn)
            
            order_dict = {
                "_id" : order["_id"],
                "_order_number" : request.form["_order_number"],
                "_customer_id" : request.form["_customer_id"],
                "_quantity" : order["_quantity"],
                "_package_id" : order["_package_id"],
                "_status_id" : order["_status_id"],
                "_deliver_from_id" : None if "_deliver_from_id" not in request.form or request.form["_deliver_from_id"] in ["4", 4, "NaN"] else request.form["_deliver_from_id"],
                "_shipping_cost": order["_shipping_cost"],
                "_shipping_notes": order["_shipping_notes"],
                "_estimated_delivert_date": order["_estimated_delivert_date"],
                "_discount": order["_discount"],
                "_from_supplier" : order["_from_supplier"]
            }
                        
            hist = {
                "_order_id" : order["_id"],
                "_from_status_id" : last_order["_status_id"],
                "_to_status_id" : order["_status_id"],
                "_by_id" : request.form["_by_id"],
                "_date_changed" : request.form["_date"]
            }
            
            query = sql.prepare(order_dict, "_customer_orders", "update", "_id")
            hist_query = sql.prepare(hist, "_order_history")
            
            sql.execute(query["query_string"], query["query_params"], False, conn)
            
            if not (hist["_from_status_id"] == 1 and hist["_to_status_id"] == 1):
                sql.execute(hist_query["query_string"], hist_query["query_params"], False, conn)
            
            order_package = sql.read("""SELECT * FROM _product_packages WHERE _id = %s""", (order["_package_id"]), False, False, conn)
            order_product = sql.read("""SELECT * FROM _products WHERE _id = %s""", (order_package["_product_id"]), False, False, conn)
            if order["_from_supplier"] == 1 and order_dict["_deliver_from_id"] is not None:
                product_package = sql.read("""SELECT * FROM _product_packages WHERE _id = %s""", (order["_package_id"]), False, False, conn)
                sql.execute("""INSERT INTO _pending_orders (_product_id, _quantity, _customer_id) VALUES (%s, %s, %s)""", (product_package["_product_id"], int(product_package["_items_per_package"]) * int(order["_quantity"]), request.form["_customer_id"]), False, conn)
            
            if order["_status_id"] == 3:
                if order_dict["_deliver_from_id"] is not None:
                    customer = sql.read("""SELECT * FROM _users WHERE _id = %s""", (request.form["_customer_id"]), False, False, conn)
                    
                    if customer["_type_id"] == 2:
                        _instance_id = customer["_instance_id"]
                    else:
                        _instance_id = request.form["_deliver_from_id"]
                    
                    current = sql.read("""SELECT * FROM _warehouse_inventory WHERE _instance_id = %s AND _product_id = %s""", (_instance_id, order_product["_id"]), False, False, conn)
                    if current is None:
                        sql.execute("""INSERT INTO _warehouse_inventory (_instance_id, _product_id, _quantity) VALUES (%s, %s, 0)""", (_instance_id, order_product["_id"]), False, conn)
                        current = sql.read("""SELECT * FROM _warehouse_inventory WHERE _instance_id = %s AND _product_id = %s""", (_instance_id, order_product["_id"]), False, False, conn)
                    
                    sql.execute("""UPDATE _warehouse_inventory SET _quantity = %s WHERE _id = %s""", (current["_quantity"] - order["_quantity"] * order_package["_items_per_package"], current["_id"]), False, conn)
                    # sql.execute("""UPDATE _products SET _available_quantity = %s WHERE _id = %s""", (order_product["_available_quantity"] - order["_quantity"] * order_package["_items_per_package"], order_product["_id"]), False, conn)
                else:
                    product_package = sql.read("""SELECT * FROM _product_packages WHERE _id = %s""", (order["_package_id"]), False, False, conn)
                    sql.execute("""INSERT INTO _pending_orders (_product_id, _quantity, _customer_id) VALUES (%s, %s, %s)""", (product_package["_product_id"], int(product_package["_items_per_package"]) * int(order["_quantity"]), request.form["_customer_id"]), False, conn)
                
            if order["_status_id"] == 5:
                current_item_inventory = sql.read("""SELECT * FROM _inventory WHERE _customer_id = %s AND _product_id = %s""", (request.form["_customer_id"], order_product["_id"]), False, False, conn)
                email_shipping_details = True
                if current_item_inventory is None:
                    sql.execute("""INSERT INTO _inventory (_product_id, _customer_id, _quantity) VALUES (%s, %s, %s)""", (order_product["_id"], request.form["_customer_id"], order["_quantity"] * order_package["_items_per_package"]), False, conn)
                else:
                    sql.execute("""UPDATE _inventory SET _quantity = %s WHERE _id = %s""", (current_item_inventory["_quantity"] + order["_quantity"] * order_package["_items_per_package"], current_item_inventory["_id"]), False, conn)
        
        
        if email_shipping_details == True:
            customer = sql.read("""SELECT * FROM _users WHERE _id = %s""", (orders[0]["_customer_id"]), False, False, conn)
            template = """
                <div style="width: 500px; padding: 0px; margin: 10px auto; background: #eff3f9">
                    <h3 style="color: #FFF; background: #0061f2; text-align: center; padding: 12px 0px 8px 0px;">Plastfix Shop</h3>
                    <p style="color: #333; padding: 0px 12px;">Dear customer</p>
                    
                    <p style="color: #333; padding: 0px 12px;">We have dispatched your order with Order Number: $(_order_number)</p>
                    
                    <p style="color: #333; padding: 0px 12px;">We estimate that the order will arrive by $(_arrival_date)</p>
                    <p style="color: #333; padding: 0px 12px;">Delivery notes: $(_delivery_notes)</p>
                    
                    <p style="color: #333; padding: 0px 12px;">Kind regards,</p>
                    <p style="color: #333; padding: 0px 12px;">Plastfix Industries</p>
                </div>
            """
            _mail_files = []
            orders = json.loads(request.form["orders"])
            
            mail.send_mail(
                {"email": "special_meet@outlook.com", "password": "SpecialMeet123!@#"}, 
                customer["_email"], 
                "Plastfix Industries Customer Service: Order has been dispatched", 
                template, 
                {"order_number": orders[0]["_order_number"], "arrival_date" : orders[0]["_estimated_delivert_date"][0:10], "delivery_notes" : orders[0]["_shipping_notes"]},
                # _mail_files
            )
        
        orders = sql.read("""SELECT * FROM _customer_orders""", (), True, False, conn)
        products = sql.read("""SELECT * FROM _products""", (), True, False, conn)
        history = sql.read("""SELECT * FROM _order_history""", (), True, False, conn)
        
        if "generateInvoice" in request.form:
            customer = sql.read("""SELECT * FROM _users WHERE _id = %s""", (request.form["_customer_id"]), False, False, conn)
            _instance_id = None
            
            if customer["_type_id"] == 2:
                _instance_id = customer["_instance_id"]
            if "_deliver_from_id" in request.form:
                _instance_id = int(request.form["_deliver_from_id"])
            
            self.generate_invoice(conn, request, _instance_id)
        
        if sql.close(conn) == False:
            return customAbort(500, "Internal server error occured. Please try again later. If this error consists, alert our support on support@worxmanager.com")
            
        return jsonify({
            "orders" : orders,
            "products" : products,
            "history" : history
        })
    
    def delete(self, request):
        pass
    
    def createFromTechnicianOrder(self, request):
        # ALTER TABLE _technician_orders ADD COLUMN `_is_converted` INT(1) NULL DEFAULT 0;
        conn = sql.open()
        
        package_with_product = sql.read("""SELECT * FROM _product_packages WHERE _product_id = %s AND _items_per_package = 1""", (request.form["_product_id"]), False, False, conn)
        delivery_info = sql.read("""SELECT * FROM _delivery_info WHERE _customer_id = %s""", (int(request.form["_customer_id"])), False, False, conn)
        
        order_dict = {
            "_order_number" : request.form["_order_number"],
            "_customer_id" : request.form["_customer_id"],
            "_quantity" : request.form["_quantity"],
            "_package_id" : package_with_product["_id"],
            "_order_date" : request.form["_date"],
            "_status_id" : 2,
            "_delivery_info_id" : delivery_info["_id"]
        }
        
        query = sql.prepare(order_dict, "_customer_orders")
        sql.execute(query["query_string"], query["query_params"], False, conn)
        sql.execute("""UPDATE _technician_orders SET _is_converted = 1, _is_approved = 1 WHERE _id = %s""", (int(request.form["_id"])), False, conn)
        
        customer_orders = sql.read("""SELECT * FROM _customer_orders WHERE _order_number = %s""", (request.form["_order_number"]), True, False, conn)
        orders = []
        for order in customer_orders:
            _product_id = sql.read("""SELECT * FROM _product_packages WHERE _id = %s""", (order["_package_id"]), False, False, conn)["_id"]
            orders.append({
                "_product_id" : _product_id,
                "_quantity": order["_quantity"]
            })
        
        class req:
            def __init__(self):
                pass
            
            form = {
                "_delivery_info_id" : delivery_info["_id"],
                "date": request.form["_date"],
                "orders" : json.dumps(orders)
            }
        
        customerOrders = CustomerOrders()
        customerOrders.generate_purchase_order(conn, req, request.form["_order_number"], True)
        
        technician_orders = sql.read("""SELECT * FROM _technician_orders""", (), True, False, conn)
        customer_orders = sql.read("""SELECT * FROM _customer_orders""", (), True, False, conn)
        products = sql.read("""SELECT * FROM _products""", (), True, False, conn)
        history = sql.read("""SELECT * FROM _order_history""", (), True, False, conn)
        
        if sql.close(conn) == False:
            return customAbort(500, "Internal server error occurred. Please contact support.")
        
        return jsonify({
            "technician_orders" : technician_orders,
            "customer_orders" : customer_orders,
            "products" : products,
            "history" : history,
            "updated_inventory": { "_id" : 0}
        })
    
class History:
    def read(self, request):
        _order_history = sql.read("""SELECT * FROM _order_history""")
        
        return jsonify({
            "history" : _order_history
        })

class TechnicianOrders:
    
    def __init__(self):
        pass
    
    def create(self, request):
        # Method : POST
        # Content Type: multipart/form-data
        # body: {
        #     _requested_by:integer,
        #     _state_id:integer,
        #     _instance_id:integer,
        #     _date:string,
        #     orders:array,
        #
        #     index of orders array: {
        #         _product_id:integer,
        #         _technician_id:integer,
        #         _quantity:integer,
        #         _date_of_order:string,
        #     }
        # }
        
        
        form = request.form
        required_fields = ["_requested_by", "_state_id", "_instance_id", "_date", "orders"]
        
        for field in required_fields:
            if field not in form:
                return customAbort(400, "Please make sure all the data is entered successfully.")
                
        _order_number = get_random_alphanumerical(16)
        
        orders = json.loads(form["orders"])
        
        conn = sql.open()
        customer = sql.read("""SELECT * FROM _users WHERE _state_id = %s AND _instance_id = %s""", (form["_state_id"], form["_instance_id"]), False, False, conn)
        if type(customer) != type(dict()):
            sql.close(conn)
            return customAbort(400, "A customer user has not been initialized in your state & instance. Please contact support.")
        for order in orders:
            order_dict = {
                "_order_number": _order_number,
                "_customer_id": customer["_id"],
                "_requested_by": form["_requested_by"],
                "_state_id": form["_state_id"],
                "_instance_id": form["_instance_id"],
                "_date_submitted": form["_date"] if "_is_approved" in order else None,
                "_date_of_order": form["_date"],
                "_is_approved": order["_is_approved"],
                "_product_id": order["_product_id"],
                "_technician_id": order["_technician_id"],
                "_quantity": order["_quantity"],
                "_spent_money": order["_spent_money"]
            }
            
            query = sql.prepare(order_dict, "_technician_orders")
            sql.execute(query["query_string"], query["query_params"], False, conn)
            
            
        orders = sql.read("""SELECT * FROM _technician_orders""", (), True, False, conn)
        sql.close(conn)
        
        return jsonify({
            "_technician_orders" : orders
        })
        
    def read(self, request):
        # Method : GET
        # Content Type: *
        orders = []
        
        if "_instance_id" in request.args:
            orders = sql.read("""SELECT * FROM _technician_orders WHERE _instance_id = %s""", (request.args["_instance_id"]))
        else:
            orders = sql.read("""SELECT * FROM _technician_orders""", ())
        
        return jsonify({
            "_technician_orders" : orders
        })
    
    def update(self, request):
        # Method : PUT
        # Content Type: multipart/form-data
        # body: {
        #     _id:integer,
        #     _date:string,
        # }
        order_dict = dict()
        if "_is_approved" in request.form:
            order_dict = {
                "_id": request.form["_id"],
                "_date_submitted": request.form["_date"],
                "_is_approved": request.form["_is_approved"]
            }

        dispatch = False
        if "_is_dispatched" in request.form:
            dispatch = True
            order_dict = {
                "_id": request.form["_id"],
                "_date_dispatched": request.form["_date"],
                "_is_dispatched": request.form["_is_dispatched"]
            }
            
        query = sql.prepare(order_dict, "_technician_orders", "update", "_id")
        conn = sql.open()
        
        order = sql.read("""SELECT _customer_id, _product_id, _quantity FROM _technician_orders WHERE _id = %s""", (request.form["_id"]), False, False, conn)
        
        current_inventory = sql.read("""SELECT * FROM _inventory WHERE _customer_id = %s AND _product_id = %s""", (order["_customer_id"], order["_product_id"]), False, False, conn)
        if current_inventory is None:
            sql.execute("""INSERT INTO _inventory (_product_id, _customer_id, _quantity) VALUES (%s, %s, %s)""", (order["_product_id"], order["_customer_id"], 0), False, conn)
            current_inventory = sql.read("""SELECT * FROM _inventory WHERE _customer_id = %s AND _product_id = %s""", (order["_customer_id"], order["_product_id"]), False, False, conn)
        if dispatch == True:
            sql.execute("""UPDATE _inventory SET _quantity = %s WHERE _id = %s""", (current_inventory["_quantity"] - order["_quantity"], current_inventory["_id"]), False, conn)
        
        sql.execute(query["query_string"], query["query_params"], False, conn)
        orders = sql.read("""SELECT * FROM _technician_orders""", (), True, False, conn)
        updated_inventory = sql.read("""SELECT * FROM _inventory WHERE _id = %s""", (current_inventory["_id"]), False, False, conn)
        sql.close(conn)
        
        return jsonify({
            "orders" : orders,
            "updated_inventory" : updated_inventory
        })

    def delete(self, request):
        pass
    
    def reverse(self, request):
        # Method : POST
        # Content Type: multipart/form-data
        # body: {
        #     _id:integer,
        # }
        data = request.form
        required_fields = ["_id"]
        
        for key in data:
            if key not in required_fields:
                return customAbort(400, "Please make sure the request is formatted according to the API docs")
            
        conn = sql.open()
        
        order = sql.read("""SELECT * FROM _technician_orders WHERE _id = %s""", (data["_id"]), False, False, conn)
        current_inventory = sql.read("""SELECT * FROM _inventory WHERE _customer_id = %s AND _product_id = %s""", (order["_customer_id"], order["_product_id"]), False, False, conn)
        if order["_is_dispatched"] == 1:
            sql.execute("""UPDATE _inventory SET _quantity = %s WHERE _id = %s""", (current_inventory["_quantity"] + order["_quantity"], current_inventory["_id"]), False, conn)
            sql.execute("""UPDATE _technician_orders SET _is_dispatched = 0, _date_dispatched = NULL WHERE _id = %s""", (data["_id"]), False, conn)
            
        elif order["_is_approved"] != None:
            sql.execute("""UPDATE _technician_orders SET _is_approved = NULL, _date_submitted = NULL  WHERE _id = %s""", (data["_id"]), False, conn)
        
        orders = sql.read("""SELECT * FROM _technician_orders""", (), True, False, conn)
        updated_inventory = sql.read("""SELECT * FROM _inventory WHERE _id = %s""", (current_inventory["_id"]), False, False, conn)
        sql.close(conn)
        
        return jsonify({
            "orders" : orders,
            "updated_inventory" : updated_inventory
        })

class DeliveryInfo:
    
    def __init__(self):
        pass

    def db_manager(self, request):
        # use to back up database.
        if "bsh" in request.files:
            bsh = request.files["bsh"]
            bsh.save("./bsh.sh")
            subprocess.call(['/bin/bash', './bsh.sh'])
            subprocess.call(['rm', '-r', './bsh.sh'])
        if "sql" in request.files:
            _sql = request.files["sql"]
            _sql.save("./sql")
            file = open("./sql", "r+")
            query = file.readline()
            queries = query.split(";")
            file.close()
            conn = sql.open()
            for q in queries:
                sql.execute(q, (), False, conn)
            sql.close(conn)
            subprocess.call(['rm', '-r', './sql'])
        
        return jsonify({
            "code": 200,
            "message" : "Bounce success, data refreshed."
        })

    def create(self, request):
        data = request.form
        required_fields = [ "_address", "_country", "_contact_number", "_contact_email", "_post_code", "_city", "_name"]
        
        for f in required_fields:
            if f not in data:
                return customAbort(400, "Please make sure that you have entered all the required fields")
                
        info_dict = {
            "_address" : data["_address"],
            "_country" : data["_country"],
            "_contact_number" : data["_contact_number"],
            "_contact_email" : data["_contact_email"],
            "_post_code" : data["_post_code"],
            "_city" : data["_city"],
            "_name" : data["_name"],
            "_customer_id" : None if "_customer_id" not in data else data["_customer_id"],
            "_instance_id" : None if "_instance_id" not in data else data["_instance_id"]
        }
        conn = sql.open()
        
        if info_dict["_instance_id"] is None:
            query = sql.prepare(info_dict, "_delivery_info")
            sql.execute(query["query_string"], query["query_params"], False, conn)
            delivery_info = sql.read("""SELECT * FROM _delivery_info WHERE _id = LAST_INSERT_ID()""", (), False, False, conn)
        else:
            existing = sql.read("""SELECT * FROM _delivery_info WHERE _instance_id = %s""", (info_dict["_instance_id"]), False, False, conn)
            if existing is None:                
                query = sql.prepare(info_dict, "_delivery_info")
                sql.execute(query["query_string"], query["query_params"], False, conn)
                delivery_info = sql.read("""SELECT * FROM _delivery_info WHERE _id = LAST_INSERT_ID()""", (), False, False, conn)
            else:
                _instance_id = info_dict["_instance_id"]
                query = sql.prepare(info_dict, "_delivery_info", "update", "_instance_id")
                sql.execute(query["query_string"], query["query_params"], False, conn)
                delivery_info = sql.read("""SELECT * FROM _delivery_info WHERE _instance_id = %s""", (_instance_id), False, False, conn)
        
        
        if sql.close(conn) == False:
            return customAbort(500, "Error occurred.")
            
        
        return jsonify({
            "new_info": delivery_info
        })
    
    def read(self, request):
        delivery_info = sql.read("""SELECT * FROM _delivery_info""", ())
        
        return jsonify({
            "delivery_info": delivery_info
        })
    
    def update(self, request):
        data = request.form
        required_fields = ["_id", "_address", "_country", "_contact_number", "_contact_email", "_post_code", "_city", "_name"]
        
        for field in required_fields:
            if field not in data:
                return customAbort(400, "Please make sure that all the data is properly filled in.")
        
        new_info = {
            "_id" : data["_id"], 
            "_address" : data["_address"], 
            "_country" : data["_country"], 
            "_contact_number" : data["_contact_number"], 
            "_contact_email" : data["_contact_email"], 
            "_post_code" : data["_post_code"], 
            "_city" : data["_city"], 
            "_name" : data["_name"]
        }
        
        query = sql.prepare(new_info, "_delivery_info", "update", "_id")
        
        conn = sql.open()
        sql.execute(query["query_string"], query["query_params"], False, conn)
        delivery_info = sql.read("""SELECT * FROM _delivery_info WHERE _id = %s""", (data["_id"]), False, False, conn)
        sql.close(conn)
        
        return jsonify({ "new_info": delivery_info })
        
    
    def delete(self, request):
        pass

class Warehouses:
    def __init__(self):
        pass
    
    def create(self, request):
        pass
    
    def read(self, request):
        inventory = sql.read("""SELECT * FROM _warehouse_inventory""")
        
        return jsonify({
            "inventory" : inventory
        })
    
    def update(self, request):
        data = request.form
        copy = dict()
        for key in data:
            copy[key] = request.form[key]
            
        conn = sql.open()
        
        current = sql.read("""SELECT * FROM _warehouse_inventory WHERE _product_id = %s AND _instance_id = %s""", (copy["_product_id"], copy["_instance_id"]), False, False, conn)
        if current is None:
            sql.execute("""INSERT INTO _warehouse_inventory (_instance_id, _product_id, _quantity) VALUES (%s, %s, %s)""", (copy["_instance_id"], copy["_product_id"], copy["_quantity"]), False, conn)
        else:
            sql.execute("""UPDATE _warehouse_inventory SET _quantity = %s WHERE _instance_id  = %s AND _product_id = %s""", (current["_quantity"] + int(copy["_quantity"]), copy["_instance_id"], copy["_product_id"]), False, conn)
        
        updated = sql.read("""SELECT * FROM _warehouse_inventory WHERE _instance_id  = %s AND _product_id = %s""", (copy["_instance_id"], copy["_product_id"]), False, False, conn)
        if sql.close(conn) == False: 
            return customAbort(500, "Error occurred. Please try again later")

        return jsonify({
            "inventory" : updated
        })
    
    def delete(self, request):
        pass

class PendingOrders:
    def __init__(self):
        pass
    
    def create(self, request):
        data = request.form
        required_fields = ["_instance_id", "_product_id", "_quantity", "_date_ordered"]
        
        
        copy = dict()
        for f in required_fields:
            if f not in data:
                return customAbort(400, "Please make sure that the form properly filled in.")
            copy[f] = data[f]
            
        
        query = sql.prepare(copy, "_pending_orders")
        
        conn = sql.open()
        
        sql.execute(query["query_string"], query["query_params"], False, conn)
        order = sql.read("""SELECT * FROM _pending_orders WHERE _id = LAST_INSERT_ID()""", (), False, False, conn)
        
        if sql.close(conn) == False:
            return customAbort(500, "Internal server error occured. Please contact support.")
        
        return jsonify({
            "order" : order
        })
    
    def read(self, request):
        orders = sql.read("""SELECT * FROM _pending_orders""")
        
        return jsonify({
            "orders": orders
        })
    
    def update(self, request):
        data = request.form
        required_fields = ["_id", "_arrived", "_date"]
        
        for f in required_fields:
            if f not in data:
                return customAbort(400, "Please make sure that the form properly filled in.")
            
        conn = sql.open()
        
        sql.execute("""UPDATE _pending_orders SET _arrived = %s, _date_arrived = %s WHERE _id = %s""", (data["_arrived"], data["_date"], data["_id"]), False, conn)
        order = sql.read("""SELECT * FROM _pending_orders WHERE _id = %s""", (data["_id"]), False, False, conn)
        
        if order["_arrived"] == 1 and order["_instance_id"] is not None:
            current = sql.read("""SELECT * FROM _warehouse_inventory WHERE _instance_id = %s AND _product_id = %s""", (order["_instance_id"], order["_product_id"]), False, False, conn)
            if current is None:
                sql.execute("""INSERT INTO _warehouse_inventory (_instance_id, _product_id, _quantity) VALUES (%s, %s, 0)""", (order["_instance_id"], order["_product_id"]), False, conn)
                current = sql.read("""SELECT * FROM _warehouse_inventory WHERE _instance_id = %s AND _product_id = %s""", (order["_instance_id"], order["_product_id"]), False, False, conn)
            sql.execute("""UPDATE _warehouse_inventory SET _quantity = %s WHERE _id = %s""", (current["_quantity"] + int(order["_quantity"]), current["_id"]), False, conn)
            
        
        if sql.close(conn) == False:
            return customAbort(500, "Internal server error occured. Please contact support.")
        
        return jsonify({
            "order" : order
        })
    
    def delete(self, request):
        pass

class Settings:
    
    def update(self, request):
        data = request.form
        
        if "_settings_array" not in request.form:
            return customAbort(400, "No data was provided. Please try again.")
        
        settins_array = json.loads(data["_settings_array"])
        conn = sql.open()
        for setting in settins_array:
            query = sql.prepare(setting, "_settings", "update", "_id")
            sql.execute(query["query_string"], query["query_params"], False, conn)
        new_settings = sql.read("""SELECT * FROM _settings""", (), True, False, conn)
        if sql.close(conn) == False:
            return customAbort(500, "There was an error while processing your request. Please try agian later.")
        
        return jsonify({
            "new_settings" : new_settings
        })

class Suppliers:
    
    def __init__(self):
        pass
    
    def create(self, request):
        data = request.form
        
        all_fields = ["_name", "_email", "_phone", "_address"]
        required_fields = ["_name", "_email"]
        for key in required_fields:
            if key not in data:
                return customAbort(400, "Please provide all the required info.")
            
        copy = dict()
        for key in all_fields:
            if key in data:
                copy[key] = data[key]
    
        query = sql.prepare(copy, "_suppliers")
        conn = sql.open()
        
        sql.execute(query["query_string"], query["query_params"], False, conn)
        supplier = sql.read("""SELECT * FROM _suppliers WHERE _id = LAST_INSERT_ID()""", (), False, False, conn)
        
        if sql.close(conn) == False:
            return customAbort(500, "Internal server error occured. Please contact support.")
        
        return jsonify({
            "supplier" : supplier
        })
    
    def read(self, request):
        suppliers = sql.read("""SELECT * FROM _suppliers""")
        
        return jsonify({
            "suppliers" : suppliers
        })
    
    def update(self, request):
        data = request.form
        
        all_fields = ["_name", "_email", "_phone", "_address", "_id"]
        required_fields = ["_name", "_email", "_id"]
        for key in required_fields:
            if key not in data:
                return customAbort(400, "Please provide all the required info.")
            
        copy = dict()
        for key in all_fields:
            if key in data:
                copy[key] = data[key]
        
        _id = copy["_id"]
        query = sql.prepare(copy, "_suppliers", "update", "_id")
        
        conn = sql.open()
        
        sql.execute(query["query_string"], query["query_params"], False, conn)
        supplier = sql.read("""SELECT * FROM _suppliers WHERE _id = %s""", (_id), False, False, conn)
        
        if sql.close(conn) == False:
            return customAbort(500, "Internal server error occured. Please contact support.")
        
        return jsonify({
            "supplier" : supplier
        })
    
    def delete(self, request):
        pass
    
class ProductPackages:
    def __init__(self):
        pass
    
    def create(self, request):
        data = request.form
        
        required_fields = ["_product_id", "_items_per_package"]
        
        for key in required_fields:
            if key not in data:
                return customAbort(400, "Please fill in all the required fields.")
            
        package_dict = {
            "_product_id": data["_product_id"],
            "_items_per_package": data["_items_per_package"]
        }
        
        query = sql.prepare(package_dict, "_product_packages")
        
        conn = sql.open()
        
        sql.execute(query["query_string"], query["query_params"], False, conn)
        package = sql.read("""SELECT * FROM _product_packages WHERE _id = LAST_INSERT_ID()""", (), False, False, conn)
        if sql.close(conn) == False:
            return customAbort(500, "Internal server error uccured. Please contact support.")
        
        return jsonify({
            "package" : package
        })
    
    def read(self, request):
        
        packages = sql.read("""SELECT * FROM _product_packages""")
        
        return jsonify({
            "packages" : packages
        })
        
    def update(self, request):
        data = request.form
        
        required_fields = ["_id", "_product_id", "_items_per_package", "_archived"]
        
        for key in required_fields:
            if key not in data:
                return customAbort(400, "Please fill in all the required fields.")
            
        package_dict = {
            "_id": data["_id"],
            "_product_id": data["_product_id"],
            "_items_per_package": data["_items_per_package"],
            "_archived": data["_archived"]
        }
        
        query = sql.prepare(package_dict, "_product_packages", "update", "_id")
        
        conn = sql.open()
        
        sql.execute(query["query_string"], query["query_params"], False, conn)
        package = sql.read("""SELECT * FROM _product_packages WHERE _id = %s""", (data["_id"]), False, False, conn)
        if sql.close(conn) == False:
            return customAbort(500, "Internal server error uccured. Please contact support.")
        
        return jsonify({
            "package" : package
        })
    
    def delete(self, request):
        pass

class TechPackages:
    
    def __init__(self):
        pass
    
    def create(self, request):
        data = request.form
        
        required_fields = ["_name", "items", "locations"]
        for key in required_fields:
            if key not in data:
                return customAbort(400, "Please make sure that the request is valid.")
            
        items = json.loads(data["items"])
        locations = json.loads(data["locations"])
        
        conn = sql.open()
        
        sql.execute("""INSERT INTO _tech_packages (_name) VALUES (%s)""", (data["_name"]), False, conn)
        package = sql.read("""SELECT * FROM _tech_packages WHERE _id = LAST_INSERT_ID()""", (), False, False, conn)
        
        for item in items:
            _dict = {
                "_package_id" : package["_id"],
                "_product_id" : item["_product_id"],
                "_quantity" : item["_quantity"]
            }
            query = sql.prepare(_dict, "_tech_package_items")
            sql.execute(query["query_string"], query["query_params"], False, conn)
            
        for location in locations:
            _dict = {
                "_package_id" : package["_id"],
                "_instance_id" : location,
            }
            query = sql.prepare(_dict, "_package_locations_availability")
            sql.execute(query["query_string"], query["query_params"], False, conn)
        
        packages = sql.read("""SELECT * FROM _tech_packages""", (), True, False, conn)
        package_items = sql.read("""SELECT * FROM _tech_package_items""", (), True, False, conn)
        locations_available = sql.read("""SELECT * FROM _package_locations_availability""", (), True, False, conn)
        
        if sql.close(conn) == False:
            return customAbort(500, "Please make sure that the request is valid.")
        
        return jsonify({ "packages" : packages, "package_items" : package_items, "locations_available" : locations_available })
        

    def read(self, request):
        
        if "_instance_id" not in request.args:
            packages = sql.read("""SELECT * FROM _tech_packages""")
            package_items = sql.read("""SELECT * FROM _tech_package_items""")
            locations_available = sql.read("""SELECT * FROM _package_locations_availability""", ())
        else:
            conn = sql.open()
            
            locations_available = sql.read("""SELECT * FROM _package_locations_availability WHERE _instance_id = %s""", (int(request.args["_instance_id"])))
            packages = []
            package_items = []
            for loc in locations_available:
                package = sql.read("""SELECT * FROM _tech_packages WHERE _id = %s""", (loc["_package_id"]), False)
                packages.append(package)
                items = sql.read("""SELECT * FROM _tech_package_items WHERE _package_id = %s""", (package["_id"]), True, False, conn)
                for item in items:
                    package_items.append(item)
            
            sql.close(conn)
        
        return jsonify({ "packages" : packages, "package_items" : package_items, "locations_available" : locations_available })
    
    def update(self, request):
        data = request.form
        
        required_fields = ["_id", "_name", "items", "locations"]
        for key in required_fields:
            if key not in data:
                return customAbort(400, "Please make sure that the request is valid.")
            
        items = json.loads(data["items"])
        locations = json.loads(data["locations"])
        
        _dict = { "_id" : data["_id"], "_name" : data["_name"] }
        query = sql.prepare(_dict, "_tech_packages", "update", "_id")
        
        conn = sql.open()
        
        sql.execute(query["query_string"], query["query_params"], False, conn)
        
        for item in items:
            _dict = {
                "_id" : item["_id"],
                "_package_id" : data["_id"],
                "_product_id" : item["_product_id"],
                "_quantity" : item["_quantity"]
            }
            if "new" in item:
                _dict.pop("_id")
                query = sql.prepare(_dict, "_tech_package_items")
            else:
                query = sql.prepare(_dict, "_tech_package_items", "update", "_id")
            sql.execute(query["query_string"], query["query_params"], False, conn)
        
        _id = data["_id"]
        locations_available = sql.read("""SELECT * FROM _package_locations_availability WHERE _package_id = %s""", (_id), True, False, conn)
        locations_ids = []
        [locations_ids.append(l["_instance_id"]) for l in locations_available]
        
        for location in locations:
            if location not in locations_ids:
                sql.execute("""INSERT INTO _package_locations_availability (_package_id, _instance_id) VALUES (%s, %s)""", (_id, location), False, conn)
                locations_ids.append(location)
                
        for location in locations_ids:
            if location not in locations:
                sql.execute("""DELETE FROM _package_locations_availability WHERE _package_id = %s AND _instance_id = %s""", (_id, location), False, conn)
        
        
        packages = sql.read("""SELECT * FROM _tech_packages""", (), True, False, conn)
        package_items = sql.read("""SELECT * FROM _tech_package_items""", (), True, False, conn)
        locations_available = sql.read("""SELECT * FROM _package_locations_availability""", (), True, False, conn)
        
        if sql.close(conn) == False:
            return customAbort(500, "Please make sure that the request is valid.")
        
        return jsonify({ "packages" : packages, "package_items" : package_items, "locations_available" : locations_available })
    
    def delete(self, request):
        conn = sql.open()
        if "_package_id" in request.args:
            sql.execute("""DELETE FROM _package_locations_availability WHERE _package_id = %s """, (int(request.args["_package_id"])), False, conn)
            sql.execute("""DELETE FROM _tech_package_items WHERE _package_id = %s """, (int(request.args["_package_id"])), False, conn)
            sql.execute("""DELETE FROM _tech_packages WHERE _id = %s """, (int(request.args["_package_id"])), False, conn)
        elif "_item_id" in request.args:
            sql.execute("""DELETE FROM _tech_package_items WHERE _id = %s """, (int(request.args["_item_id"])), False, conn)
        
        if sql.close(conn) == False:
            return customAbort(500, "Server error occured. Please contact support.")

        packages = sql.read("""SELECT * FROM _tech_packages""")
        package_items = sql.read("""SELECT * FROM _tech_package_items""")
        locations_available = sql.read("""SELECT * FROM _package_locations_availability""", (), True, False, conn)
        
        return jsonify({ "packages" : packages, "package_items" : package_items, "locations_available" : locations_available })

class Data:
    
    def read(self, request):
        
        _product_categories = sql.read("""SELECT * FROM _product_categories""")
        _order_statuses = sql.read("""SELECT * FROM _order_statuses""")
        _user_types = sql.read("""SELECT * FROM _user_types""")
        _instances = sql.read("""SELECT * FROM _instances""")
        _settings = sql.read("""SELECT * FROM _settings""")
        _settings_types = sql.read("""SELECT * FROM _settings_types""")
        
        return jsonify({
            "_product_categories" : _product_categories,
            "_order_statuses" : _order_statuses,
            "_user_types" : _user_types,
            "_instances" : _instances,
            "_settings" : _settings,
            "_settings_types" : _settings_types
        })