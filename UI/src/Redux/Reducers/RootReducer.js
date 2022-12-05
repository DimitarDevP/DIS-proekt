import ShopReducer from "./ShopReducer"
import UserReducer from "./UserReducer"
import GeneralReducer from "./GeneralReducer"
import TempCartReducer from "./TemporaryCart"
import TableReducer from "./TablesReducer"
import { combineReducers } from "redux"


export default combineReducers({
    user: UserReducer,
    shop: ShopReducer,
    general: GeneralReducer,
    tempCart: TempCartReducer,
    tables: TableReducer,
})