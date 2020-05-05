import React, { Component } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Card, WhiteSpace, WingBlank, Flex, Button, ActivityIndicator, Tabs, Icon } from "@ant-design/react-native";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actions as customerActions, getCustomers, getByCustomers, getByCustomerFaces, getCustomerFaces } from "../../redux/modules/customer";
import OrderList from "./components/OrderList";
import { Link, Switch, Route } from "react-router-native";
import { matchUrl } from "../../utils/commonUtils";
import connectRoute from "../../utils/connectRoute";
import asyncComponent from "../../utils/AsyncComponent";


const AsyncAddOrderEntry = connectRoute(asyncComponent(() => import("./components/AddOrderEntry")));
const AsyncBoxList = connectRoute(asyncComponent(() => import("../BoxList")));


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
                                ><Button type="primary" size="lg" style={{ width: 100, height: 30 }}>新增订单</Button>
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
                                    render={props =>
                                        <AsyncBoxList {...props} customerId={customerId}/>
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
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(customerActions, dispatch),
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(Customer);