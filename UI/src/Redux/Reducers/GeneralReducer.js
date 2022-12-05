import {
    READ_DATA_REQUEST,
    READ_DATA_SUCCESS,
    READ_DATA_FAILURE,
    UPDATE_SETTINGS_REQUEST,
    UPDATE_SETTINGS_SUCCESS,
    UPDATE_SETTINGS_FAILURE,
    statuses
} from "../constants"


const initialState = {

    _product_categories : [],
    _order_statuses : [],
    _user_types : [],
    _instances : [],
    _currencies: [],
    _settings: [],
    _settings_types: [],

    readDataStatus: statuses.idle,
    readDataMessage: "",

    updateSettingsStatus: statuses.idle,
    updateSettingsMessage: ""
}


export default (state = initialState, action) => {

    switch(action.type) {
        case READ_DATA_REQUEST:
            return {
                ...state,
                readDataStatus: statuses.pending,
                readDataMessage: "Data is loading... Please wait.",
            }
        case READ_DATA_SUCCESS:
            return {
                ...state,
                readDataStatus: statuses.success,
                readDataMessage: "Data loaded successfully",
                _product_categories: action.payload._product_categories,
                _order_statuses: action.payload._order_statuses,
                _user_types: action.payload._user_types,
                _instances: action.payload._instances,
                _currencies: action.payload._currencies,
                _settings : action.payload._settings,
                _settings_types : action.payload._settings_types,
            }
        case READ_DATA_FAILURE:
            return {
                ...state,
                readDataStatus: statuses.failure,
                readDataMessage: action.payload.message,
            }
        case UPDATE_SETTINGS_REQUEST: 
            return {
                ...state,
                updateSettingsStatus: statuses.pending,
                updateSettingsMessage: "Request is being processed. This may take a while."
            }
        case UPDATE_SETTINGS_SUCCESS: 
            return {
                ...state,
                updateSettingsStatus: statuses.success,
                updateSettingsMessage: "Settings updated successfully.",
                _settings: action.payload.new_settings,
            }
        case UPDATE_SETTINGS_FAILURE: 
            return {
                ...state,
                updateSettingsStatus: statuses.failure,
                updateSettingsMessage: action.payload.message
            }
        default:
            return state
    }
}