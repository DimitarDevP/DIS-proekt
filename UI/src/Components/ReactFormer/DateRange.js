import React from 'react'
import "react-modern-calendar-datepicker/lib/DatePicker.css";
import DatePicker from "react-modern-calendar-datepicker";

const DateRange = props => {
    const generateDate = (range) => {
        let _range = {
            from: range.from === null ?  null : {
                year: range?.from?.getFullYear(),
                month: range?.from?.getMonth() + 1,
                day: range?.from?.getDate(),
            },
            to: range.to === null ? null : {
                year: range?.to?.getFullYear(),
                month: range?.to?.getMonth() + 1,
                day: range?.to?.getDate(),
            }
        }
        return _range
    }

    const handleChange = e => {

        let from = null
        let to = null
        if(e.from !== null) from = new Date(e.from.month + "/" + e.from.day + "/" + e.from.year + " 00:00:00")
        if(e.to !== null) to = new Date(e.to.month + "/" + e.to.day + "/" + e.to.year + " 23:59:59")

        const range = { from, to }
        const event = {
            target: {
                name: props.name,
                value: range
            }
        }
        props.handleChange(event)
    }

    const value = generateDate(props.value)

    return (
        <div className="date">
            <label htmlFor={props.name}>{props.label}</label>
            <DatePicker
                value={value}
                onChange={handleChange}
                shouldHighlightWeekends
                calendarPopperPosition={"bottom"}
            />
            {props.alert === "" || props.alert === undefined ? null : <p className="fieldAlert">{props.alert}</p>}
        </div>
    )
}

export default DateRange