import React, { Component } from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { Card, WingBlank, ActivityIndicator, Flex } from "@ant-design/react-native";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actions as orderActions, getByOrders, getOrders, getByProducts } from "../../../../redux/modules/order";
import { actions as boxActions, getByBoxes } from "../../../../redux/modules/box";
import { actions as customerActions, getByCustomerFaces, getByCustomers, getCustomerFaces, getCustomers } from "../../../../redux/modules/customer";
import { timeStampConvertToFormatTime } from "../../../../utils/timeUtils";
import { orderStatus } from "../../../../utils/common";
import { Link } from "react-router-native";
import { matchUrl } from "../../../../utils/commonUtils";

class OrderList extends Component {

    state = {
        refreshing: false
    }

    onRefresh = () => {
        this.setState({ refreshing: true })
        setTimeout(() => {
            this.setState({ refreshing: false })
        }, 2000);
    };

    render() {
        const { byCustomers, byOrders, byCustomerFaces, byProducts, byBoxes } = this.props;
        const { uid, type } = this.props.match.params;
        const customerId = type == "search" ? uid : byCustomerFaces[uid].customerId;
        const hasRegister = customerId != undefined;
        const isDataNull = byCustomers[customerId] == undefined;
        const { refreshing } = this.state;
        //未注册用户
        if (!hasRegister) {
            return (
                <View style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                    <Text>未注册客户,无记录...</Text>
                </View>
            )
        }
        if (isDataNull) {
            return (
                <View style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" />
                </View>
            )
        }
        return (
            <>
                <ScrollView
                    style={{ height: "100%" }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={this.onRefresh} />
                    }>
                    {byCustomers[customerId].orders.length == 0 ?
                        <Text style={{textAlign:"center",marginTop:10}}>此用户暂无订单信息...</Text>
                        : byCustomers[customerId].orders.map((uid) => {
                            if (byOrders[uid] == undefined) {
                                return null;
                            }
                            return (
                                <Link
                                    key={uid}
                                    to={{
                                        pathname: matchUrl.ORDERDETAIL(uid),
                                        state: { from: this.props.match.url }
                                    }}
                                    component={TouchableOpacity}>
                                    <WingBlank size="lg" style={{ marginTop: 10 }}>
                                        <Card >
                                            <Card.Header
                                                title={timeStampConvertToFormatTime(byOrders[uid].orderTime)}
                                                extra={`状态：${orderStatus[byOrders[uid].status.status]}`}
                                            />
                                            <Card.Body>
                                                <Flex direction="column" style={{ alignItems: "flex-start", margin: 16 }}>
                                                    {
                                                        byOrders[uid].reservations.length > 0 ?
                                                            <>
                                                                <Text>包厢预约：{byBoxes[byOrders[uid].reservations[0].boxId].name}</Text>
                                                                <Text>时间段：</Text>
                                                                {
                                                                    byOrders[uid].reservations.map((reservation, index) => (
                                                                        <Text key={index}>{timeStampConvertToFormatTime(reservation.reservationTime)}~{timeStampConvertToFormatTime(reservation.reservationTime + byBoxes[byOrders[uid].reservations[0].boxId].duration * 1000 * 60)}</Text>
                                                                    ))
                                                                }

                                                            </>
                                                            : byOrders[uid].products.length == 0 ?
                                                                <Text>无产品信息</Text> :
                                                                byOrders[uid].products.length <= 3 ?
                                                                    byOrders[uid].products.map(uid => (
                                                                        <Flex.Item key={uid}>
                                                                            <Flex direction="row" style={{ width: "100%" }}>
                                                                                <Flex.Item style={{ flex: 1 }}>
                                                                                    <Text>{byProducts[uid].product.name}</Text>
                                                                                </Flex.Item>
                                                                                <Flex.Item style={{ flex: 2 }}>
                                                                                    <Text>x{byProducts[uid].number}</Text>
                                                                                </Flex.Item>
                                                                            </Flex>
                                                                        </Flex.Item>
                                                                    ))
                                                                    : <>
                                                                        {byOrders[uid].products.filter((uid, index) => index < 3).map(uid => (
                                                                            <Flex.Item key={uid}>
                                                                                <Flex direction="row" style={{ width: "100%" }}>
                                                                                    <Flex.Item style={{ flex: 1 }}>
                                                                                        <Text>{byProducts[uid].product.name}</Text>
                                                                                    </Flex.Item>
                                                                                    <Flex.Item style={{ flex: 2 }}>
                                                                                        <Text>x{byProducts[uid].number}</Text>
                                                                                    </Flex.Item>
                                                                                </Flex>
                                                                            </Flex.Item>
                                                                        ))}
                                                                        < Flex.Item >
                                                                            <Text>......</Text>
                                                                        </Flex.Item>
                                                                    </>
                                                    }
                                                </Flex>
                                            </Card.Body>
                                        </Card>
                                    </WingBlank>
                                </Link>
                            )
                        })
                    }
                </ScrollView>
            </>
        )
    }
}


const mapStateToProps = (state, props) => {
    return {
        customers: getCustomers(state),
        byCustomers: getByCustomers(state),
        customerFaces: getCustomerFaces(state),
        byCustomerFaces: getByCustomerFaces(state),
        orders: getOrders(state),
        byOrders: getByOrders(state),
        byProducts: getByProducts(state),
        byBoxes: getByBoxes(state),
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(customerActions, dispatch),
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(OrderList);