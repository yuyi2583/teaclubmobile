import { actions as appActions } from "./app";
import { post, get } from "../../utils/request";
import url from "../../utils/url";
import { storeData } from "../../utils/storage";
import { TOKEN } from "../../utils/common";

const initialState = {
    boxes: new Array(),
    byBoxes: new Object(),
    byReservations: new Object(),
}

//action types
export const types = {
    FETCH_BOXES: "BOX/FETCH_BOXES",
    FETCH_RESERVATIONS: "BOX/FETCH_RESERVATIONS",
};

//action creators
export const actions = {
    //获取门店包厢列表
    fetchBoxes: (shopId) => {
        return (dispatch) => {
            dispatch(appActions.startRequest());
            return get(url.fetchBoxes(shopId)).then((result) => {
                dispatch(appActions.finishRequest());
                if (!result.error) {
                    console.log("result.data", result.data)
                    dispatch(fetchBoxesSuccess(convertBoxesToPlainStructure(result.data)));
                    return Promise.resolve();
                } else {
                    dispatch(appActions.setError(result.error));
                    return Promise.reject(result.error);
                }
            });
        }
    },
    fetchReservations: (boxId, startTime, endTime) => {
        return (dispatch) => {
            dispatch(appActions.startRequest());
            return get(url.fetchReservations(boxId, startTime, endTime)).then((result) => {
                dispatch(appActions.finishRequest());
                if (!result.error) {
                    console.log("result.data", result.data)
                    dispatch(fetchReservationsSuccess(boxId, convertReservationsToPlainStructure(result.data)));
                    return Promise.resolve();
                } else {
                    dispatch(appActions.setError(result.error));
                    return Promise.reject(result.error);
                }
            });
        }
    }
}

const convertReservationsToPlainStructure = (data) => {
    let byReservations = new Object();
    let reservations = new Array();
    data.forEach(reservation => {
        reservations.push(reservation.reservationTime);
        if (!byReservations[reservation.reservationTime]) {
            byReservations[reservation.reservationTime] = reservation;
        }
    });
    return {
        reservations,
        byReservations
    }
}

const fetchReservationsSuccess = (boxId, { reservations, byReservations }) => ({
    type: types.FETCH_RESERVATIONS,
    boxId,
    reservations,
    byReservations
})

const convertBoxesToPlainStructure = (data) => {
    let boxes = new Array();
    let byBoxes = new Object();
    let byReservations = new Object();
    data.forEach(box => {
        boxes.push(box.uid);
        let reservations = new Array();
        if (!byBoxes[box.uid]) {
            byBoxes[box.uid] = box;
        }
        box.reservations.forEach(reservation => {
            reservations.push(reservation.reservationTime);
            if (!byReservations[reservation.reservationTime]) {
                byReservations[reservation.reservationTime] = reservation;
            }
        });
        byBoxes[box.uid].reservations = reservations;
    });
    return {
        boxes,
        byBoxes,
        byReservations
    }
}

const fetchBoxesSuccess = ({ boxes, byBoxes, byReservations }) => ({
    type: types.FETCH_BOXES,
    boxes,
    byBoxes,
    byReservations
});

//reducers
const reducer = (state = initialState, action) => {
    let boxes;
    let byBoxes;
    let byReservations;
    let tempBox;
    switch (action.type) {
        case types.FETCH_RESERVATIONS:
            byBoxes = {
                ...state.byBoxes,
                [action.boxId]: {
                    ...state.byBoxes[action.boxId],
                    reservations: state.byBoxes[action.boxId].reservations.concat(action.reservations.filter(time => state.byBoxes[action.boxId].reservations.indexOf(time) == -1))
                }
            };
            byReservations = { ...state.byReservations, ...action.byReservations };
            return { ...state, byBoxes, byReservations };
        case types.FETCH_BOXES:
            return { ...state, boxes: action.boxes, byBoxes: action.byBoxes, byReservations: action.byReservations };
        default:
            return state;
    }
}

export default reducer;

//selectors
export const getBoxes = (state) => state.box.boxes;
export const getByBoxes = (state) => state.box.byBoxes;
export const getByReservations = (state) => state.box.byReservations;