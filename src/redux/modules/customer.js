import { actions as appActions } from "./app";
import { post, get } from "../../utils/request";
import url from "../../utils/url";
import { storeData } from "../../utils/storage";
import { TOKEN } from "../../utils/common";

const initialState = {
    customers: new Array(),
    byCustomers: new Object(),
}

//action types
export const types = {
    RECEIEVE_CUSTOMERS: "CUSTOMER/RECEIEVE_CUSTOMERS",//websocket获取当前人脸识别到的客户信息
};

//action creators
export const actions = {
    receieveCustomers: (customers) => {
        return (dispatch) => {
            dispatch(receieveCustomersSuccess(convertCustomersToPlainStructure(customers)));
        }
    },
}

const convertCustomersToPlainStructure = (data) => {
    let customers = new Array();
    let byCustomers = new Object();
    data.forEach(item => {
        customers.push(item.uid);
        if (!byCustomers[item.uid]) {
            byCustomers[item.uid] = { ...item };
            if(item.customer!=null||item.customer!=undefined){
                byCustomers[item.uid]={...item.customer,...item};
            }
        }
    });
    return {
        customers,
        byCustomers
    }
}

const receieveCustomersSuccess = ({ customers, byCustomers }) => ({
    type: types.RECEIEVE_CUSTOMERS,
    customers,
    byCustomers
})

//reducers
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case types.LOGIN:
            return { ...state, user: action.user };
        case types.RECEIEVE_CUSTOMERS:
            return { ...state, customers: action.customers, byCustomers: action.byCustomers };
        default:
            return state;
    }
}

export default reducer;

//selectors
export const getCustomers = (state) => state.customer.customers;
export const getByCustomers = (state) => state.customer.byCustomers;