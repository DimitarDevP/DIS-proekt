import { Fragment, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { CONSTANTS } from "../../../../package.json"
import { _pending_orders, _products } from "../../../Redux/Actions/ShopActions"
import { readData } from "../../../Redux/Actions/GeneralActions"
import "./IncomingOrders.css"

import moment from 'moment-timezone'
const TIMEZONE_REGION = {
    "name": "Sydney Australia",
    "value": "Australia/Sydney"
}

export const getUtcString = (d = new Date()) => {
    return moment.tz(moment(), TIMEZONE_REGION.value).format("YYYY-MM-DD HH:mm:ss")
}

const Order = props => {
    const dispatch = useDispatch()
    const ordered_product = useSelector(state => state.shop.products[props.order._product_id])
    const instance = useSelector(state => state.general._instances.find(i => i._id === props.order._instance_id))
    const customer = useSelector(state => state.user.users.find(u => u._id === props.order._customer_id))

    const handleSubmit = (e, _recieved) => {
        e.preventDefault()
        const data = new FormData()
        data.append("_id", props.order._id)
        data.append("_arrived", _recieved)
        data.append("_date", getUtcString())
        props.setSubmitted(props.order._id)
        dispatch(_pending_orders.update(data))
    }

    return (
        <div className="incoming-order-item">
            <span className="product-info">
                <img src={CONSTANTS.STATIC_URL + ordered_product?._image_url} />
                <h3>{ordered_product?._name}</h3>
            </span>

            <span className="date-info"> <center>{props.order?._date_ordered} <br /> {props.order?._date_arrived} </center></span>

            <span className="instance-info"> {instance?._name === undefined ? customer?._name === undefined ? "Customer" : customer?._name : instance?._name} </span>

            <span className="quantity-info"> {props.order._quantity} </span>

            <span className="arrival-action">
                {props.order._arrived === null ? <Fragment>
                    <button className="Approved" onClick={e => handleSubmit(e, 1)}>Recieve</button>
                    <button className="Rejected" onClick={e => handleSubmit(e, 0)}>Discard</button>
                </Fragment> : props.order._arrived === 0 ?
                        <Fragment>
                            <h3>This order was discarded.</h3>
                            <button className="Approved" onClick={e => handleSubmit(e, 1)}>Recieve</button>
                        </Fragment> : props.order._arrived === 1 ?
                            <h3>Order was recieved.</h3> : null}
            </span>
        </div>
    )
}

export default props => {
    const dispatch = useDispatch()
    const shop = useSelector(state => state.shop)
    const [submitted, setSubmitted] = useState(false)

    let incoming_orders = useSelector(state => state.shop.pendingOrders.filter(order => order?._arrived === null).map(order => <Order submitted={submitted} setSubmitted={setSubmitted} order={order} />))
    let discared_orders = useSelector(state => state.shop.pendingOrders.filter(order => order?._arrived === 0).map(order => <Order submitted={submitted} setSubmitted={setSubmitted} order={order} />))
    let recieved_orders = useSelector(state => state.shop.pendingOrders.filter(order => order?._arrived === 1).map(order => <Order submitted={submitted} setSubmitted={setSubmitted} order={order} />))

    useEffect(() => {
        dispatch(_pending_orders.read())
        dispatch(_products.read())
        dispatch(readData())
    }, [])

    return (
        <div className="container">
            <div className="details">
                <h1>Incoming Orders</h1>
                <h3>View and manage incoming orders</h3>
            </div>

            <div className="incoming-orders-container">
                <div className="incoming incoming-orders">
                    <h2>Incoming Orders</h2>
                    <hr />
                    <div className="incoming-order-item">
                        <span className="product-info"> Product Info </span>
                        <span className="date-info"> Date Ordered </span>
                        <span className="instance-info"> Destination </span>
                        <span className="quantity-info"> Ordered Quantity </span>
                        <span className="arrival-action"> Action </span>
                    </div>
                    {incoming_orders.length === 0 ? <p>There are no incoming orders</p> : incoming_orders}
                </div>

                <div className="discared incoming-orders">
                    <h2>Discarded Orders</h2>
                    <hr />
                    <div className="incoming-order-item">
                        <span className="product-info"> Product Info </span>
                        <span className="date-info"> <center>Date Ordered <br /> Date Discarded</center> </span>
                        <span className="instance-info"> Destination </span>
                        <span className="quantity-info"> Ordered Quantity </span>
                        <span className="arrival-action"> Action </span>
                    </div>
                    {discared_orders.length === 0 ? <p>There are no discarded orders</p> : discared_orders}
                </div>

                <div className="recieved incoming-orders">
                    <h2>Recieved Orders</h2>
                    <hr />
                    <div className="incoming-order-item">
                        <span className="product-info"> Product Info </span>
                        <span className="date-info"> <center>Date Ordered <br /> Date Arrived</center> </span>
                        <span className="instance-info"> Destination </span>
                        <span className="quantity-info"> Ordered Quantity </span>
                        <span className="arrival-action"> Action </span>
                    </div>
                    {recieved_orders.length === 0 ? <p>There are no recieved orders</p> : recieved_orders}
                </div>
            </div>
        </div>
    )
}