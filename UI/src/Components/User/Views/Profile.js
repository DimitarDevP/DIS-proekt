import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import { _warehouse_inventory } from "../../../Redux/Actions/ShopActions"
import { updateUser } from "../../../Redux/Actions/UserActions"
import Form from "../../ReactFormer/Form"

export default props => {
    const dispatch = useDispatch()

    const _id = parseInt(useParams()._id)
    const userReducer = useSelector(state => state.user)
    const generalReducer = useSelector(state => state.general)
    const [info, setInfo] = useState({ infoType: "Undetermined", infoMessage: "Undetermined" })
    const [submitted, setSubmitted] = useState(false)
    const [user, setUser] = useState({ ...userReducer.users.find(u => u._id === _id) })

    const [states, setStates] = useState(false)

    useEffect(async () => {
        const nz_json = await fetch("https://api.plastfix.com/api/general/get_general_data")
        const us_json = await fetch("https://api.pttapal.com/api/general/get_general_data")
        const au_json = await fetch("https://api.au.worxmanager.com/api/general/get_general_data")

        const nz_data = await nz_json.json()
        const us_data = await us_json.json()
        const au_data = await au_json.json()

        setStates({
            ...states,
            "PlastfixNZ": nz_data._states,
            "PlastfixUS": us_data._states,
            "PlastfixAU": au_data._states,
        })
        dispatch(_warehouse_inventory.read())
    }, [])

    useEffect(() => {
        if (submitted === false) return
        setInfo({ infoType: userReducer.updateStatus, infoMessage: userReducer.updateMessage })

    }, [userReducer, submitted])


    return (
        <div className="container profile-container">
            <div className="details">
                <h1>{userReducer.users.find(u => u._id === _id)._name}</h1>
                <h3>{userReducer.users.find(u => u._id === _id)._name}'s profile page.</h3>
            </div>
            <div className="content-container">
                <div style={{marginTop: "-50px", marginBottom: "100px"}}>
                    <Form
                        data={{
                            handleChange: e => {
                                setInfo({ infoType: "Undetermined", infoMessage: "Undetermined" })
                                setSubmitted(false)
                                setUser({
                                    ...user,
                                    [e.target.name]: e.target.value
                                })
                            },
                            handleSubmit: e => {
                                e?.preventDefault()

                                if (user?._type_id === null || user?._type_id === undefined) return setInfo({ infoType: "warning", infoMessage: "Please select a user type." })

                                if (user._type_id === 2) {
                                    if (user?._instance_id === null || user?._instance_id === undefined) return setInfo({ infoType: "warning", infoMessage: "Please select an instance." })
                                    if (user?._state_id === null || user?._state_id === undefined) return setInfo({ infoType: "warning", infoMessage: "Please select a state." })
                                }

                                if (user?._name?.length === 0 || user?._name?.length === undefined) return setInfo({ infoType: "warning", infoMessage: "Please enter the users' name" })
                                if (user?._email?.length === 0 || user?._email?.length === undefined) return setInfo({ infoType: "warning", infoMessage: "Please make sure the email you entered is valid" })
                                if (user?._username?.length === 0 || user?._username?.length === undefined) return setInfo({ infoType: "warning", infoMessage: "Please make sure that the username is entered correctly" })
                                
                                const data = new FormData()
                                data.append("_id", user._id)
                                data.append("_email", user._email)
                                data.append("_name", user._name)
                                data.append("_type_id", user._type_id)
                                if (user._state_id !== null) data.append("_state_id", user._state_id)
                                if (user._instance_id !== null) data.append("_instance_id", user._instance_id)
                                if (user._username !== "") data.append("_username", user._username)
                                if (user._password !== "") data.append("_password", user._password)
                                setSubmitted(true)
                                dispatch(updateUser(data))
                            },
                            fields: [
                                {
                                    name: "_type_id",
                                    label: "Select User Type",
                                    value: user._type_id,
                                    formType: "select",
                                    options: generalReducer._user_types === undefined ? [] : generalReducer._user_types
                                },
                                {
                                    name: "_instance_id",
                                    label: "Select customer instance",
                                    value: user._instance_id,
                                    formType: "select",
                                    options: generalReducer._instances = undefined ? [] : generalReducer._instances,
                                    hide: user._type_id !== 2
                                },
                                {
                                    name: "_state_id",
                                    label: "Select customer state",
                                    value: user._state_id,
                                    formType: "select",
                                    options: (generalReducer._instances.find(i => i._id === user._instance_id)?._name === undefined ? [] : states[generalReducer._instances.find(i => i._id === user._instance_id)?._name]) || [],
                                    hide: user._type_id !== 2
                                },
                                {
                                    name: "_name",
                                    label: "Name",
                                    type: "text",
                                    value: user._name,
                                    placeholder: "Enter User Name",
                                    formType: "input"
                                },
                                {
                                    name: "_email",
                                    label: "Email",
                                    type: "email",
                                    value: user._email,
                                    placeholder: "Enter Email",
                                    formType: "input"
                                },
                                {
                                    name: "_username",
                                    label: "Username",
                                    type: "text",
                                    value: user._username,
                                    placeholder: "Enter Username",
                                    formType: "input"
                                },
                                {
                                    name: "_password",
                                    label: "Password",
                                    type: "password",
                                    value: user._password,
                                    placeholder: "Enter Password",
                                    formType: "input"
                                },
                            ],
                            fieldsData: user,
                            info: info,
                            submitted: submitted,
                            formName: "Update User Form",
                            submitButtonText: "Update User"
                        }}
                    />
                </div>
            </div>
        </div>
    )
}