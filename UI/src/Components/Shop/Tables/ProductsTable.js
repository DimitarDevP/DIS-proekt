import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from 'react-redux'
import Table from "../../ReduxTable/Table"
import { _customer_orders, _products } from "../../../Redux/Actions/ShopActions"

export default function Jobs2(props) {
    const dispatch = useDispatch()
    const general = useSelector(state => state.general)
    const shop = useSelector(state => state.shop)

    useEffect(() => {
        dispatch(_products.read())
        dispatch(_customer_orders.read())
    }, [])

    let createArray = (prod) => {
        return [
            { "Name": prod._name },
            { "ID": prod._id },
            { "Product Number": prod._product_number },
            { "Price (USD)": prod._price },
            { "Internal": prod._is_internal === 1 ? "Yes" : "No" },
            { "Category": general?._product_categories?.find(cat => prod._category_id == cat._id)?._name }
        ]
    }
    const mappedProducts = shop.products.filter(product => product !== undefined && product !== null).map(product => createArray(product))
    return (
        <div className="container">
            <div className="details">
                <h1>Products</h1>
                <h3>List of all the shop products.</h3>
            </div>
            <Table
                loading={shop.readProductStatus === "pending"}
                setExportData={() => { }}
                redirectPath="/products/edit/"
                appendField="ID"
                appendFieldIdx={1}
                columns={[
                    {name: "Name"},
                    {name: "ID", width: 60},
                    {name: "Product Number", width: 100},
                    {name: "Price (USD)", width: 150},
                    {name: "Internal", width: 80},
                    {name: "Category"},
                ]}
                rows={mappedProducts}
            />
        </div>
    )
}