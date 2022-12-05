import {
    products,
    customerOrders,
    technicianOrders,
    wearhouses,
    pendingOrders,
    productPackages,
    suppliers,
    technicianPackages,
    _readHistory, _readInventory
} from "../Apis/ShopApi"
import {
    CREATE_PRODUCT_REQUEST,
    CREATE_PRODUCT_SUCCESS,
    CREATE_PRODUCT_FAILURE,
    READ_PRODUCT_REQUEST,
    READ_PRODUCT_SUCCESS,
    READ_PRODUCT_FAILURE,
    UPDATE_PRODUCT_REQUEST,
    UPDATE_PRODUCT_SUCCESS,
    UPDATE_PRODUCT_FAILURE,
    DELETE_PRODUCT_REQUEST,
    DELETE_PRODUCT_SUCCESS,
    DELETE_PRODUCT_FAILURE,
    CREATE_ORDER_REQUEST,
    CREATE_ORDER_SUCCESS,
    CREATE_ORDER_FAILURE,
    READ_ORDER_REQUEST,
    READ_ORDER_SUCCESS,
    READ_ORDER_FAILURE,
    UPDATE_ORDER_REQUEST,
    UPDATE_ORDER_SUCCESS,
    UPDATE_ORDER_FAILURE,
    READ_INVENTORY_REQUEST,
    READ_INVENTORY_SUCCESS,
    READ_INVENTORY_FAILURE,
    READ_ORDER_HISTORY_FAILURE,
    READ_ORDER_HISTORY_SUCCESS,
    READ_ORDER_HISTORY_REQUEST,
    READ_TECH_ORDER_REQUEST,
    READ_TECH_ORDER_SUCCESS,
    READ_TECH_ORDER_FAILURE,
    UPDATE_TECH_ORDER_REQUEST,
    UPDATE_TECH_ORDER_SUCCESS,
    UPDATE_TECH_ORDER_FAILURE,
    READ_WAREHOUSE_DATA_REQUEST,
    READ_WAREHOUSE_DATA_SUCCESS,
    READ_WAREHOUSE_DATA_FAILURE,
    UPDATE_WAREHOUSE_DATA_REQUEST,
    UPDATE_WAREHOUSE_DATA_SUCCESS,
    UPDATE_WAREHOUSE_DATA_FAILURE,
    CREATE_PENDING_ORDER_REQUEST,
    CREATE_PENDING_ORDER_SUCCESS,
    CREATE_PENDING_ORDER_FAILURE,
    READ_PENDING_ORDER_REQUEST,
    READ_PENDING_ORDER_SUCCESS,
    READ_PENDING_ORDER_FAILURE,
    UPDATE_PENDING_ORDER_REQUEST,
    UPDATE_PENDING_ORDER_SUCCESS,
    UPDATE_PENDING_ORDER_FAILURE,
    CREATE_SUPPLIER_REQUEST,
    CREATE_SUPPLIER_SUCCESS,
    CREATE_SUPPLIER_FAILURE,
    READ_SUPPLIER_REQUEST,
    READ_SUPPLIER_SUCCESS,
    READ_SUPPLIER_FAILURE,
    UPDATE_SUPPLIER_REQUEST,
    UPDATE_SUPPLIER_SUCCESS,
    UPDATE_SUPPLIER_FAILURE,
    CREATE_PACKAGE_REQUEST,
    CREATE_PACKAGE_SUCCESS,
    CREATE_PACKAGE_FAILURE,
    READ_PACKAGE_REQUEST,
    READ_PACKAGE_SUCCESS,
    READ_PACKAGE_FAILURE,
    UPDATE_PACKAGE_REQUEST,
    UPDATE_PACKAGE_SUCCESS,
    UPDATE_PACKAGE_FAILURE,
    CREATE_TECH_PACKAGE_REQUEST,
    CREATE_TECH_PACKAGE_SUCCESS,
    CREATE_TECH_PACKAGE_FAILURE,
    READ_TECH_PACKAGE_REQUEST,
    READ_TECH_PACKAGE_SUCCESS,
    READ_TECH_PACKAGE_FAILURE,
    UPDATE_TECH_PACKAGE_REQUEST,
    UPDATE_TECH_PACKAGE_SUCCESS,
    UPDATE_TECH_PACKAGE_FAILURE,
    DELETE_TECH_PACKAGE_REQUEST,
    DELETE_TECH_PACKAGE_SUCCESS,
    DELETE_TECH_PACKAGE_FAILURE,
} from "../constants"

