import React, { Component } from "react";
import { Text, View, TouchableOpacity, Alert } from "react-native";
import { Card, WhiteSpace, WingBlank, Flex, Button, ActivityIndicator, Tabs, Icon } from "@ant-design/react-native";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actions as customerActions, getCustomers, getByCustomers, getByCustomerFaces, getCustomerFaces } from "../../redux/modules/customer";
import { actions as newOrderActions, getSelectedSlot } from "../../redux/modules/newOrder";
import { getByBoxes } from "../../redux/modules/box";
import OrderList from "./components/OrderList";
import { Link, Switch, Route, Redirect } from "react-router-native";
import { matchUrl } from "../../utils/commonUtils";
import connectRoute from "../../utils/connectRoute";
import asyncComponent from "../../utils/AsyncComponent";
import { timeStampConvertToFormatTime } from "../../utils/timeUtils";


const AsyncAddOrderEntry = connectRoute(asyncComponent(() => import("./components/AddOrderEntry")));
const AsyncBoxList = connectRoute(asyncComponent(() => import("../BoxList")));
const AsyncBoxDetail = connectRoute(asyncComponent(() => import("../BoxDetail")));


const tabs = [
    { title: '订单' },
    { title: '新增' },
];

const style = {
    alignItems: 'center',
    justifyContent: 'center',
    height: "100%",
    backgroundColor: '#fff',
};

class Customer extends Component {
    state = {
        hasRegister: true,
        redirectTo: null,
    }

    componentDidMount() {
        const { faceId } = this.props.match.params;
        console.log("in customer view", faceId);
        this.props.fetchCustomer(faceId)
            .then(() => {

            })
            .catch(err => {
                //TODO 网络问题的展示
            })
    }

    getButtonDispaly = () => {
        const { pathname } = this.props.location;
        var reservationRegex = /\/mobile\/customer\/\d+\/box\/\d+/;
        let display = null;
        if (reservationRegex.test(pathname)) {
            display = <Button type="primary" size="lg" style={{ width: 100, height: 30 }} onPress={this.reservation}>确认预约</Button>;
        }
        return display;

    }

    reservation = () => {
        const { pathname } = this.props.location;
        const pathnameSplit = pathname.split("/")
        const boxId = pathnameSplit[pathnameSplit.length - 1];
        const { currentCustomer, user, selectedSlot, byBoxes } = this.props;
        const { duration, price } = byBoxes[boxId];
        //TODO 区分是否注册
        if (selectedSlot.length == 0) {
            this.props.toast("info", "您未选择预约时间段");
            return;
        }
        const reservations = selectedSlot.map(reservationTime => ({ reservationTime, boxId }));
        let ingot = 0;
        let credit = 0;
        let confirmationDisplay = "预约以下时间段:\n";
        reservations.forEach(reservation => {
            ingot += price.ingot;
            credit += price.credit;
            confirmationDisplay += `${timeStampConvertToFormatTime(reservation.reservationTime)}~${timeStampConvertToFormatTime(reservation.reservationTime + duration * 1000 * 60)}\n`;
        })
        let amountDisplay = "";
        if (ingot != 0) {
            amountDisplay += `${ingot}元宝 `;
        }
        if (credit != 0) {
            amountDisplay += `${credit}积分`;
        }
        confirmationDisplay += `总价:${amountDisplay}`;
        const order = {
            customer: { uid: currentCustomer.customerId },
            clerk: { uid: user.uid, name: user.name },
            reservations
        }
        Alert.alert(
            "确认预约？",
            `${confirmationDisplay}`,
            [
                {
                    text: "取消",
                    style: "cancel"
                },
                {
                    text: "确认", onPress: () => {
                        this.props.reserve(order)
                            .then(() => {

                            })
                            .catch(err => {
                                console.log("err",err);
                                if (err.code == 500700) {//余额不足，跳转付费二维码
                                    Alert.alert(
                                        "余额不足",
                                        `${err.error}`,
                                        [
                                            {
                                                text: "取消",
                                                style: "cancel"
                                            },
                                            {
                                                text: "充值", onPress: () => {
                                                    this.props.resetAfterCompleteReservation();
                                                    this.props.history.push(`/mobile/pay/${currentCustomer.customerId}`);
                                                }
                                            }
                                        ],
                                        { cancelable: false }
                                    );
                                    return;
                                }
                                this.props.toast("fail", err.error, 8);
                            })
                    }
                }
            ],
            { cancelable: false }
        );
    }

    render() {
        const { byCustomerFaces, byCustomers } = this.props;
        const { faceId } = this.props.match.params;
        const customerId = byCustomerFaces[faceId].customerId;
        const hasRegister = customerId != undefined;
        const isDataNull = byCustomers[customerId] == undefined;
        const { redirectTo } = this.state;
        if (redirectTo) {
            return <Redirect
                to={{
                    pathname: redirectTo,
                    state: { from: this.props.location.pathname }
                }}
            />

        }
        //TODO 未注册用户
        if (isDataNull) {
            return (
                <View style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" />
                </View>
            )
        }
        const displayButton = this.getButtonDispaly();
        return (
            <Flex direction="column" style={{ width: "100%", height: "100%" }}>
                <Flex.Item style={{ flex: 1, width: "100%" }}>
                    <Card full style={{ height: "100%" }}>
                        <Card.Header
                            title={<WingBlank><Text>{hasRegister ? byCustomers[customerId].name : "未注册用户"}</Text></WingBlank>}
                            thumbStyle={{ width: 60, height: 60 }}
                            thumb={hasRegister ? byCustomers[customerId].avatar.photo : byCustomerFaces[faceId].image}
                            extra={
                                <WingBlank
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'flex-end',
                                        alignItems: 'center',
                                    }}
                                >
                                    {displayButton}
                                </WingBlank>
                            }
                        />
                    </Card>
                </Flex.Item>
                <Flex.Item style={{ flex: 5, width: "100%" }}>
                    <Tabs tabs={tabs}>
                        <View style={{ padding: 10 }}>
                            <Switch>
                                <Route
                                    path={this.props.match.url}
                                    exact
                                    render={props =>
                                        <AsyncAddOrderEntry {...props} {...this.props} />
                                    }
                                />
                                <Route
                                    path={`${this.props.match.url}/box`}
                                    exact
                                    render={props =>
                                        <AsyncBoxList {...props} customerId={customerId} />
                                    }
                                />
                                <Route
                                    path={`${this.props.match.url}/box/:boxId`}
                                    render={props =>
                                        <AsyncBoxDetail {...props} />
                                    }
                                />
                            </Switch>

                        </View>
                        <View>
                            <OrderList {...this.props} />
                        </View>
                    </Tabs>
                </Flex.Item>
            </Flex>
        )
    }
}

const mapStateToProps = (state, props) => {
    return {
        customers: getCustomers(state),
        byCustomers: getByCustomers(state),
        customerFaces: getCustomerFaces(state),
        byCustomerFaces: getByCustomerFaces(state),
        selectedSlot: getSelectedSlot(state),
        byBoxes: getByBoxes(state),
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(customerActions, dispatch),
        ...bindActionCreators(newOrderActions, dispatch),
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(Customer);