import React, { Fragment, useEffect, useState } from "react"
import { NavLink } from "react-router-dom"
import "./Table.css"
import { BiLeftArrow, BiRightArrow } from "react-icons/bi"
const Table = props => {

    const sorter = (aoa, index, shoudlAscend) => {
        aoa.sort((a, b) => {
            const name = Object.keys(b[index])[0]
            if (a[index][name] == parseInt(a[index][name]) && b[index][name] == parseInt(b[index][name])) {
                if (parseInt(a[index][name]) > parseInt(b[index][name])) return 1
                else return -1
            }
            else if (!isNaN(new Date(a[index][name])?.getTime()) && !isNaN(new Date(b[index][name])?.getTime())) {
                if (new Date(a[index][name]).getTime() > new Date(b[index][name]).getTime()) return 1
                else return -1
            }
            else {
                if (a[index][name]?.toString() === "") return 1
                else if (b[index][name]?.toString() === "") return -1
                else return a[index][name]?.toString().localeCompare(b[index][name].toString())
            }
        })

        if (shoudlAscend === true) return aoa
        else return aoa.reverse()
    }


    const [filter, setFilter] = useState(props.columns.map(col => { return { col: "" } }))
    const [index, setIndex] = useState(0)
    const [shoudlAscend, setShoudlAscend] = useState(true)
    const [page, setPage] = useState(1)
    const [pageSet, setPageSet] = useState(1)

    useEffect(() => {
        let filterOptions = {}
        for (const option of props.columns) {
            filterOptions = {
                ...filterOptions,
                [option.name]: ""
            }
        }
        setFilter(filterOptions)
        props.setExportData({
            cols: props.columns.map((currElement, index) => {
                return {
                    key: index,
                    name: currElement.name
                }
            }),
            data: [
                props.columns.map(col => col.name),
                ...sorter([...props.rows], index, shoudlAscend)?.map(row => {
                    const rowData = []
                    for (const r in row) {
                        let name = Object.getOwnPropertyNames(row[r])[0]
                        let value = row[r][name]
                        if (value?.toString()?.includes(filter[name]))
                            rowData.push(row[r][Object.keys(row[r])[0]])
                    }
                    if (Object.keys(row).length === rowData.length) return rowData
                })
            ]
        })
    }, [props.rows, props.columns])

    const generateRows = () => {
        return sorter([...props.rows], index, shoudlAscend)?.map(row => {
            let rowJsx
            let rowItems = []
            let i = 0
            for (const r in row) {
                let value = row[r][Object.keys(row[r])[0]]
                let name = Object.keys(row[r])[0]
                let filterValue = filter[name]
                if (filterValue !== undefined) filterValue = filterValue?.toLowerCase()
    
                if (value?.toString()?.toLowerCase()?.includes(filterValue) === true || value?.toString()?.toLowerCase()?.includes(filterValue) === undefined)
                    rowItems.push(<span className={i === props.statusIndex ? "status " + value.split("_")[1] : null} style={value == parseInt(value) ? { "textAlign": "right" } : null}><p>{i === props.statusIndex ? value.split("_")[1] : value}</p></span>)
                i++
            }
            if (props.redirectPath === undefined) rowJsx = <div> {rowItems} </div>
            else rowJsx = <NavLink to={props.redirectPath + row[props.appendFieldIdx][props.appendField]}> {rowItems} </NavLink>
    
            if (Object.keys(row).length === rowItems.length) return rowJsx
        })
    }

    let rows = generateRows()

    useEffect(() => {
        rows = generateRows()

        props.setExportData({
            cols: props.columns.map((currElement, index) => {
                return {
                    key: index,
                    name: currElement.name
                }
            }),
            data: [
                props.columns.map(col => col.name),
                ...sorter([...props.rows], index, shoudlAscend)?.map(row => {
                    const rowData = []

                    for (const r in row) {
                        let name = Object.getOwnPropertyNames(row[r])[0]
                        let value = row[r][name]
                        if (value?.toString()?.toLowerCase()?.includes(filter[name]?.toLowerCase()) === true || value?.toString()?.toLowerCase()?.includes(filter[name]?.toLowerCase()) === undefined) rowData.push(row[r][Object.keys(row[r])[0]])
                    }

                    if (Object.keys(row).length === rowData.length) return rowData
                })
            ]
        })
    }, [filter, index, shoudlAscend])

    const columns = props.columns.map((column, _index) => {
        return (
            <span>
                <p onClick={e => {
                    setIndex(_index)
                    setShoudlAscend(!shoudlAscend)
                }}>{column.name}</p>
                <input onChange={e => setFilter({ ...filter, [column.name]: e.target.value })} />
            </span>
        )
    })

    const rowsPerPage = 10
    const numberPages = Math.ceil(rows.filter(row => row !== undefined).length / rowsPerPage)

    useEffect(() => {
        if (pageSet > 0 && pageSet <= numberPages) setPage(pageSet)
    }, [pageSet])

    useEffect(() => {
        if (page !== pageSet) setPageSet(page)
    }, [page])

    return (
        <Fragment>
            <div className="table-container">
                <div className="table">
                    <div className="columns">
                        {columns}
                    </div>
                    <div
                        className="rows"
                        style={window.innerWidth > 950 ? { "width": columns.length * 220 + "px" } : { "width": columns.length * 116 + "px" }}>
                        {rows.filter(row => row !== undefined).filter((row, index) => index < rowsPerPage * page && index > (rowsPerPage * page) - (rowsPerPage + 1))}
                    </div>
                </div>
            </div>
            {rows.length > rowsPerPage ? <div className="table-pages">
                <BiLeftArrow onClick={e => { if (page - 1 > 0) setPage(page - 1) }} />
                <div>
                    <span>
                        <input type="text" value={pageSet} onChange={e => {
                            if (parseInt(e.target.value) > numberPages) setPageSet(parseInt(numberPages))
                            if (parseInt(e.target.value) < 1) setPageSet(1)
                            if (isNaN(parseInt(e.target.value)) === false) setPageSet(parseInt(e.target.value))
                            else setPageSet(null)
                        }} /> 
                    </span>
                    <span> of </span>
                    <span> {numberPages} </span>
                </div>
                <BiRightArrow onClick={e => { if (page + 1 <= numberPages) setPage(page + 1) }} />
            </div> : null}
            
        </Fragment>
    )
}


export default Table