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
    READ_ORDER_HISTORY_REQUEST,
    READ_ORDER_HISTORY_SUCCESS,
    READ_ORDER_HISTORY_FAILURE,
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
    statuses
} from "../constants"


const initialState = {
    products: [],
    createProductStatus: statuses.idle,
    createProductMessage: "",
    readProductStatus: statuses.idle,
    readProductMessage: "",
    updateProductStatus: statuses.idle,
    updateProductMessage: "",
    deleteProductStatus: statuses.idle,
    deleteProductMessage: "",

    packages: [],
    createPackageStatus: statuses.idle,
    createPackageMessage: "",
    readPackageStatus: statuses.idle,
    readPackageMessage: "",
    updatePackageStatus: statuses.idle,
    updatePackageMessage: "",

    locations: [],

    customerOrders: [],
    createCustomerOrderStatus: statuses.idle,
    createCustomerOrderMessage: "",
    readCustomerOrderStatus: statuses.idle,
    readCustomerOrderMessage: "",
    updateCustomerOrderStatus: statuses.idle,
    updateCustomerOrderMessage: "",

    pendingOrders: [],
    createPendingOrderStatus: statuses.idle,
    createPendingOrderMessage: "",
    readPendingOrderStatus: statuses.idle,
    readPendingOrderMessage: "",
    updatePendingOrderStatus: statuses.idle,
    updatePendingOrderMessage: "",

    inventory: [],
    readInventoryStatus: statuses.idle,
    readInventoryMessage: "",

    history: [],
    readHistoryStatus: statuses.idle,
    readHistoryMessage: "",

    technicianOrders: [],
    readTechnicianOrderStatus: statuses.idle,
    readTechnicianOrderMessage: "",
    updateTechnicianOrderStatus: statuses.idle,
    updateTechnicianOrderMessage: "",

    warehouseInventory: [],
    readWarehouseInventoryStatus: statuses.idle,
    readWarehouseInventoryMessage: "",
    updateWarehouseInventoryStatus: statuses.idle,
    updateWarehouseInventoryMessage: "",

    suppliers: [],
    createSupplierStatus: statuses.idle,
    createSupplierMessage: "",
    readSupplierStatus: statuses.idle,
    readSupplierMessage: "",
    updateSupplierStatus: statuses.idle,
    updateSupplierMessage: "",

    techPackages: [],
    createTechPackageStatus: statuses.idle,
    createTechPackageMessage: "",
    readTechPackageStatus: statuses.idle,
    readTechPackageMessage: "",
    updateTechPackageStatus: statuses.idle,
    updateTechPackageMessage: "",
    deleteTechPackageStatus: statuses.idle,
    deleteTechPackageMessage: "",
}


