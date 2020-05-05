import { actions as appActions } from "./app";
import { actions as boxActions } from "./box";
import { post, get } from "../../utils/request";
import url from "../../utils/url";
import { storeData } from "../../utils/storage";
import { TOKEN } from "../../utils/common";

const initialState = {
    user: new Object(),
    shop: new Object(),
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
            console.log("start login")
            return post(url.login(), params).then((result) => {
                dispatch(appActions.finishRequest());
                if (!result.error) {
                    console.log("result.data", result.data)
                    let data = convertUserToPlainStructure(result.data);
                    dispatch(loginSuccess(data));
                    dispatch(boxActions.fetchBoxes(data))
                    return Promise.resolve();
                } else {
                    dispatch(appActions.setError(result.error));
                    return Promise.reject(result.error);
                }
            });
        }
    },
    verifyToken: (token) => {
        return (dispatch) => {
            dispatch(appActions.startRequest());
            return get(url.verifyToken(token)).then((result) => {
                dispatch(appActions.finishRequest());
                if (!result.error) {
                    console.log("result.data", result.data)
                    result.data.token = token;
                    let data = convertUserToPlainStructure(result.data);
                    dispatch(loginSuccess(data));
                    dispatch(boxActions.fetchBoxes(data))
                    return Promise.resolve();
                } else {
                    dispatch(appActions.setError(result.error));
                    return Promise.reject(result.error);
                }
            });
        }
    }
}

const convertUserToPlainStructure = (data) => {
    let user = new Object();
    let shop = new Object();
    let boxes = new Array();
    let byBoxes = new Object();
    shop = data.shop;
    try {
        shop.shopBoxes.forEach(box => {
            boxes.push(box.uid);
            if (!byBoxes[box.uid]) {
                byBoxes[box.uid] = box;
            }
        });
        shop.shopBoxes=boxes;
    }catch{
        shop = data.shop;
    }
    return {
        user: data,
        shop,
        boxes,
        byBoxes
    }
}

const loginSuccess = ({ user, shop }) => {
    storeData(TOKEN, user.token)
        .then(() => {
            console.log("store token success");
        })
        .catch(err => {
            console.log("store token error", err);
        })
    user.avatar.photo = `data:image/jpeg;base64,${user.avatar.photo}`;
    return {
        type: types.LOGIN,
        user,
        shop
    }
}

//reducers
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case types.LOGIN:
            return { ...state, user: action.user, shop: action.shop };
        default:
            return state;
    }
}

export default reducer;

//selectors
export const getUser = (state) => state.auth.user;
export const getShop = (state) => state.auth.shop;