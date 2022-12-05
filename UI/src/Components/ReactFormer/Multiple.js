import React, { useState } from "react"
import MultiSelect from "react-multi-select-component"

export default function Multiple(props) {

    let idBy = props.idBy === undefined ? "_id" : props.idBy
    let display = props.display === undefined ? "_name" : props.display

    const options = props.options.map(opt => {
        return {
            label: opt[display], 
            value: opt[idBy]
        }
    })

    const values = props.options.filter(opt => props.value.includes(opt._id) === true).map(opt => {
        return {
            label: opt[display], 
            value: opt[idBy]
        }
    })


    const handleChange = (e) => {
        const event = {
            target: {
                name: props.name,
                value: e.map(item => item.value)
            }
        }
        return props.handleChange === undefined ? () => {} : props.handleChange(event)
    }

    const overrider = {
        "selectSomeItems": "Select...",
        "allItemsAreSelected": "You have selected all the options.",
        "selectAll": "Select All",
        "search": "Search",
        "clearSearch": "Clear Search"
    }

    return (
        <div className="multiple">
            <label htmlFor={props.name}>{props.label}</label>
            <MultiSelect
                overrideStrings={overrider}
                options={options}
                value={values}  
                onChange={handleChange}
                labelledBy={"Select"}
                focusSearchOnOpen={false}
            />
            {props.alert !== "" ? <p>{props.alert}</p> : null}
        </div>
    )
}