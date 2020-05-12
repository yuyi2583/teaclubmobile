import { actions as appActions } from "./app";
import { actions as orderActions } from "./order";
import { post, get } from "../../utils/request";
import url from "../../utils/url";
import { storeData } from "../../utils/storage";
import { TOKEN,requestType } from "../../utils/common";

const initialState = {
    customerFaces: new Array(),
    byCustomerFaces: new Object(),
    customers: new Array(),
    byCustomers: new Object(),
    currentCustomer: new Object(),
    searchCustomers: new Array(),
    bySearchCustomers: new Object(),
    currentSearchCustomer: new Object(),
}

//action types
export const types = {
    RECEIEVE_CUSTOMER_FACES: "CUSTOMER/RECEIEVE_CUSTOMER_FACES",//websocket获取当前人脸识别到的客户信息
    FETCH_CUSTOMER: "CUSTOMER/FETCH_CUSTOMER",
    CURRENT_CUSTOMER: "CUSTOMER/CURRENT_CUSTOMER",
    ADD_CUSTOMER_ORDER: "CUSTOMER/ADD_CUSTOMER_ORDER",
    SEARCH_CUSTOMERS: "CUSTOMER/SEARCH_CUSTOMERS",
    CURRENT_SEARCH_CUSTOMER: "CUSTOMER/CURRENT_SEARCH_CUSTOMER",
    FETCH_SEARCH_CUSTOMER: "CUSTOMER/FETCH_SEARCH_CUSTOMER",
    REGISTER:"CUSTOMER/REGISTER",
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
    fetchCustomer: (uid,type) => {
        return (dispatch) => {
            dispatch(appActions.startRequest());
            return get(url.fetchCustomer(uid,type)).then((result) => {
                if (!result.error) {
                    console.log("result.data", result.data)
                    let data = convertCustomerToPlainStructure(result.data);
                    if (data != null) {
                        dispatch(fetchCustomerSuccess(data.customer));
                        dispatch(orderActions.fetchCustomerOrders(data));
                    }
                    dispatch(appActions.finishRequest());
                    return Promise.resolve();
                } else {
                    dispatch(appActions.setError(result.error));
                    dispatch(appActions.finishRequest());
                    return Promise.reject(result.error);
                }
            });
        }
    },
    setCurrentCustomer: (uid, customerType) => {
        return (dispatch) => {
            dispatch({
                type: types.CURRENT_CUSTOMER,
                uid,
                customerType
            });
        }
    },
    addCustomerOrder: (customerId, orderId) => {
        return (dispatch) => {
            dispatch({
                type: types.ADD_CUSTOMER_ORDER,
                customerId,
                orderId
            })
        }
    },
    //根据输入信息搜索客户
    searchCustomer: (searchText) => {
        return (dispatch) => {
            dispatch(appActions.startRequest(requestType.updateRequest));
            return get(url.searchCustomer(searchText)).then((result) => {
                dispatch(appActions.finishRequest(requestType.updateRequest));
                if (!result.error) {
                    console.log("result.data", result.data)
                    dispatch(fetchCustomersSuccess(convertCustomersToPlainStructure(result.data)));
                    return Promise.resolve();
                } else {
                    dispatch(appActions.setError(result.error));
                    return Promise.reject(result.error);
                }
            });
        }
    },
    //未注册客户注册
    register:(faceId,customer)=>{
        return (dispatch) => {
            dispatch(appActions.startRequest());
            const params={...customer};
            return post(url.register(faceId),params).then((result) => {
                dispatch(appActions.finishRequest());
                if (!result.error) {
                    console.log("result.data", result.data)
                    dispatch(registerSuccess(convertCustomerToPlainStructure(result.data)));
                    return Promise.resolve();
                } else {
                    dispatch(appActions.setError(result.error));
                    return Promise.reject(result.error);
                }
            });
        }
    }
}

const registerSuccess=({customer})=>({
    type:types.REGISTER,
    customer
})

const convertCustomersToPlainStructure = (data) => {
    let searchCustomers = new Array();
    let bySearchCustomers = new Object();
    data.forEach(customer => {
        searchCustomers.push(customer.uid);
        if (!bySearchCustomers[customer.uid]) {
            bySearchCustomers[customer.uid] = customer;
            bySearchCustomers[customer.uid].avatar.photo=`data:image/jpeg;base64,${bySearchCustomers[customer.uid].avatar.photo}`
        }
    });
    return {
        searchCustomers,
        bySearchCustomers
    }
}

const fetchCustomersSuccess = ({ searchCustomers, bySearchCustomers }) => ({
    type: types.SEARCH_CUSTOMERS,
    searchCustomers,
    bySearchCustomers
})

const convertCustomerToPlainStructure = (data) => {
    if (data != null) {
        let orders = new Array();
        let byOrders = new Object();
        data.orders.forEach(order => {
            orders.push(order.uid);
            if (!byOrders[order.uid]) {
                byOrders[order.uid] = order;
            }
        });
        if(data.avatar!=null){
            data.avatar.photo = `data:image/jpeg;base64,${data.avatar.photo}`;
        }
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

const fetchSearchCustomerSuccess = (customer) => ({
    type: types.FETCH_SEARCH_CUSTOMER,
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
    let byCustomerFaces;
    switch (action.type) {
        case types.SEARCH_CUSTOMERS:
            return { ...state, searchCustomers: action.searchCustomers, bySearchCustomers: action.bySearchCustomers };
        case types.ADD_CUSTOMER_ORDER:
            byCustomers = { ...state.byCustomers, [action.customerId]: { ...state.byCustomers[action.customerId], orders: state.byCustomers[action.customerId].orders.concat([action.orderId]) } };
            return { ...state, byCustomers };
        case types.CURRENT_CUSTOMER:
            if (action.customerType == "face") {
                return { ...state, currentCustomer: state.byCustomerFaces[action.uid] };
            } else {
                return { ...state, currentCustomer: state.bySearchCustomers[action.uid] };
            }
        case types.RECEIEVE_CUSTOMER_FACES:
            customerFaces = state.customerFaces;
            byCustomerFaces = state.byCustomerFaces;
            action.customerFaces.forEach(uid => {
                if (state.customerFaces.indexOf(uid) == -1) {
                    customerFaces = state.customerFaces.concat([uid]);
                    byCustomerFaces = { ...state.byCustomerFaces, [uid]: action.byCustomerFaces[uid] };
                }
            })
            return { ...state, customerFaces, byCustomerFaces };
        case types.REGISTER:
        case types.FETCH_CUSTOMER:
            customers = state.customers;
            if (state.customers.indexOf(action.customer.uid) == -1) {
                customers = state.customers.concat([action.customer.uid]);
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
export const getCurrentCustomer = (state) => state.customer.currentCustomer;
export const getCurrentSearchCustomer = (state) => state.customer.currentSearchCustomer;
export const getSearchCustomers = (state) => state.customer.searchCustomers;
export const getBySearchCustomers = (state) => state.customer.bySearchCustomers;