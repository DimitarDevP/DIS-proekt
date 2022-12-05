import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { _customer_orders, _packages, _technician_orders } from '../../../Redux/Actions/ShopActions'
import Table from '../../ReduxTable/Table'

export default props => {
    const dispatch = useDispatch()

    const [instanceUsers, setInstanceUsers] = useState([])

    useEffect(() => {
        dispatch(_technician_orders.read())
        dispatch(_customer_orders.read())
        dispatch(_packages.read())
    }, [])

    const [loadedUsers, setLoadedUsers] = useState(false)
    const [users, setUsers] = useState(false)
    const shop = useSelector(state => state.shop)
    const user = useSelector(state => state.user)
    const general = useSelector(state => state.general)

    useEffect(async () => {
        let items = {}
        for (const instance of general._instances) {
            const req = await fetch(instance._api_url + "/api/user/get_users")
            const res = await req.json()
            const data = await res
            items = { ...items, [instance._id]: data.allUsers }
        }
        setUsers(items)
    }, [])

    const createArray = (num, order) => {
        const numPending = order.filter(ord => ord._is_approved === null).length
        const numActive = order.filter(ord => ord._is_converted === 0 && ord._is_approved === 1 && ord._is_dispatched === 0).length
        const awaiting_pi = order.filter(ord => [2, 3, 4].includes(shop.customerOrders[ord._order_number]?.find(prod => ord._product_id === shop.packages[prod._package_id]?._product_id)?._status_id)).length
        const dispatched_pi = order.filter(ord => ord._is_dispatched === 0 && shop.customerOrders[ord._order_number]?.find(prod => ord._product_id === shop.packages[prod._package_id]?._product_id)?._status_id === 5).length
        const numCompleted = order.filter(ord => ord._is_dispatched === 1).length
        const numRejected = order.filter(ord => ord._is_approved === 0 || (ord._is_converted && shop.customerOrders[ord._order_number]?.find(prod => ord._product_id === shop.packages[prod._package_id]?._product_id)?._status_id === 1)).length
        const status = numPending > 0 ? "1_Pending" : numActive + awaiting_pi > 0 ? "2_Active" : dispatched_pi > 0 ? "3_In Transit" : numRejected === order.length ? "5_Rejected" : "4_Dispatched"

        return [
            { "Status": status },
            { "Order Number": num },
            { "Ordered By": users[order[0]._instance_id]?.find(u => u._id === order[0]._technician_id)._username },
            { "Date Of Order": order[0]._date_of_order },
            { "Pending": numPending },
            { "Approved": numActive + awaiting_pi },
            { "In Transit": dispatched_pi },
            { "Dispatched": numCompleted },
            { "Rejected": numRejected },
        ]
    }

    const mappedOrders = []

    if (users !== false) {
        for (const key in shop.technicianOrders) {
            if (shop.technicianOrders[key]?.length) {
                if (shop.technicianOrders[key][0]._customer_id === user.currentUser?._id || user.currentUser?._type_id === 1) mappedOrders.push(createArray(key, shop.technicianOrders[key]))
            }
        }
    }

    return (
        <div className="container">
            <div className="details">
                <h1>Technician Orders</h1>
                <h3>A summarized table of all technician orders in your state</h3>
            </div>
            <div>
                <Table
                    loading={users === false || shop.readTechnicianOrder === "pending" || general.readDataStatus === "pending" || user.readStatus === "pending"}
                    setExportData={() => { }}
                    redirectPath="/tech_orders/process/"
                    appendField="Order Number"
                    appendFieldIdx={1}
                    statusIndex={0}
                    columns={[
                        { name: "Status", width: 170 },
                        { name: "Order Number", width: 160 },
                        { name: "Ordered By", width: 150 },
                        { name: "Date Of Order", width: 140 },
                        { name: "Pending", width: 100 },
                        { name: "Approved", width: 100 },
                        { name: "In Transit", width: 120 },
                        { name: "Dispatched", width: 100 },
                        { name: "Rejected", width: 100 },
                    ]}
                    rows={mappedOrders}
                />
            </div>
        </div>
    )
}