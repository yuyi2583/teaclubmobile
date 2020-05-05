import { actions as appActions } from "./app";
import { post, get } from "../../utils/request";
import url from "../../utils/url";
import { storeData } from "../../utils/storage";
import { TOKEN } from "../../utils/common";

const initialState = {
    boxes: new Array(),
    byBoxes: new Object(),
}

//action types
export const types = {
    FETCH_BOXES: "BOX/FETCH_BOXES",
};

//action creators
export const actions = {
    //获取门店包厢列表
    fetchBoxes: ({ boxes, byBoxes }) => {
        return (dispatch) => {
            dispatch({
                type: types.FETCH_BOXES,
                boxes,
                byBoxes
            })
        }
    },
}
//reducers
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_BOXES:
            return { ...state, boxes: action.boxes, byBoxes: action.byBoxes };
        default:
            return state;
    }
}

export default reducer;

//selectors
export const getBoxes = (state) => state.box.boxes;
export const getByBoxes = (state) => state.box.byBoxes;