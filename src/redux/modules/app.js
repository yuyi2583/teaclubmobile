import {requestType} from "../../utils/common";

const initialState = {
    retrieceRequestQuantity: 0,     //当前应用中正在进行获取信息的API请求数
    updateRequestQuantity: 0,        //当前正在进行的UD操作API请求数
    error: null,            //应用全局错误信息
    companyInfo: new Object(),             //页脚公司信息
    modalRequestQuantity: 0, //modal中正在进行的API请求数
    connectError: false,//网络/服务器错误
}

//action types
export const types = {
    START_RETRIEVE_REQUEST: "APP/START_RETRIEVE_REQUEST",                 //开始发送获取信息请求
    FINISH_RETRIEVE_REQUEST: "APP/FINISH_RETRIEVE_REQUEST",               //获取信息请求结束
    START_UPDATE_REQUEST: "APP/START_UPDATE_REQUEST",            //开始发送update请求（UD操作）
    FINISH_UPDATE_REQUEST: "APP/FINISH_UPDATE_REQUEST",
    SET_ERROR: "APP/SET_ERROR",                         //设置错误信息
    REMOVE_ERROR: "APP/REMOVE_ERROR",                   //删除错误信息
    START_MODAL_REQUEST: "APP/START_MODAL_REQUEST",      //在modal发送请求
    FINISH_MODAL_REQUEST: "APP/FINISH_MODAL_REQUEST",    //在modal中结束请求
    SET_CONNECT_ERROR: "APP/SET_CONNECT_ERROR",//
    REMOVE_CONNECT_ERROR: "APP/REMOVE_CONNECT_ERROR"
    // ALTER_COMPANY:"APP/ALTER_COMPANY",       //
};

//action creators
export const actions = {
    startRequest: (reqType = requestType.retrieveRequest) => {
        switch (reqType) {
            case requestType.modalRequest:
                return startModalRequest();
            case requestType.updateRequest:
                return startUpdateRequest();
            default:
                return startRetrieveRequest();
        }
    },
    finishRequest: (reqType = requestType.retrieveRequest) => {
        switch (reqType) {
            case requestType.modalRequest:
                return finishModalRequest();
            case requestType.updateRequest:
                return finishUpdateRequest();
            default:
                return finishRetrieveRequest();
        }
    },
    setError: (error) => {
        // callNotification("error", error);
        return ({
            type: types.SET_ERROR,
            error
        })
    },
    removeError: () => ({
        type: types.REMOVE_ERROR
    }),
    setConnectError: () => ({
        type: types.SET_CONNECT_ERROR
    }),
    removeConnectError: () => ({
        type: types.REMOVE_CONNECT_ERROR,
    })
}


const startModalRequest = () => ({
    type: types.START_MODAL_REQUEST,
});
const finishModalRequest = () => ({
    type: types.FINISH_MODAL_REQUEST,
});

const startRetrieveRequest = () => ({
    type: types.START_RETRIEVE_REQUEST
});

const finishRetrieveRequest = () => ({
    type: types.FINISH_RETRIEVE_REQUEST
});

const startUpdateRequest = () => ({
    type: types.START_UPDATE_REQUEST
});

const finishUpdateRequest = () => ({
    type: types.FINISH_UPDATE_REQUEST
});

//reducers
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case types.START_RETRIEVE_REQUEST:
            //每接收一个API请求开始的action，requestQuantity+1
            return { ...state, retrieceRequestQuantity: state.retrieceRequestQuantity + 1 };
        case types.FINISH_RETRIEVE_REQUEST:
            // 每接收一个API请求结束的action，requestQuantity减1
            return { ...state, retrieceRequestQuantity: state.retrieceRequestQuantity <= 0 ? 0 : state.retrieceRequestQuantity - 1 };
        case types.START_UPDATE_REQUEST:
            return { ...state, updateRequestQuantity: state.updateRequestQuantity + 1 };
        case types.FINISH_UPDATE_REQUEST:
            return { ...state, updateRequestQuantity: state.updateRequestQuantity <= 0 ? 0 : state.updateRequestQuantity - 1 };
        case types.SET_ERROR:
            return { ...state, error: action.error };
        case types.REMOVE_ERROR:
            return { ...state, error: null };
        case types.START_MODAL_REQUEST:
            return { ...state, modalRequestQuantity: state.modalRequestQuantity + 1 };
        case types.FINISH_MODAL_REQUEST:
            return { ...state, modalRequestQuantity: state.modalRequestQuantity <= 0 ? 0 : state.modalRequestQuantity - 1 };
        case types.SET_CONNECT_ERROR:
            return { ...state, connectError: true };
        case types.REMOVE_CONNECT_ERROR:
            return { ...state, connectError: false };
        default:
            return state;
    }
}

export default reducer;

//selectors
export const getError = (state) => state.app.error;
export const getRetrieveRequestQuantity = (state) => state.app.retrieceRequestQuantity;
export const getUpdateRequestQuantity = (state) => state.app.updateRequestQuantity;
export const getModalRequestQuantity = (state) => state.app.modalRequestQuantity;
export const getConnectError = (state) => state.app.connectError;