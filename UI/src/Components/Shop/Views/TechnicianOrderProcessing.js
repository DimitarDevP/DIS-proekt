import { Fragment, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import moment from 'moment-timezone'

import { readInventory, _products, _packages, _technician_orders, _customer_orders } from "../../../Redux/Actions/ShopActions"
import { CONSTANTS } from "../../../../package.json"
import Info from "../../ReactFormer/Info"
import { NavLink } from 'react-router-dom'
import "./TechnicianOrderProcessing.css"
import { addOrder, editOrder } from "../../../Redux/Actions/TempCartActions"

const TIMEZONE_REGION = { "name": "Sydney Australia", "value": "Australia/Sydney" }
const getUtcString = (d = new Date()) => moment.tz(moment(), TIMEZONE_REGION.value).format("YYYY-MM-DD HH:mm:ss")

const TechnicianActions = props => {
    const dispatch = useDispatch()

    const findStatus = item => {
        const order = props.shop.customerOrders[props.order._order_number]
        const order_item = order?.find(i => props.shop.packages[i._package_id]?._product_id === item._product_id)
        return order_item?._status_id
    }

    const [added, setAdded] = useState(props.cart.orders.find(ord => ord._order_id === props.order._id) === undefined ? false : true)

    let handleCart = e => {
        e.preventDefault()
        if (added) return
        let pkg = props.shop.packages.find(pkg => pkg?._product_id === props.order._product_id && pkg._items_per_package === 1)
        let existing = props.cart.orders.find(ord => ord._product_id === pkg._id)
        let _item = { _product_id: pkg._id, _order_id: props.order._id }
        if (existing === undefined) {
            _item._quantity = props.order._quantity
            dispatch(addOrder(_item))
        }
        else {
            _item._quantity = props.order._quantity + existing._quantity
            dispatch(editOrder(_item))
        }
        setAdded(true)
    }

    if (props.order._is_approved === 0) return <p>Rejected</p>
    if (props.order._is_dispatched === 1 && props.order._is_converted === 0) return <p>Dispatched to tech</p>
    if (props.order._is_dispatched === 1 && props.order._is_converted === 1) return <p>Dispatched to tech from PI</p>
    if (
        props.order._is_approved === 1 &&
        props.order._is_converted === 0
    ) return <button className="Credit" onClick={e => {
        e.preventDefault()
        props.setSubmitted(true)
        const data = new FormData()
        data.append("_id", props.order._id)
        data.append("_date", getUtcString())
        data.append("_is_dispatched", 1)
        dispatch(_technician_orders.update(data))
    }}>Technician Received</button>
    if (
        props.order._is_approved === 1 &&
        props.order._is_converted === 1 &&
        findStatus(props.order) === 1
    ) return <NavLink to={"/orders/process/" + props.order._order_number}>Rejected by PI</NavLink>
    if (
        props.order._is_approved === 1 &&
        props.order._is_converted === 1 &&
        findStatus(props.order) === 5
    ) return (
        <Fragment>
            <button className="Ready invert" onClick={e => {
                e.preventDefault()
            }}>In Stock</button>
            <button className="Credit" onClick={e => {
                e.preventDefault()
                props.setSubmitted(true)
                const data = new FormData()
                data.append("_id", props.order._id)
                data.append("_date", getUtcString())
                data.append("_is_dispatched", 1)
                dispatch(_technician_orders.update(data))
            }}>Technician Received</button>
        </Fragment>
    )
    if (
        props.order._is_approved === 1 &&
        props.order._is_converted === 1
    ) return <NavLink to={"/orders/process/" + props.order._order_number}>Being processed by PI</NavLink>
    if (props.order._is_approved === null) {
        return (
            <Fragment>
                <button className="In Transit" onClick={e => {
                    e.preventDefault()
                    props.setSubmitted(true)
                    const data = new FormData()
                    data.append("_id", props.order._id)
                    data.append("_date", getUtcString())
                    data.append("_is_approved", 1)
                    dispatch(_technician_orders.update(data))
                }}>Approve <br /> (From Stock)</button>
                <button className="In Transit" onClick={e => {
                    e.preventDefault()
                    props.setSubmitted(true)
                    const data = new FormData()
                    data.append("_id", props.order._id)
                    data.append("_date", getUtcString())
                    data.append("_product_id", props.order._product_id)
                    data.append("_customer_id", props.order._customer_id)
                    data.append("_order_number", props.order._order_number)
                    data.append("_quantity", props.order._quantity)
                    data.append("_date_of_order", props.order._date_of_order)
                    dispatch(_customer_orders.createFromTechnicianOrder(data))
                }}>Approve <br /> (From PI)</button>
                <button className="Ordered" onClick={handleCart}>{added === true ? "Added" : "To Cart"}</button>
                <button className="Cancelled" onClick={e => {
                    e.preventDefault()
                    props.setSubmitted(true)
                    const data = new FormData()
                    data.append("_id", props.order._id)
                    data.append("_date", getUtcString())
                    data.append("_is_approved", 0)
                    dispatch(_technician_orders.update(data))
                }}>Reject</button>
            </Fragment>
        )
    }
}

export default props => {

    const dispatch = useDispatch()
    const _order_number = useParams()._order_number

    useEffect(() => {
        dispatch(_technician_orders.read())
        dispatch(_customer_orders.read())
        dispatch(_products.read())
        dispatch(_packages.read())
        dispatch(readInventory())
    }, [])

    const general = useSelector(state => state.general)
    const shop = useSelector(state => state.shop)
    const cart = useSelector(state => state.tempCart)
    const currentOrder = useSelector(state => state.shop.technicianOrders[_order_number])

    const [tech, setTech] = useState(false)
    const [info, setInfo] = useState({ infoType: "Undetermined", infoMessage: "Undetermined" })
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        if (submitted === false) return
        setInfo({ infoType: shop.updateTechnicianOrderStatus, infoMessage: shop.updateTechnicianOrderMessage })
    }, [shop])

    useEffect(() => {
        if (currentOrder.length === 0 || tech !== false) return
        let url = general._instances.find(i => i._id === currentOrder[0]?._instance_id)?._api_url
        fetch(url + "/api/user/get_users")
            .then(response => response.json())
            .then(data => {
                setTech(data.allUsers.find(u => u._id === currentOrder[0]?._technician_id))
            })
    }, [currentOrder])

    return (
        <div className="container">
            <div className="details">
                <h1>Process Technician Order</h1>
                <h3>Order Processing screen</h3>
                <NavLink style={{ background: "#FFF", color: "#006CDC", fontWeight: "550", border: "2px solid #006CDC" }} to="/orders/technician_orders">Back to Orders</NavLink>
            </div>
            <div className="order-processing-container">
                <div className="top">
                    <h2>Order Processing</h2>
                    <hr />
                </div>
                <div className="orders-container">

                    <div className="order-item">
                        <span className="item-info info-special">
                            <h4>Product</h4>
                        </span>
                        <span className="quantity">
                            <h4>Stock QTY</h4>
                        </span>
                        <span className="quantity">
                            <h4>Order QTY</h4>
                        </span>
                        <div class="break"></div>
                        <span className="action">
                            <h4>Action</h4>
                        </span>
                    </div>

                    {currentOrder.sort((a, b) => a._id > b._id ? 1 : -1).map(item => (
                        <div className="order-item">
                            <span className="item-info">
                                <img src={CONSTANTS.STATIC_URL + shop.products[item._product_id]?._image_url} />
                                <p>{shop.products[item._product_id]?._name}</p>
                            </span>
                            <span className="quantity">
                                <p>{shop.inventory.find(inv => inv._product_id === item._product_id && inv._customer_id === item._customer_id)?._quantity || "0"}</p>
                            </span>
                            <span className="quantity">
                                <p>{item._quantity}</p>
                            </span>
                            <div class="break"></div>
                            <span className="action">
                                <TechnicianActions
                                    shop={shop}
                                    order={item}
                                    setSubmitted={setSubmitted}
                                    cart={cart}
                                />
                                {/* {item._is_dispatched === 1 ? <p>Dispatched</p> : item._is_approved === 0 ? <p>Rejected</p> : null}
                                {item._is_converted === 1 && item._is_dispatched !== 1 ? shop.customerOrders[item._order_number].find(ord => shop.packages[ord._package_id]._product_id === item._product_id)?._status_id === 5 ? <button className="Dispatched" onClick={e => {
                                    e.preventDefault()
                                    setSubmitted(true)
                                    const data = new FormData()
                                    data.append("_id", item._id)
                                    data.append("_date", getUtcString())
                                    data.append("_is_dispatched", 1)
                                    dispatch(_technician_orders.update(data))
                                }}>Dispatch Order <br /> (PI approved)</button> : item._is_converted === 1 && item._is_dispatched !== 1 && shop.customerOrders[item._order_number].find(ord => shop.packages[ord._package_id]._product_id === item._product_id)?._status_id === 1 ? "Rejected by PI" : <NavLink to={"/orders/process/" + item._order_number}>Forwarded to PI</NavLink> : item._is_approved === null ?
                                        (<OrderManagement item={item} setSubmitted={setSubmitted} shop={shop} cart={cart} />) : null}

                                {item._is_approved === 1 && item._is_converted !== 1 && item._is_dispatched === 0 ? <button className="Dispatched" onClick={e => {
                                    e.preventDefault()
                                    setSubmitted(true)
                                    const data = new FormData()
                                    data.append("_id", item._id)
                                    data.append("_date", getUtcString())
                                    data.append("_is_dispatched", 1)
                                    dispatch(_technician_orders.update(data))
                                }}>Dispatch Order</button> : null} */}
                            </span>
                        </div>
                    ))}

                </div>
                {submitted === true ? <Info type={info.infoType} message={info.infoMessage} /> : null}
                <div className="order-events">
                    {currentOrder.sort((a, b) => a._id > b._id ? 1 : -1).map(item => (
                        <div className="event">
                            <h3>{shop.products[item._product_id]?._name}
                                {item._is_approved === null ? null : <button onClick={e => {
                                    e.preventDefault()
                                    setSubmitted(true)
                                    const data = new FormData()
                                    data.append("_id", item._id)
                                    dispatch(_technician_orders.update(data, true))
                                }}>Revert Status</button>}
                            </h3>
                            <p>{item._date_of_order} : {tech?._username} placed order</p>
                            {item._is_approved !== null ? <p>{item._date_submitted} : {item._is_approved === 1 ? "Order was approved" : "Order was rejected"} </p> : null}
                            {item._is_dispatched === 1 ? <p>{item._date_dispatched} : Order was dispatched </p> : null}
                            <br />
                            <hr />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}