export const _products = {
    "create": product => {
        return (dispatch, getState) => {
            dispatch({ type: CREATE_PRODUCT_REQUEST })
            products.create(product)
                .then(res => dispatch({ type: res.message === undefined ? CREATE_PRODUCT_SUCCESS : CREATE_PRODUCT_FAILURE, payload: res }))
                .catch(error => dispatch({ type: CREATE_PRODUCT_FAILURE, payload: error }))
        }
    },
    "read": () => {
        return (dispatch, getState) => {
            dispatch({ type: READ_PRODUCT_REQUEST })
            products.read()
                .then(res => dispatch({ type: READ_PRODUCT_SUCCESS, payload: res }))
                .catch(error => dispatch({ type: READ_PRODUCT_FAILURE, payload: error }))
        }
    },
    "update": product => {
        return (dispatch, getState) => {
            dispatch({ type: UPDATE_PRODUCT_REQUEST })
            products.update(product)
                .then(res => dispatch({ type: UPDATE_PRODUCT_SUCCESS, payload: res }))
                .catch(error => dispatch({ type: UPDATE_PRODUCT_FAILURE, payload: error }))
        }
    },
    "delete": (_id, _retrive = undefined) => {
        return (dispatch, getState) => {
            dispatch({ type: DELETE_PRODUCT_REQUEST })
            products.delete(_id, _retrive)
                .then(res => dispatch({ type: DELETE_PRODUCT_SUCCESS, payload: res }))
                .catch(error => dispatch({ type: DELETE_PRODUCT_FAILURE, payload: error }))
        }
    }
}

export const _customer_orders = {
    "create": order => {
        return (dispatch, getState) => {
            dispatch({ type: CREATE_ORDER_REQUEST })
            customerOrders.create(order)
                .then(res => dispatch({ type: CREATE_ORDER_SUCCESS, payload: res }))
                .catch(error => dispatch({ type: CREATE_ORDER_FAILURE, payload: error }))
        }
    },
    "read": () => {
        return (dispatch, getState) => {
            dispatch({ type: READ_ORDER_REQUEST })
            customerOrders.read()
                .then(res => dispatch({ type: READ_ORDER_SUCCESS, payload: res }))
                .catch(error => dispatch({ type: READ_ORDER_FAILURE, payload: error }))
        }
    },
    "update": order => {
        return (dispatch, getState) => {
            dispatch({ type: UPDATE_ORDER_REQUEST })
            customerOrders.update(order)
                .then(res => dispatch({ type: UPDATE_ORDER_SUCCESS, payload: res }))
                .catch(error => dispatch({ type: UPDATE_ORDER_FAILURE, payload: error }))
        }
    },
    "createFromTechnicianOrder": order => {
        return (dispatch, getState) => {
            dispatch({ type: UPDATE_ORDER_REQUEST })
            dispatch({ type: UPDATE_TECH_ORDER_REQUEST })
            customerOrders.createFromTechnicianOrder(order)
                .then(res => {
                    dispatch({ type: UPDATE_ORDER_SUCCESS, payload: { ...res, orders: res.customer_orders} })
                    dispatch({ type: UPDATE_TECH_ORDER_SUCCESS, payload: { ...res, orders: res.technician_orders} })
                })
                .catch(error => {
                    dispatch({ type: UPDATE_ORDER_FAILURE, payload: error })
                    dispatch({ type: UPDATE_TECH_ORDER_FAILURE, payload: error })
                })
        }
    }
}

