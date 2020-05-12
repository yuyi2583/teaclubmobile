import { actions as appActions } from "./app";
import { actions as customerActions } from "./customer";
import { post, get, put } from "../../utils/request";
import url from "../../utils/url";
import { storeData } from "../../utils/storage";
import { TOKEN } from "../../utils/common";

const initialState = {
    orders: new Array(),
    byOrders: new Object(),
    byProducts: new Object(),
}

//action types
export const types = {
    FETCH_CUSTOMER_ORDERS: "ORDERS/FETCH_CUSTOMER_ORDERS",
    CUSTOMER_PICK_UP: "ORDERS/CUSTOMER_PICK_UP",
    COMPLETE_RESERVATION: "ORDERS/COMPLETE_RESERVATION",
    FETCH_ORDERS: "ORDER/FETCH_ORDERS",
};

//action creators
export const actions = {
    fetchCustomerOrders: ({ orders, byOrders }) => {
        return (dispatch) => {
            dispatch(fetchCustomerOrdersSuccess(convertOrdersToPlainStructure({orders, byOrders})))
        }
    },
    //买家提货
    customerPickUp: (orderId, user) => {
        return (dispatch) => {
            dispatch(appActions.startRequest());
            const params = { uid: orderId, clerk: { uid: user.uid, name: user.name } };
            console.log("params", params)
            return put(url.customerPickUp(), params).then((result) => {
                dispatch(appActions.finishRequest());
                if (!result.error) {
                    console.log("result.data", result.data)
                    dispatch(customerPickUpSuccess(convertOrderToPlainStructure(result.data)));
                    return Promise.resolve();
                } else {
                    dispatch(appActions.setError(result.error));
                    return Promise.reject(result.error);
                }
            });
        }
    },
    //客户完成订单
    completeReservation: (data) => {
        return (dispatch) => {
            dispatch({
                type: types.COMPLETE_RESERVATION,
                order: data
            });
            dispatch(customerActions.addCustomerOrder(data.customer.uid, data.uid));
        }
    },
    fetchOrders: (customerId) => {
        return (dispatch) => {
            // dispatch(appActions.startRequest());
            return get(url.fetchOrders(customerId)).then((result) => {
                // dispatch(appActions.finishRequest());
                if (!result.error) {
                    console.log("result.data", result.data)
                    const data=convertOrdersToPlainStructure(convertRefreshOrdersToPlainStructure(result.data))
                    dispatch(fetchOrdersSuccess(data));
                    dispatch(customerActions.refreshCustomerOrders(customerId,data.orders));
                    return Promise.resolve();
                } else {
                    dispatch(appActions.setError(result.error));
                    return Promise.reject(result.error);
                }
            });
        }
    }
}
const fetchOrdersSuccess = ({ orders, byOrders,byProducts }) => ({
    type: types.FETCH_ORDERS,
    orders,
    byOrders,
    byProducts
})
const convertRefreshOrdersToPlainStructure = (data) => {
    console.log("convertRefreshOrdersToPlainStructure")
    let orders = new Array();
    let byOrders = new Object();
    data.forEach(order => {
        orders.push(order.uid);
        if (!byOrders[order.uid]) {
            byOrders[order.uid] = order;
        }
    });
    return {
        orders,
        byOrders
    }
}

const convertOrderToPlainStructure = (data) => {
    let products = new Array();
    let byProducts = new Object();
    data.products.forEach(product => {
        products.push(product.uid);
        if (!byProducts[product.uid]) {
            byProducts[product.uid] = product;
        }
    });
    return {
        order: { ...data, products },
        products,
        byProducts
    }
}

const customerPickUpSuccess = ({ order, products, byProducts }) => ({
    type: types.CUSTOMER_PICK_UP,
    order,
    products,
    byProducts
})

const convertOrdersToPlainStructure = ({orders, byOrders}) => {
    console.log("convertOrdersToPlainStructure",orders)
    let byProducts = new Object();
    orders.forEach(uid => {
        let products = new Array();
        byOrders[uid].products.forEach(product => {
            products.push(product.uid);
            if (!byProducts[product.uid]) {
                byProducts[product.uid] = product;
            }
        });
        byOrders[uid].products = products;
    });
    return {
        orders,
        byOrders,
        byProducts
    }
}

const fetchCustomerOrdersSuccess = ({ orders, byOrders, byProducts }) => ({
    type: types.FETCH_CUSTOMER_ORDERS,
    orders,
    byOrders,
    byProducts
})

//reducers
const reducer = (state = initialState, action) => {
    let orders;
    let byOrders;
    let byProducts;
    switch (action.type) {
        case types.COMPLETE_RESERVATION:
            orders = state.orders.concat([action.order.uid]);
            byOrders = { ...state.byOrders, [action.order.uid]: action.order };
            return { ...state, orders, byOrders };
        case types.CUSTOMER_PICK_UP:
            products = state.products;
            byProducts = state.byProducts;
            orders = state.orders;
            if (state.orders.indexOf(action.order.uid) == -1) {
                orders = state.orders.concat([action.order.uid]);
            }
            byOrders = { ...state.byOrders, [action.order.uid]: action.order };
            action.products.forEach(uid => {
                byProducts[uid] = action.byProducts[uid];
            });
            return { ...state, orders, byOrders, byProducts };
        case types.FETCH_ORDERS:
        case types.FETCH_CUSTOMER_ORDERS:
            return { ...state, orders: action.orders, byOrders: action.byOrders, byProducts: action.byProducts };
        default:
            return state;
    }
}

export default reducer;

//selectors
export const getOrders = (state) => state.order.orders;
export const getByOrders = (state) => state.order.byOrders;
export const getByProducts = (state) => state.order.byProducts;