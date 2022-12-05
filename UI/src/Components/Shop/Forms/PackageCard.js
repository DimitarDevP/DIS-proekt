import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { CONSTANTS } from "../../../../package.json"
import { _packages } from "../../../Redux/Actions/ShopActions"
import Info from "../../ReactFormer/Info"
import "./PackageCard.css"

export default props => {

    const dispatch = useDispatch()

    const [submitted, setSubmitted] = useState(false)
    const shopReducer = useSelector(state => state.shop)

    return (
        <div className="package-card">
            <div>
                <span><img src={CONSTANTS.STATIC_URL + props.product._image_url} /></span>
                <span><h3>{props.product._name}</h3></span>
                <span><h3>x{props._package._items_per_package}</h3></span>
                <span><h3>{props._package._archived === 0 ? "Active" : "Archived"}</h3></span>
                <span>{props._package._archived === 0 ? <button className="Rejected" onClick={e => {
                    e.preventDefault()

                    const data = new FormData()
                    data.append("_id", props._package._id)
                    data.append("_product_id", props._package._product_id)
                    data.append("_items_per_package", props._package._items_per_package)
                    data.append("_archived", 1)
                    
                    setSubmitted(true)
                    dispatch(_packages.update(data))
                }}>Archive Package</button> : <button className="Approved" onClick={e => {
                    e.preventDefault()

                    const data = new FormData()
                    data.append("_id", props._package._id)
                    data.append("_product_id", props._package._product_id)
                    data.append("_items_per_package", props._package._items_per_package)
                    data.append("_archived", 0)

                    setSubmitted(true)
                    dispatch(_packages.update(data))
                }}>Retrive Package</button>}</span>
            </div>

            {submitted === true ? <Info type={shopReducer.updatePackageStatus} message={shopReducer.updatePackageMessage} /> : null}
        </div>
    )
}