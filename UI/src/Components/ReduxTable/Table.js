import React, { useState, useEffect, Fragment } from "react"
import { BiLeftArrow, BiRightArrow } from "react-icons/bi"

import { NavLink, useLocation } from "react-router-dom"

import { useDispatch, useSelector } from "react-redux"
import { generateFilters, setAscendFilter, setIndexFilter, setPageFilter, setTableFilter } from "../../Redux/Actions/TablesActions"

import "./Table.css"
import { useCurrentWidth } from "./useCurrentWidth"

const sorter = (aoa, _index, shoudlAscend) => {
    let index = _index !== undefined ? _index : 1
    aoa.sort((a, b) => {
        index = b[index] !== undefined ? index : 1
        const name = Object.keys(b[index])[0]
        if (a[index][name] == parseInt(a[index][name]) && b[index][name] == parseInt(b[index][name])) {
            if (parseInt(a[index][name]) > parseInt(b[index][name])) return 1
            else return -1
        }
        else if (a[index][name] == parseFloat(a[index][name]) && b[index][name] == parseFloat(b[index][name])) {
            if (parseFloat(a[index][name]) > parseFloat(b[index][name])) return 1
            else return -1
        }
        else if (!isNaN(new Date(a[index][name])?.getTime()) || !isNaN(new Date(b[index][name])?.getTime())) {
            if (isNaN(new Date(a[index][name])?.getTime()) === true) return -1
            if (isNaN(new Date(b[index][name])?.getTime()) === true) return 1
            if (new Date(a[index][name]).getTime() > new Date(b[index][name]).getTime()) return 1
            else return -1
        }
        else {
            if (a[index][name]?.toString() === "") return 1
            else if (b[index][name]?.toString() === "") return -1
            else return a[index][name]?.toString()?.localeCompare(b[index][name]?.toString())
        }
    })

    if (shoudlAscend === true) return aoa
    else return aoa.reverse()
}

