import { Fragment, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Redirect, useParams } from "react-router-dom"
import { _customer_orders, readHistory, _packages, _products } from "../../../Redux/Actions/ShopActions"
import { addOrder, emptyCart } from "../../../Redux/Actions/TempCartActions"
import { CONSTANTS } from "../../../../package.json"
import { GrClose, GrCheckmark } from "react-icons/gr"

import "./OrderProcessing.css"

import moment from 'moment-timezone'
import Info from "../../ReactFormer/Info"
import Multiple from "../../ReactFormer/Select"
import Input from "../../ReactFormer/Input"
import DateTime from "../../ReactFormer/DateTime"
const TIMEZONE_REGION = {
    "name": "Sydney Australia",
    "value": "Australia/Sydney"
}

export const getUtcString = (d = new Date()) => {
    return moment.tz(moment(), TIMEZONE_REGION.value).format("YYYY-MM-DD HH:mm:ss")
}

const prioritizedStatuses = {
    "1": 5,
    "2": 1,
    "3": 2,
    "4": 3,
    "5": 4,
}

const getDateString = dateObj => {

    var cDate = dateObj.getDate();
    var cMonth = dateObj.getMonth() + 1;
    var cYear = dateObj.getFullYear();

    return `${cYear}-${cMonth < 10 ? "0" + cMonth : cMonth}-${cDate < 10 ? "0" + cDate : cDate} 00:00:00`
}

const OrderItem = props => {
    // const item_product = useSelector(state => state.shop.products.find(prod => prod._id === props.item._product_id))
    const shop = useSelector(state => state.shop)
    const statuses = useSelector(state => state.general._order_statuses)

    const order_package = shop.packages[props.item._package_id]
    const order_product = shop.products[order_package?._product_id] || {}
    return (
        <div className="order-item">
            <span className="item-info">
                <img src={CONSTANTS.STATIC_URL + order_product._image_url} />
                <p>{order_product._name} x{order_package?._items_per_package}</p>
            </span>
            <div className="break"></div>
            <span className="quantity-control">
                {props.canEdit === true ?  props.item._status_id === 2 || props.item._set === true ? (
                    <Fragment>
                        <button onClick={e => {
                            e.preventDefault()
                            if (props.item._quantity - 1 <= 0) return
                            props.setOrder({
                                ...props.order,
                                orders: [
                                    ...props.order.orders.filter(ord => ord._id !== props.item._id),
                                    { ...props.item, _quantity: props.item._quantity - 1 }
                                ]
                            })
                        }}>-</button>
                        <input value={props.item._quantity} onChange={e => {
                            const qty = isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value)
                            props.setOrder({
                                ...props.order,
                                orders: [
                                    ...props.order.orders.filter(ord => ord._id !== props.item._id),
                                    { ...props.item, _quantity: qty }
                                ]
                            })
                        }} />
                        <button onClick={e => {
                            e.preventDefault()
                            props.setOrder({
                                ...props.order,
                                orders: [
                                    ...props.order.orders.filter(ord => ord._id !== props.item._id),
                                    { ...props.item, _quantity: props.item._quantity + 1 }
                                ]
                            })
                        }}>+</button>
                    </Fragment>
                ) : <p>{props.item._quantity}</p> : <p>{props.item._quantity}</p>}
            </span>
            <span>{parseFloat(order_product._price) * order_package?._items_per_package * props.item._quantity}</span>
            <span className="approval-control">
                {props.canEdit === true ? (
                    <Fragment>
                        { props.item._status_id === 2 || props.item._set === true ?
                            <Fragment>
                                <button className={props.item._status_id === 1 ? "rejected" : ""} onClick={e => {
                                    e.preventDefault()
                                    props.setOrder({
                                        ...props.order,
                                        orders: [
                                            ...props.order.orders.filter(ord => ord._id !== props.item._id),
                                            { ...props.item, _status_id: 1, _set: true }
                                        ]
                                    })
                                }}><GrClose /></button>
                                <button className={[1, 2].includes(props.item._status_id) === false ? "approved" : ""} onClick={e => {
                                    e.preventDefault()
                                    props.setOrder({
                                        ...props.order,
                                        orders: [
                                            ...props.order.orders.filter(ord => ord._id !== props.item._id),
                                            { ...props.item, _status_id: 3, _set: true }
                                        ]
                                    })
                                }}><GrCheckmark /></button>
                                <div className="break"></div>
                                <button className={props.item._from_supplier !== 1 ? "Ordered-Light" : "Ordered"} onClick={e => {
                                    props.setOrder({
                                        ...props.order,
                                        orders: [
                                            ...props.order.orders.filter(ord => ord._id !== props.item._id),
                                            { ...props.item, _from_supplier: props.item._from_supplier === 1 ? 0 : 1 }
                                        ]
                                    })
                                }}>From Supplier</button>
                            </Fragment>
                            :
                            <p> You cannot change the approval status of this order right now. </p>
                        }
                    </Fragment>
                ) : <p className={"status " + statuses.find(stat => stat._id === props.item._status_id)?._name}>{statuses.find(stat => stat._id === props.item._status_id)?._name}</p>}
            </span>
            <span className="discount-control">
                {props.canEdit === true &&  props.item._status_id === 2 || props.item._set === true ? (
                    <Fragment>
                        <p>Discount</p>
                        <input type="text" value={props.item._discount} onChange={e => {
                            props.setOrder({
                                ...props.order,
                                orders: [
                                    ...props.order.orders.filter(ord => ord._id !== props.item._id),
                                    { ...props.item, _discount: e.target.value }
                                ]
                            })
                        }} />
                    </Fragment>
                ) : <Fragment><p>Discount: </p> <h3>{props.item._discount}</h3> </Fragment>}
            </span>
        </div>
    )
}



