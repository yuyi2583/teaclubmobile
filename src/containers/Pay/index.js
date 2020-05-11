import React, { Component } from "react";
import { View, Text, Image } from "react-native";
import { Tabs, Button, InputItem } from "@ant-design/react-native";
import { ws } from "../../utils/url";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actions as newOrderActions } from "../../redux/modules/newOrder";
import {matchUrl} from "../../utils/commonUtils";

const tabs = [
    { title: '微信支付' },
    { title: '支付宝支付' },
];

const style = {
    alignItems: 'center',
    justifyContent: 'center',
    height: "100%",
    backgroundColor: '#fff',
};

class Pay extends Component {

    state = {
        value: 50,
    }

    componentDidMount() {
        this.WebSocketPayConnect()
    }

    WebSocketPayConnect = () => {
        const { customerId } = this.props.match.params;
        var wspay = new WebSocket(ws.pay(customerId));
        wspay.onopen = () => {
            // connection opened
            wspay.send('something'); // send a message
        };

        wspay.onmessage = (e) => {
            // a message was received
            const result = JSON.parse(e.data)
            console.log("wspay receive message", result);
            if (result.code == 200) {
                this.props.toast("success", result.data,6);
                this.props.history.goBack();
            }
        };

        wspay.onerror = (e) => {
            // an error occurred
            console.log("wspay websocket error", e.message);
        };

        wspay.onclose = (e) => {
            // connection closed
            console.log("wspay websocket close", e.code, e.reason);
        };
    }

    pay = () => {
        const { customerId } = this.props.match.params;
        const { value } = this.state;
        this.props.pay(customerId, value);
    }

    render() {
        const { value } = this.state;
        return (
            <View style={{ width: "100%", height: "100%" }}>
                <Tabs tabs={tabs}>
                    <View style={style}>
                        <Image source={require('../../assets/pay_wechat.png')} style={{ width: 300, height: 300 }} />
                    </View>
                    <View style={style}>
                        <Image source={require('../../assets/pay_ali.jpg')} style={{ width: 300, height: 300 }} />
                    </View>
                </Tabs>
                <InputItem
                    clear
                    type="number"
                    value={this.state.value}
                    onChange={value => {
                        this.setState({
                            value,
                        });
                    }}
                    placeholder="充值金额"
                    extra="元"
                />
                <Button type="primary" onPress={this.pay}>模拟支付</Button>
            </View>
        )
    }
}

const mapStateToProps = (state, props) => {
    return {
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(newOrderActions, dispatch),
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(Pay);