import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { NavLink, useParams } from 'react-router-dom'
import { readData } from "../../../Redux/Actions/GeneralActions"
import { _products, _warehouse_inventory } from "../../../Redux/Actions/ShopActions"
import { readDeliveryInfo } from "../../../Redux/Actions/UserActions"
import StockManagement from "../Forms/StockManagement"
import WarehouseShippingInfo from "../Forms/WarehouseShippingInfo"
import WarehouseInventory from "../Tables/WarehouseInventory"

import "./WarehouseSettings.css"





export default props => {
    const dispatch = useDispatch()
    const _id = parseInt(useParams()._id)
    const option = useParams()._option
    const shopReducer = useSelector(state => state.shop)
    const userReducer = useSelector(state => state.user)
    const dataReducer = useSelector(state => state.general)

    useEffect(() => {
        dispatch(readDeliveryInfo())
        dispatch(readData())
        dispatch(_products.read())
        dispatch(_warehouse_inventory.read())
    }, [])

    return (
        <div className="container">
            <div className="details">
                <h1>Warehouse Settings ({dataReducer._instances.find(instance => instance._id === _id)._name})</h1>
                <h3>Manage warehouse settings</h3>
            </div>

            <div className="warehouse-settings-container">
                <div className="nav-links">
                    <NavLink className={option === "inventory" ? "selected" : ""} to={"/warehouse/settings/" + _id + "/" + "inventory"}>Browse Inventory</NavLink>
                    <NavLink className={option === "stocks" ? "selected" : ""} to={"/warehouse/settings/" + _id + "/" + "stocks"}>Manage Stocks</NavLink>
                    <NavLink className={option === "shipping_info" ? "selected" : ""} to={"/warehouse/settings/" + _id + "/" + "shipping_info"}>Manage Shipping Info</NavLink>
                </div>

                <div className="component-wrapper">
                    {option === "inventory" ? <WarehouseInventory shop={shopReducer} general={dataReducer} id={_id} /> : null}
                    {option === "stocks" ? <StockManagement shop={shopReducer} general={dataReducer} id={_id} /> : null}
                    {option === "shipping_info" ? <WarehouseShippingInfo user={userReducer} id={_id} /> : null}
                </div>
            </div>
        </div>
    )
}