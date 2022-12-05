import { FaCheck, FaTimes } from "react-icons/fa"

export default props => {

    return (
        <div className="checkbox">
            <label htmlFor={props.name}>{props.label}</label>
            <span className={props.value === true || props.value === 1 ? "checked" : "unchecked"} onClick={e => props.handleChange({
                target: {
                    name: props.name,
                    value: [0, 1].includes(props.value) ? props.value === 1 ? 0 : 1 : !props.value
                }
            })}>
                <div className="slider"></div>
                <FaCheck />
                <FaTimes />
            </span>
        </div>
    )
}