import { actions as appActions } from "./app";
import { actions as orderActions } from "./order";
import { post, get } from "../../utils/request";
import url from "../../utils/url";
import { storeData } from "../../utils/storage";
import { TOKEN } from "../../utils/common";
import { requestType } from "../../utils/common";

const initialState = {
    selectedSlot: new Array(),
    hasSelectSlot: false,
    selectedProduct: new Object(),
}

//action types
export const types = {
    SELECT_SLOT: "NEWORDER/SELECT_SLOT",
    RESET_SLOT: "NEWORDER/RESET_SLOT",
    RESET_AFTER_COMPLETE_RESERVATION: "NEWORDER/RESET_AFTER_COMPLETE_RESERVATION",
    SELECT_PRODUCT: "NEWORDER/SELECT_PRODUCT",
    RESET_PRODUCT: "NEWORDER/RESET_PRODUCT",
};

//action creators
export const actions = {
    selectSlot: (startTime) => {
        return (dispatch) => {
            dispatch({
                type: types.SELECT_SLOT,
                startTime
            })
        }
    },
    resetSlot: () => {
        return (dispatch) => {
            dispatch({
                type: types.RESET_SLOT
            })
        }
    },
    reserve: (order) => {
        return (dispatch) => {
            dispatch(appActions.startRequest(requestType.updateRequest));
            const params = { ...order };
            return post(url.reserve(), params).then((result) => {
                dispatch(appActions.finishRequest(requestType.updateRequest));
                if (!result.error) {
                    console.log("result.data", result.data)
                    dispatch(orderActions.completeOrder(result.data));
                    dispatch({ type: types.RESET_AFTER_COMPLETE_RESERVATION });
                    return Promise.resolve();
                } else {
                    console.log("result", result);
                    dispatch(appActions.setError(result));
                    return Promise.reject(result);
                }
            });
        }
    },
    resetAfterCompleteReservation: () => {
        return (dispatch => {
            dispatch({ type: types.RESET_AFTER_COMPLETE_RESERVATION });
        })
    },
    pay: (customerId, value) => {
        return (dispatch) => {
            dispatch(appActions.startRequest());
            return get(url.pay(customerId, value)).then((result) => {
                dispatch(appActions.finishRequest());
                if (!result.error) {
                    console.log("result.data", result.data)
                    return Promise.resolve();
                } else {
                    console.log("result", result);
                    dispatch(appActions.setError(result.error));
                    return Promise.reject(result.error);
                }
            });
        }
    },
    selectProduct: (productId, value) => {
        return (dispatch) => {
            dispatch({
                type: types.SELECT_PRODUCT,
                productId,
                value
            })
        }
    },
    resetSelectedProduct: () => {
        return (dispatch) => {
            dispatch({
                type: types.RESET_PRODUCT
            })
        }
    },
    placeOrder: (order) => {
        return (dispatch) => {
            dispatch(appActions.startRequest(requestType.updateRequest));
            const params = { ...order };
            return post(url.placeOrder(), params).then((result) => {
                dispatch(appActions.finishRequest(requestType.updateRequest));
                if (!result.error) {
                    console.log("result.data", result.data)
                    dispatch(orderActions.completeOrder(result.data));
                    dispatch({ type: types.RESET_PRODUCT });
                    return Promise.resolve();
                } else {
                    console.log("result", result);
                    dispatch(appActions.setError(result));
                    return Promise.reject(result);
                }
            });
        }
    }
}

//reducers
const reducer = (state = initialState, action) => {
    let selectedSlot;
    let selectedProduct;
    switch (action.type) {
        case types.RESET_PRODUCT:
            return { ...state, selectedProduct: new Object() };
        case types.SELECT_PRODUCT:
            selectedProduct = { ...state.selectedProduct, [action.productId]: action.value };
            return { ...state, selectedProduct };
        case types.RESET_AFTER_COMPLETE_RESERVATION:
            return { ...state, hasSelectSlot: false };
        case types.RESET_SLOT:
            return { ...state, selectedSlot: new Array(), hasSelectSlot: false }
        case types.SELECT_SLOT:
            if (state.selectedSlot.indexOf(action.startTime) == -1) {
                selectedSlot = state.selectedSlot.concat([action.startTime]);
            } else {
                selectedSlot = state.selectedSlot.filter(time => time != action.startTime);
            }
            return { ...state, selectedSlot, hasSelectSlot: selectedSlot.length > 0 };
        default:
            return state;
    }
}

export default reducer;

//selectors
export const getSelectedSlot = (state) => state.newOrder.selectedSlot;
export const getHasSelectSlot = (state) => state.newOrder.hasSelectSlot;
export const getSelectedProduct = (state) => state.newOrder.selectedProduct;