import React, { Component } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Card, WhiteSpace, WingBlank, Flex, Button, ActivityIndicator, Tabs, Icon } from "@ant-design/react-native";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actions as customerActions, getCustomers, getByCustomers, getByCustomerFaces, getCustomerFaces } from "../../redux/modules/customer";
import { actions as newOrderActions, getSelectedSlot } from "../../redux/modules/newOrder";
import OrderList from "./components/OrderList";
import { Link, Switch, Route } from "react-router-native";
import { matchUrl } from "../../utils/commonUtils";
import connectRoute from "../../utils/connectRoute";
import asyncComponent from "../../utils/AsyncComponent";


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
        "/mobile/customer/3/box/4"
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
        const { currentCustomer, user, selectedSlot } = this.props;
        //TODO 区分是否注册
        const reservations = selectedSlot.map(reservationTime => ({ reservationTime, boxId }))
        const order = {
            customer: { uid: currentCustomer.customerId },
            clerk: { uid: user.uid },
            reservations,
        }
        this.props.reserve(order)
            .then(() => {

            })
            .catch(err => {
                this.props.toast("fail", err);
            })
    }

    render() {
        const { byCustomerFaces, byCustomers } = this.props;
        const { faceId } = this.props.match.params;
        const customerId = byCustomerFaces[faceId].customerId;
        const hasRegister = customerId != undefined;
        const isDataNull = byCustomers[customerId] == undefined;
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
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(customerActions, dispatch),
        ...bindActionCreators(newOrderActions, dispatch),
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(Customer);