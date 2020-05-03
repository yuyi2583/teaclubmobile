import React, { Component } from "react";
import { View, Text, ScrollView } from "react-native";
import { Card, WingBlank, ActivityIndicator } from "@ant-design/react-native";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actions as orderActions, getByOrders, getOrders } from "../../../../redux/modules/order";
import { actions as customerActions, getByCustomerFaces, getByCustomers, getCustomerFaces, getCustomers } from "../../../../redux/modules/customer";
import {timeStampConvertToFormatTime} from "../../../../utils/timeUtils";
import {orderStatus} from "../../../../utils/common";

class OrderList extends Component {



    render() {
        const { byCustomers, byOrders, byCustomerFaces } = this.props;
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
            <>
                <ScrollView style={{ height: "100%"}}>
                    {
                        byCustomers[customerId].orders.map((uid) => (
                            <WingBlank size="lg" key={uid} style={{marginTop:10}}>
                                <Card>
                                    <Card.Header
                                        title={timeStampConvertToFormatTime(byOrders[uid].orderTime)}
                                        extra={`状态：${orderStatus[byOrders[uid].status.status]}`}
                                    />
                                    <Card.Body>
                                        <View style={{ height: 42 }}>
                                            <Text style={{ marginLeft: 16 }}>Card Content</Text>
                                        </View>
                                    </Card.Body>
                                </Card>
                            </WingBlank>
                        ))
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
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(customerActions, dispatch),
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(OrderList);