import React, { Component } from 'react';
import { View, Text, Button, TouchableOpacity } from "react-native";
import { Flex } from "@ant-design/react-native";
import PropTypes from "prop-types";

const buttonStyle = {
    borderWidth: 1,
    borderColor: "#108EE9",
    width: 30,
    height: 30,
    justifyContent: "center",
    borderRadius: 5
};

class Stepper extends Component {

    plus = () => {
        const value = this.props.value
        if (value >= this.props.max) {
            return;
        }
        const { onChange } = this.props;
        if (onChange != null) {
            onChange(value + 1);
        }
    }

    minus = () => {
        const value = this.props.value;
        if (value <= this.props.min) {
            return;
        }
        const { onChange } = this.props;
        if (onChange != null) {
            onChange(value - 1);
        }
    }

    render() {
        const plusDisabled = this.props.value >= this.props.max;
        const minusDisabled = this.props.value <= this.props.min;
        return (
            <Flex style={{ width: "80%" }} justify="center" align="center">
                <Flex.Item style={{ alignItems: "center" }}>
                    <View style={{ ...buttonStyle, borderColor: minusDisabled ? "#DCDCDC" : "#108EE9", backgroundColor: minusDisabled ? "#DCDCDC" : "#fff" }}>
                        <TouchableOpacity onPress={this.minus} disabled={minusDisabled}>
                            <Text style={{ textAlign: "center" }}>-</Text>
                        </TouchableOpacity>
                    </View>
                </Flex.Item>
                <Flex.Item>
                    <Text style={{ textAlign: "center", width: "100%" }}>{this.props.value}</Text>
                </Flex.Item>
                <Flex.Item style={{ alignItems: "center" }}>
                    <TouchableOpacity onPress={this.plus} disabled={plusDisabled}>
                        <View style={{ ...buttonStyle, borderColor: plusDisabled ? "#DCDCDC" : "#108EE9", backgroundColor: plusDisabled ? "#DCDCDC" : "#fff" }}><Text style={{ textAlign: "center" }}>+</Text></View>
                    </TouchableOpacity>
                </Flex.Item>
            </Flex>
        )
    }
}

Stepper.propTypes = {
    max: PropTypes.number,
    min: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.number.isRequired
}

Stepper.defaultProps = {
    max: Infinity,
    min: -Infinity,
}

export default Stepper;