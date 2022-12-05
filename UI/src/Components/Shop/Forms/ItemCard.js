import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { _products, _technician_packages } from "../../../Redux/Actions/ShopActions"
import { MdDeleteForever } from "react-icons/md"
import Multiple from "../../ReactFormer/Select"
import Input from "../../ReactFormer/Input"
import "./ItemCard.css"
export default props => {

    const dispatch = useDispatch()
    const shopReducer = useSelector(state => state.shop)

    const setItem = e => {
        props.setSubmitted(false)
        props.setPackageSet({
            ...props.packageSet,
            items: [
                ...props.packageSet.items.filter(pkg => pkg._id !== props.item._id),
                { ...props.item, [e.target.name]: e.target.value }
            ]
        })
    }
    const deleteItem = e => {
        if (props.item.new === true) props.setPackageSet({ ...props.packageSet, items: [...props.packageSet.items.filter(pkg => pkg._id !== props.item._id)] })
        else {
            props.setSubmitted(true)
            props.setInfo({ infoType: "undetermined", infoMessage: "undetermined" })
            props.setPackageSet({ ...props.packageSet, items: [...props.packageSet.items.filter(pkg => pkg._id !== props.item._id)] })
            dispatch(_technician_packages.delete({ name: "_item_id", value: props.item._id }))
        }
    }

    useEffect(() => props.setInfo({ infoType: shopReducer.deleteTechPackageStatus, infoMessage: shopReducer.deleteTechPackageMessage }), [shopReducer.deleteTechPackageStatus])

    return (
        <div className="item-card">
            <h4>
                {props.item._product_id === null ? "New Product" : shopReducer.products[props.item._product_id]._name + " x" + props.item._quantity}
                <h3 onClick={e => deleteItem(e)}><MdDeleteForever className="remove-item" /></h3>
            </h4>
            <span className="col-2">
                <Multiple
                    name="_product_id" label="Select Product"
                    value={props.item._product_id}
                    options={shopReducer.products.filter(prod => prod !== null)}
                    handleChange={e => setItem(e)}
                    disableBlocker={true}
                />
                <Input
                    name="_quantity" label="Product Quantity" type="number" placeholder="Enter Product Quantity"
                    value={props.item._quantity}
                    handleChange={e => setItem(e)}
                />
            </span>
        </div>
    )
}
