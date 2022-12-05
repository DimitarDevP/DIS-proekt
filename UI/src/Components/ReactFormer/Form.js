import React, { Fragment } from "react"
import "./Form.css"
import File from "./File"
import DateTime from "./DateTime"
import DateRange from "./DateRange"
import Input from "./Input"
import Select from "./Select"
import Multiple from "./Multiple"
import Info from "./Info"
import RadioSelect from "./RadioSelect"
import Checkbox from "./Checkbox"

const compareType = (val1, val2) => {
    return typeof val1 === typeof val2 ? true : false
}

const Form = props => {

    const fields = props.data.fields.map(field => {
        if ((field.visability === undefined || field.visability === true) && (field.hide === undefined || field.hide === false)) {
            if (field.formType === "input") {
                return (<Input
                    name={field.name}
                    label={field.label}
                    type={field.type}
                    value={props.data.fieldsData[field.name]}
                    placeholder={field.placeholder}
                    handleChange={props.data.handleChange}
                    alert={field.alert}
                    overload={field.overload}
                />)
            }
            if (field.formType === "radio") {
                return (<RadioSelect
                    name={field.name}
                    label={field.label}
                    value={props.data.fieldsData[field.name] === undefined ? [] : props.data.fieldsData[field.name]}
                    options={field.options}
                    handleChange={props.data.handleChange}
                    alert={field.alert}
                />)
            }
            if (field.formType === "select") {
                return (<Select
                    name={field.name}
                    label={field.label}
                    value={props.data.fieldsData[field.name]}
                    options={field.options}
                    idBy={field.identifier}
                    display={field.display}
                    handleChange={props.data.handleChange}
                    alert={field.alert}
                />)
            }
            if (field.formType === "multiple") {
                return (<Multiple
                    name={field.name}
                    label={field.label}
                    value={props.data.fieldsData[field.name] === undefined ? [] : props.data.fieldsData[field.name]}
                    options={field.options}
                    idBy={field.identifier}
                    display={field.display}
                    handleChange={props.data.handleChange}
                    alert={field.alert}
                />)
            }
            if (field.formType === "file") {
                return (<File
                    alternateClass={field.alternateClass}
                    defaultPreview={field.defaultPreview === undefined ? "" : field.defaultPreview}
                    name={field.name}
                    label={field.label}
                    handleChange={props.data.handleChange}
                    accept={field.accept}
                    multiple={field.multiple}
                    descriptor={field.descriptor === undefined ? undefined : field.descriptor}
                    withComment={field.withComment}
                    withPreview={field.withPreview}
                    value={field.value}
                    alert={field.alert}
                />)
            }
            if (field.formType === "date") {
                let val
                if (compareType(props.data.fieldsData[field.name], new Date()) === false)
                    val = new Date(props.data.fieldsData[field.name])
                else
                    val = props.data.fieldsData[field.name]
                return (<DateTime
                    name={field.name}
                    alert={field.alert}
                    label={field.label}
                    value={val}
                    handleChange={props.data.handleChange}
                />)
            }
            if (field.formType === "daterange") {
                let val
                if (compareType(props.data.fieldsData[field.name].from, new Date()) === false || compareType(props.data.fieldsData[field.name].to, new Date()) === false)
                    val = { from: null, to: null }
                else
                    val = props.data.fieldsData[field.name]
                return (<DateRange
                    name={field.name}
                    label={field.label}
                    value={val}
                    handleChange={props.data.handleChange}
                />)
            }
            if (field.formType === "checkbox_switch") {
                return (<Checkbox
                    name={field.name}
                    label={field.label}
                    value={props.data.fieldsData[field.name]}
                    handleChange={props.data.handleChange}
                />)
            }
        }
    })

    return (
        <div className="form">
            <h3>{props.data.formName}</h3>
            <form onSubmit={props.data.handleSubmit}>
                {fields}
                {props.data.overloadedAfter === undefined || props.data.overloadedAfter === false ? props.data.overloadedFields : null}
                {props.data.submitted === false ? (
                    <Fragment>
                        {props.data.canEdit !== true && props.data.canEdit !== undefined ? null : <button>{props.data.submitButtonText}</button>}
                    </Fragment>
                ) : null}
                {props.data.submitted === true || props.data.info.infoType == "warning" ? (
                    <Info
                        type={props.data.info.infoType}
                        message={props.data.info.infoMessage}
                    />
                ) : null}
                {props.data.overloadedAfter === true ? props.data.overloadedFields : null}
            </form>
        </div>
    )
}

export default Form