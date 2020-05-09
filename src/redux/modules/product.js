import { actions as appActions } from "./app";
import { actions as orderActions } from "./order";
import { post, get } from "../../utils/request";
import url from "../../utils/url";
import { storeData } from "../../utils/storage";
import { TOKEN } from "../../utils/common";
import { requestType } from "../../utils/common";

const initialState = {
    products: new Array(),
    byProducts: new Object(),
    byPhotos: new Object(),
    byActivityRules: new Object(),
    productTypes: new Array(),
    byProductTypes: new Object(),
}

//action types
export const types = {
    FETCH_PRODUCTS: "PRODUCT/FETCH_PRODUCTS",
};

//action creators
export const actions = {
    fetchProducts: (shopId) => {
        return (dispatch) => {
            dispatch(appActions.startRequest());
            return get(url.fetchProducts(shopId)).then((result) => {
                dispatch(appActions.finishRequest());
                if (!result.error) {
                    console.log("result.data", result.data)
                    dispatch(fetchProductsSuccess(convertProductsToPlainStructure(result.data)));
                    return Promise.resolve();
                } else {
                    console.log("result", result);
                    dispatch(appActions.setError(result.error));
                    return Promise.reject(result.error);
                }
            });
        }
    },
}

const convertProductsToPlainStructure = (data) => {
    let products = new Array();
    let byProducts = new Object();
    let byActivityRules = new Object();
    let byPhotos = new Object();
    let productTypes = new Array();
    let byProductTypes = new Object();
    data.forEach(product => {
        products.push(product.uid);
        let photos = new Array();
        product.photos.forEach(photo => {
            photos.push(photo.uid);
            if (!byPhotos[photo.uid]) {
                byPhotos[photo.uid] = {...photo,photo:`data:image/jpeg;base64,${photo.photo}`};
            }
        });
        let activityRules = new Array();
        product.activityRules.forEach(item => {
            activityRules.push(item.uid);
            if (!byActivityRules[item.uid]) {
                byActivityRules[item.uid] = item;
            }
        })
        if (productTypes.indexOf(product.type.uid) == -1) {
            productTypes.push(product.type.uid);
            byProductTypes[product.type.uid]=new Object();
            byProductTypes[product.type.uid].name = product.type.name;
            byProductTypes[product.type.uid].products = [product.uid];
        } else {
            byProductTypes[product.type.uid].products = byProductTypes[product.type.uid].products.concat([product.uid]);
        }
        if (!byProducts[product.uid]) {
            byProducts[product.uid] = { ...product, photos, activityRules };
        }
    })
    return {
        products,
        byProducts,
        byPhotos,
        byActivityRules,
        productTypes,
        byProductTypes
    }
}

const fetchProductsSuccess = ({ products, byPhotos, byProducts, byActivityRules, productTypes, byProductTypes }) => ({
    type: types.FETCH_PRODUCTS,
    products,
    byPhotos,
    byProducts,
    byActivityRules,
    productTypes,
    byProductTypes
})

//reducers
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_PRODUCTS:
            return {
                ...state, products: action.products,
                byPhotos: action.byPhotos, byProducts: action.byProducts,
                byActivityRules: action.byActivityRules, productTypes: action.productTypes, byProductTypes: action.byProductTypes
            };
        default:
            return state;
    }
}

export default reducer;

//selectors
export const getProducts = (state) => state.product.products;
export const getByProducts = (state) => state.product.byProducts;
export const getByPhotos = (state) => state.product.byPhotos;
export const getByActivityRules = (state) => state.product.byActivityRules;
export const getProductTypes = (state) => state.product.productTypes;
export const getByProductTypes = (state) => state.product.byProductTypes;
