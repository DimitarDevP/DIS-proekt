import { CONSTANTS } from "../../../package.json"


export const _readData = async () => {
    const res = await fetch(CONSTANTS.API_URL + "/api/data")

    const data = await res.json()
    return data
}

export const _updateSettings = async new_settings => {
    const res = await fetch(CONSTANTS.API_URL + "/api/settings", {
        "method": "PUT",
        "body": new_settings,
        "Content-Type": "multipart/form-data"
    })

    const data = await res.json()
    return data
}