export const _technician_orders = {
    "read": () => {
        return (dispatch, getState) => {
            dispatch({ type: READ_TECH_ORDER_REQUEST })
            technicianOrders.read()
                .then(res => dispatch({ type: READ_TECH_ORDER_SUCCESS, payload: res }))
                .catch(error => dispatch({ type: READ_TECH_ORDER_FAILURE, payload: error }))
        }
    },
    "update": (order, revert = false) => {
        return (dispatch, getState) => {
            dispatch({ type: UPDATE_TECH_ORDER_REQUEST })
            technicianOrders.update(order, revert)
                .then(res => dispatch({ type: UPDATE_TECH_ORDER_SUCCESS, payload: res }))
                .catch(error => dispatch({ type: UPDATE_TECH_ORDER_FAILURE, payload: error }))
        }
    },
}

export const _warehouse_inventory = {
    "read": () => {
        return (dispatch, getState) => {
            dispatch({ type: READ_WAREHOUSE_DATA_REQUEST })
            wearhouses.read()
                .then(res => dispatch({ type: READ_WAREHOUSE_DATA_SUCCESS, payload: res }))
                .catch(error => dispatch({ type: READ_WAREHOUSE_DATA_FAILURE, payload: error }))
        }
    },
    "update": inventory => {
        return (dispatch, getState) => {
            dispatch({ type: UPDATE_WAREHOUSE_DATA_REQUEST })
            wearhouses.update(inventory)
                .then(res => dispatch({ type: UPDATE_WAREHOUSE_DATA_SUCCESS, payload: res }))
                .catch(error => dispatch({ type: UPDATE_WAREHOUSE_DATA_FAILURE, payload: error }))
        }
    }
}

export const _pending_orders = {
    "create": order => {
        return (dispatch, getState) => {
            dispatch({ type: CREATE_PENDING_ORDER_REQUEST })
            pendingOrders.create(order)
                .then(res => dispatch({ type: CREATE_PENDING_ORDER_SUCCESS, payload: res }))
                .catch(error => dispatch({ type: CREATE_PENDING_ORDER_FAILURE, payload: error }))
        }
    },
    "read": () => {
        return (dispatch, getState) => {
            dispatch({ type: READ_PENDING_ORDER_REQUEST })
            pendingOrders.read()
                .then(res => dispatch({ type: READ_PENDING_ORDER_SUCCESS, payload: res }))
                .catch(error => dispatch({ type: READ_PENDING_ORDER_FAILURE, payload: error }))
        }
    },
    "update": order => {
        return (dispatch, getState) => {
            dispatch({ type: UPDATE_PENDING_ORDER_REQUEST })
            pendingOrders.update(order)
                .then(res => dispatch({ type: UPDATE_PENDING_ORDER_SUCCESS, payload: res }))
                .catch(error => dispatch({ type: UPDATE_PENDING_ORDER_FAILURE, payload: error }))
        }
    }
}

export const _suppliers = {
    "create": order => {
        return (dispatch, getState) => {
            dispatch({ type: CREATE_SUPPLIER_REQUEST })
            suppliers.create(order)
                .then(res => dispatch({ type: CREATE_SUPPLIER_SUCCESS, payload: res }))
                .catch(error => dispatch({ type: CREATE_SUPPLIER_FAILURE, payload: error }))
        }
    },
    "read": () => {
        return (dispatch, getState) => {
            dispatch({ type: READ_SUPPLIER_REQUEST })
            suppliers.read()
                .then(res => dispatch({ type: READ_SUPPLIER_SUCCESS, payload: res }))
                .catch(error => dispatch({ type: READ_SUPPLIER_FAILURE, payload: error }))
        }
    },
    "update": order => {
        return (dispatch, getState) => {
            dispatch({ type: UPDATE_SUPPLIER_REQUEST })
            suppliers.update(order)
                .then(res => dispatch({ type: UPDATE_SUPPLIER_SUCCESS, payload: res }))
                .catch(error => dispatch({ type: UPDATE_SUPPLIER_FAILURE, payload: error }))
        }
    }
}

