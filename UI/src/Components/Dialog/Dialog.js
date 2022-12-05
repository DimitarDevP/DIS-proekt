import React from "react"
import { Fragment } from "react"
import { GrFormClose } from "react-icons/gr"
import "./Dialog.css"

const Dialog = props => {

    document.addEventListener("keydown", e => {
        if (e.keyCode === 27) {
            props.setShowing(false)
        }
    })

    return (
        <Fragment>
            <div className={props.showing === true ? "vis-filter showing" : "vis-filter"}>

            </div>
            <div className={props.showing === true ? "dialog showing" : "dialog"}>
                <div className="dialog_title">
                    <h2>{props.title}</h2> <GrFormClose onClick={e => props.setShowing(false)} />
                </div>
                <hr />
                <div className="dialog_content">
                    {props.jsx}
                </div>
            </div>
        </Fragment>
    )
}

export default Dialog