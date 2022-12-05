import React from 'react'
import DatePicker from 'react-modern-calendar-datepicker'
import "react-modern-calendar-datepicker/lib/DatePicker.css";
const DateTime = props => {

    const generateDate = (date) => {
        if (date === null) return new Date()
        return {
            year: date?.getFullYear(),
            month: date?.getMonth() + 1,
            day: date?.getDate(),
        }
    }

    const handleChange = e => {

        const date = new Date(e.month + "/" + e.day + "/" + e.year)
        const event = {
            target: {
                name: props.name,
                value: date
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
              wrapperClassName="fontWrapper"
              calendarClassName="fontWrapper"
              calendarPopperPosition={"bottom"}
            />
            {props.alert === "" || props.alert === undefined ? null : <p style={{fontSize: "0.8em", color: "red"}} className="fieldAlert">{props.alert}</p>}
        </div>
    )
}

export default DateTime