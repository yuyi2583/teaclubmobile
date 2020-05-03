import { actions as appActions } from "./app";
import { post, get } from "../../utils/request";
import url from "../../utils/url";
import { storeData } from "../../utils/storage";
import { TOKEN } from "../../utils/common";

const initialState = {
    orders: new Array(),
    byOrders: new Object(),
}

//action types
export const types = {
    FETCH_CUSTOMER_ORDERS: "ORDERS/FETCH_CUSTOMER_ORDERS",
};

//action creators
export const actions = {
    fetchCustomerOrders: ({orders, byOrders}) => {
        return (dispatch) => {
            dispatch({
                type: types.FETCH_CUSTOMER_ORDERS,
                orders,
                byOrders
            })
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

//reducers
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_CUSTOMER_ORDERS:
            return { ...state, orders: action.orders, byOrders: action.byOrders };
        default:
            return state;
    }
}

export default reducer;

//selectors
export const getOrders = (state) => state.order.orders;
export const getByOrders = (state) => state.order.byOrders;