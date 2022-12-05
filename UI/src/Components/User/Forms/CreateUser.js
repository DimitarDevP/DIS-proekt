import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Form from "../../ReactFormer/Form"
import { createUser } from "../../../Redux/Actions/UserActions"
import { readData } from '../../../Redux/Actions/GeneralActions'

import "./CreateUser.css"

const _instances = [
    {_id: 1, _name: "PlastfixAU"},
    {_id: 2, _name: "PlastfixNZ"},
    {_id: 3, _name: "PlastfixUS"},
]

export default props => {

    const dispatch = useDispatch()

    const [user, setUser] = useState({
        _email: "",
        _name: "",
        _state_id: null,
        _type_id: null,
        _instance_id: null,
        _username: "",
        _password: "",
        _confirm_password: ""
    })


    const [info, setInfo] = useState({ infoType: "Undetermined", infoMessage: "Undetermined" })
    const [submitted, setSubmitted] = useState(false)
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

    }, [])


    useEffect(() => {
        dispatch(readData())
    }, [])


    const userReducer = useSelector(state => state.user)
    const generalReducer = useSelector(state => state.general)

    useEffect(() => {
        if (submitted === false) return

        setInfo({infoType: userReducer.createStatus, infoMessage: userReducer.createMessage})

    }, [userReducer, submitted])

    return (
        <div className="container create-user">
            <div className="details">
                <h1>Create New User</h1>
            </div>
            {states === false ? "Loading... Please wait." : <div className="create-user-form">
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
                            if (user._password !== user._confirm_password) return setInfo({ infoType: "warning", infoMessage: "Please make sure the passwords match" })
                            
                            if (user?._type_id === null || user?._type_id === undefined) return setInfo({ infoType: "warning", infoMessage: "Please select a user type." })

                            if (user._type_id === 2) {
                                if (user?._instance_id === null || user?._instance_id === undefined) return setInfo({ infoType: "warning", infoMessage: "Please select an instance." })
                                if (user?._state_id === null || user?._state_id === undefined) return setInfo({ infoType: "warning", infoMessage: "Please select a state." })
                            }

                            if (user?._name?.length === 0 || user?._name?.length === undefined) return setInfo({ infoType: "warning", infoMessage: "Please enter the users' name" })
                            if (user?._email?.length === 0 || user?._email?.length === undefined) return setInfo({ infoType: "warning", infoMessage: "Please make sure the email you entered is valid" })
                            if (user?._username?.length === 0 || user?._username?.length === undefined) return setInfo({ infoType: "warning", infoMessage: "Please enter username" })
                            if (user?._password?.length === 0 || user?._password?.length === undefined) return setInfo({ infoType: "warning", infoMessage: "Please enter password" })

                            const data = new FormData()
                            data.append("_email", user._email)
                            data.append("_name", user._name)
                            data.append("_type_id", user._type_id)
                            data.append("_state_id", user._state_id)
                            data.append("_instance_id", user._instance_id)
                            data.append("_username", user._username)
                            data.append("_password", user._password)
                            setSubmitted(true)
                            dispatch(createUser(data))
                        },
                        fields: [
                            {
                                name: "_type_id",
                                label: "Select User Type",
                                value: user._type_id,
                                formType: "select",
                                options: generalReducer._user_types
                            },
                            {
                                name: "_instance_id",
                                label: "Select customer instance",
                                value: user._instance_id,
                                formType: "select",
                                options: _instances,
                                hide: user._type_id !== 2
                            },
                            {
                                name: "_state_id",
                                label: "Select customer state",
                                value: user._state_id,
                                formType: "select",
                                options: _instances.find(i => i._id === user._instance_id)?._name === undefined ? [] : states[_instances.find(i => i._id === user._instance_id)?._name],
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
                            {
                                name: "_confirm_password",
                                label: "Confirm Password",
                                type: "password",
                                value: user._password,
                                placeholder: "Confirm Password",
                                formType: "input"
                            },
                        ],
                        fieldsData: user,
                        info: info,
                        submitted: submitted,
                        formName: "Create User Form",
                        submitButtonText: "Create User"
                    }}
                />
            </div>}
        </div>
    )
}