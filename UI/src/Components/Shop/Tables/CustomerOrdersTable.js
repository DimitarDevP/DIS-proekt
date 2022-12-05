import React, {  useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { readData } from '../../../Redux/Actions/GeneralActions'
import { _customer_orders } from '../../../Redux/Actions/ShopActions'
import { readUser } from '../../../Redux/Actions/UserActions'
import Table from '../../ReduxTable/Table'

const prioritizedStatuses = {
    "1": 5,
    "2": 1,
    "3": 2,
    "4": 3,
    "5": 4
}

export default props => {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(_customer_orders.read())
        dispatch(readUser())
        dispatch(readData())
    }, [])

    const shop = useSelector(state => state.shop)
    const user = useSelector(state => state.user)
    const general = useSelector(state => state.general)

    const createArray = order => {
        let high_priority = null
        for (const item of order)
            if (high_priority === null || prioritizedStatuses[item._status_id] < prioritizedStatuses[high_priority._status_id]) high_priority = item


        return [
            { "Order Status": prioritizedStatuses[high_priority._status_id] + "_" + general._order_statuses.find(status => high_priority._status_id === status._id)?._name },
            { "Order Number": high_priority._order_number },
            { "Ordered By": user?.users?.find(user => user._id === high_priority._customer_id)?._name },
            { "Order Date": high_priority._order_date },
        ]

    }

    const mappedOrders = []

    if (user?.currentUser?._type_id === 1 || user?.currentUser?._type_id === 3){
        for (const key in shop.customerOrders) {
            if (shop.customerOrders[key] !== null && shop.customerOrders[key] !== undefined) mappedOrders.push(createArray(shop.customerOrders[key]))
        }
    } else {
        for (const key in shop.customerOrders) {
            if (shop.customerOrders[key] !== null && shop.customerOrders[key] !== undefined && shop.customerOrders[key][0]._customer_id === user?.currentUser?._id) mappedOrders.push(createArray(shop.customerOrders[key]))
        }
    }

    return (
        <div className="container">
            <div className="details">
                <h1>Customer Orders</h1>
                <h3>A summarized table of all customer orders</h3>
            </div>
            <div>
                <Table
                    loading={shop.readCustomerOrderStatus === "pending" || general.readDataStatus === "pending" || user.readStatus === "pending"}
                    setExportData={() => { }}
                    redirectPath="/orders/process/"
                    appendField="Order Number"
                    appendFieldIdx={1}
                    statusIndex={0}
                    columns={[
                        {name: "Order Status"},
                        {name: "Order Number"},
                        {name: "Ordered By"},
                        {name: "Order Date"},
                    ]}
                    rows={mappedOrders}
                />
            </div>
        </div>
    )
}