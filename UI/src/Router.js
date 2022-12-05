import CreateUser from './Components/User/Forms/CreateUser'
import Login from './Components/User/Forms/Login'
import UsersTable from './Components/User/Tables/UsersTable'
import CreateProduct from './Components/Shop/Forms/CreateProduct';
import ViewProducts from './Components/Shop/Views/ViewProducts';
import ProductsTable from './Components/Shop/Tables/ProductsTable';
import EditProduct from './Components/Shop/Forms/EditProduct';
import Cart from './Components/Shop/Views/Cart'
import CustomerOrdersTable from './Components/Shop/Tables/CustomerOrdersTable'
import ProcessCustomerOrder from './Components/Shop/Views/ProcessCustomerOrder'
import CustomerInventory from './Components/Shop/Tables/CustomerInventory'
import TechnicianOrders from './Components/Shop/Tables/TechnicianOrders'
import TechnicianOrderProcessing from './Components/Shop/Views/TechnicianOrderProcessing'
import ShippingInfoTable from './Components/User/Tables/ShippingInfoTable'
import ShippingInfoForm from './Components/User/Forms/ShippingInfoForm'
import EditShippingInfo from './Components/User/Forms/EditShippingInfo'
import ShippingSettings from './Components/Settings/ShippingSettings'
import Profile from './Components/User/Views/Profile'
import Warehouses from './Components/Shop/Tables/Warehouses'
import WarehouseInventory from './Components/Shop/Tables/WarehouseInventory'
import IncomingOrders from './Components/Shop/Views/IncomingOrders'
import SuppliersSettings from './Components/Settings/SuppliersSettings'
import EditSupplier from './Components/Settings/EditSupplier'
import WarehousesSettings from './Components/Shop/Views/WarehousesSettings'
import StonksReport from './Components/Reports/StonksReport'
import DetailedStonksReport from './Components/Reports/DetailedStonksReport'
import CustomerOrdersReport from './Components/Reports/CustomerOrdersReport'
import SalesReport from './Components/Reports/SalesReport'
import AdminSettings from './Components/Settings/AdminSettings'
import ProductSets from './Components/Shop/Tables/ProductSets'
import CreateProductSet from './Components/Shop/Forms/CreateProductSet'
import EditProductSet from './Components/Shop/Forms/EditProductSet'
import Print from './Components/Print/Print'

import {
    AiOutlineShoppingCart,
    FaUserAlt,
    HiDocumentReport,
    RiSettings4Fill
} from 'react-icons/all'

