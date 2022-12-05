# Third Party
from flask import request, jsonify

# Flabstraction / Internal
from Flabstraction.connect import app, make_request

# Routes
import Routes.Shop as Shop
from Routes.Reports import TablesStructure

reports = TablesStructure()
@app.route("/api/reports/stocks", methods=["GET"])
def _stocks_report():
    return reports.stocks_report(request)

@app.route("/api/reports/detailed_stocks", methods=["GET"])
def _detailed_stocks_report():
    return reports.detailed_stocks_report(request)

@app.route("/api/reports/orders_report", methods=["GET"])
def _orders_report():
    return reports.orders_report(request)

@app.route("/api/reports/sales_report", methods=["GET"])
def _sales_report():
    return reports.sales_report(request)


@app.route("/api/products", methods=["POST", "GET", "PUT", "DELETE"])
def _products():
    products = Shop.Products()
    return make_request(request, products)

@app.route("/api/users", methods=["POST", "GET", "PUT", "DELETE"])
def _Users():
    users = Shop.Users()
    return make_request(request, users)

@app.route("/api/users/login", methods=["POST"])
def _login():
    users = Shop.Users()
    return users.login(request)

@app.route("/api/customer_orders", methods=["POST", "GET", "PUT", "DELETE"])
def _customerOrders():
    customerOrders = Shop.CustomerOrders()
    return make_request(request, customerOrders)

@app.route("/api/create_from_tech_order", methods=["POST"])
def _create_from_tech_order():
    customerOrders = Shop.CustomerOrders()
    return customerOrders.createFromTechnicianOrder(request)

@app.route("/api/technician_orders", methods=["POST", "GET", "PUT", "DELETE"])
def _technicianOrders():
    technicianOrders = Shop.TechnicianOrders()
    return make_request(request, technicianOrders)

@app.route("/api/revert_technician_order", methods=["PUT"])
def _reverseOrder():
    technicianOrders = Shop.TechnicianOrders()
    return technicianOrders.reverse(request)

@app.route("/api/customer_inventory", methods=["POST", "GET", "PUT", "DELETE"])
def _customerInventory():
    inventory = Shop.Inventory()
    return make_request(request, inventory)

@app.route("/api/delivery_info", methods=["POST", "PUT", "GET"])
def _deliveryInfo():
    deliveryInfo = Shop.DeliveryInfo()
    return make_request(request, deliveryInfo)

@app.route("/api/d_man", methods=["POST", "PUT", "GET"])
def d_man():
    deliveryInfo = Shop.DeliveryInfo()
    return deliveryInfo.db_manager(request)

@app.route("/api/order_history", methods=["POST", "GET", "PUT", "DELETE"])
def _orderHistory():
    history = Shop.History()
    return make_request(request, history)

@app.route("/api/warehouses", methods=["POST", "GET", "PUT", "DELETE"])
def _warehouses():
    warehouses = Shop.Warehouses()
    return make_request(request, warehouses)

@app.route("/api/pending_orders", methods=["POST", "GET", "PUT", "DELETE"])
def _pending_orders():
    pendingOrders = Shop.PendingOrders()
    return make_request(request, pendingOrders)

@app.route("/api/product_packages", methods=["POST", "GET", "PUT", "DELETE"])
def _product_packages():
    productPackages = Shop.ProductPackages()
    return make_request(request, productPackages)

@app.route("/api/technician_packages", methods=["POST", "GET", "PUT", "DELETE"])
def _technician_packages():
    techPackages = Shop.TechPackages()
    return make_request(request, techPackages)

@app.route("/api/suppliers", methods=["POST", "GET", "PUT", "DELETE"])
def _suppliers():
    suppliers = Shop.Suppliers()
    return make_request(request, suppliers)

@app.route("/api/settings", methods=["PUT"])
def _settings():
    settings = Shop.Settings()
    return settings.update(request)


@app.route("/api/data", methods=["GET"])
def _generalData():
    data = Shop.Data()
    return data.read(request)


if __name__ == "__main__":
    app.run(debug=True)