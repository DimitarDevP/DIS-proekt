import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from 'react-redux'
import Table from "../../ReduxTable/Table"
import { readUser } from "../../../Redux/Actions/UserActions"
import { readData } from "../../../Redux/Actions/GeneralActions"

export default function Jobs2(props) {
    const dispatch = useDispatch()
    const general = useSelector(state => state.general)
    const user = useSelector(state => state.user)
    const [states, setStates] = useState(false)

    useEffect(() => {
        dispatch(readUser())
        dispatch(readData())
    }, [])

    useEffect(async () => {
        const nz_json = await fetch("https://api.plastfix.com/api/general/get_general_data")
        const us_json = await fetch("https://api.pttapal.com/api/general/get_general_data")
        const au_json = await fetch("https://api.au.worxmanager.com/api/general/get_general_data")

        const nz_data = await nz_json.json()
        const us_data = await us_json.json()
        const au_data = await au_json.json()

        setStates({
            ...states,
            "1": au_data._states,
            "2": nz_data._states,
            "3": us_data._states,
        })

    }, [])
    
    let createArray = user => {
        let state = "NA"
        if (user._type_id === 2 && states !== false) {
            state = states[user._instance_id.toString()].find(state => state._id === user._state_id)?._name
        }
        return [
            { "Name": user._name },
            { "Email": user._email },
            { "Type": general?._user_types?.find(type => user._type_id == type._id)?._name === undefined ? "NA" : general?._user_types?.find(type => user._type_id == type._id)?._name },
            { "Instance": general?._instances?.find(ins => user._instance_id == ins._id)?._name === undefined ? "NA" : general?._instances?.find(ins => user._instance_id == ins._id)?._name },
            { "State": state },
            { "ID": user._id }
        ]
    }

    const mappedUsers = user?.users?.filter(user => !(!user._archived) === false)?.map(user => createArray(user))
    
    return (
        <div className="container">
            <div className="details">
                <h1>Users</h1>
                <h3>List of all users in the system</h3>
            </div>
            <Table
                loading={user.readStatus === "pending" || states === false}
                setExportData={() => { }}
                redirectPath="/users/profile/"
                appendField="ID"
                appendFieldIdx={5}
                columns={[
                    {name: "Name"},
                    {name: "Email"},
                    {name: "Type"},
                    {name: "Instance"},
                    {name: "State"},
                    {name: "ID", width: 50}
                ]}
                rows={mappedUsers}
            />
        </div>
    )
}