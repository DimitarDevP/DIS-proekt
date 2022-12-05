import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams, NavLink, useLocation } from "react-router-dom"
import { _suppliers } from "../../Redux/Actions/ShopActions"
import Form from "../ReactFormer/Form"
import Table from "../ReduxTable/Table"

import "./SupplierSettings.css"

export default props => {

    const option = useParams().option === ":option" ? "view" : useParams().option
    const dispatch = useDispatch()
    const shop = useSelector(state => state.shop)
    const [newSupplier, setNewSupplier] = useState({
        _name: "",
        _email: "",
        _phone: "",
        _address: ""
    })
    const [submitted, setSubmitted] = useState(false)
    const [info, setInfo] = useState({ infoType: "undetermined", infoMessage: "undetermined" })

    useEffect(() => dispatch(_suppliers.read()) , [])

    useEffect(() => {
        if(submitted === false) return
        setInfo({infoType: shop.createSupplierStatus, infoMessage: shop.createSupplierMessage})
    } , [shop.createSupplierStatus])

    const createArray = s => {
        return [
            { "ID": s._id },
            { "Name": s._name },
            { "Email": s._email },
            { "Phone": s._phone || "NA" },
            { "Address": s._address || "NA" },
        ]
    }

    const mappedSuppliers = shop?.suppliers?.map(s => createArray(s))
    console.log(option)
    return (
        <div className="container">
            <div className="details">
                <h1>Suppliers Settings</h1>
                <h3>Manage suppliers data</h3>
            </div>

            <div className="settings-container">
                <div className="settings-nav">
                    <NavLink className={option === "view" ? "selected" : ""} to="/suppliers_settings/view">Suppliers table</NavLink>
                    <NavLink className={option === "create" ? "selected" : ""} to="/suppliers_settings/create">Add new supplier</NavLink>
                </div>
                <div className="settings-components">
                    {
                        option === "view" ?
                            <Table
                                hideTopClear={true}
                                loading={shop.readSupplierStatus === "pending"}
                                setExportData={() => { }}
                                redirectPath="/edit_supplier/"
                                appendField="ID"
                                appendFieldIdx={0}
                                columns={[
                                    { name: "ID" },
                                    { name: "Name" },
                                    { name: "Email" },
                                    { name: "Phone" },
                                    { name: "Address" },
                                ]}
                                rows={mappedSuppliers}
                            /> :
                            <Form
                                data={{
                                    handleChange: e => {
                                        setInfo({ infoType: "undetermined", infoMesssage: "undetermined" })
                                        setSubmitted(false)
                                        setNewSupplier({ ...newSupplier, [e.target.name]: e.target.value })
                                    },
                                    handleSubmit: e => {
                                        e.preventDefault()
                                        if (newSupplier._name === "" || newSupplier._name === undefined) return setInfo({infoType: "warning", infoMesssage: "Please enter name"})
                                        if (newSupplier._email === "" || newSupplier._email === undefined) return setInfo({infoType: "warning", infoMesssage: "Please enter email"})
                                        setSubmitted(true)
                                        const data = new FormData()
                                        data.append("_id", newSupplier._id)
                                        data.append("_name", newSupplier._name)
                                        data.append("_email", newSupplier._email)
                                        data.append("_phone", newSupplier._phone)
                                        data.append("_address", newSupplier._address)
                                        dispatch(_suppliers.create(data))
                                    },
                                    fields: [
                                        {
                                            name: "_name",
                                            label: "Supplier Name",
                                            type: "text",
                                            value: newSupplier._name,
                                            placeholder: "Enter Supplier Name",
                                            formType: "input"
                                        },
                                        {
                                            name: "_email",
                                            label: "Supplier Email",
                                            type: "text",
                                            value: newSupplier._email,
                                            placeholder: "Enter Supplier Email",
                                            formType: "input"
                                        },
                                        {
                                            name: "_phone",
                                            label: "Supplier Phone",
                                            type: "text",
                                            value: newSupplier._phone,
                                            placeholder: "Enter Supplier Phone",
                                            formType: "input"
                                        },
                                        {
                                            name: "_address",
                                            label: "Supplier Address",
                                            type: "text",
                                            value: newSupplier._address,
                                            placeholder: "Enter Supplier Address",
                                            formType: "input"
                                        },
                                    ],
                                    fieldsData: newSupplier,
                                    info,
                                    submitted,
                                    formName: "Create new supplier",
                                    submitButtonText: "Create"
                                }}
                            />
                    }
                </div>
            </div>
        </div>
    )
}