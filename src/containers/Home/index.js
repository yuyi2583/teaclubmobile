import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { Flex, Tabs, Card, WhiteSpace, WingBlank, InputItem, Icon } from "@ant-design/react-native";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actions as customersActions, getByCustomers, getCustomers, getByCustomerFaces, getCustomerFaces, getSearchCustomers, getBySearchCustomers } from "../../redux/modules/customer";
import CustomerFace from "./components/CustomerFace";
import { Switch, Route, Link, BackButton } from "react-router-native";
import connectRoute from "../../utils/connectRoute";
import asyncComponent from "../../utils/AsyncComponent";
import { ws } from "../../utils/url";


const AsyncCustomer = connectRoute(asyncComponent(() => import("../Customer")));
const AsyncOrderDetail = connectRoute(asyncComponent(() => import("../OrderDetail")));
const AsyncBoxList = connectRoute(asyncComponent(() => import("../BoxList")));
const AsyncBoxDetail = connectRoute(asyncComponent(() => import("../BoxDetail")));
const AsyncPay = connectRoute(asyncComponent(() => import("../Pay")));

const tabs = [
    { title: '当前店内顾客' },
    { title: '搜索客户' },
];
const style = {
    alignItems: 'center',
    justifyContent: "flex-start",
    height: "100%",
    backgroundColor: '#fff',
};

class Home extends React.Component {
    state = {
        searchText: "",
    }

    componentDidMount() {
        this.WebSocketBoxConnect();
        this.WebSocketFaceConnect();
    }

    WebSocketFaceConnect = () => {
        var wsface = new WebSocket(ws.face(this.props.user.uid));
        wsface.onopen = () => {
            // connection opened
            wsface.send('something'); // send a message
        };

        wsface.onmessage = (e) => {
            // a message was received
            console.log("wsface receive message", JSON.parse(e.data));
            this.props.receieveCustomerFaces(JSON.parse(e.data));
        };

        wsface.onerror = (e) => {
            // an error occurred
            console.log("wsface websocket error", e.message);
        };

        wsface.onclose = (e) => {
            // connection closed
            console.log("wsface websocket close", e.code, e.reason);
        };
    }

    WebSocketBoxConnect = () => {
        var wsbox = new WebSocket(ws.box(this.props.user.shop.uid));
        wsbox.onopen = () => {
            // connection opened
            wsbox.send('something'); // send a message
        };

        wsbox.onmessage = (e) => {
            // a message was received
            console.log("wsbox receive message", JSON.parse(e.data));
            // this.props.receieveCustomerFaces(JSON.parse(e.data));
        };

        wsbox.onerror = (e) => {
            // an error occurred
            console.log("wsbox websocket error", e.message);
        };

        wsbox.onclose = (e) => {
            // connection closed
            console.log("wsbox websocket close", e.code, e.reason);
        };
    }

    searchCustomer = () => {
        const { searchText } = this.state;
        console.log("searchText");
        this.props.searchCustomer(searchText)
            .then(() => {

            })
            .catch(err => {
                this.props.toast("fail", err, 6);
            })
    }

    render() {
        const { customers, byCustomers, user, customerFaces, byCustomerFaces, match, searchCustomers, bySearchCustomers } = this.props;
        return (
            <Flex style={{ width: "100%", height: "100%" }}>
                <Flex.Item style={{ flex: 2, height: "100%" }}>
                    <Switch>
                        <BackButton>
                            <Route
                                path={match.url}
                                exact
                                render={props =>
                                    <AsyncBoxList {...props} />
                                }
                            />
                            <Route
                                path={`${match.url}/customer/:type/:uid`}
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
                            <Route
                                path={`${match.url}/box/:boxId`}
                                render={props =>
                                    <AsyncBoxDetail {...props} />
                                }
                            />
                            <Route
                                path={`${match.url}/pay/:customerId`}
                                render={props =>
                                    <AsyncPay {...props} />
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
                                                    onPress={() => {
                                                        this.props.setCurrentCustomer(uid,"face");
                                                        this.props.fetchCustomer(uid,"face");
                                                    }}
                                                    to={`${match.url}/customer/face/${uid}`} >
                                                    <CustomerFace content={byCustomerFaces[uid]} />
                                                </Link>
                                            ))
                                        }
                                    </ScrollView>
                                </View>
                                <View style={style}>
                                    <Flex direction="column" style={{ width: "100%", height: "100%" }}>
                                        <Flex.Item style={{ width: "100%" }}>
                                            <InputItem
                                                clear
                                                value={this.state.searchText}
                                                onChange={value => {
                                                    this.setState({
                                                        searchText: value,
                                                    });
                                                }}
                                                extra={
                                                    <TouchableOpacity onPress={this.searchCustomer}>
                                                        <Icon name="search" />
                                                    </TouchableOpacity>
                                                }
                                                placeholder="客户信息"
                                            />
                                        </Flex.Item>
                                        <Flex.Item style={{ flex: 11, width: "100%" }}>
                                            <ScrollView style={{ height: "100%" }}>
                                                {
                                                    searchCustomers.map(uid => (
                                                        <Link
                                                            key={uid}
                                                            component={TouchableOpacity}
                                                            onPress={() => {
                                                                this.props.setCurrentCustomer(uid,"search");
                                                                this.props.fetchCustomer(uid,"search");
                                                            }}
                                                            to={`${match.url}/customer/search/${uid}`} >
                                                            <CustomerFace content={bySearchCustomers[uid]} />
                                                        </Link>
                                                    ))
                                                }
                                            </ScrollView>
                                        </Flex.Item>
                                    </Flex>


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
        searchCustomers: getSearchCustomers(state),
        bySearchCustomers: getBySearchCustomers(state),
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(customersActions, dispatch),
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(Home);