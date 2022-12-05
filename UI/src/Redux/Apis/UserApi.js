import { CONSTANTS } from "../../../package.json"

export const _creatUser = async user => {
    const res = await fetch(CONSTANTS.API_URL + "/api/users", {
        "method": "POST",
        "body": user,
        "Content-Type": "multipart/form-data"
    })

    const data = await res.json()
    return data
}

export const _readUser = async () => {
    const res = await fetch(CONSTANTS.API_URL + "/api/users")

    const data = await res.json()
    return data
}

export const _updateUser = async user => {
    const res = await fetch(CONSTANTS.API_URL + "/api/users", {
        "method": "PUT",
        "body": user,
        "Content-Type": "multipart/form-data"
    })

    const data = await res.json()
    return data
}

export const _deleteUser = async (_id, _retrive = undefined) => {
    let url = CONSTANTS.API_URL + "/api/users?_id=" + _id
    if (_retrive === true) url = CONSTANTS.API_URL + "/api/users?_id=" + _id + "&_retrive"
    const res = await fetch(url, { "method": "DELETE" })

    const data = await res.json()
    return data
}

export const _login = async user => {
    const res = await fetch(CONSTANTS.API_URL + "/api/users/login", {
        "method": "POST",
        "body": user,
        "Content-Type": "multipart/form-data"
    })

    const data = await res.json()
    return data
}



export const _creatDeliveryInfo = async info => {
    const res = await fetch(CONSTANTS.API_URL + "/api/delivery_info", {
        "method": "POST",
        "body": info,
        "Content-Type": "multipart/form-data"
    })

    const data = await res.json()
    return data
}

export const _readDeliveryInfo = async () => {
    const res = await fetch(CONSTANTS.API_URL + "/api/delivery_info")

    const data = await res.json()
    return data
}

export const _updateDeliveryInfo = async info => {
    const res = await fetch(CONSTANTS.API_URL + "/api/delivery_info", {
        "method": "PUT",
        "body": info,
        "Content-Type": "multipart/form-data"
    })

    const data = await res.json()
    return data
}