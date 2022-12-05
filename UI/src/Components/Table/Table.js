import React, { Fragment, useEffect, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import "./Table.css"
import { BiLeftArrow, BiRightArrow } from "react-icons/bi"
import { useCurrentWidth } from "../../customHooks/useCurrentWidth"
import { useDispatch, useSelector } from "react-redux"
import { generateFilters, setPageFilter } from "../../Redux/Actions/TablesActions"


const compare = (a, b, index) => {
    if (b == undefined) return
    const name = Object.keys(b[index])[0]
    if (a[index][name] == parseInt(a[index][name]) && b[index][name] == parseInt(b[index][name])) {
        if (parseInt(a[index][name]) >= parseInt(b[index][name])) return a
        else return b
    }
    else if (a[index][name] == parseFloat(a[index][name]) && b[index][name] == parseFloat(b[index][name])) {
        if (parseFloat(a[index][name]) >= parseFloat(b[index][name])) return a
        else return b
    }
    else if (!isNaN(new Date(a[index][name])?.getTime()) || !isNaN(new Date(b[index][name])?.getTime())) {
        if (isNaN(new Date(a[index][name])?.getTime()) === true) return b
        if (isNaN(new Date(b[index][name])?.getTime()) === true) return a
        if (new Date(a[index][name]).getTime() >= new Date(b[index][name]).getTime()) return a
        else return b
    }
    else {
        if (a[index][name]?.toString() === "") return a
        else if (b[index][name]?.toString() === "") return b
        else return a[index][name]?.toString().localeCompare(b[index][name].toString()) === 1 ? b : a
    }
}

function sortItems(array, index) {
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array.length; j++) {
            if (compare(array[j], array[j + 1], index) === array[j + 1]) {
                let temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;
            }
        }
    }
    return array;
}

const _sort = (a, b, index) => {
    const name = Object.keys(b[index])[0]
    if (a[index][name] == parseInt(a[index][name]) && b[index][name] == parseInt(b[index][name])) {
        if (parseInt(a[index][name]) >= parseInt(b[index][name])) return 1
        else return -1
    }
    else if (a[index][name] == parseFloat(a[index][name]) && b[index][name] == parseFloat(b[index][name])) {
        if (parseFloat(a[index][name]) >= parseFloat(b[index][name])) return 1
        else return -1
    }
    else if (!isNaN(new Date(a[index][name])?.getTime()) || !isNaN(new Date(b[index][name])?.getTime())) {
        if (isNaN(new Date(a[index][name])?.getTime()) === true) return -1
        if (isNaN(new Date(b[index][name])?.getTime()) === true) return 1
        if (new Date(a[index][name]).getTime() >= new Date(b[index][name]).getTime()) return 1
        else return -1
    }
    else {
        if (a[index][name]?.toString() === "") return 1
        else if (b[index][name]?.toString() === "") return -1
        else return a[index][name]?.toString().localeCompare(b[index][name].toString())
    }
}

