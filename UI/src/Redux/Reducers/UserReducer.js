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
    LOGOUT,
    statuses
} from "../constants"


const initialState = {
    currentUser: null,
    loginStatus: statuses.idle,
    loginMessage: "",

    users: [],
    createStatus: statuses.idle,
    createMessage: "",
    readStatus: statuses.idle,
    readMessage: "",
    updateStatus: statuses.idle,
    updateMessage: "",
    deleteStatus: statuses.idle,
    deleteMessage: "",


    delivery_info: {},
    shipping_info: {},
    all_info: [],
    createInfoStatus: statuses.idle,
    createInfoMessage: "",
    updateInfoStatus: statuses.idle,
    updateInfoMessage: "",
    readInfoStatus: statuses.idle,
    readInfoMessage: ""
}

export default (state = initialState, action) => {
    switch (action.type) {
        case LOGOUT:
            return {
                ...state,
                currentUser: null
            }
        case LOGIN_REQUEST:
            return {
                ...state,
                loginStatus: statuses.pending,
                loginMessage: ""
            }
        case LOGIN_SUCCESS:
            return {
                ...state,
                loginStatus: statuses.success,
                loginMessage: "Logged in successfully.",
                currentUser: action.payload.user
            }
        case LOGIN_FAILURE:
            return {
                ...state,
                loginStatus: statuses.failure,
                loginMessage: action.payload.message
            }
        case CREATE_USER_REQUEST:
            return {
                ...state,
                createStatus: statuses.pending,
                createMessage: "Creating user... Please wait."
            }
        case CREATE_USER_SUCCESS:
            return {
                ...state,
                createStatus: statuses.success,
                createMessage: "User created successfully.",
                users: typeof state.users !== typeof [] ? [action.payload.user] : [...state.users, action.payload.user]
            }
        case CREATE_USER_FAILURE:
            return {
                ...state,
                createStatus: statuses.failure,
                createMessage: action.payload.message,
            }
        case READ_USER_REQUEST:
            return {
                ...state,
                readStatus: statuses.pending,
                readMessage: "Loading users... Please wait."
            }
        case READ_USER_SUCCESS:
            return {
                ...state,
                readStatus: statuses.success,
                readMessage: "users loaded.",
                users: action.payload.users
            }
        case READ_USER_FAILURE:
            return {
                ...state,
                readStatus: statuses.failure,
                readMessage: "Error loading users."
            }
        case UPDATE_USER_REQUEST:
            return {
                ...state,
                updateStatus: statuses.pending,
                updateMessage: "Updating user... Please wait."
            }
        case UPDATE_USER_SUCCESS:
            return {
                ...state,
                updateStatus: statuses.success,
                updateMessage: "Updated user successfully.",
                users: typeof state.users !== typeof [] ? [action.payload.user] : [...state.users.filter(user => user !== null && user?._id !== action.payload.user?._id), action.payload.user]
            }
        case UPDATE_USER_FAILURE:
            return {
                ...state,
                updateStatus: statuses.failure,
                updateMessage: action.payload.message
            }
        case DELETE_USER_REQUEST:
            return {
                ...state,
                deleteStatus: statuses.pending,
                deleteMessage: "Request is processing... Please wait."
            }
        case DELETE_USER_SUCCESS:
            return {
                ...state,
                deleteStatus: statuses.success,
                deleteMessage: "Request has been processed successfully.",
                users: typeof state.users !== typeof [] ? [] : state.users.filter(user => user._id != action.payload._id)
            }
        case DELETE_USER_FAILURE:
            return {
                ...state,
                deleteStatus: statuses.success,
                deleteMessage: "Error occurred. Please try again later.",
            }
        case CREATE_SHIPPING_INFO_REQUEST:
            return {
                ...state,
                createInfoStatus: statuses.pending,
                createInfoMessage: "Please Wait..."
            }
        case CREATE_SHIPPING_INFO_SUCCESS:
            const delivery_info = { ...state.delivery_info }
            const shipping_info = { ...state.shipping_info }

            if (action.payload.new_info._customer_id === null) {
                shipping_info[action.payload.new_info._instance_id] = action.payload.new_info
            }
            else {
                if (delivery_info[action.payload.new_info._customer_id] === undefined) {
                    delivery_info[action.payload.new_info._customer_id] = []
                }
                delivery_info[action.payload.new_info._customer_id].push(action.payload.new_info)
            }
            return {
                ...state,
                createInfoStatus: statuses.success,
                createInfoMessage: "Success.",
                delivery_info: delivery_info,
                shipping_info: shipping_info,
                all_info: [...state.all_info, action.payload.new_info]
            }
        case CREATE_SHIPPING_INFO_FAILURE:
            return {
                ...state,
                createInfoStatus: statuses.failure,
                createInfoMessage: "There was an error while inserting your shipping information into our database. Please try again later."
            }
        case UPDATE_SHIPPING_INFO_REQUEST:
            return {
                ...state,
                updateInfoStatus: statuses.pending,
                updateInfoMessage: "Please Wait..."
            }
        case UPDATE_SHIPPING_INFO_SUCCESS:
            const __delivery_info = { ...state.delivery_info }
            const __shipping_info = { ...state.shipping_info }

            if (action.payload.new_info._customer_id === null) {
                __shipping_info[action.payload.new_info._instance_id] = action.payload.new_info
            }
            else {
                if (__delivery_info[action.payload.new_info._customer_id] === undefined) {
                    __delivery_info[action.payload.new_info._customer_id] = []
                }
                __delivery_info[action.payload.new_info._customer_id].push(action.payload.new_info)
            }
            return {
                ...state,
                updateInfoStatus: statuses.success,
                updateInfoMessage: "Success.",
                delivery_info: __delivery_info,
                shipping_info: __shipping_info,
                all_info: [...state.all_info, action.payload.new_info]
            }
        case UPDATE_SHIPPING_INFO_FAILURE:
            return {
                ...state,
                updateInfoStatus: statuses.failure,
                updateInfoMessage: "There was an error while updating your shipping information. Please try again later."
            }
        case READ_SHIPPING_INFO_REQUEST:
            return {
                ...state,
                readInfoStatus: statuses.pending,
                readInfoMessage: "Please Wait..."
            }
        case READ_SHIPPING_INFO_SUCCESS:
            const _delivery_info = {}
            const _shipping_info = {}
            for (const info of action.payload.delivery_info) {
                if (info._customer_id === null) {
                    _shipping_info[info._instance_id] = info
                }
                else {
                    if (_delivery_info[info._customer_id] === undefined) _delivery_info[info._customer_id] = []
                    _delivery_info[info._customer_id].push(info)
                }
            }
            return {
                ...state,
                readInfoStatus: statuses.success,
                readInfoMessage: "Shipping info loaded successfully.",
                delivery_info: _delivery_info,
                shipping_info: _shipping_info,
                all_info: action.payload.delivery_info
            }
        case READ_SHIPPING_INFO_FAILURE:
            return {
                ...state,
                readInfoStatus: statuses.failure,
                readInfoMessage: "Error occurred while fetching data. Please try again leter"
            }
        default:
            return state
    }
}