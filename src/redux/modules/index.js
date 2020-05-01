import { combineReducers } from "redux";
import app from "./app";
import auth from "./auth";
import customer from "./customer";


// 合并所有模块的reducer成一个根reducer
const rootReducer = combineReducers({
    app,
    auth,
    customer
});

export default rootReducer;