import { Fragment, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import CartItem from "./CartItem"
import "./Cart.css"
import { _customer_orders, _products } from "../../../Redux/Actions/ShopActions"
import Info from "../../ReactFormer/Info"
import { statuses } from "../../../Redux/constants"
import { emptyCart } from "../../../Redux/Actions/TempCartActions"
import { readDeliveryInfo } from "../../../Redux/Actions/UserActions"
import Form from "../../ReactFormer/Form"
import { NavLink } from "react-router-dom"
import moment from 'moment-timezone'
const TIMEZONE_REGION = { "name": "Sydney Australia", "value": "Australia/Sydney" }

export const getUtcString = (d = new Date()) => moment.tz(moment(), TIMEZONE_REGION.value).format("YYYY-MM-DD HH:mm:ss")

const isAlphaNumeric = str => {

    if (str === undefined) return true

    for (let i = 0, len = str.length; i < len; i++)
        if (!(str.charCodeAt(i) > 47 && str.charCodeAt(i) < 58) && !(str.charCodeAt(i) > 64 && str.charCodeAt(i) < 91) && !(str.charCodeAt(i) > 96 && str.charCodeAt(i) < 123)) return false

    return true
}

export default props => {

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(_products.read())
        dispatch(readDeliveryInfo())
    }, [])

    const cartReducer = useSelector(state => state.tempCart)
    const products = useSelector(state => state.shop.products)
    const packages = useSelector(state => state.shop.packages)
    const user_id = useSelector(state => state.user.currentUser?._id)
    const userReducer = useSelector(state => state.user)
    const shopReducer = useSelector(state => state.shop)

    const [submitted, setSubmitted] = useState(false)
    const [info, setInfo] = useState({ type: "undetermined", message: "undetermined" })
    const [selectedInfo, setSelectedInfo] = useState({ _selected_info: null })


    useEffect(() => {
        if (submitted === true) {
            setInfo({ type: shopReducer.createCustomerOrderStatus, message: shopReducer.createCustomerOrderMessage })
            if (shopReducer.createCustomerOrderStatus === statuses.success) setTimeout(() => dispatch(emptyCart()), 1000)
        }
    }, [shopReducer])

    useEffect(() => setSubmitted(false), [cartReducer])


    const placeOrder = e => {
        e.preventDefault()
        setSubmitted(true)
        if (selectedInfo._selected_info === null || selectedInfo._selected_info === undefined) return setInfo({ type: "warning", message: "Please select delivery option." })
        const data = new FormData()
        data.append("_customer_id", user_id)
        data.append("orders", JSON.stringify(cartReducer.orders))
        data.append("date", getUtcString())
        data.append("_delivery_info_id", selectedInfo._selected_info)
        if (selectedInfo._po_number !== undefined && selectedInfo._po_number !== null && selectedInfo._po_number !== "") data.append("_po_number", selectedInfo._po_number)
        dispatch(_customer_orders.create(data))
    }


    let prices = cartReducer.orders.map(order => {
        const pkg = packages[order._product_id]
        const product = products[pkg?._product_id]
        return { amount: parseFloat(product?._price) * order._quantity * pkg?._items_per_package, currency: "USD" }
    })

    let totals = {}
    const totals_jsx = []
    for (const price of prices) {
        if (totals[price["currency"]] === undefined) totals[price["currency"]] = price["amount"]
        else totals[price["currency"]] += price["amount"]
    }

    for (const key in totals) totals_jsx.push(<h3> {totals[key].toFixed(3)} {key} </h3>)


    return (
        <div className="container">
            <div className="details">
                <h1>My Cart</h1>
            </div>
            <div className="order-container">
                <div className="cart-container">
                    <div className="above">
                        <h2>Products</h2>
                        <h2>{cartReducer.orders.length} items</h2>
                    </div>
                    <hr />
                    <div className="items-container">
                        {cartReducer.orders.length > 0 ? (
                            <Fragment>
                                <div className="cart-item labels">
                                    <span className="product-info"> <h3>Product</h3> </span>
                                    <span className="quantity-controls"> <h3>Quantity</h3> </span>
                                    <span className="price one"> <h3>Price</h3> </span>
                                    <span className="price total"> <h3>Total</h3> </span>
                                </div>
                                {cartReducer.orders.sort((a, b) => (a._product_id > b._product_id) ? 1 : -1).map(ord => <CartItem order={ord} />)}
                            </Fragment>
                        ) : "You dont have any items in your cart."}
                    </div>
                </div>
                {cartReducer.orders.length > 0 ? (
                    <div className="summary-container">
                        <div className="above">
                            <h2>Order Summary</h2>
                        </div>
                        <hr />
                        <div className="order-processing">
                            <span>
                                <h3>Number of Items: {cartReducer.orders.length}</h3>
                                <h3>Cost: {totals["USD"].toFixed(3)} USD </h3>
                                <h3>Tax: {(totals["USD"] / 10).toFixed(3)} USD - (10% GST)</h3>
                                <h3>Total: {(totals["USD"] * 1.1).toFixed(3)} USD</h3>
                                
                                <Form
                                    data={{
                                        handleChange: e => {
                                            setSelectedInfo({ ...selectedInfo, [e.target.name]: e.target.value })
                                            setSubmitted(false)
                                        },
                                        handleSubmit: e => e.preventDefault(),
                                        fields: [
                                            {
                                                name: "_selected_info",
                                                label: "Select Delivery Address * ",
                                                value: selectedInfo._selected_info,
                                                formType: "select",
                                                display: "_address",
                                                options: userReducer.delivery_info[user_id] === undefined ? [] : userReducer.delivery_info[user_id]
                                            },
                                            {
                                                name: "_po_number",
                                                label: "Enter internal PO number (optional)",
                                                placeholder: "Internal PO number (optional)",
                                                value: selectedInfo._po_number,
                                                formType: "input",
                                                type: "text"
                                            }
                                        ],
                                        fieldsData: selectedInfo,
                                        info: {},
                                    }}
                                />
                            </span>
                            <span>

                            </span>
                            {submitted === false ?
                                <button onClick={e => {
                                    e.preventDefault()
                                    if (isAlphaNumeric(selectedInfo._po_number) === false && selectedInfo._po_number?.length > 0) {
                                        setSubmitted(true)
                                        setInfo({ type: "warning", message: "PO Number must be alphanumerical." })
                                    } else placeOrder(e)
                                }} className="place-order">Place Order</button> :
                                <Info type={info.type} message={info.message} />
                            }
                            {submitted === true && info.message === "Please select delivery option." ? <NavLink to="/create_shipping_info">Don't see one? create new.</NavLink> : null}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    )
}