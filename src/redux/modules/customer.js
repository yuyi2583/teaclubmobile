import { actions as appActions } from "./app";
import {actions as orderActions} from "./order";
import { post, get } from "../../utils/request";
import url from "../../utils/url";
import { storeData } from "../../utils/storage";
import { TOKEN } from "../../utils/common";

const initialState = {
    customerFaces: new Array(),
    byCustomerFaces: new Object(),
    customers: new Array(),
    byCustomers: new Object(),
}

//action types
export const types = {
    RECEIEVE_CUSTOMER_FACES: "CUSTOMER/RECEIEVE_CUSTOMER_FACES",//websocket获取当前人脸识别到的客户信息
    FETCH_CUSTOMER: "CUSTOMER/FETCH_CUSTOMER",
};

//action creators
export const actions = {
    //websocket获取人脸识别结果
    receieveCustomerFaces: (customerFaces) => {
        return (dispatch) => {
            dispatch(receieveCustomerFacesSuccess(convertCustomerFacesToPlainStructure(customerFaces)));
        }
    },
    //根据user_face_info的uid获取客户信息
    fetchCustomer: (uid) => {
        return (dispatch) => {
            dispatch(appActions.startRequest());
            return get(url.fetchCustomer(uid)).then((result) => {
                dispatch(appActions.finishRequest());
                if (!result.error) {
                    console.log("result.data", result.data)
                    let data = convertCustomerToPlainStructure(result.data);
                    if (data != null) {
                        dispatch(fetchCustomerSuccess(data.customer));
                        dispatch(orderActions.fetchCustomerOrders(data));
                    }
                    return Promise.resolve();
                } else {
                    dispatch(appActions.setError(result.error));
                    return Promise.reject(result.error);
                }
            });
        }
    }
}

const convertCustomerToPlainStructure = (data) => {
    if (data != null) {
        let orders = new Array();
        let byOrders = new Object();
        data.orders.forEach(order => {
            orders.push(order.uid);
            if (!byOrders[order.uid]) {
                byOrders[order.uid] = order;
            }
        })
        data.avatar.photo = `data:image/jpeg;base64,${data.avatar.photo}`;
        data.orders = orders;
        return {
            customer: data,
            orders,
            byOrders,
        }
    }
    return null;
}

const fetchCustomerSuccess = (customer) => ({
    type: types.FETCH_CUSTOMER,
    customer
})

const convertCustomerFacesToPlainStructure = (data) => {
    let customerFaces = new Array();
    let byCustomerFaces = new Object();
    data.forEach(item => {
        customerFaces.push(item.uid);
        if (!byCustomerFaces[item.uid]) {
            byCustomerFaces[item.uid] = { ...item };
            if (item.customer != null || item.customer != undefined) {
                byCustomerFaces[item.uid] = { ...item.customer, ...item, customerId: item.customer.uid };
            }
        }
    });
    return {
        customerFaces,
        byCustomerFaces
    }
}

const receieveCustomerFacesSuccess = ({ customerFaces, byCustomerFaces }) => ({
    type: types.RECEIEVE_CUSTOMER_FACES,
    customerFaces,
    byCustomerFaces
})

//reducers
const reducer = (state = initialState, action) => {
    let customers;
    let byCustomers;
    let customerFaces;
    let byCustomerFaces
    switch (action.type) {
        case types.RECEIEVE_CUSTOMER_FACES:
            customerFaces = state.customerFaces;
            byCustomerFaces = state.byCustomerFaces;
            action.customerFaces.forEach(uid => {
                if (customerFaces.indexOf(uid) == -1) {
                    customerFaces.push(uid);
                    byCustomerFaces = { ...byCustomerFaces, [uid]: action.byCustomerFaces[uid] };
                }
            })
            return { ...state, customerFaces, byCustomerFaces };
        case types.FETCH_CUSTOMER:
            customers = state.customers;
            if (customers.indexOf(action.customer.uid) == -1) {
                customers.push(action.customer.uid);
            }
            byCustomers = { ...state.byCustomers, [action.customer.uid]: action.customer };
            return { ...state, customers, byCustomers };
        default:
            return state;
    }
}

export default reducer;

//selectors
export const getCustomers = (state) => state.customer.customers;
export const getByCustomers = (state) => state.customer.byCustomers;
export const getCustomerFaces = (state) => state.customer.customerFaces;
export const getByCustomerFaces = (state) => state.customer.byCustomerFaces;