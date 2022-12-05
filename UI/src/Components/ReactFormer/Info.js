import React from "react"
import "./Info.css"

export default function Info(props) {
    return (
        <div className={"Info " + props.type}>
            <p>{props.message === "Undetermined" ? "Processing ..." : props.message}</p>
        </div>
    )
}