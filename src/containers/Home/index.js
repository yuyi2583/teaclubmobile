import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { Flex, Tabs, Card, WhiteSpace, WingBlank } from "@ant-design/react-native";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actions as customersActions, getByCustomers, getCustomers, getByCustomerFaces, getCustomerFaces } from "../../redux/modules/customer";
import { getUser } from "../../redux/modules/auth";
import CustomerFace from "./components/CustomerFace";
import { Switch, Route, Link, BackButton } from "react-router-native";
import connectRoute from "../../utils/connectRoute";
import asyncComponent from "../../utils/AsyncComponent";


const AsyncCustomer = connectRoute(asyncComponent(() => import("../Customer")));
const AsyncOrderDetail = connectRoute(asyncComponent(() => import("../OrderDetail")));

const tabs = [
    { title: '当前店内顾客' },
    { title: '订单' },
];
const style = {
    alignItems: 'center',
    justifyContent: "flex-start",
    height: "100%",
    backgroundColor: '#fff',
};

class Home extends React.Component {
    state = {
        ws: null,
    }

    componentDidMount() {
        var ws = new WebSocket(`ws://192.168.1.228:8080/websocket/${this.props.user.uid}`);
        ws.onopen = () => {
            // connection opened
            ws.send('something'); // send a message
        };

        ws.onmessage = (e) => {
            // a message was received
            console.log("receive message", JSON.parse(e.data));
            this.props.receieveCustomerFaces(JSON.parse(e.data));
        };

        ws.onerror = (e) => {
            // an error occurred
            console.log("websocket error", e.message);
        };

        ws.onclose = (e) => {
            // connection closed
            console.log("websocket close", e.code, e.reason);
        };
    }

    render() {
        const { customers, byCustomers, user, customerFaces, byCustomerFaces, match } = this.props;
        return (
            <Flex style={{ width: "100%", height: "100%" }}>
                <Flex.Item style={{ flex: 2, height: "100%" }}>
                    <Switch>
                        <BackButton>
                            <Route
                                path={match.url}
                                exact
                                render={props =>
                                    <Text>clerk view</Text>
                                }
                            />
                            <Route
                                path={`${match.url}/customer/:faceId`}
                                render={props =>
                                    <AsyncCustomer {...props} />
                                }
                            />
                            <Route
                                path={`${match.url}/order/:orderId`}
                                render={props =>
                                    <AsyncOrderDetail {...props} />
                                }
                            />
                        </BackButton>
                    </Switch>
                </Flex.Item>
                <Flex.Item style={{ flex: 1, height: "100%", borderLeftWidth: 1, borderColor: "black" }}>
                    <Flex direction="column" style={{ width: "100%", height: "100%" }}>
                        <View style={{ flex: 1, width: "100%", height: "100%" }}>
                            <Tabs tabs={tabs}>
                                <View style={style}>
                                    <ScrollView style={{ width: "100%" }}>
                                        {
                                            customerFaces.map(uid => (
                                                <Link
                                                    key={uid}
                                                    component={TouchableOpacity}
                                                    to={`${match.url}/customer/${uid}`} >
                                                    <CustomerFace content={byCustomerFaces[uid]} />
                                                </Link>
                                            ))
                                        }
                                    </ScrollView>
                                </View>
                                <View style={style}>
                                    <Text>订单</Text>
                                </View>
                            </Tabs>
                        </View>
                    </Flex>
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
        user: getUser(state),
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(customersActions, dispatch),
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(Home);