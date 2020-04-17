import { combineReducers } from "redux";
import app from "./app";
import auth from "./auth";


// 合并所有模块的reducer成一个根reducer
const rootReducer = combineReducers({
    app,
    auth,
});

export default rootReducer;