import React, { useState, useEffect } from "react"
import Form from "../ReactFormer/Form"
import Table from "../Table/Table"
import "./Reports.css"
import Axios from "axios"

import { CONSTANTS } from "../../../package.json"


const request = async (options, url) => {
    const res = await Axios.get(url, {
        method: "GET",
        headers: {
            "Content-type": "application/json",
            "data": JSON.stringify(options),
            "offsetHours": 0,
            "offsetMinutes": 0,
        }
    })
    const data = await res.data

    let newReport = {
        fields: [],
        rows: []
    }

    for (const c in data.columns) {
        newReport.fields.push({ name: data.columns[c] })
    }

    for (const row in data.rows) {
        const _row = []
        for (const prop in data.rows[row]) {
            _row.push({ [data.rows[row][prop].name]: data.rows[row][prop].value })
        }
        newReport.rows.push(_row)
    }

    return newReport
}

export default props => {
    const [report, setReport] = useState({ rows: [], fields: [] })
    const [submitted, setSubmitted] = useState(false)
    const [print, setPrint] = useState(false)
    const [info, setInfo] = useState({ infoType: "undetermined", infoMessage: "Undetermined" })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const data = props.formatData()
        if (props.url !== undefined) request(data, props.url)
    }, [])

    useEffect(() => {
        if (print === true) {
            const print = document.getElementsByClassName("print-table-legacy")[0]
            const newWin = window.open("")
            const logo_url = CONSTANTS._instance_id === 3 ? "https://static.pttapal.com/public/documents/doc_16383718374553235.png" : "https://static.plastfix.com/public/images/index.png"
            const html = `
            <html> 
                <head>
                    <style>
                        * { text-decoration: none; font-family: sans-serif; margin: 0px; padding: 0px }
                        body>h2, body>p { text-align: center; }
                        .print-table-legacy>thead>.columns { background: #0061f2 !important; color: #FFF; text-align: center }
                        .print-table-legacy>thead>.columns>td>p { padding: 3px 6px }
                        .print-table-legacy>tbody>tr { page-break-after: avoid; page-break-inside: avoid; }
                        .logos { display: flex; justify-content: space-around; width: 100%; margin: 25px auto; }
                        .logos>img { max-height: 90px; }
                        table{ font-size:0.65vw; border-spacing: 0px; margin: 0px auto;}
                        table, td, tr { border: 1.5px solid  #0061f2 }
                        table, thead > tr, thead > tr > td { border: 1.5px solid  #FFF }
                        td > p { padding: 6px }
                    </style>
                </head> 
                <body> 
                    <div class="logos">
                        <img src="https://static.plastfix.com/public/images/wxm_white.png" />
                        <img src="${logo_url}" />
                    </div>
                    <br />
                    <br />
                    <h2> ${props.name} </h2>
                    <p> Report generated for : ${props.datesInfo} </p>
                    <br />
                    <br />
                    <div class="table-container">
                        ${print.outerHTML} 
                    </div>
                </body> 
            </html>
            `
            newWin.document.write(html)
            newWin.document.onload = newWin.print()
        }
    }, [print])
    const form = {
        name: "report",
        handleChange: e => {
            setSubmitted(false)
            setPrint(false)
            props.setFilterOptions({ ...props.filterOptions, [e.target.name]: e.target.value })
        },
        handleSubmit: e => {
            e.preventDefault()
            if (submitted === true) return
            setSubmitted(true)
            setLoading(true)
            if (props.validate() === "") {
                setInfo({ infoType: "undetermined", infoMessage: "Undetermined" })
                const data = props.formatData()
                request(data, props.url)
                    .then(res => {
                        setReport(res)
                        props.setFilterOptions({
                            ...props.filterOptions,
                            _export_columns_options: res.fields,
                            _export_columns: res.fields.map((option, id) => id)
                        })
                        setInfo({ infoType: "success", infoMessage: "Report built successfully." })
                        setLoading(false)
                    })
                    .catch(e => {
                        setInfo({ infoType: "error", infoMessage: "Error occurred. Please try again" })
                    })
            } else {
                setInfo({ infoType: "warning", infoMessage: props.validate() })
            }
        },
        fields: [
            ...props.fields,
            {
                name: "_export_columns",
                label: "Select Export Columns",
                value: props.filterOptions._export_columns,
                formType: "multiple",
                options: Array.isArray(props.filterOptions._export_columns_options) === true ? props.filterOptions._export_columns_options.map((item, index) => { return { _name: item.name, _id: index } }) : null,
                hide: Array.isArray(props.filterOptions._export_columns_options) === false
            }
        ],
        overloadedFields: [
            ...props.overloadedFields,
            (<button onClick={e => {
                e.preventDefault()
                setPrint(true)
            }}>  Export as PDF </button>)
        ],
        fieldsData: props.filterOptions,
        submitButtonText: "Generate Report",
        formName: props.name + " Filter Options",
        canEdit: props.disable === true ? false : true,
        submitted,
        info,
    }

    return (
        <div className={props.customClass !== undefined ? "container report " + props.customClass : "container report"}>
            <span className="details">
                <span>
                    <h1>{props.name}</h1>
                    <h3>{props.description}</h3>
                </span>
                <span>
                    <Form data={form} />
                </span>
            </span>

            {props.columns !== null && props.rows !== null ? (
                <Table
                    selectedIndexes={props.filterOptions._export_columns}
                    groupBy={props.groupBy}
                    groupByIdx={props.groupByIdx}
                    loading={loading}
                    columns={props.columns === undefined ? report.fields : props.columns}
                    rows={props.rows === undefined ? report.rows : props.rows}
                    setExportData={props.setExportData}
                    redirectPath={props.path}
                    appendField={props.fieldName}
                    appendFieldIdx={props.fieldIndex}
                    print={print}
                />
            ) : ""}
        </div>
    )
}