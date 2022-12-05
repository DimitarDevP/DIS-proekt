import { CONSTANTS } from "../../../../package.json"
import { useDispatch, useSelector } from "react-redux"
import { editOrder, removeItem } from "../../../Redux/Actions/TempCartActions"

export default props => {
    const dispatch = useDispatch()
    
    const products = useSelector(state => state.shop.products)
    const packages = useSelector(state => state.shop.packages)
    const general = useSelector(state => state.general)

    const _package = packages[props.order._product_id]
    const product = products[_package?._product_id] || {}

    return (
        <div className="cart-item product-item">
            <span className="product-info">
                <img src={CONSTANTS.STATIC_URL + product._image_url} />
                <span className="product-data">
                    <p>{product._name} x{_package?._items_per_package}</p>
                    <p>{general._product_categories.find(cat => cat._id == product._category_id)?._name}</p>
                    <p onClick={() => dispatch(removeItem(props.order))}>Remove Item</p>
                </span>
            </span>
            <div className="break"></div>
            <span className="quantity-controls">
                <button onClick={e => {
                    e.preventDefault()
                    if (props.order._quantity - 1 > 0) dispatch(editOrder({ ...props.order, _quantity: props.order._quantity - 1 }))
                }}>-</button>
                <input value={props.order._quantity} onChange={e => {
                    const qty = isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value)
                    dispatch(editOrder({ ...props.order, _quantity: qty }))
                }} />
                <button onClick={e => {
                    e.preventDefault()
                    dispatch(editOrder({ ...props.order, _quantity: props.order._quantity + 1 }))
                }}>+</button>
            </span>

            <span className="price one">{parseFloat(product._price) * _package?._items_per_package} USD</span>
            <span className="price total">{parseFloat(product._price) * _package?._items_per_package * props.order._quantity} USD</span>

        </div>
    )
}