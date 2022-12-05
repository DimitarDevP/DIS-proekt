import React from "react"
export default props => {
    const handleChange = (opt) => {
        const event = {
            target: {
                name: props.name,
                value: opt._name
            }
        }
        return props.handleChange === undefined ? () => { } : props.handleChange(event)
    }

    return (
        <div className="radio">
            <label htmlFor={props.name}>{props.label}</label>
            <span>
                {props.options.map(opt => (
                    <span className={opt._name == props.value ? "selected option" : "option"} onClick={e => handleChange(opt)}>
                        <p>{opt._name}</p>
                    </span>
                ))}
            </span>
        </div>
    )
}