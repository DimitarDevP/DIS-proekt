import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from 'react-redux'
import Table from "../../ReduxTable/Table"
import { _technician_packages } from "../../../Redux/Actions/ShopActions"

export default function ProductSets(props) {
    const dispatch = useDispatch()
    const shop = useSelector(state => state.shop)

    useEffect(() => {
        dispatch(_technician_packages.read())
    }, [])

    let createArray = (pkg) => {
        return [
            { "ID": pkg._id },
            { "Name": pkg._name }
        ]
    }
    const mappedProducts = shop?.techPackages?.filter(pkg => pkg !== undefined && pkg !== null).map(pkg => createArray(pkg))
    return (
        <div className="container">
            <div className="details">
                <h1>Product Sets</h1>
                <h3>List of all the product set bundles.</h3>
            </div>
            <Table
                loading={shop.readTechPackageStatus === "pending"}
                setExportData={() => { }}
                redirectPath="/productSets/edit/"
                appendField="ID"
                appendFieldIdx={0}
                columns={[
                    {name: "ID", width: 60},
                    {name: "Name"},
                ]}
                rows={mappedProducts}
            />
        </div>
    )
}