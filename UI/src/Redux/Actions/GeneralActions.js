import { _readData, _updateSettings } from "../Apis/GeneralApi"
import {
    READ_DATA_REQUEST,
    READ_DATA_SUCCESS,
    READ_DATA_FAILURE,
    UPDATE_SETTINGS_REQUEST,
    UPDATE_SETTINGS_SUCCESS,
    UPDATE_SETTINGS_FAILURE,
} from "../constants"


export const readData = () => {
    return (dispatch, getState) => {
        dispatch({type: READ_DATA_REQUEST})
        _readData()
        .then(res =>  dispatch({type: READ_DATA_SUCCESS, payload: res}))
        .catch(error => dispatch({type: READ_DATA_FAILURE, payload: error}))
    }
}


export const updateSettings = new_settings => {
    return (dispatch, getState) => {
        dispatch({type: UPDATE_SETTINGS_REQUEST})
        _updateSettings(new_settings)
        .then(res =>  dispatch({type: UPDATE_SETTINGS_SUCCESS, payload: res}))
        .catch(error => dispatch({type: UPDATE_SETTINGS_FAILURE, payload: error}))
    }
}