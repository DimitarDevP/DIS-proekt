import { _creatDeliveryInfo, _updateDeliveryInfo, _creatUser, _deleteUser, _login, _readDeliveryInfo, _readUser, _updateUser } from "../Apis/UserApi"
import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    CREATE_USER_REQUEST,
    CREATE_USER_SUCCESS,
    CREATE_USER_FAILURE,
    READ_USER_REQUEST,
    READ_USER_SUCCESS,
    READ_USER_FAILURE,
    UPDATE_USER_REQUEST,
    UPDATE_USER_SUCCESS,
    UPDATE_USER_FAILURE,
    DELETE_USER_REQUEST,
    DELETE_USER_SUCCESS,
    DELETE_USER_FAILURE,
    CREATE_SHIPPING_INFO_REQUEST,
    CREATE_SHIPPING_INFO_SUCCESS,
    CREATE_SHIPPING_INFO_FAILURE,
    UPDATE_SHIPPING_INFO_REQUEST,
    UPDATE_SHIPPING_INFO_SUCCESS,
    UPDATE_SHIPPING_INFO_FAILURE,
    READ_SHIPPING_INFO_REQUEST,
    READ_SHIPPING_INFO_SUCCESS,
    READ_SHIPPING_INFO_FAILURE,
    LOGOUT
} from "../constants"


export const login = user => {
    return (dispatch, getState) => {
        dispatch({ type: LOGIN_REQUEST })
        _login(user)
        .then(res => {
            if (res.message === undefined) dispatch({ type: LOGIN_SUCCESS, payload: res })
            else dispatch({ type: LOGIN_FAILURE, payload: res })
        })
    }
}

export const logout = () => {
    return (dispatch, getState) => {
        dispatch({ type: LOGOUT })
    }
}

export const createUser = user => {
    return (dispatch, getState) => {
        dispatch({ type: CREATE_USER_REQUEST })
        _creatUser(user)
        .then(res => {
            if (res.message === undefined) dispatch({ type: CREATE_USER_SUCCESS, payload: res })
            else dispatch({ type: CREATE_USER_FAILURE, payload: res })
        })
    }
}

export const readUser = () => {
    return (dispatch, getState) => {
        dispatch({ type: READ_USER_REQUEST })
        _readUser()
        .then(res => dispatch({ type: READ_USER_SUCCESS, payload: res }))
        .catch(error => dispatch({ type: READ_USER_FAILURE, payload: error }))
    }
}

export const updateUser = user => {
    return (dispatch, getState) => {
        dispatch({ type: UPDATE_USER_REQUEST })
        _updateUser(user)
        .then(res => {
            if (res.message === undefined) dispatch({ type: UPDATE_USER_SUCCESS, payload: res })
            else dispatch({ type: UPDATE_USER_FAILURE, payload: res })
        })
        .catch(error => dispatch({ type: UPDATE_USER_FAILURE, payload: error.message }) ) 
    }
}

export const deleteUser = (_id, _retrive = undefined) => {
    return (dispatch, getState) => {
        dispatch({ type: DELETE_USER_REQUEST })
        _deleteUser(_id, _retrive)
        .then(res => {
            if (res.message === undefined) dispatch({ type: DELETE_USER_SUCCESS, payload: res })
            else dispatch({ type: DELETE_USER_FAILURE, payload: res })
        })
    }
}



export const createDeliveryInfo = user => {
    return (dispatch, getState) => {
        dispatch({ type: CREATE_SHIPPING_INFO_REQUEST })
        _creatDeliveryInfo(user)
        .then(res => {
            if (res.message === undefined) dispatch({ type: CREATE_SHIPPING_INFO_SUCCESS, payload: res })
            else dispatch({ type: CREATE_SHIPPING_INFO_FAILURE, payload: res })
        })
    }
}

export const readDeliveryInfo = () => {
    return (dispatch, getState) => {
        dispatch({ type: READ_SHIPPING_INFO_REQUEST })
        _readDeliveryInfo()
        .then(res => dispatch({ type: READ_SHIPPING_INFO_SUCCESS, payload: res }))
        .catch(error => dispatch({ type: READ_SHIPPING_INFO_FAILURE, payload: error }))
    }
}

export const updateDeliveryInfo = info => {
    return (dispatch, getState) => {
        dispatch({ type: UPDATE_SHIPPING_INFO_REQUEST })
        _updateDeliveryInfo(info)
        .then(res => {
            if (res.message === undefined) dispatch({ type: UPDATE_SHIPPING_INFO_SUCCESS, payload: res })
            else dispatch({ type: UPDATE_SHIPPING_INFO_FAILURE, payload: res })
        })
    }
}