import React from "react";
import { TouchableOpacity } from "react-native";
import {Icon } from "@ant-design/react-native";

function BackArrow(props) {
    return (
        <TouchableOpacity onPress={() => props.history.replace(props.location.state.from)}>
            <Icon name="arrow-left" color="black" />
        </TouchableOpacity>
    )
}

export default BackArrow;