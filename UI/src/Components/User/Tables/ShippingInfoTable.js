import React, { useEffect } from "react"
import { useDispatch, useSelector } from 'react-redux'
import Table from "../../ReduxTable/Table"
import { readDeliveryInfo, readUser } from "../../../Redux/Actions/UserActions"
import { readData } from "../../../Redux/Actions/GeneralActions"
import { NavLink } from "react-router-dom"

export default function Jobs2(props) {
    const dispatch = useDispatch()
    const general = useSelector(state => state.general)
    const user = useSelector(state => state.user)

    useEffect(() => {
        dispatch(readDeliveryInfo())
        dispatch(readData())
        dispatch(readUser())
    }, [])


    const createArray = info => {
        const _user = user.users.find(u => u._id === info._customer_id)

        return [
            { "ID": info._id  },
            { "Customer Name": _user?._name || "NA" },
            { "Recipiant Type": general._user_types.find(type => type._id === _user?._type_id)?._name || "NA" },
            { "Recipiant Name": info._name },
            { "Recipiant Phone Number": info._contact_number },
            { "Recipiant Email": info._contact_email },
            { "Country": info._country },
            { "City": info._city },
            { "Postal Code": info._post_code },
            { "Address": info?._address }
        ]
    }


    const mappedInfo = []
    if (user.currentUser?._type_id === 1 || user.currentUser?._type_id === 3) {
        for (const customer in user?.delivery_info) {
            for (const info of user?.delivery_info[customer]) {
                mappedInfo.push(createArray(info))
            }
        }
    } else if (user?.delivery_info[user.currentUser?._id] !== undefined) {

        for (const info of user.delivery_info[user.currentUser?._id]) {
            mappedInfo.push(createArray(info))
        }
    }

    return (
        <div className="container">
            <div className="details">
                <h1>Shipping Info</h1>
                <h3>List of Shipping Info Entries</h3>
                {[2, 4].includes(user.currentUser?._type_id) ? <NavLink to="create_shipping_info">Create New</NavLink> : null}
            </div>
            <Table
                loading={user.readStatus === "pending" || user.readInfoStatus === "pending" || general.readDataStatus === "pending"}
                setExportData={() => { }}
                redirectPath="/edit_shipping_info/"
                appendField="ID"
                appendFieldIdx={0}
                columns={[
                    { name: "ID" },
                    { name: "Customer Name" },
                    { name: "Recipiant Type" },
                    { name: "Recipiant Name" },
                    { name: "Recipiant Phone Number" },
                    { name: "Recipiant Email" },
                    { name: "Country" },
                    { name: "City" },
                    { name: "Postal Code" },
                    { name: "Address" },
                ]}
                rows={mappedInfo}
            />
        </div>
    )
}