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
}

//action types
export const types = {
    SELECT_SLOT: "NEWORDER/SELECT_SLOT",
    RESET_SLOT: "NEWORDER/RESET_SLOT",
    RESET_AFTER_COMPLETE_RESERVATION: "NEWORDER/RESET_AFTER_COMPLETE_RESERVATION",
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
                    dispatch(orderActions.completeReservation(result.data));
                    dispatch({ type: types.RESET_AFTER_COMPLETE_RESERVATION });
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
    let selectedSlot;
    switch (action.type) {
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