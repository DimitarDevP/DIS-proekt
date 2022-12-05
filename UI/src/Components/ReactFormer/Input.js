import React from 'react'

const Input = props => {

    const handleChange = (e) => {
        if (props.type === "number") e.target.value = parseInt(e.target.value)
        return props.handleChange === undefined ? () => { } : props.handleChange(e)
    }

    const type = props.type === undefined ? "text" : props.type
    const placeholder = props.placeholder === undefined ? "Enter " + props.name : props.placeholder

    return (
        <div className="input">
            <label htmlFor={props.name}>{props.label}</label>
            {type !== "textarea" ?
                (
                    <input
                        name={props.name}
                        value={props.value}
                        type={type}
                        onChange={e => handleChange(e)}
                        placeholder={placeholder}
                    />
                ) : (
                    <textarea
                        name={props.name}
                        value={props.value}
                        type={type}
                        onChange={e => handleChange(e)}
                        placeholder={placeholder}
                    />
                )}

            {props.alert !== "" ? <p className={props.alert?.includes("already exists") || props.alert?.includes("optional") ? "waring" : ""}>{props.alert}</p> : null}
            <span className="overloaded">
                {props.overload !== undefined ? props.overload : null}
            </span>
        </div>
    )
}

export default Input