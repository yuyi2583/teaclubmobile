import { actions as appActions } from "./app";
import { actions as customerActions } from "./customer";
import { post, get, put } from "../../utils/request";
import url from "../../utils/url";
import { storeData } from "../../utils/storage";
import { TOKEN } from "../../utils/common";
import { State } from "react-native-gesture-handler";

const initialState = {
    orders: new Array(),
    byOrders: new Object(),
    byProducts: new Object(),
    reservationOrders: new Array(),
    byReservationOrders: new Object(),
}

//action types
export const types = {
    FETCH_CUSTOMER_ORDERS: "ORDERS/FETCH_CUSTOMER_ORDERS",
    CUSTOMER_PICK_UP: "ORDERS/CUSTOMER_PICK_UP",
    COMPLETE_RESERVATION: "ORDERS/COMPLETE_RESERVATION",
    FETCH_ORDERS: "ORDER/FETCH_ORDERS",
    RESET_ORDERS: "ORDER/RESET_ORDERS",
    FETCH_CUSTOMER_RESERVATIONS: "ORDER/FETCH_CUSTOMER_RESERVATIONS",
};

//action creators
export const actions = {
    fetchCustomerOrders: ({ orders, byOrders }) => {
        return (dispatch) => {
            dispatch(fetchCustomerOrdersSuccess(convertOrdersToPlainStructure({ orders, byOrders })))
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
    //获取客户订单信息（10条）
    fetchOrders: (customerId, page) => {
        return (dispatch) => {
            return get(url.fetchOrders(customerId, page)).then((result) => {
                if (!result.error) {
                    console.log("result.data", result.data)
                    const data = convertOrdersToPlainStructure(result.data);
                    dispatch(fetchOrdersSuccess(data));
                    return Promise.resolve(result.data);
                } else {
                    dispatch(appActions.setError(result.error));
                    return Promise.reject(result.error);
                }
            });
        }
    },
    //获取客户预约
    fetchCustomerReservations: (customerId, page) => {
        return (dispatch) => {
            return get(url.fetchCustomerReservations(customerId, page)).then((result) => {
                if (!result.error) {
                    console.log("result.data", result.data)
                    const data = convertReservationsToPlainStructure(result.data);
                    dispatch(fetchCustomerReservationssSuccess(data));
                    return Promise.resolve();
                } else {
                    dispatch(appActions.setError(result.error));
                    return Promise.reject(result.error);
                }
            });
        }
    },
    resetOrders: () => {
        return (dispatch) => {
            dispatch({
                type: types.RESET_ORDERS
            })
        }
    }
}

const fetchCustomerReservationssSuccess = ({ reservationOrders, byReservationOrders }) => ({
    type: types.FETCH_CUSTOMER_RESERVATIONS,
    byReservationOrders,
    reservationOrders
})

const convertReservationsToPlainStructure = (data) => {
    let reservationOrders = new Array();
    let byReservationOrders = new Object();
    data.forEach(order => {
        reservationOrders.push(order.uid);
        if (!byReservationOrders[order.uid]) {
            byReservationOrders[order.uid] = { ...order };
        }
    });
    return {
        reservationOrders,
        byReservationOrders
    }
}

const fetchOrdersSuccess = ({ orders, byOrders, byProducts }) => ({
    type: types.FETCH_ORDERS,
    orders,
    byOrders,
    byProducts
})
const convertOrdersToPlainStructure = (data) => {
    let orders = new Array();
    let byOrders = new Object();
    let byProducts = new Object();
    data.forEach(order => {
        orders.push(order.uid);
        let products = new Array();
        order.products.forEach(product => {
            products.push(product.uid);
            if (!byProducts[product.uid]) {
                byProducts[product.uid] = product;
            }
        });
        if (!byOrders[order.uid]) {
            byOrders[order.uid] = { ...order, products };
        }
    });
    return {
        orders,
        byOrders,
        byProducts
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


const fetchCustomerOrdersSuccess = ({ orders, byOrders, byProducts }) => ({
    type: types.FETCH_CUSTOMER_ORDERS,
    orders,
    byOrders,
    byProducts
})

//reducers
const reducer = (state = initialState, action) => {
    let orders = new Array();
    let byOrders = new Object();
    let byProducts = new Object();
    let reservationOrders = new Array();
    let byReservationOrders = new Object();
    switch (action.type) {
        case types.FETCH_CUSTOMER_RESERVATIONS:
            reservationOrders = action.reservationOrders.filter(uid => {
                if (state.reservationOrders.indexOf(uid) == -1) {
                    return true;
                }
                return false;
            })
            return {
                ...state, reservationOrders: state.reservationOrders.concat(reservationOrders),
                byReservationOrders: { ...state.byReservationOrders, ...action.byReservationOrders },
            };
        case types.RESET_ORDERS:
            return { ...state, orders, byOrders, byProducts, reservationOrders, byReservationOrders };
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
            orders = action.orders.filter(uid => {
                if (state.orders.indexOf(uid) == -1) {
                    return true;
                }
                return false;
            })
            return { ...state, orders: state.orders.concat(orders), byOrders: { ...state.byOrders, ...action.byOrders }, byProducts: { ...state.byProducts, ...action.byProducts } };
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
export const getReservationOrders = (state) => state.order.reservationOrders;
export const getByReservationOrders = (state) => state.order.byReservationOrders;