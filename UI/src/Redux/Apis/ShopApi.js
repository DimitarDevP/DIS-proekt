import { CONSTANTS } from "../../../package.json"
import { statuses } from "../constants"

export const products = {
    "create": async product => {
        const res = await fetch(CONSTANTS.API_URL + "/api/products", {
            "method": "POST",
            "body": product,
            "Content-Type": "multipart/form-data"
        })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    },
    "read": async () => {
        const res = await fetch(CONSTANTS.API_URL + "/api/products", { "method": "GET", })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    },
    "update": async product => {
        const res = await fetch(CONSTANTS.API_URL + "/api/products", {
            "method": "PUT",
            "body": product,
            "Content-Type": "multipart/form-data"
        })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    },
    "delete": async (_id, _retrive = undefined) => {
        let url = CONSTANTS.API_URL + "/api/products?_id=" + _id
        if (_retrive === true) url = url + "&_retrive"
        const res = await fetch(url, { "method": "DELETE" })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    }
}

export const customerOrders = {
    "create": async order => {
        const res = await fetch(CONSTANTS.API_URL + "/api/customer_orders", {
            "method": "POST",
            "body": order,
            "Content-Type": "multipart/form-data"
        })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    },
    "read": async () => {
        const res = await fetch(CONSTANTS.API_URL + "/api/customer_orders", { "method": "GET", })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    },
    "update": async order => {
        const res = await fetch(CONSTANTS.API_URL + "/api/customer_orders", {
            "method": "PUT",
            "body": order,
            "Content-Type": "multipart/form-data"
        })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    },
    "delete": async (_id, _retrive = undefined) => {
        let url = CONSTANTS.API_URL + "/api/customer_orders?_id=" + _id
        if (_retrive === true) url = CONSTANTS.API_URL + "/api/customer_orders?_id=" + _id + "&_retrive"
        const res = await fetch(url, { "method": "DELETE" })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    },
    "createFromTechnicianOrder": async order => {
        const res = await fetch(CONSTANTS.API_URL + "/api/create_from_tech_order", {
            "method": "POST",
            "body": order,
            "Content-Type": "multipart/form-data"
        })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    }
}

export const _readInventory = async () => {
    const res = await fetch(CONSTANTS.API_URL + "/api/customer_inventory", { "method": "GET", })

    const data = await res.json()
    if (res.status >= 400) throw data
    return data
}

export const _readHistory = async () => {
    const res = await fetch(CONSTANTS.API_URL + "/api/order_history", { "method": "GET", })

    const data = await res.json()
    if (res.status >= 400) throw data
    return data
}

export const technicianOrders = {
    "read": async () => {
        const res = await fetch(CONSTANTS.API_URL + "/api/technician_orders", { "method": "GET", })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    },
    "update": async (order, revert) => {
        const append = revert === false ? "/api/technician_orders" : "/api/revert_technician_order"
        const res = await fetch(CONSTANTS.API_URL + append, {
            "method": "PUT",
            "body": order,
            "Content-Type": "multipart/form-data"
        })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    },
    "reverse": async (order, revert) => {
        const append = revert === false ? "" : "?revert"
        const res = await fetch(CONSTANTS.API_URL + "/api/technician_orders" + append, {
            "method": "PUT",
            "body": order,
            "Content-Type": "multipart/form-data"
        })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    }
}

export const wearhouses = {
    "read": async () => {
        const res = await fetch(CONSTANTS.API_URL + "/api/warehouses", { "method": "GET", })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    },
    "update": async inventory => {
        const res = await fetch(CONSTANTS.API_URL + "/api/warehouses", {
            "method": "PUT",
            "body": inventory,
            "Content-Type": "multipart/form-data"
        })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    }
}

export const pendingOrders = {
    "create": async order => {
        const res = await fetch(CONSTANTS.API_URL + "/api/pending_orders", {
            "method": "POST",
            "body": order,
            "Content-Type": "multipart/form-data"
        })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    },
    "read": async () => {
        const res = await fetch(CONSTANTS.API_URL + "/api/pending_orders", { "method": "GET", })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    },
    "update": async order => {
        const res = await fetch(CONSTANTS.API_URL + "/api/pending_orders", {
            "method": "PUT",
            "body": order,
            "Content-Type": "multipart/form-data"
        })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    }
}

export const suppliers = {
    "create": async order => {
        const res = await fetch(CONSTANTS.API_URL + "/api/suppliers", {
            "method": "POST",
            "body": order,
            "Content-Type": "multipart/form-data"
        })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    },
    "read": async () => {
        const res = await fetch(CONSTANTS.API_URL + "/api/suppliers", { "method": "GET", })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    },
    "update": async order => {
        const res = await fetch(CONSTANTS.API_URL + "/api/suppliers", {
            "method": "PUT",
            "body": order,
            "Content-Type": "multipart/form-data"
        })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    }
}

export const productPackages = {
    "create": async pkg => {
        const res = await fetch(CONSTANTS.API_URL + "/api/product_packages", {
            "method": "POST",
            "body": pkg,
            "Content-Type": "multipart/form-data"
        })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    },
    "read": async () => {
        const res = await fetch(CONSTANTS.API_URL + "/api/product_packages", { "method": "GET", })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    },
    "update": async pkg => {
        const res = await fetch(CONSTANTS.API_URL + "/api/product_packages", {
            "method": "PUT",
            "body": pkg,
            "Content-Type": "multipart/form-data"
        })

        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    }
}

export const technicianPackages = {
    "create" : async pkg => {
        const res = await fetch(CONSTANTS.API_URL + "/api/technician_packages", {
            "method": "POST",
            "body": pkg,
            "Content-Type": "multipart/form-data"
        })
    
        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    },
    "read" : async () => {
        const res = await fetch(CONSTANTS.API_URL + "/api/technician_packages", { "method": "GET", })
    
        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    },
    "update" : async pkg => {
        const res = await fetch(CONSTANTS.API_URL + "/api/technician_packages", {
            "method": "PUT",
            "body": pkg,
            "Content-Type": "multipart/form-data"
        })
    
        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    },
    "delete" : async ({ name, value }) => {
        const res = await fetch(`${CONSTANTS.API_URL}/api/technician_packages?${name}=${value}`, {
            "method": "DELETE",
            "Content-Type": "multipart/form-data"
        })
    
        const data = await res.json()
        if (res.status >= 400) throw data
        return data
    }
}