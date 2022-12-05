import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { readData, updateSettings } from "../../Redux/Actions/GeneralActions"
import Form from "../ReactFormer/Form"

export default props => {
    const dispatch = useDispatch()
    const general = useSelector(state => state.general)
    useEffect(() => dispatch(readData()), [])


    const [info, setInfo] = useState({ infoType: "undetermined", infoMessage: "undetermined" })
    const [submitted, setSubmitted] = useState(false)
    const [data, setData] = useState([...general?._settings?.filter(s => s._type_id === 2)])
    const [fieldsData, setFieldsData] = useState({})

    useEffect(() => {
        const _new_data = {}
        data.map(item => { _new_data[item._name] = item._value })
        setFieldsData(_new_data)
    }, [general._settings])


    useEffect(() => {
        if (submitted === false) return
        setInfo({infoType: general.updateSettingsStatus, infoMessage: general.updateSettingsMessage})
    }, [general.updateSettingsStatus])

    return (
        <div className="container">
            <div className="details">
                <h1>Shipping Settings</h1>
                <h3>Form for modifying shipping settings.</h3>
                <h3>Note that these changes will effect generated invoices and purchase orders.</h3>
            </div>

            <div style={{ marginTop: "-50px", marginBottom: "100px" }}>
                <Form
                    data={{
                        handleChange: e => {
                            setSubmitted(false)
                            setInfo({ infoType: "undetermined", infoMessage: "undetermined" })
                            const changedItem = data.find(i => i._name === e.target.name)
                            const _setData = [...data.filter(i => i._name !== e.target.name), { ...changedItem, _value: e.target.value }]
                            const _new_data = {}
                            _setData.map(item => { _new_data[item._name] = item._value })
                            setFieldsData(_new_data)
                            setData(_setData)
                        },
                        handleSubmit: e => {
                            e.preventDefault()

                            const _data = new FormData()
                            _data.append("_settings_array", JSON.stringify(data))
                            setSubmitted(true)
                            dispatch(updateSettings(_data))
                        },
                        fields: data.sort((a, b) => a._id > b._id ? 1 : -1).map(item => {
                            return {
                                name: item._name,
                                label: item._name.replaceAll("_", " ").toUpperCase(),
                                type: "text",
                                placeholder: "Enter " + item._name.replaceAll("_", " "),
                                formType: "input"
                            }
                        }),
                        overloadedFields: [],
                        fieldsData: fieldsData,
                        info,
                        submitted,
                        formName: "Manage Settings",
                        submitButtonText: "Submit Changes"
                    }}
                />
            </div>
        </div>
    )
}