import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { CONSTANTS } from "../../../package.json"
import Report from "./Report";
import { saveAs } from 'file-saver';
import { generate, s2ab, getDateFromRange } from "../../helpers"



export default props => {
    const [exportData, setExportData] = useState({})
    const general = useSelector(state => state.general)

    const [filterOptions, setFilterOptions] = useState({
        _instance_id: [],
        _category_id: []
    })

    const overloadedFields = [
        (<button onClick={e => {
            e.preventDefault()
            const newData = { ...exportData, data: [["Stocks Report For: ", getDateFromRange(new Date()), "", "Plastfix Shop System"], ...exportData.data.filter(f => f !== undefined)] }
            const file = new Blob([s2ab(generate(newData, filterOptions._export_columns))], { type: "application/octet-stream" })
            saveAs(file, 'Stocks Report.xlsx')
        }}>Export</button>)
    ]

    const fields = [
        {
            name: "_instance_id",
            label: "Select Locations",
            value: filterOptions._instance_id,
            formType: "multiple",
            options: general._instances,
            display: "_name",
        },
        {
            name: "_category_id",
            label: "Select Category",
            value: filterOptions._category_id,
            formType: "multiple",
            options: general._product_categories,
            display: "_name",
        }
    ]

    const validate = () => {
        return ""
    }

    const formatData = () => {
        return { ...filterOptions }
    }


    return (
        <Report
            datesInfo={getDateFromRange(new Date())}
            groupBy="State"
            url={CONSTANTS.API_URL + "/api/reports/stocks"}
            validate={validate}
            formatData={formatData}
            filterOptions={filterOptions}
            setFilterOptions={setFilterOptions}
            fields={fields}
            overloadedFields={overloadedFields}
            exportData={exportData}
            setExportData={setExportData}
            name="Stocks Report"
            description="Filter and generate stocks reports"
        />
    )
}