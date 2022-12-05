import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { createDeliveryInfo } from "../../../Redux/Actions/UserActions"
import Form from "../../ReactFormer/Form"

export default props => {
    const dispatch = useDispatch()

    // state //
    const [info, setInfo] = useState({ infoType: "Undetermined", infoMessage: "Undetermined" })
    const [submitted, setSubmitted] = useState(false)
    const existingInfo = props.user.shipping_info[props.id]
    const [shippingInfo, setShippingInfo] = useState(existingInfo === undefined ? {
        _address: "",
        _country: null,
        _contact_number: "",
        _contact_email: "",
        _post_code: "",
        _city: "",
        _name: ""
    } : {...existingInfo})
    const [countries, setCountries] = useState([])
    // state //

    useEffect(() => {
        fetch("https://restcountries.com/v2/all/")
            .then(res => res.json())
            .then(data => {
                const _countries = data.map((c, idx) => { return { _name: c.name.includes("Macedonia") ? "Macedonia" : c.name, _id: idx } })
                setCountries(_countries)
                setShippingInfo({...shippingInfo, _country: _countries.find(c => c._name === shippingInfo._country)?._id})
            })
    }, [])

    useEffect(() => {
        if (submitted === false) return
        return setInfo({ infoType: props.user.createInfoStatus, infoMessage: props.user.createInfoMessage })
    }, [props.user.createInfoStatus])

    return (
        <Form
            data={{
                handleChange: e => {
                    setSubmitted(false)
                    setInfo({ infoType: "Undetermined", infoMessage: "Undetermined" })
                    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value })
                },
                handleSubmit: e => {
                    e.preventDefault()
                    for (const key in shippingInfo) {
                        if ((shippingInfo[key] === undefined || shippingInfo[key] === null || shippingInfo[key] === "") && key !== "_customer_id"){
                            console.log(key)
                            return setInfo({ infoType: "warning", infoMessage: "Please make sure that the form is filled in correctly." })
                        }
                    }

                    const data = new FormData()
                    data.append("_country", countries.find(c => c._id === shippingInfo._country)._name)
                    data.append("_city", shippingInfo._city)
                    data.append("_post_code", shippingInfo._post_code)
                    data.append("_address", shippingInfo._address)
                    data.append("_contact_number", shippingInfo._contact_number)
                    data.append("_contact_email", shippingInfo._contact_email)
                    data.append("_name", shippingInfo._name)
                    data.append("_instance_id", props.id)
                    setSubmitted(true)
                    dispatch(createDeliveryInfo(data))
                },
                fields: [
                    {
                        name: "_country",
                        label: "Select Country Of Shippment",
                        value: shippingInfo._country,
                        options: countries,
                        placeholder: "Enter Country",
                        formType: "select"
                    },
                    {
                        name: "_city",
                        label: "City",
                        type: "text",
                        value: shippingInfo._city,
                        placeholder: "Enter City",
                        formType: "input"
                    },
                    {
                        name: "_post_code",
                        label: "Postal Code",
                        type: "text",
                        value: shippingInfo._post_code,
                        placeholder: "Enter Postal Code",
                        formType: "input"
                    },
                    {
                        name: "_address",
                        label: "Shipping Address",
                        type: "text",
                        value: shippingInfo._address,
                        placeholder: "Enter Shipping Address",
                        formType: "input"
                    },
                    {
                        name: "_contact_number",
                        label: "Contact Number",
                        type: "text",
                        value: shippingInfo._contact_number,
                        placeholder: "Enter Contact Number",
                        formType: "input"
                    },
                    {
                        name: "_contact_email",
                        label: "Contact Email",
                        type: "email",
                        value: shippingInfo._contact_email,
                        placeholder: "Enter Contact Email",
                        formType: "input"
                    },
                    {
                        name: "_name",
                        label: "Deliver From",
                        type: "text",
                        value: shippingInfo._name,
                        placeholder: "Enter Name of person who will accept the package (e.g. Jane Doe)",
                        formType: "input"
                    },

                ],
                overloadedFields: [],
                fieldsData: shippingInfo,
                info: info,
                submitted: submitted,
                formName: "Manage Delivery Information",
                submitButtonText: "Submit"

            }}
        />
    )
}