export default props => {
    let width = useCurrentWidth()
    const dispatch = useDispatch()
    const current_path = props.importantPath === undefined ? useLocation().pathname : props.importantPath
    const currentTable = useSelector(state => state.tables[current_path])
    const tablesReducer = useSelector(state => state.tables)

    const _default = () => {
        const filter_obj = {}

        for (const col of props.columns) {
            filter_obj[col.name] = ""
        }
        dispatch(generateFilters(current_path, filter_obj, { default: 1 }, props.columns, props.defaultSortIndex === undefined ? 0 : props.defaultSortIndex, props.defaultSortIndex === undefined ? true : false))
    }

    useEffect(() => {
        if (currentTable !== undefined) return
        _default()
    }, [])

    useEffect(() => {
        if (currentTable?.props === undefined || props.columns.length === currentTable?.props.length) return
        _default()
    }, [props.columns])

    const generateCols = () => {
        if (currentTable?.TableFilters === undefined) return null
        return props.columns?.map((_col, index) => {
            let col = _col.name
            let col_width = _col.width === undefined ? 200 : _col.width
            if (props?.hiddenColumns?.includes(index)) return
            return (
                <span style={{ minWidth: col_width + "px", maxWidth: col_width + "px" }}>
                    <p onClick={e => {
                        const index = props.columns.findIndex(ele => ele.name === col)
                        dispatch(setAscendFilter(current_path, !currentTable.shoudlAscend))
                        dispatch(setIndexFilter(current_path, index))
                    }}>{col}</p>
                    <input name={col} value={currentTable.TableFilters[col]} onChange={ev => {
                        ev.preventDefault()
                        dispatch(setTableFilter(current_path, {
                            ...currentTable.TableFilters,
                            [ev.target.name]: ev.target.value
                        }))
                    }} />
                </span>
            )
        })
    }

    const generateRows = () => {
        return sorter([...props.rows], currentTable?.index, currentTable?.shoudlAscend)?.map((row, index) => {
            let rowJsx
            let rowItems = []
            let i = 0
            for (const r in row) {
                let value = row[r][Object.keys(row[r])[0]]
                let name = Object.keys(row[r])[0]
                let filterValue = ""
                let _width = props.columns[r].width === undefined ? 200 : props.columns[r].width

                if (currentTable === undefined) filterValue = ""
                else filterValue = currentTable.TableFilters[name]
                if (filterValue !== undefined) filterValue = filterValue?.toLowerCase()

                if (value?.toString()?.toLowerCase()?.includes(filterValue) === true || value?.toString()?.toLowerCase()?.includes(filterValue) === undefined || value === "" || value === undefined) {
                    if (props?.hiddenColumns?.includes(i)) rowItems.push(undefined)
                    else rowItems.push(
                        <span className={i === props.statusIndex ? "status " + value.split("_")[1] : null} style={{ minWidth: _width + "px", maxWidth: _width + "px" }}>
                            <p style={value == parseInt(value) || value == parseFloat(value) ? { "textAlign": "right" } : null}>{i === props.statusIndex ? value.split("_")[1] : value}</p>
                        </span>
                    )
                }
                i++
            }

            let afterArgument = ""
            let link = ""

            if (props.redirectPath !== undefined) {
                afterArgument = props.appendAfterArgument === undefined ? "" : props.appendAfterArgument
                link = props.redirectPath + row[props.appendFieldIdx][props.appendField]
            }
            if (props.redirectPath === undefined) rowJsx = <div> {rowItems} </div>
            else rowJsx = <NavLink to={link+afterArgument}> {rowItems} </NavLink>

            if (Object.keys(row).length === rowItems.length) return rowJsx
        })
    }

    let rows = generateRows()
    let cols = generateCols()

    useEffect(() => {
        rows = generateRows()
        cols = generateCols()
    }, [currentTable])

    const rowsPerPage = width > 950 ? 50 : 10
    const numberPages = Math.ceil(rows.filter(row => row !== undefined).length / rowsPerPage)

    if (currentTable === undefined) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img style={{margin: "30px auto"}} width="100px" alt="Loading Animation" src="/assets/loading1.gif" />
        </div>
    )

    let _width = 0
    let i = -1
    for (let c of props.columns) {
        i++
        if (props?.hiddenColumns?.includes(i)) continue
        if (width > 950) {
            if (c.width === undefined) _width += 220
            else _width += (c.width + 20)
        } else {
            if (c.width === undefined) _width += 205
            else _width += (c.width + 6)
        }
    }

    return (
        <Fragment>
            {width > 950 && props.hideTopClear !== true ? <div className="table-pages clear-filters" style={{ marginTop: "-70px", marginBottom: "80px" }}>
                <button style={{ background: "#FFF", color: "#333" }} onClick={e => {
                    e.preventDefault()
                    _default()
                }}>Clear Filters</button>
            </div> : null}
            <div className={props.customClass === undefined ? "table-container" : props.customClass + " table-container"} style={{ "width": _width + "px" }}>
                <div className="table">
                    {cols === null ? "" : (
                        <Fragment>
                            <div className="columns">
                                {cols}
                            </div>
                            <div className="rows" style={{ "width": _width + "px" }}>
                                {props.loading === true ?
                                    (<div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <img width="100px" alt="Loading Animation" src="/assets/loading1.gif" />
                                    </div>) : (
                                        <Fragment>
                                            {rows.filter(row => row !== undefined).filter((row, index) => index < currentTable.PageFilters.default * rowsPerPage && index >= (currentTable.PageFilters.default - 1) * rowsPerPage)}
                                        </Fragment>
                                    )}
                            </div>
                        </Fragment>
                    )}
                </div>
            </div>
            {
                rows.length > rowsPerPage ? <div className="table-pages">
                    <BiLeftArrow onClick={e => {
                        if (currentTable?.PageFilters?.default - 1 > 0) {
                            dispatch(setPageFilter(current_path, {
                                name: "default",
                                value: currentTable.PageFilters.default - 1
                            }))
                        }
                    }} />
                    <div>
                        <span>
                            <input type="text" value={currentTable?.PageFilters?.default} onChange={e => {
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
                        if (currentTable?.PageFilters?.default + 1 <= numberPages) {
                            dispatch(setPageFilter(current_path, {
                                name: "default",
                                value: currentTable?.PageFilters?.default + 1
                            }))
                        }
                    }} />
                </div> : null
            }

            <div className="table-pages clear-filters">
                <button onClick={e => {
                    e.preventDefault()
                    _default()
                }}>Clear Filters</button>
            </div>
        </Fragment>
    )

}