const Table = props => {
    let width = useCurrentWidth()
    const dispatch = useDispatch()

    const sorter = (aoa, index, shoudlAscend) => {
        let sorted = []
        if (props.groupByIdx !== undefined) {
            aoa = aoa.sort((a, b) => { return _sort(a, b, 0) })
            const groupsObject = {}
            for (const _array of aoa) {
                let groupName = _array[props.groupByIdx][props.groupBy].replace("~", "")
                if (groupsObject[groupName] === undefined) groupsObject[groupName] = []
                groupsObject[groupName].push(_array)
            }

            for (const obj in groupsObject) {
                const groupObjectsSorted = groupsObject[obj].sort((a, b) => { return _sort(a, b, index) })
                // const groupObjectsSorted = sortItems(groupsObject[obj], index)
                if (shoudlAscend === true) sorted = [...sorted, ...groupObjectsSorted]
                else sorted = [...sorted, ...groupObjectsSorted.reverse()]
            }
        } else {
            if (shoudlAscend === true) sorted = aoa.sort((a, b) => { return _sort(a, b, index) })
            else sorted = aoa.sort((a, b) => { return _sort(a, b, index) }).reverse()
        }

        return sorted
    }


    const [filter, setFilter] = useState(props.columns.map(col => { return { col: "" } }))
    const [index, setIndex] = useState(0)
    const [shoudlAscend, setShoudlAscend] = useState(true)
    const currentFilter = useSelector(state => state.tables)
    const current_path = useLocation().pathname
    const currentPage = currentFilter[current_path]?.PageFilters?.default

    useEffect(() => {
        setShoudlAscend(props.defaultSortIndex === 3 ? false : true)
        setIndex(props.defaultSortIndex !== undefined ? props.defaultSortIndex : 0)
    }, [props.defaultSortIndex])

    useEffect(() => {
        if (currentFilter[current_path] === undefined) {
            dispatch(generateFilters(current_path, props.columns.map(col => { return { [col.name]: "" } }), { default: 1 }))
        }
    }, [])


    useEffect(() => {
        dispatch(setPageFilter(current_path, {
            name: "default",
            value: 1
        }))
    }, [filter])

    useEffect(() => {

        let filterOptions = {}
        for (const option of props.columns) {
            filterOptions = {
                ...filterOptions,
                [option.name]: ""
            }
        }
        setFilter(filterOptions)
        if (props.setExportData !== undefined) props.setExportData(
            {
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
            let isTotal = false
            for (const r in row) {
                let value = row[r][Object.keys(row[r])[0]]
                let name = Object.keys(row[r])[0]
                if (row[r][name]?.toString()?.includes("~") || row[r][name]?.toString()?.includes("total")) isTotal = true
                let filterValue = filter[name]
                if (filterValue !== undefined) filterValue = filterValue?.toLowerCase()

                if (value?.toString()?.toLowerCase()?.includes(filterValue) === true || value?.toString()?.toLowerCase()?.includes(filterValue) === undefined || value === "" || value === undefined) {
                    if (props?.selectedIndexes?.includes(i) || props?.selectedIndexes === undefined) {
                        rowItems.push(<span className={i === props.statusIndex ? "status " + value.split("_")[1] : null} style={value == parseInt(value) || value == parseFloat(value) ? { "textAlign": "right" } : null}>
                            <span> {i === props.statusIndex ? value.split("_")[1] : value?.toString() !== undefined ? value.toString().replace("~", "") : ""} </span>
                        </span>)
                    } else rowItems.push(null)
                }
                i++
            }
            if (props.redirectPath === undefined) rowJsx = <div style={isTotal === true ? { background: "#DFDFDF" } : {}}> {rowItems} </div>
            else rowJsx = <NavLink to={props.redirectPath + row[props.appendFieldIdx][props.appendField]}> {rowItems} </NavLink>

            if (Object.keys(row).length === rowItems.length) return rowJsx
        })
    }
    let rows = generateRows()

    useEffect(() => {
        if (rows.length + (10 - rows.length % 10) < currentPage * 10 && currentPage !== 1) dispatch(setPageFilter(current_path, { name: "default", value: 1 }))
    }, [props.rows])

    useEffect(() => {
        rows = generateRows()

        if (props.setExportData !== undefined) props.setExportData(
            {
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
                            if (
                                value?.toString()?.toLowerCase()?.includes(filter[name]?.toLowerCase()) === true ||
                                value?.toString()?.toLowerCase()?.includes(filter[name]?.toLowerCase()) === undefined ||
                                value === "" || value === undefined
                            ) rowData.push(row[r][Object.keys(row[r])[0]])
                        }

                        if (Object.keys(row).length === rowData.length) return rowData
                    })
                ]
            })
    }, [filter, index, shoudlAscend, props.defaultSortIndex])

    let columns = props.columns.map((column, _index) => {
        return (
            <span>
                <p onClick={e => {
                    setIndex(_index)
                    setShoudlAscend(!shoudlAscend)
                }}>{column.name}</p>
                <input value={filter[column.name]} onChange={e => setFilter({ ...filter, [column.name]: e.target.value })} />
            </span>
        )
    })

    const rawColumns = props.columns.map((col, idx) => col.name).filter((col, i) => props?.selectedIndexes?.includes(i) === true || props?.selectedIndexes === undefined)
    const rawRows = sorter([...props.rows], index, shoudlAscend)?.map(row => {
        let rowJsx
        let rowItems = []
        let i = 0
        let isTotal = false
        for (const r in row) {
            let value = row[r][Object.keys(row[r])[0]]
            let name = Object.keys(row[r])[0]
            if (row[r][name]?.toString()?.includes("~") || row[r][name]?.toString()?.includes("total")) isTotal = true
            let filterValue = filter[name]
            if (filterValue !== undefined) filterValue = filterValue?.toLowerCase()

            if (value?.toString()?.toLowerCase()?.includes(filterValue) === true || value?.toString()?.toLowerCase()?.includes(filterValue) === undefined || value === "" || value === undefined) {
                if (props?.selectedIndexes?.includes(i) || props?.selectedIndexes === undefined) {
                    rowItems.push(<td className={i === props.statusIndex ? "status " + value.split("_")[1] : null} style={value == parseInt(value) || value == parseFloat(value) ? { "textAlign": "right" } : null}>
                        <p> {i === props.statusIndex ? value.split("_")[1] : value?.toString() !== undefined ? value == parseFloat(value) ? value.toString().replace("~", "").substr(0, 6) : value.toString().replace("~", "") : ""} </p>
                    </td>)
                } else rowItems.push(null)
            }
            i++
        }
        rowJsx = <tr style={{ background: isTotal === true ? "#DFDFDF" : "#FFF" }}> {rowItems} </tr>

        if (Object.keys(row).length === rowItems.length) return rowJsx
    })

    const rowsPerPage = 20
    const numberPages = Math.ceil(rows.filter(row => row !== undefined).length / rowsPerPage)
    const numSelected = props?.selectedIndexes === undefined ? columns.length : props.selectedIndexes.length
    const table_width = width > 950 ? (220 * numSelected) + "px" : 116 * numSelected + "px"

    return (
        <Fragment>
            <div className="table-container table-legacy" style={{ width: table_width }}>
                <div className="table">
                    <div className="columns">
                        {props.columns.map((column, _index) => {
                            return (
                                <span>
                                    <p onClick={e => {
                                        setIndex(_index)
                                        setShoudlAscend(!shoudlAscend)
                                    }}>{column.name}</p>
                                    <input value={filter[column.name]} onChange={e => setFilter({ ...filter, [column.name]: e.target.value })} />
                                </span>
                            )
                        }).filter((col, i) => props?.selectedIndexes?.includes(i) === true || props?.selectedIndexes === undefined)}
                    </div>
                    {props.loading === true && rows.length < 1 ? <p className="empty"> "Loading... Please wait." </p> : props.rows === null || props.rows?.length < 1 ? <p className="empty">No data to show </p> : (
                        <div
                            className="rows"
                            style={{ "width": table_width }}>
                            {rows.filter(row => row !== undefined).filter((row, index) => index < rowsPerPage * currentPage && index > (rowsPerPage * currentPage) - (rowsPerPage + 1))}
                        </div>
                    )}

                </div>
            </div>
            {rows.length > rowsPerPage ? <div className="table-pages">
                <BiLeftArrow onClick={e => {
                    if (currentPage - 1 > 0) {
                        dispatch(setPageFilter(current_path, {
                            name: "default",
                            value: currentPage - 1
                        }))
                    }
                }} />
                <div>
                    <span>
                        <input type="text" value={currentPage} onChange={e => {
                            if (parseInt(e.target.value) > numberPages) {
                                dispatch(setPageFilter(current_path, {
                                    name: "default",
                                    value: numberPages
                                }))
                            }
                            if (parseInt(e.target.value) < 1) {
                                dispatch(setPageFilter(current_path, {
                                    name: "default",
                                    value: 1
                                }))
                            }
                            if (isNaN(parseInt(e.target.value)) === false) {
                                dispatch(setPageFilter(current_path, {
                                    name: "default",
                                    value: e.target.value
                                }))
                            }
                        }} />
                    </span>
                    <span> of </span>
                    <span> {numberPages} </span>
                </div>
                <BiRightArrow onClick={e => {
                    if (currentPage + 1 <= numberPages) {
                        dispatch(setPageFilter(current_path, {
                            name: "default",
                            value: currentPage + 1
                        }))
                    }
                }} />
            </div> : null}

            {props.print === false ? <div className="table-pages clear-filters">
                <button onClick={e => {
                    e.preventDefault()
                    dispatch(generateFilters(current_path, props.columns.map(col => { return { [col.name]: "" } }), { default: 1 }))
                    let a = {}
                    props.columns.map(col => a[col.name] = "")
                    setFilter(a)
                }}>Clear Filters</button>
            </div> : null}
            <table className="print-table-legacy">
                <thead>
                    <tr className="columns">
                        {rawColumns.map(col => (<td><p>{col}</p></td>))}
                    </tr>
                </thead>
                <tbody>
                    {rawRows}
                </tbody>
            </table>
        </Fragment>
    )
}

export default Table

