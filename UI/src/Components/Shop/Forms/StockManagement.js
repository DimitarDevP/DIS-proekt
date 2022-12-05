import { useEffect, useState } from "react"
import Form from "../../ReactFormer/Form"
import { useDispatch } from "react-redux"
import { _pending_orders, _warehouse_inventory } from "../../../Redux/Actions/ShopActions"
import moment from 'moment-timezone'
import { statuses } from "../../../Redux/constants"

const TIMEZONE_REGION = { "name": "Sydney Australia", "value": "Australia/Sydney" }

export const getUtcString = (d = new Date()) => moment.tz(moment(), TIMEZONE_REGION.value).format("YYYY-MM-DD HH:mm:ss")

export default props => {

    const dispatch = useDispatch()

    const [submittedQty, setSubmittedQty] = useState(false)
    const [submittedPen, setSubmittedPen] = useState(false)
    const [info, setInfo] = useState({ infoType: "undetermined", infoMessage: "Undetermined" })
    const [stock, setStock] = useState({ _product_id: null, _quantity: null })

    useEffect(() => { if (submittedQty === true) setInfo({ infoType: props.shop.updateWarehouseInventoryStatus, infoMessage: props.shop.updateWarehouseInventoryMessage }) }, [props.shop])
    useEffect(() => { if (submittedPen === true) setInfo({ infoType: props.shop.createPendingOrderStatus, infoMessage: props.shop.createPendingOrderMessage }) }, [props.shop])

    return props.shop.readProductStatus === statuses.success ? (
        <Form
            data={{
                handleChange: e => {
                    setStock({ ...stock, [e.target.name]: e.target.value })
                    setSubmittedPen(false)
                    setSubmittedQty(false)
                },
                handleSubmit: e => {
                    e.preventDefault()
                    const data = new FormData()
                    data.append("_instance_id", props.id)
                    data.append("_product_id", stock._product_id)
                    data.append("_quantity", stock._quantity)

                    setSubmittedQty(true)
                    dispatch(_warehouse_inventory.update(data))
                },
                fields: [
                    {
                        name: "_quantity",
                        label: "Quantity",
                        type: "number",
                        value: stock._quantity,
                        placeholder: "Enter Quantity to add to inventory",
                        formType: "input"
                    },
                    {
                        name: "_product_id",
                        label: "Select Product",
                        value: stock._product_id,
                        formType: "select",
                        options: props.shop.products.filter(p => p !== null)
                    }
                ],
                overloadedFields: [
                    (
                        <button onClick={e => {
                            e.preventDefault()
                            const data = new FormData()
                            data.append("_instance_id", props.id)
                            data.append("_product_id", stock._product_id)
                            data.append("_quantity", stock._quantity)
                            data.append("_date_ordered", getUtcString())

                            setSubmittedPen(true)
                            dispatch(_pending_orders.create(data))
                        }}>Place as pending order</button>
                    )
                ],
                submitted: submittedPen || submittedQty,
                info,
                fieldsData: stock,
                formName: "Manage Warehouse Inventory (stocks)",
                submitButtonText: "ADD STOCKS DIRECTLY"
            }}
        />
    ) : "Loading... Please wait."
}