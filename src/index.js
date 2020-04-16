import React from "react";
import { Provider } from "react-redux";
import { View, Text } from "react-native";
import configureStore from "./redux/configureStore";
import Test from "./test";

const store = configureStore();

export default function App() {
    return (
        <Provider store={store}>
            <Test />
        </Provider>
    )
}
