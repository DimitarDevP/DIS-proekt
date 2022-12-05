import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { CONSTANTS } from "../../../../package.json"
import { addOrder, editOrder, removeItem } from "../../../Redux/Actions/TempCartActions"

export default props => {

    const compareInt = (number1, number2) => {
        return parseInt(number1) === parseInt(number2) ? true : false
    }

    const dispatch = useDispatch()

    const cart = useSelector(state => state.tempCart)
    const generalReducer = useSelector(state => state.general)
    const itemIsInCart = cart.orders.filter(order => compareInt(order._product_id, props.package._id) === true).length > 0
    const [qty, setQty] = useState(
        cart.orders.find(order => compareInt(order._product_id, props.package._id) === true) === undefined ? 0 : 
        cart.orders.find(order => compareInt(order._product_id, props.package._id) === true)._quantity
    )


    useEffect(() => {
        if (itemIsInCart === true) {
            if (qty === 0) dispatch(removeItem({ _product_id: props.package._id, _quantity: qty }))
            else dispatch(editOrder({ ...cart.orders.find(order => compareInt(order._product_id, props.package._id) === true), _quantity: qty }))
        } else {
            if (qty > 0) dispatch(addOrder({ _product_id: props.package._id, _quantity: qty }))
        }
    }, [qty])

    const categories = useSelector(state => state.general._product_categories)

    return (
        <div className="product-card">
            <div className="product-image">
                <img src={CONSTANTS.STATIC_URL + props.product._image_url} alt="Plastfix Product" />
            </div>
            <div className="product-data">
                <p style={{color: "#666"}}>{props.product._name} x{props.package._items_per_package}</p>
                <h3>USD ${props.product._price * props.package._items_per_package} </h3>
                <p>{generalReducer._product_categories.find(cat => cat._id === props.product._category_id)._name}</p>
                
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
        </div>
    )
}