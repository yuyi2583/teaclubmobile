import { actions as appActions } from "./app";
import { post } from "../../utils/request";
import url from "../../utils/url";
import { storeData } from "../../utils/storage";
import { TOKEN } from "../../utils/common";

const initialState = {
    user: new Object()
}

//action types
export const types = {
    LOGIN: "AUTH/LOGIN",
};

//action creators
export const actions = {
    login: (id, password) => {
        return (dispatch) => {
            dispatch(appActions.startRequest());
            const params = { identityId: id, password };
            return post(url.login(), params).then((result) => {
                dispatch(appActions.finishRequest());
                if (!result.error) {
                    console.log("result.data", result.data)
                    dispatch(loginSuccess(result.data));
                    return Promise.resolve();
                } else {
                    dispatch(appActions.setError(result.error));
                    return Promise.reject(result.error);
                }
            });
        }
    }
}

const loginSuccess = (data) => {
    storeData(TOKEN, data.token)
        // .then(() => {
        //     return {
        //         type: types.LOGIN,
        //         user: data
        //     }
        // }).catch(err => {
        //     throw new Error(err);
        // });
    return {
        type: types.LOGIN,
        user: data
    }
}

//reducers
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case types.LOGIN:
            return { ...state, user: action.user };
        default:
            return state;
    }
}

export default reducer;

//selectors
export const getUser = (state) => state.auth.user;