export const _packages = {
    "create": pkg => {
        return (dispatch, getState) => {
            dispatch({ type: CREATE_PACKAGE_REQUEST })
            productPackages.create(pkg)
                .then(res => dispatch({ type: CREATE_PACKAGE_SUCCESS, payload: res }))
                .catch(error => dispatch({ type: CREATE_PACKAGE_FAILURE, payload: error }))
        }
    },
    "read": () => {
        return (dispatch, getState) => {
            dispatch({ type: READ_PACKAGE_REQUEST })
            productPackages.read()
                .then(res => dispatch({ type: READ_PACKAGE_SUCCESS, payload: res }))
                .catch(error => dispatch({ type: READ_PACKAGE_FAILURE, payload: error }))
        }
    },
    "update": pkg => {
        return (dispatch, getState) => {
            dispatch({ type: UPDATE_PACKAGE_REQUEST })
            productPackages.update(pkg)
                .then(res => dispatch({ type: UPDATE_PACKAGE_SUCCESS, payload: res }))
                .catch(error => dispatch({ type: UPDATE_PACKAGE_FAILURE, payload: error }))
        }
    }
}

export const readInventory = () => {
    return (dispatch, getState) => {
        dispatch({ type: READ_INVENTORY_REQUEST })
        _readInventory()
            .then(res => dispatch({ type: READ_INVENTORY_SUCCESS, payload: res }))
            .catch(error => dispatch({ type: READ_INVENTORY_FAILURE, payload: error }))
    }
}

export const readHistory = () => {
    return (dispatch, getState) => {
        dispatch({ type: READ_ORDER_HISTORY_REQUEST })
        _readHistory()
            .then(res => dispatch({ type: READ_ORDER_HISTORY_SUCCESS, payload: res }))
            .catch(error => dispatch({ type: READ_ORDER_HISTORY_FAILURE, payload: error }))
    }
}

export const _technician_packages = {
    "create": pkg => {
        return (dispatch, getState) => {
            dispatch({ type: CREATE_TECH_PACKAGE_REQUEST })
            technicianPackages.create(pkg)
                .then(res => dispatch({ type: res.message === undefined ? CREATE_TECH_PACKAGE_SUCCESS : CREATE_TECH_PACKAGE_FAILURE, payload: res }))
                .catch(error => dispatch({ type: CREATE_TECH_PACKAGE_FAILURE, payload: error }))
        }
    },
    "read": () => {
        return (dispatch, getState) => {
            dispatch({ type: READ_TECH_PACKAGE_REQUEST })
            technicianPackages.read()
                .then(res => dispatch({ type: READ_TECH_PACKAGE_SUCCESS, payload: res }))
                .catch(error => dispatch({ type: READ_TECH_PACKAGE_FAILURE, payload: error }))
        }
    },
    "update": pkg => {
        return (dispatch, getState) => {
            dispatch({ type: UPDATE_TECH_PACKAGE_REQUEST })
            technicianPackages.update(pkg)
                .then(res => dispatch({ type: UPDATE_TECH_PACKAGE_SUCCESS, payload: res }))
                .catch(error => dispatch({ type: UPDATE_TECH_PACKAGE_FAILURE, payload: error }))
        }
    },
    "delete": options => {
        return (dispatch, getState) => {
            dispatch({ type: DELETE_TECH_PACKAGE_REQUEST })
            technicianPackages.delete(options)
                .then(res => dispatch({ type: DELETE_TECH_PACKAGE_SUCCESS, payload: res }))
                .catch(error => dispatch({ type: DELETE_TECH_PACKAGE_FAILURE, payload: error }))
        }
    }
}