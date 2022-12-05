import { Fragment, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import Dialog from "../../Dialog/Dialog"
import { CONSTANTS } from "../../../../package.json"
import { addOrder, editOrder, removeItem } from "../../../Redux/Actions/TempCartActions"

const ViewDialog = props => {

    const shopReducer = useSelector(state => state.shop)

    return (
        <Fragment>
            <Dialog
                showing={props.showing}
                setShowing={props.setShowing}
                title={"Products in " + props.package._name}
                jsx={(
                    <div className="dialog-products-container">
                        {props.package.items.map(item => (
                            <div>
                                <img src={CONSTANTS.STATIC_URL + shopReducer.products[item._product_id]._image_url} />
                                <h3>{shopReducer.products[item._product_id]._name} x{item._quantity}</h3>
                            </div>
                        ))}
                    </div>
                )}
            />
        </Fragment>
    )
}

export default props => {

    const compareInt = (number1, number2) => {
        return parseInt(number1) === parseInt(number2) ? true : false
    }

    const [showing, setShowing] = useState(false)

    const dispatch = useDispatch()

    const cart = useSelector(state => state.tempCart)
    const shop = useSelector(state => state.shop)


    let price = 0

    for (const prod of props.package.items) {
        price += parseFloat(shop.products[prod._product_id]._price) * prod._quantity
    }
    const itemIsInCart = cart.orders.filter(order => compareInt(order._product_id, props.package._id) === true).length > 0
    const [qty, setQty] = useState(cart.orders.find(order => compareInt(order._product_id, props.package._id) === true && order._is_tech_package === true) === undefined ? 0 : cart.orders.find(order => compareInt(order._product_id, props.package._id) === true  && order._is_tech_package === true)._quantity)

    useEffect(() => {
        if (itemIsInCart === true) {
            if (qty === 0) dispatch(removeItem({ _product_id: props.package._id, _quantity: qty, _is_tech_package: true }))
            else dispatch(editOrder({ ...cart.orders.find(order => compareInt(order._product_id, props.package._id) === true), _quantity: qty }))
        } else {
            if (qty > 0) dispatch(addOrder({ _product_id: props.package._id, _quantity: qty, _is_tech_package: true }))
        }
    }, [qty])

    return (
        <div className="product-card package">
            <div className="product-image">
                <span>
                    <h1>{props.package._name}</h1>
                </span>
            </div>
            <div className="product-data">
                <p style={{ color: "#666" }}>{props.package._name}</p>
                <h3>USD ${price} </h3>
                <p className="category">Package <span onClick={e => setShowing(true)}>(Browse Products)</span></p>

                <span>
                    {itemIsInCart === false ? <button onClick={e => {
                        e.preventDefault()
                        setQty(1)
                    }}>Add to cart</button> : <button onClick={e => {
                        e.preventDefault()
                        setQty(0)
                    }}>Remove from cart</button>}
                </span>
            </div>
            <ViewDialog
                showing={showing}
                setShowing={setShowing}
                package={props.package}
            />
        </div>
    )
}