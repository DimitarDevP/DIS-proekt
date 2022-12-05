import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import { _suppliers } from "../../Redux/Actions/ShopActions"
import { statuses } from "../../Redux/constants"
import Form from "../ReactFormer/Form"

export default props => {
    const dispatch = useDispatch()
    const _id = parseInt(useParams()._id)

    const [submitted, setSubmitted] = useState(false)
    const [info, setInfo] = useState({ infoType: "undetermined", infoMessage: "undetermined" })
    const [supplier, setSupplier] = useState({
        _name: "",
        _email: "",
        _phone: "",
        _address: ""
    })

    const shop = useSelector(state => state.shop)

    useEffect(() => dispatch(_suppliers.read()), [])

    useEffect(() => {
        if (shop.readSupplierStatus === statuses.success) setSupplier({...shop.suppliers.find(s => s._id === _id)})
    }, [shop.readSupplierStatus])

    useEffect(() => {
        if(submitted === false) return
        setInfo({infoType: shop.updateSupplierStatus, infoMessage: shop.updateSupplierMessage})
    }, [shop.updateSupplierStatus])

    return (
        <div className="container">
            <div className="details" style={{marginBottom: "50px"}}>
                <h1>Edit Supplier</h1>
            </div>
            <Form
                data={{
                    handleChange: e => {
                        setInfo({ infoType: "undetermined", infoMessage: "undetermined" })
                        setSubmitted(false)
                        setSupplier({ ...supplier, [e.target.name]: e.target.value })
                    },
                    handleSubmit: e => {
                        e.preventDefault()
                        
                        if (supplier._name === "" || supplier._name === undefined) return setInfo({infoType: "warning", infoMesssage: "Please enter name"})
                        if (supplier._email === "" || supplier._email === undefined) return setInfo({infoType: "warning", infoMesssage: "Please enter email"})
                        setSubmitted(true)
                        const data = new FormData()
                        data.append("_id", supplier._id)
                        data.append("_name", supplier._name)
                        data.append("_email", supplier._email)
                        data.append("_phone", supplier._phone)
                        data.append("_address", supplier._address)
                        dispatch(_suppliers.update(data))
                    },
                    fields: [
                        {
                            name: "_name",
                            label: "Supplier Name",
                            type: "text",
                            value: supplier._name,
                            placeholder: "Enter Supplier Name",
                            formType: "input"
                        },
                        {
                            name: "_email",
                            label: "Supplier Email",
                            type: "text",
                            value: supplier._email,
                            placeholder: "Enter Supplier Email",
                            formType: "input"
                        },
                        {
                            name: "_phone",
                            label: "Supplier Phone",
                            type: "text",
                            value: supplier._phone,
                            placeholder: "Enter Supplier Phone",
                            formType: "input"
                        },
                        {
                            name: "_address",
                            label: "Supplier Address",
                            type: "text",
                            value: supplier._address,
                            placeholder: "Enter Supplier Address",
                            formType: "input"
                        },
                    ],
                    fieldsData: supplier,
                    info,
                    submitted,
                    formName: "Update supplier",
                    submitButtonText: "Update"
                }} 
            />
        </div>
    )
}