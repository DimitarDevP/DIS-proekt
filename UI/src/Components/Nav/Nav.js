import React, { Fragment, useEffect, useState } from "react"
import { NavLink, Redirect } from "react-router-dom"
import {
    AiOutlineShoppingCart,
    FaUserAlt,
    GiHamburgerMenu,
    MdKeyboardArrowDown,
    RiLogoutBoxFill,
    AiOutlineShop,
    HiDocumentReport,
    RiSettings4Fill
} from 'react-icons/all'

import "./Nav.css"
import { useDispatch, useSelector } from 'react-redux'
import { logout } from "../../Redux/Actions/UserActions"
import { useCurrentWidth } from "../ReduxTable/useCurrentWidth"



const Nav = props => {
    const dispatch = useDispatch()
    const width = useCurrentWidth()
    const userReducer = useSelector(state => state.user)
    const handleClick = e => {
        if (e.target.tagName === "P") {
            e.target?.classList?.toggle("showing")
            e.target?.nextSibling?.classList?.toggle("showing")
        }
        // if (e.target.tagName === "A" && width < 920) props.setExpanded(true)
    }

    let jsx = []
    for (const key in props.navigation) {
        if (key === "Routes") continue
        let items = props.navigation[key].items.map(i => i.renderCondition({ currentUser: userReducer?.currentUser }) === true ?
            <NavLink to={i.route} onClick={e => {
                if (width < 920) {
                    props.setExpanded(false)
                }
            }}>{i.name}</NavLink> : null
        )
        let _jsx = (
            <Fragment>
                <p>{props.navigation[key].icon} {key} <MdKeyboardArrowDown /></p>
                <span>
                    {items}
                </span>
            </Fragment>
        )
        if (items.filter(i => i !== null).length > 0) jsx.push(_jsx)
    }
    
    return userReducer?.currentUser?._id === undefined ? <Redirect to="/" /> : (
        <div id="Nav" className={props.expanded === false ? "reduced" : ""}>
            <div>
                <h1 style={{ display: "flex", justifyContent: "center", alignItems: "center" }}> <AiOutlineShop style={{ marginRight: "12px" }} /> Plastfix Shop</h1>
            </div>

            <div onClick={e => handleClick(e)}>
                {jsx}
                <p onClick={(e) => { props.setExpanded(true); dispatch(logout()) }}><RiLogoutBoxFill /> Logout</p>
            </div>


            <div onClick={e => props.setExpanded(!props.expanded)} className={props.expanded === false ? "reduced" : ""}>
                <GiHamburgerMenu />
            </div>
        </div>
    )

}

export default Nav