import {
    CREATE_TEMP_CART,
    ADD_TEMP_ITEM,
    EDIT_TEMP_ITEM,
    DELETE_TEMP_ITEM,
    EMPTY_CART
} from "../constants"

export const createCart = cart => (dispatch, getState) => {
    dispatch({
        type: CREATE_TEMP_CART,
        payload: cart
    })
}

export const addOrder = order => (dispatch, getState) => {
    dispatch({
        type: ADD_TEMP_ITEM,
        payload: order
    })
}

export const editOrder = order => (dispatch, getState) => {
    dispatch({
        type: EDIT_TEMP_ITEM,
        payload: order
    })
}

export const removeItem = order => (dispatch, getState) => {
    dispatch({
        type: DELETE_TEMP_ITEM,
        payload: order
    })
}

export const emptyCart = () => (dispatch, getState) => {
    dispatch({ type: EMPTY_CART })
}