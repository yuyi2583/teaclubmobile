import React, { Component } from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { Card, WingBlank, ActivityIndicator, Flex, Modal } from "@ant-design/react-native";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actions as orderActions, getReservationOrders, getByReservationOrders } from "../../../../redux/modules/order";
import { actions as boxActions, getByBoxes } from "../../../../redux/modules/box";
import { actions as customerActions, getByCustomerFaces, getByCustomers, getCustomerFaces, getCustomers, getCurrentCustomer } from "../../../../redux/modules/customer";
import { convertTimestampToHHMM,convertTimestampToYYYYMMDD ,timeStampConvertToFormatTime} from "../../../../utils/timeUtils";
import { orderStatus } from "../../../../utils/common";
import { Link } from "react-router-native";
import { matchUrl } from "../../../../utils/commonUtils";

class ReservationList extends Component {

    state = {
        refreshing: false,
        page: 0,
        isBottom: false
    }

    onRefresh = () => {
        const { uid, type } = this.props.match.params;
        const { currentCustomer } = this.props;
        if (currentCustomer.customerId) {
            this.setState({ refreshing: true })
            this.props.resetOrders();
            this.props.fetchCustomerReservations(currentCustomer.customerId, 0)
                .then(() => {
                    this.setState({ refreshing: false, page: 0 })
                })
                .catch(err => {
                    this.setState({ refreshing: false });
                    this.props.toast("fail", err, 6);
                })
        } else {
            Modal.alert(
                "未注册用户",
                "该用户未注册，暂无预约信息"
            )
        }
    };

    componentDidMount() {
        const { currentCustomer } = this.props;
        const { page } = this.state;
        if (currentCustomer.customerId) {
            this.setState({ refreshing: true })
            this.props.resetOrders();
            this.props.fetchCustomerReservations(currentCustomer.customerId, page)
                .then(() => {
                    this.setState({ refreshing: false })
                })
                .catch(err => {
                    this.setState({ refreshing: false });
                    this.props.toast("fail", err, 6);
                })
        }
    }

    // 监听上拉触底
    _contentViewScroll = (e) => {
        let offsetY = e.nativeEvent.contentOffset.y; //滑动距离
        let contentSizeHeight = e.nativeEvent.contentSize.height; //scrollView contentSize高度
        let oriageScrollHeight = e.nativeEvent.layoutMeasurement.height; //scrollView高度
        if (offsetY + oriageScrollHeight >= contentSizeHeight - 10) {
            const { page, isBottom } = this.state;
            const { currentCustomer } = this.props;
            if (currentCustomer.customerId && !isBottom) {
                this.setState({ refreshing: true })
                this.props.fetchCustomerReservations(currentCustomer.customerId, page + 1)
                    .then((res) => {
                        this.setState({ refreshing: false })
                        if (res.length == 0) {
                            this.props.toast("fail", "没有更多了...", 6);
                            this.setState({ isBottom: true })
                        } else {
                            this.setState({ page: page + 1 })
                        }
                    })
                    .catch(err => {
                        this.setState({ refreshing: false })
                        this.props.toast("fail", err, 6);
                    })
            }
        }
    };

    componentWillUnmount() {
        this.props.resetOrders();
    }

    render() {
        const { byCustomers, byReservationOrders, byCustomerFaces, byReservations, byBoxes, reservationOrders } = this.props;
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
                    style={{ height: "100%", marginBottom: 50 }}
                    onMomentumScrollEnd={this._contentViewScroll}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={this.onRefresh} />
                    }>
                    {reservationOrders.length == 0 ?
                        <Text style={{ textAlign: "center", marginTop: 10 }}>此用户暂无订单信息...</Text>
                        : reservationOrders.map((uid) => {
                            if (byReservationOrders[uid] == undefined) {
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
                                                title={timeStampConvertToFormatTime(byReservationOrders[uid].orderTime)}
                                                extra={`编号${uid} 状态：${orderStatus[byReservationOrders[uid].status.status]}`}
                                            />
                                            <Card.Body>
                                                <Flex direction="column" style={{ alignItems: "flex-start", margin: 16 }}>
                                                    {
                                                       
                                                            <>
                                                                <Text>包厢预约：{byReservationOrders[uid].reservations[0].box.name}</Text>
                                                                <Text>时间段：</Text>
                                                                {
                                                                    byReservationOrders[uid].reservations.map((reservation, index) => (
                                                                    <Text key={index}>{convertTimestampToYYYYMMDD(reservation.reservationTime)} {convertTimestampToHHMM(reservation.reservationTime)}~{convertTimestampToHHMM(reservation.reservationTime + byReservationOrders[uid].reservations[0].box.duration * 1000 * 60)}</Text>
                                                                    ))
                                                                }

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
        reservationOrders: getReservationOrders(state),
        byReservationOrders: getByReservationOrders(state),
        byBoxes: getByBoxes(state),
        currentCustomer: getCurrentCustomer(state),
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(customerActions, dispatch),
        ...bindActionCreators(orderActions, dispatch),
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(ReservationList);