const printHtml = url => {
    fetch(url)
    .then(res => res.text())
    .then(res => {
        let win = window.open("")
        win.document.write(res)
        win.document.onload = win.print()
    })
}



export default props => {

    const dispatch = useDispatch()
    const _order_number = useParams()._order_number

    useEffect(() => {
        dispatch(_customer_orders.read())
        dispatch(_packages.read())
        dispatch(_products.read())
        dispatch(readHistory())
    }, [])

    const shop = useSelector(state => state.shop)
    const user = useSelector(state => state.user)
    const canEdit = [1, 3].includes(user?.currentUser?._type_id)
    const general = useSelector(state => state.general)
    const currentOrder = shop.customerOrders[_order_number]

    const [info, setInfo] = useState({ infoType: "Undetermined", infoMessage: "Undetermined" })
    const [submitted, setSubmitted] = useState(false)

    const [_deliver_from_id, _set_deliver_from_id] = useState(null)
    const [redirect, setRedirect] = useState(false)

    useEffect(() => {
        if (submitted === false) return
        setInfo({ infoType: shop.updateCustomerOrderStatus, infoMessage: shop.updateCustomerOrderMessage })
    }, [shop])

    const [newOrder, setNewOrder] = useState({
        _order_number: _order_number,
        _customer_id: currentOrder === undefined ? null : currentOrder[0]?._customer_id,
        orders: currentOrder === undefined ? [] : [...currentOrder]
    })

    const checkOrders = () => {
        for (const order of newOrder.orders) {
            if (order._status_id === 2) return false
        }
        return true
    }

    let priority_status = null
    currentOrder.map(item => {
        if ((priority_status === null || item._status_id < priority_status) && item._status_id !== 1) priority_status = item._status_id 
    })

    console.log(currentOrder)

    if (priority_status === null) priority_status = 1
    const next_status = priority_status + 1
    console.log(next_status)
    const next_status_name = general._order_statuses.find(status => status._id === next_status)?._name
    return redirect === true ? <Redirect to="/products/products_cart" /> : (
        <div className="container">
            <div className="details">
                <h1>Process Customer Order</h1>
                <h3>Order Processing screen</h3>
            </div>

            <div className="order-processing-container">
                <div className="top">
                    <span>
                        <h2>Order Processing</h2>
                        <span>
                            <button onClick={e => {
                                e.preventDefault()
                                let url = CONSTANTS.STATIC_URL + "pos/" + _order_number + ".html"
                                printHtml(url)
                            }}>Download PO</button>
                            {currentOrder !== undefined && currentOrder[0]._status_id !== 2 ? <button onClick={e => {
                                e.preventDefault()
                                let url = CONSTANTS.STATIC_URL + "invoices/" + _order_number + ".html"
                                printHtml(url)
                            }}>Download Invoice</button> : null }
                        </span>
                    </span>
                    <hr />
                </div>

                <div className="items-container">

                    <div className="order-item">
                        <span className="item-info">
                            <h3>Image</h3>
                        </span>
                        <span className="quantity-control">
                            <h3>Quantity</h3>
                        </span>
                        <span>
                            <h3>Product Price</h3>
                        </span>
                        <span className="approval-control">
                            <h3>Approval Status</h3>
                        </span>
                        <span className="discount-control">
                            <h3>Discount %</h3>
                        </span>
                    </div>

                    {newOrder.orders.sort((a, b) => (a._id > b._id) ? 1 : -1).map(item => <OrderItem canEdit={canEdit} currentOrder={currentOrder} order={newOrder} setOrder={setNewOrder} item={item} />)}
                </div>

                <div className="order-info-container">
                    {canEdit === true ? (
                        <Fragment>
                            <div>
                                {priority_status === 2 ?
                                    <Fragment>
                                        <span className="proceed-button btns" style={{ justifyContent: "flex-end", display: "flex" }}>
                                            <button className="Rejected" onClick={e => {
                                                e.preventDefault()
                                                setNewOrder({ ...newOrder, orders: newOrder.orders.map(ord => ({ ...ord, _status_id: 1 })) })
                                            }} style={{ marginRight: "30px", fontSize: "0.9em" }}>Reject All</button>

                                            <button className="Approved" onClick={e => {
                                                e.preventDefault()
                                                setNewOrder({ ...newOrder, orders: newOrder.orders.map(ord => ({ ...ord, _status_id: 3 })) })
                                            }} style={{ fontSize: "0.9em" }}>Approve All</button>
                                        </span>

                                        <div className="form">
                                            <form>
                                                <Multiple
                                                    name="_deliver_from_id"
                                                    label="Select location/supplier to deliver from."
                                                    value={_deliver_from_id}
                                                    options={[...general._instances, { _id: 4, _name: "Ship from supplier" }]}
                                                    idBy="_id"
                                                    display="_name"
                                                    handleChange={e => _set_deliver_from_id(e.target.value)}
                                                />

                                                <Input
                                                    type="text"
                                                    handleChange={e => setNewOrder({ ...newOrder, orders: newOrder.orders.map(ord => ({ ...ord, _shipping_cost: e.target.value })) })}
                                                    value={newOrder.orders[0]._shipping_cost}
                                                    label="Shipping cost"
                                                />
                                            </form>
                                        </div>
                                        <span className="proceed-button">
                                            {checkOrders() === true && (user.users.find(u => u._id === currentOrder[0]._customer_id)._type_id !== 4 || _deliver_from_id !== null) ?
                                                <button onClick={e => {
                                                    e.preventDefault()
                                                    const ords = []

                                                    for (const ord of newOrder.orders) {
                                                        if (ord._set === true) {
                                                            delete ord._set
                                                            ords.push(ord)
                                                        }
                                                    }

                                                    const data = new FormData()
                                                    data.append("_order_number", _order_number)
                                                    data.append("_customer_id", currentOrder[0]._customer_id)
                                                    data.append("_by_id", user.currentUser._id)
                                                    data.append("_by_name", user.currentUser._name)
                                                    data.append("_date", getUtcString())
                                                    data.append("orders", JSON.stringify(ords.length > 0 ? ords : newOrder.orders))
                                                    data.append("generateInvoice", true)
                                                    data.append("_deliver_from_id", parseInt(_deliver_from_id))
                                                    setSubmitted(true)
                                                    dispatch(_customer_orders.update(data))
                                                }}>Proceed</button>
                                                :
                                                <p>Please approve/decline orders before processing this order</p>}
                                        </span>
                                    </Fragment>
                                    : null}

                                <span className="proceed-button">
                                    {priority_status === 1 ? <p>This order has been rejected.</p> : priority_status > 2 && next_status <= 5 ? (
                                        <Fragment>
                                            {next_status_name === "Dispatched" ? (
                                                <Fragment>
                                                    <div className="form">
                                                        <form>
                                                            <DateTime
                                                                name="_estimated_delivert_date"
                                                                label="Estimated delivery day"
                                                                value={newOrder.orders[0]._estimated_delivert_date === null ? new Date() : new Date(newOrder.orders[0]._estimated_delivert_date)}
                                                                handleChange={e => setNewOrder({ ...newOrder, orders: newOrder.orders.map(ord => ({ ...ord, _estimated_delivert_date: e.target.value })) })}
                                                            />

                                                            <Input
                                                                type="textarea"
                                                                handleChange={e => setNewOrder({ ...newOrder, orders: newOrder.orders.map(ord => ({ ...ord, _shipping_notes: e.target.value })) })}
                                                                value={newOrder.orders[0]._shipping_notes}
                                                                label="Shipping notes"
                                                            />
                                                        </form>
                                                    </div>
                                                </Fragment>
                                            ) : null}
                                            <button onClick={e => {
                                                e.preventDefault()
                                                setSubmitted(true)
                                                if (next_status_name === "Dispatched" && newOrder.orders[0]._estimated_delivert_date === null) return setInfo({infoType: "warning", infoMessage: "Please select an estimated delivery date"})
                                                const orders = [...newOrder.orders]
                                                for (let order in orders) {
                                                    if (orders[order]._status_id === priority_status) orders[order]._status_id = next_status
                                                }
                                                const data = new FormData()
                                                data.append("_order_number", _order_number)
                                                data.append("_customer_id", currentOrder[0]._customer_id)
                                                data.append("_by_id", user.currentUser._id)
                                                data.append("_date", getUtcString())
                                                data.append("orders", JSON.stringify(orders.map(ord => ({ ...ord, _estimated_delivert_date: ord._estimated_delivert_date === null || ord._estimated_delivert_date.getMonth() === undefined ? ord._estimated_delivert_date : getDateString(ord._estimated_delivert_date) }))))

                                                setNewOrder({ ...newOrder, orders: orders.map(ord => ({ ...ord, _estimated_delivert_date: ord._estimated_delivert_date === null || ord._estimated_delivert_date.getMonth() === undefined ? ord._estimated_delivert_date : getDateString(ord._estimated_delivert_date) })) })
                                                dispatch(_customer_orders.update(data))
                                            }} className={next_status_name}>Continue to {next_status_name} </button>
                                        </Fragment>
                                    ) : next_status > 5 ?
                                            <div>
                                                <p><b>Estimated delivery date: </b> {newOrder.orders[0]._estimated_delivert_date === null || typeof newOrder.orders[0]._estimated_delivert_date !== "string" ? null : newOrder.orders[0]._estimated_delivert_date.substr(0, 11)}</p>
                                                <br />
                                                <p><b>Shipping notes: </b> {newOrder.orders[0]._shipping_notes}</p>
                                            </div> : null}
                                </span>

                            </div>
                            <br />
                            {submitted === true ? <Info type={info.infoType} message={info.infoMessage} /> : null}
                        </Fragment>
                    ) : <button className="btn Ordered" onClick={e => {
                        dispatch(emptyCart())
                        setTimeout(() => {
                            for(const item of newOrder.orders) {
                                dispatch(addOrder({ _product_id: item._package_id, _quantity: item._quantity }))
                            }
                            setRedirect(true)
                        }, 250)
                    }}>Order Again</button>}

                </div>

                <span className="history-container">
                    {newOrder.orders.map(order => (
                        <span>
                            <h3>{shop?.products[shop?.packages[order?._package_id]?._product_id]?._name} x{shop?.packages[order?._package_id]?._items_per_package}</h3>
                            {shop?.history?.filter(hist => hist._order_id === order._id)?.map(hist => (
                                <p>
                                    <strong>{hist._date_changed}</strong> < br /> {user.users.find(user => user._id === hist._by_id)._name} Changed the status from {general._order_statuses.find(s => s._id === hist._from_status_id)._name} to {general._order_statuses.find(s => s._id === hist._to_status_id)._name}
                                </p>
                            ))}
                        </span>
                    ))}
                </span>
            </div>
        </div>
    )
}