export default (state = initialState, action) => {
    let packages = []
    switch(action.type) {
        case CREATE_TECH_PACKAGE_REQUEST:
            return {
                ...state,
                createTechPackageStatus: statuses.pending,
                createTechPackageMessage: "Creating package... Please wait."
            }
        case CREATE_TECH_PACKAGE_SUCCESS:
            packages = []
            for (const pkg of action.payload.packages) {
                packages[pkg._id] = {
                    ...pkg,
                    items: action.payload.package_items.filter(item => item._package_id === pkg._id),
                    locations: action.payload.locations_available.filter(i => i._package_id === pkg._id).map(l => l._instance_id)
                }
            }
            return {
                ...state,
                createTechPackageStatus: statuses.success,
                createTechPackageMessage: "Package has been created successfully.",
                techPackages: packages
            }
        case CREATE_TECH_PACKAGE_FAILURE:
            return {
                ...state,
                createTechPackageStatus: statuses.failure,
                createTechPackageMessage: action.payload?.message
            }
        case READ_TECH_PACKAGE_REQUEST:
            return {
                ...state,
                readTechPackageStatus: statuses.pending,
                readTechPackageMessage: "Loading packages... Please wait."
            }
        case READ_TECH_PACKAGE_SUCCESS:
            console.log(action.payload.package_items)
            packages = []
            for (const pkg of action.payload.packages) {
                packages[pkg._id] = {
                    ...pkg,
                    items: action.payload.package_items.filter(item => item._package_id === pkg._id),
                    locations: action.payload.locations_available.filter(i => i._package_id === pkg._id).map(l => l._instance_id)
                }
            }
            return {
                ...state,
                readTechPackageStatus: statuses.success,
                readTechPackageMessage: "Packages have been loaded.",
                techPackages: packages
            }
        case READ_TECH_PACKAGE_FAILURE:
            return {
                ...state,
                readTechPackageStatus: statuses.failure,
                readTechPackageMessage: action.payload?.message
            }
        case UPDATE_TECH_PACKAGE_REQUEST:
            return {
                ...state,
                updateTechPackageStatus: statuses.pending,
                updateTechPackageMessage: "Updating package... Please wait."
            }
        case UPDATE_TECH_PACKAGE_SUCCESS:
            packages = []
            for (const pkg of action.payload.packages) {
                packages[pkg._id] = {
                    ...pkg,
                    items: action.payload.package_items.filter(item => item._package_id === pkg._id),
                    locations: action.payload.locations_available.filter(i => i._package_id === pkg._id).map(l => l._instance_id)
                }
            }
            return {
                ...state,
                updateTechPackageStatus: statuses.success,
                updateTechPackageMessage: "Package updated successfully.",
                techPackages: packages
            }
        case UPDATE_TECH_PACKAGE_FAILURE:
            return {
                ...state,
                updateTechPackageStatus: statuses.failure,
                updateTechPackageMessage: action.payload?.message
            }
        case DELETE_TECH_PACKAGE_REQUEST:
            return {
                ...state,
                deleteTechPackageStatus: statuses.pending,
                deleteTechPackageMessage: "Deleting... Please wait."
            }
        case DELETE_TECH_PACKAGE_SUCCESS:
            packages = []
            for (const pkg of action.payload.packages) {
                packages[pkg._id] = {
                    ...pkg,
                    items: action.payload.package_items.filter(item => item._package_id === pkg._id)
                }
            }
            return {
                ...state,
                deleteTechPackageStatus: statuses.success,
                deleteTechPackageMessage: "Item has been deleted successfully.",
                techPackages: packages
            }
        case DELETE_TECH_PACKAGE_FAILURE:
            return {
                ...state,
                deleteTechPackageStatus: statuses.failure,
                deleteTechPackageMessage: action.payload?.message
            }
        case CREATE_PRODUCT_REQUEST:
            return {
                ...state,
                createProductStatus: statuses.pending,
                createProductMessage: "Creating product... Please wait."
            }
        case CREATE_PRODUCT_SUCCESS:
            const _products = state.products.length ? [...state.products] : []
            _products[action.payload.product._id] = action.payload.product
            const _packages = []
            for (const pack of action.payload.packages) {
                _packages[pack._id] = pack
            }
            const _locations = []
            for (const loc of action.payload.locations_available) {
                if (_locations[loc._product_id] === undefined) _locations[loc._product_id] = []
                _locations[loc._product_id].push(loc._instance_id)
            }
            return {
                ...state,
                createProductStatus: statuses.success,
                createProductMessage: "Product created successfully.",
                products: _products,
                packages: _packages,
                locations: _locations
            }
        case CREATE_PRODUCT_FAILURE:
            return {
                ...state,
                createProductStatus: statuses.failure,
                createProductMessage: action.payload.message,
            }
        case READ_PRODUCT_REQUEST:
            return {
                ...state,
                readProductStatus: statuses.pending,
                readProductMessage: "Products are loading... Please wait.",
            }
        case READ_PRODUCT_SUCCESS:
            const __products =  []
            for (const prod of action.payload.products) {
                __products[prod._id] = prod
            }
            const __packages = []
            for (const pack of action.payload.packages) {
                __packages[pack._id] = pack
            }
            const __locations = []
            for (const loc of action.payload.locations_available) {
                if (__locations[loc._product_id] === undefined) __locations[loc._product_id] = []
                __locations[loc._product_id].push(loc._instance_id)
            }
            return {
                ...state,
                readProductStatus: statuses.success,
                readProductMessage: "Products loaded successfully",
                products: __products,
                packages: __packages,
                locations: __locations
            }
        case READ_PRODUCT_FAILURE:
            return {
                ...state,
                readProductStatus: statuses.failure,
                readProductMessage: action.payload.message,
            }
        case UPDATE_PRODUCT_REQUEST:
            return {
                ...state,
                updateProductStatus: statuses.pending,
                updateProductMessage: "Product is updating... Please wait.",
            }
        case UPDATE_PRODUCT_SUCCESS:
            const prods = state.products.length ? [...state.products] : []
            prods[action.payload.product._id] = action.payload.product
            const locs = []
            for (const loc of action.payload.locations_available) {
                if (locs[loc._product_id] === undefined) locs[loc._product_id] = []
                locs[loc._product_id].push(loc._instance_id)
            }
            return {
                ...state,
                updateProductStatus: statuses.success,
                updateProductMessage: "Product updated successfully.",
                products: prods,
                locations: locs
            }
        case UPDATE_PRODUCT_FAILURE:
            return {
                ...state,
                updateProductStatus: statuses.failure,
                updateProductMessage: action.payload.message,
            }
        case DELETE_PRODUCT_REQUEST:
            return {
                ...state,
                deleteProductStatus: statuses.pending,
                deleteProductMessage: "Request is processing. Please wait."
            }
        case DELETE_PRODUCT_SUCCESS:
            const __prods = state.products.length ? [...state.products] : []
            __prods[action.payload.product._id] = action.payload.product
            return {
                ...state,
                deleteProductStatus: statuses.success,
                deleteProductMessage: "Request has been processed.",
                products: __prods
            }
        case DELETE_PRODUCT_FAILURE:
            return {
                ...state,
                deleteProductStatus: statuses.failure,
                deleteProductMessage: action.payload.message || "Error processing request. Please try again later."
            }
        case CREATE_ORDER_REQUEST:
            return {
                ...state,
                createCustomerOrderStatus: statuses.pending,
                createCustomerOrderMessage: "Order creation is in process. ",
            }
        case CREATE_ORDER_SUCCESS:
            const _orders_ = {...state?.customerOrders}
            _orders_[action.payload.orders[0]._order_number] = action.payload.orders
            return {
                ...state,
                createCustomerOrderStatus: statuses.success,
                createCustomerOrderMessage: "Order created successfully.",
                customerOrders: _orders_
            }
        case CREATE_ORDER_FAILURE:
            return {
                ...state,
                createCustomerOrderStatus: statuses.failure,
                createCustomerOrderMessage: action.payload.message,
            }
        case READ_ORDER_REQUEST:
            return {
                ...state,
                readCustomerOrderStatus: statuses.pending,
                readCustomerOrderMessage: "Loading orders... Please wait."
            }
        case READ_ORDER_SUCCESS:
            const _orders = {}
            for (const ord of action.payload._customer_orders) {
                if(_orders[ord._order_number] === undefined) _orders[ord._order_number] = []
                _orders[ord._order_number].push(ord)
            }
            return {
                ...state,
                readCustomerOrderStatus: statuses.success,
                readCustomerOrderMessage: "Orders loaded successfully.",
                customerOrders: _orders
            }
        case READ_ORDER_FAILURE:
            return {
                ...state,
                readCustomerOrderStatus: statuses.failure,
                readCustomerOrderMessage: "Error loading orders. Please try again later..",
            }
        case UPDATE_ORDER_REQUEST:
            return {
                ...state,
                updateCustomerOrderStatus: statuses.pending,
                updateCustomerOrderMessage: "Updating order... Please wait."
            }
        case UPDATE_ORDER_SUCCESS:
            const __orders = {}
            for (const ord of action.payload.orders) {
                if(__orders[ord._order_number] === undefined) __orders[ord._order_number] = []
                __orders[ord._order_number].push(ord)
            }

            const _prods = []
            for (const product of action.payload.products) {
                _prods[product._id] = product
            }

            return {
                ...state,
                updateCustomerOrderStatus: statuses.success,
                updateCustomerOrderMessage: "Order updated successfully.",
                customerOrders: __orders,
                products: _prods,
                history: action.payload.history
            }
        case UPDATE_ORDER_FAILURE:
            return {
                ...state,
                updateCustomerOrderStatus: statuses.failure,
                updateCustomerOrderMessage: action.payload.message,
            }
        case READ_INVENTORY_REQUEST:
            return {
                ...state,
                readInventoryStatus: statuses.pending,
                readProductMessage: "Loading items... Please wait."
            }
        case READ_INVENTORY_SUCCESS:
            return {
                ...state,
                readInventoryStatus: statuses.success,
                readProductMessage: "Items loaded successfully.",
                inventory: action.payload.items
            }
        case READ_INVENTORY_FAILURE:
            return {
                ...state,
                readInventoryStatus: statuses.failure,
                readProductMessage: action.payload.message
            }
        case READ_ORDER_HISTORY_REQUEST:
            return {
                ...state,
                readHistoryStatus: statuses.pending,
                readHistoryMessage: "Order history is loading. Please wait"
            }
        case READ_ORDER_HISTORY_SUCCESS:
            return {
                ...state,
                history: action.payload.history,
                readHistoryStatus: statuses.success,
                readHistoryMessage: "Order history loaded successfully."
            }
        case READ_ORDER_HISTORY_FAILURE:
            return {
                ...state,
                readHistoryStatus: statuses.failure,
                readHistoryMessage: action.payload.message
            }
        case READ_TECH_ORDER_REQUEST:
            return {
                ...state,
                readTechnicianOrderStatus: statuses.pending,
                readTechnicianOrderMessage: "Orders are loading. Please wait."
            }
        case READ_TECH_ORDER_SUCCESS:
            const _t_orders = {}
            for (const order of action.payload._technician_orders) {
                if (_t_orders[order._order_number] === undefined) _t_orders[order._order_number] = []
                _t_orders[order._order_number].push(order)
            }
            return {
                ...state,
                readTechnicianOrderStatus: statuses.success,
                readTechnicianOrderMessage: "Orders loaded successfully",
                technicianOrders: _t_orders
            }
        case READ_TECH_ORDER_FAILURE:
            return {
                ...state,
                readTechnicianOrderStatus: statuses.failure,
                readTechnicianOrderMessage: action.payload.message
            }
        case UPDATE_TECH_ORDER_REQUEST:
            return {
                ...state,
                updateTechnicianOrderStatus: statuses.pending,
                updateTechnicianOrderMessage: "Update request is being processed. Please wait."
            }
        case UPDATE_TECH_ORDER_SUCCESS:
            const t_orders = {}
            for (const order of action.payload.orders) {
                if (t_orders[order._order_number] === undefined) t_orders[order._order_number] = []
                t_orders[order._order_number].push(order)
            }
            return {
                ...state,
                updateTechnicianOrderStatus: statuses.success,
                updateTechnicianOrderMessage: "Order updated successfully",
                technicianOrders: t_orders,
                inventory: state.inventory.length ? [...state.inventory.filter(i => i._id !== action.payload.updated_inventory._id), action.payload.updated_inventory] : [action.payload.updated_inventory]
            }
        case UPDATE_TECH_ORDER_FAILURE:
            return {
                ...state,
                updateTechnicianOrderStatus: statuses.failure,
                updateTechnicianOrderMessage: action.payload.message
            }
        case READ_WAREHOUSE_DATA_REQUEST:
            return {
                ...state,
                readWarehouseInventoryStatus: statuses.pending,
                readWarehouseInventoryMessage: "Loading... Please wait.",

            }
        case READ_WAREHOUSE_DATA_SUCCESS:
            const _warehouseInventory = []
            for (const inv of action.payload.inventory) _warehouseInventory[inv._id] = inv
            return {
                ...state,
                readWarehouseInventoryStatus: statuses.success,
                readWarehouseInventoryMessage: "Inventory loaded successfully.",
                warehouseInventory: _warehouseInventory
            }
        case READ_WAREHOUSE_DATA_FAILURE:
            return {
                ...state,
                readWarehouseInventoryStatus: statuses.failure,
                readWarehouseInventoryMessage: "Error occured. Please try again."
            }
        case UPDATE_WAREHOUSE_DATA_REQUEST:
            return {
                ...state,
                updateWarehouseInventoryStatus: statuses.pending,
                updateWarehouseInventoryMessage: "Processing... Please wait."
            }
        case UPDATE_WAREHOUSE_DATA_SUCCESS:
            const __warehouseInventory = state?.warehouseInventory?.length !== undefined ? [...state.warehouseInventory] : []
            __warehouseInventory[action.payload.inventory._id] = action.payload.inventory
            return {
                ...state,
                updateWarehouseInventoryStatus: statuses.success,
                updateWarehouseInventoryMessage: "Items added to warehouse.",
                warehouseInventory: __warehouseInventory
            }
        case UPDATE_WAREHOUSE_DATA_FAILURE:
            return {
                ...state,
                updateWarehouseInventoryStatus: statuses.failure,
                updateWarehouseInventoryMessage: action.payload.message
            }
        case CREATE_PENDING_ORDER_REQUEST:
            return {
                ...state,
                createPendingOrderStatus: statuses.pending,
                createPendingOrderMessage: "Order is being placed... Please wait."
            }
        case CREATE_PENDING_ORDER_SUCCESS:
            return {
                ...state,
                createPendingOrderStatus: statuses.success,
                createPendingOrderMessage: "Order placed successfully.",
                pendingOrders: state?.pendingOrders?.length !== undefined ? [...state.pendingOrders, action.payload.order] : [action.payload.order]
            }
        case CREATE_PENDING_ORDER_FAILURE:
            return {
                ...state,
                createPendingOrderStatus: statuses.failure,
                createPendingOrderMessage: action.payload.message || "Error occured. Please try again."
            }
        case READ_PENDING_ORDER_REQUEST:
            return {
                ...state,
                readPendingOrderStatus: statuses.pending,
                readPendingOrderMessage: "Loading orders... Please wait."
            }
        case READ_PENDING_ORDER_SUCCESS:
            return {
                ...state,
                readPendingOrderStatus: statuses.success,
                readPendingOrderMessage: "Orders have been loaded.",
                pendingOrders: action.payload.orders
            }
        case READ_PENDING_ORDER_FAILURE:
            return {
                ...state,
                readPendingOrderStatus: statuses.failure,
                readPendingOrderMessage: action.payload.message || "Error loading orders."
            }
        case UPDATE_PENDING_ORDER_REQUEST:
            return {
                ...state,
                updatePendingOrderStatus: statuses.pending,
                updatePendingOrderMessage: "Order is being updated... Please wait."
            }
        case UPDATE_PENDING_ORDER_SUCCESS:
            return {
                ...state,
                updatePendingOrderStatus: statuses.success,
                updatePendingOrderMessage: "Order updated successfully.",
                pendingOrders: state?.pendingOrders?.length === undefined ? [action.payload.order] : [...state.pendingOrders.filter(order => order._id !== action.payload.order._id), action.payload.order]
            }
        case UPDATE_PENDING_ORDER_FAILURE:
            return {
                ...state,
                updatePendingOrderStatus: statuses.failure,
                updatePendingOrderMessage: action.payload.message || "Error while updating order. Please try again."
            }
        case CREATE_SUPPLIER_REQUEST:
            return {
                ...state,
                createSupplierStatus: statuses.pending,
                createSupplierMessage: "Creating supplier... Please wait"
            }
        case CREATE_SUPPLIER_SUCCESS:
            return {
                ...state,
                createSupplierStatus: statuses.success,
                createSupplierMessage: "Supplier created successfully",
                suppliers: state?.suppliers?.length === undefined ? [action.payload.supplier] : [...state.suppliers, action.payload.supplier]
            }
        case CREATE_SUPPLIER_FAILURE:
            return {
                ...state,
                createSupplierStatus: statuses.failure,
                createSupplierMessage: action.payload.message || "Error creating supplier. Please try again"
            }
        case READ_SUPPLIER_REQUEST:
            return {
                ...state,
                readSupplierStatus: statuses.pending,
                readSupplierMessage: "Loading suppliers... Please wait"
            }
        case READ_SUPPLIER_SUCCESS:
            return {
                ...state,
                readSupplierStatus: statuses.success,
                readSupplierMessage: "Suppliers loaded successfully",
                suppliers: action.payload.suppliers
            }
        case READ_SUPPLIER_FAILURE:
            return {
                ...state,
                readSupplierStatus: statuses.failure,
                readSupplierMessage: action.payload.message || "Error loading supplier. Please check your internet connection"
            }
        case UPDATE_SUPPLIER_REQUEST:
            return {
                ...state,
                updateSupplierStatus: statuses.pending,
                updateSupplierMessage: "Updating supplier... Please wait"
            }
        case UPDATE_SUPPLIER_SUCCESS:
            return {
                ...state,
                updateSupplierStatus: statuses.success,
                updateSupplierMessage: "Supplier updated successfully",
                suppliers: state?.suppliers?.length === undefined ? [action.payload.supplier] : [...state.suppliers.filter(s => s._id !== action.payload.supplier._id), action.payload.supplier]
            }
        case UPDATE_SUPPLIER_FAILURE:
            return {
                ...state,
                updateSupplierStatus: statuses.failure,
                updateSupplierMessage: action.payload.message || "Error updating supplier. Please try again"
            }
        case CREATE_PACKAGE_REQUEST:
            return {
                ...state,
                createPackageStatus: statuses.pending,
                createPackageMessage: "Creating package... Please wait."
            }
        case CREATE_PACKAGE_SUCCESS:
            const pkg = state.packages.length ? [...state.packages] : []
            pkg[action.payload.package._id] = action.payload.package
            return {
                ...state,
                createPackageStatus: statuses.success,
                createPackageMessage: "Package created successfully",
                packages: pkg
            }
        case CREATE_PACKAGE_FAILURE:
            return {
                ...state,
                createPackageStatus: statuses.failure,
                createPackageMessage: "Error occured while creating package. "
            }
        case READ_PACKAGE_REQUEST:
            return {
                ...state,
                readPackageStatus: statuses.pending,
                readPackageMessage: "Loading packages... Please wait."
            }
        case READ_PACKAGE_SUCCESS:
            const _pkg = []
            for (const pack of action.payload.packages) {
                _pkg[pack._id] = pack
            }
            return {
                ...state,
                readPackageStatus: statuses.success,
                readPackageMessage: "Packages loaded successfully",
                packages: _pkg
            }
        case READ_PACKAGE_FAILURE:
            return {
                ...state,
                readPackageStatus: statuses.failure,
                readPackageMessage: "Error occured while loading packages."
            }
        case UPDATE_PACKAGE_REQUEST:
            return {
                ...state,
                updatePackageStatus: statuses.pending,
                updatePackageMessage: "Updating package... Please wait"
            }
        case UPDATE_PACKAGE_SUCCESS:
            const __pkg = state.packages.length ? [...state.packages] : []
            __pkg[action.payload.package._id] = action.payload.package
            return {
                ...state,
                updatePackageStatus: statuses.success,
                updatePackageMessage: "Package updated successfully.",
                packages: __pkg
            }
        case UPDATE_PACKAGE_FAILURE:
            return {
                ...state,
                updatePackageStatus: statuses.failure,
                updatePackageMessage: "Error occured while updating package"
            }
        default:
            return state
    }
}