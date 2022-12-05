import {
    CREATE_TEMP_CART,
    ADD_TEMP_ITEM,
    EDIT_TEMP_ITEM,
    DELETE_TEMP_ITEM,
    EMPTY_CART
} from "../constants"

const cart = {
    cart: {},
    orders: []
}

const compareInt = (number1, number2) => {
    return parseInt(number1) === parseInt(number2) ? true : false
}


export default (state = cart, action) => {

    const newState = {...state}

    switch(action.type){
        case CREATE_TEMP_CART:
            return {
                ...newState,
                cart: action.payload
            }
        case ADD_TEMP_ITEM:
            return {
                ...newState,
                orders: [
                    ...newState.orders, action.payload
                ]
            }
        case EDIT_TEMP_ITEM:
            return {
                ...newState,
                orders: [
                    ...newState.orders.filter(order => compareInt(order._product_id, action.payload._product_id) === false), action.payload
                ]
            }
        case DELETE_TEMP_ITEM:
            return {
                ...newState,
                orders: newState.orders.filter(order => compareInt(order._product_id, action.payload._product_id) === false)
            }
        case EMPTY_CART:
            return {
                ...newState,
                orders: []
            }
        default:
            return state
    }
}


