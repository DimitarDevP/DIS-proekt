import React, { useState } from "react"
import { compareInt } from "../../helpers"
import MultiSelect from "react-multi-select-component"

export default function Multiple(props) {

    let idBy = props.idBy === undefined ? "_id" : props.idBy
    let display = props.display === undefined ? "_name" : props.display
    const [isOpen, setIsOpen] = useState(false)

    const options = props.options.map(opt => {
        return {
            label: opt.icon === undefined ? opt[display] : (
                <span className="item-with-icon">
                    <img src={opt.icon} />
                    <p>{opt[display]}</p>
                </span>
            ),
            value: opt[idBy]
        }
    })
    const values = props.options.filter(opt => props.value === opt[idBy]).map(opt => {
        return {
            label: opt[display],
            value: opt[idBy]
        }
    })
    
    const handleChange = (e) => {
        setIsOpen(false)
        const event = {
            target: {
                name: props.name,
                value: e.map(item => item.value)[e.length - 1] === undefined ? null : e.map(item => item.value)[e.length - 1]
            }
        }
        return props.handleChange === undefined ? () => { } : props.handleChange(event)
    }

    const overrider = {
        "selectSomeItems": "Select...",
        "allItemsAreSelected": "You have selected all the options.",
        "selectAll": "Select All",
        "search": "Search",
        "clearSearch": "Clear Search"
    }

    return (
        <div className={isOpen === false ? "multiple" : "multiple open"}>
            <label htmlFor={props.name}>{props.label}</label>
            {props.disableBlocker === undefined ?
                <span style={{ "position": "relative" }}>
                    <MultiSelect
                        overrideStrings={overrider}
                        options={options}
                        disableSearch={options.length > 10 ? false : true}
                        value={values}
                        onChange={handleChange}
                        labelledBy={"Select"}
                        hasSelectAll={false}
                        focusSearchOnOpen={false}
                        isOpen={isOpen}
                        ClearIcon={""}
                    />
                    <span style={{ "top": "0", "height": "42px", "width": "100%", "position": "absolute", "background": "transparent" }} onClick={e => setIsOpen(!isOpen)}></span>
                </span> :
                <MultiSelect
                    overrideStrings={overrider}
                    options={options}
                    disableSearch={options.length > 10 ? false : true}
                    value={values}
                    onChange={handleChange}
                    labelledBy={"Select"}
                    hasSelectAll={false}
                    focusSearchOnOpen={false}
                    // isOpen={isOpen}
                    ClearIcon={""}
                />
            }
            {props.alert !== "" ? <p>{props.alert}</p> : null}
        </div>
    )
}