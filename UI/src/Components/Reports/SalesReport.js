import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { CONSTANTS } from "../../../package.json"
import Report from "./Report";
import { saveAs } from 'file-saver';
import { generate, s2ab, getDateFromRange } from "../../helpers"



export default props => {
    const [exportData, setExportData] = useState({})
    const general = useSelector(state => state.general)
    const user = useSelector(state => state.user)

    const [filterOptions, setFilterOptions] = useState({
        _instance_id: [],
        _status_id: [],
        _type_id: [],
        _customer_id: [],
        _date_range: {
            from: new Date(),
            to: new Date()
        }
    })

    const overloadedFields = [
        (<button onClick={e => {
            e.preventDefault()
            const newData = { ...exportData, data: [["Sales Report For: ", getDateFromRange(filterOptions._date_range), "", "Plastfix Shop System"], ...exportData.data.filter(f => f !== undefined)] }
            const file = new Blob([s2ab(generate(newData, filterOptions._export_columns))], { type: "application/octet-stream" })
            saveAs(file, 'Sales Report.xlsx')
        }}>Export</button>)
    ]

    const fields = [
        {
            name: "_date_range",
            label: "Select Range",
            value: filterOptions._purchesed_date,
            formType: "daterange"
        },
        {
            name: "_instance_id",
            label: "Select Shipping Location",
            value: filterOptions._instance_id,
            formType: "multiple",
            options: [...general._instances, {_id: null, _name: "Vendor"}],
            display: "_name",
        },
        {
            name: "_status_id",
            label: "Select Statuses",
            value: filterOptions._status_id,
            formType: "multiple",
            options: general._order_statuses,
            display: "_name",
        },
        {
            name: "_type_id",
            label: "Select Customer Type",
            value: filterOptions._type_id,
            formType: "multiple",
            options: general._user_types.filter(t => t._id == 2 || t._id == 4),
            display: "_name",
        },
        {
            name: "_customer_id",
            label: "Select Customers",
            value: filterOptions._customer_id,
            formType: "multiple",
            options: user.users.filter(u => filterOptions._type_id.includes(u._type_id)),
            display: "_name",
            hide: filterOptions._type_id === null || filterOptions._type_id === [] || filterOptions._type_id === undefined
        }
    ]

    const validate = () => {
        if (filterOptions._date_range.from === null) return "Please select date."
        if (filterOptions._date_range.to === null) return "Please select date range."
        return ""
    }

    const formatData = () => {
        const Dates = {
            from: `${filterOptions._date_range.from.getFullYear()}-${filterOptions._date_range.from.getMonth() + 1}-${filterOptions._date_range.from.getDate()} 00:00:00`,
            to: `${filterOptions._date_range.to.getFullYear()}-${filterOptions._date_range.to.getMonth() + 1}-${filterOptions._date_range.to.getDate()} 23:59:59`,
        }
        return { ...filterOptions, Dates: Dates }
    }


    return (
        <Report
            datesInfo={getDateFromRange(new Date())}
            groupBy="Customer"
            groupByIdx={0}
            url={CONSTANTS.API_URL + "/api/reports/sales_report"}
            validate={validate}
            formatData={formatData}
            filterOptions={filterOptions}
            setFilterOptions={setFilterOptions}
            fields={fields}
            overloadedFields={overloadedFields}
            exportData={exportData}
            setExportData={setExportData}
            name="Sales Report"
            description="Filter and generate sales reports"
        />
    )
}