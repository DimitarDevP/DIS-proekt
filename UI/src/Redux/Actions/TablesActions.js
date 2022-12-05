import {
    SET_TABLE_FILTER,
    SET_VIEW_FILTER,
    SET_PAGE_FILTER,
    GENERATE_FILTERS
} from "../constants"


export const setViewFilter = (route, filter) => {
    return dispatch => {
        dispatch({type: SET_VIEW_FILTER, payload: {route, filter}})
    }
}

export const setPageFilter = (route, filter) => {
    return dispatch => {
        dispatch({type: SET_PAGE_FILTER, payload: {route, filter}})
    }
}


export const setTableFilter = (route, filters) => {
    return dispatch => {
        dispatch({type: SET_TABLE_FILTER, payload: {route, filters}})
    }
}

export const setIndexFilter = (route, index) => {
    return dispatch => {
        dispatch({type: "SET_INDEX_FILTER", payload: {route, index}})
    }
}

export const setAscendFilter = (route, ascend) => {
    return dispatch => {
        dispatch({type: "SET_ASCEND_FILTER", payload: {route, ascend}})
    }
}

export const generateFilters = (route, TableFilters, PageFilters, props, index = 0, asc = true) => {
    return dispatch => {
        dispatch({type: GENERATE_FILTERS, payload: {route, TableFilters, PageFilters, props, index, asc}})
    }
}

export const clearAllFilters = () => {
    return dispatch => {
        dispatch({type: "CLEAR_ALL_FILTERS", payload: {}})
    }
}