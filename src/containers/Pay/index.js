import React, { Component } from "react";
import { View, Text, Image } from "react-native";
import { Tabs, Button, InputItem } from "@ant-design/react-native";
import { ws } from "../../utils/url";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actions as newOrderActions } from "../../redux/modules/newOrder";
import { actions as customerActions } from "../../redux/modules/customer";
import { matchUrl } from "../../utils/commonUtils";
import { WebSocketBalanceConnect } from "../../utils/websocket";

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
        const { customerId, type } = this.props.match.params;
        WebSocketBalanceConnect(customerId, type, this.props);
    }


    pay = () => {
        const { customerId } = this.props.match.params;
        const { value } = this.state;
        this.props.pay(customerId, value)
            .then(() => {
                this.props.toast("success", "支付成功", 6);
            })
            .catch(err => {
                this.props.toast("fail", err, 6)
            });
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
        ...bindActionCreators(customerActions, dispatch),
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(Pay);