export const Navigation = {
    "Shop": {
        icon: <AiOutlineShoppingCart />,
        items: [
            { component: CreateProduct, route: "/products/create", name: "Create Product", renderCondition: options => options.currentUser._type_id === 1 },
            { component: ProductsTable, route: "/products/products_table", name: "Products Table", renderCondition: options => options.currentUser._type_id === 1 },
            { component: CreateProductSet, route: "/productsSets/create", name: "Create Product Sets", renderCondition: options => options.currentUser._type_id === 1 },
            { component: ProductSets, route: "/productsSets/view", name: "Products Sets", renderCondition: options => options.currentUser._type_id === 1 },
            { component: CustomerOrdersTable, route: "/orders/customer_orders", name: "Customer Orders", renderCondition: options => [1, 3].includes(options.currentUser._type_id) },
            { component: Warehouses, route: "/warehouses", name: "Locations", renderCondition: options => [1, 3].includes(options.currentUser._type_id) },
            { component: IncomingOrders, route: "/incoming_orders", name: "Incoming Orders", renderCondition: options => [1, 3].includes(options.currentUser._type_id) },
            { component: ViewProducts, route: "/products/products_page", name: "Products", renderCondition: options => [2, 4].includes(options.currentUser._type_id) },
            { component: Cart, route: "/products/products_cart", name: "My Cart", renderCondition: options => [2, 4].includes(options.currentUser._type_id) },
            { component: CustomerOrdersTable, route: "/orders/customer_orders", name: "My Orders", renderCondition: options => [2, 4].includes(options.currentUser._type_id) },
            { component: TechnicianOrders, route: "/orders/technician_orders", name: "Technician Orders", renderCondition: options => [1, 2].includes(options.currentUser._type_id) },
        ]
    },
    "User": {
        icon: <FaUserAlt />,
        items: [
            { component: CreateUser, route: "/create_user", name: "Create User", renderCondition: options => options.currentUser?._type_id === 1 },
            { component: UsersTable, route: "/users/table", name: "View Users", renderCondition: options => options.currentUser?._type_id === 1 },
            { component: CustomerInventory, route: "/stocks", name: "My Stock", renderCondition: options => [2, 4].includes(options.currentUser?._type_id) },
            { component: ShippingInfoTable, route: "/shipping_info", name: "Shipping Information", renderCondition: options => options.currentUser?._type_id != 3 },
            { component: EditShippingInfo, route: "/edit_shipping_info/:_id", name: "", renderCondition: options => [1, 2, 4].includes(options.currentUser._type_id) },
            { component: Print, route: "/print/:_url", name: "", renderCondition: options => true },
        ]
    },
    "Settings": {
        icon: <RiSettings4Fill />,
        items: [
            { component: ShippingSettings, route: "/shipping_settings", name: "Shipping Settings", renderCondition: options => options.currentUser._type_id === 1 },
            { component: AdminSettings, route: "/admin_settings", name: "Admin Settings", renderCondition: options => options.currentUser._type_id === 1 },
            { component: SuppliersSettings, route: "/suppliers_settings/:option", name: "Suppliers Settings", renderCondition: options => options.currentUser._type_id === 1 },
        ]
    },
    "Reports": {
        icon: <HiDocumentReport />,
        items: [
            { component: StonksReport, route: "/reports/stonks", name: "Stocks Report", renderCondition: options => options.currentUser._type_id === 1 },
            { component: DetailedStonksReport, route: "/reports/detailedStonks", name: "Detailed Stocks Report", renderCondition: options => options.currentUser._type_id === 1 },
            { component: CustomerOrdersReport, route: "/reports/customerOrders", name: "Customer Orders Report", renderCondition: options => options.currentUser._type_id === 1 },
            { component: SalesReport, route: "/reports/sales", name: "Sales Report", renderCondition: options => options.currentUser._type_id === 1 },
        ]
    },
    "Routes": {
        items: [
            { route: "/orders/process/:_order_number", component: ProcessCustomerOrder, renderCondition: options => options.currentUser !== null },
            { route: "/tech_orders/process/:_order_number", component: TechnicianOrderProcessing, renderCondition: options => [1, 2].includes(options.currentUser._type_id) },
            { route: "/suppliers_settings/:option", component: SuppliersSettings, renderCondition: options => options.currentUser._type_id === 1 },
            { route: "/edit_supplier/:_id", component: EditSupplier, renderCondition: options => options.currentUser._type_id === 1 },
            { route: "/users/profile/:_id", component: Profile, renderCondition: options => options.currentUser._type_id === 1 },
            { route: "/productSets/edit/:_id", component: EditProductSet, renderCondition: options => options.currentUser._type_id === 1 },
            { route: "/products/edit/:_id", component: EditProduct, renderCondition: options => options.currentUser._type_id === 1 },
            { route: "/warehouse_inventory/:_id", component: WarehouseInventory, renderCondition: options => [1, 3].includes(options.currentUser._type_id) },
            { route: "/warehouse/settings/:_id/:_option", component: WarehousesSettings, renderCondition: options => [1, 3].includes(options.currentUser._type_id) },
            { route: "/create_shipping_info", component: ShippingInfoForm, renderCondition: options => [2, 4].includes(options.currentUser._type_id) },
            { route: "/", component: Login, renderCondition: options => true }
        ]
    },
}