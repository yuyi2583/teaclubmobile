import React, { Component } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Flex, Icon, InputItem, Accordion, List, Button, ActivityIndicator, Portal } from "@ant-design/react-native";
import BackArrow from "../../components/BackArrow";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actions as customerActions, getCurrentCustomer } from "../../redux/modules/customer";
import { actions as orderActions, getByOrders, getOrders, getByProducts } from "../../redux/modules/order";
import { getByBoxes } from "../../redux/modules/box";
import { deliverMode, orderStatus } from "../../utils/common";
import { timeStampConvertToFormatTime,convertTimestampToHHMM,convertTimestampToYYYYMMDD } from "../../utils/timeUtils";
import { Link } from "react-router-native";

class OrderDetail extends Component {

    state = {
        activeSections: [0],
    };

    onChange = activeSections => {
        this.setState({ activeSections });
    };

    componentDidMount() {
        const { orderId } = this.props.match.params;
        this.props.fetchOrder(orderId)
            .catch(err => {
                this.props.toast("fail", err.error);
            })

    }

    getAmountDisplay = () => {
        const { orderId } = this.props.match.params;
        const { byOrders } = this.props;
        let display = "";
        try {
            const { ingot, credit } = byOrders[orderId].amount;
            if (ingot != 0) {
                display += ingot + "元宝";
            }
            if (credit != 0) {
                display += credit + "积分";
            }
            if (ingot == 0 && credit == 0) {
                display = 0;
            }
        } catch (err) {
            console.log(err);
        }
        return display;
    }

    getButton = () => {
        const { orderId } = this.props.match.params;
        const { orders, byOrders, byProducts } = this.props;
        const { status } = byOrders[orderId].status;
        const { deliverMode } = byOrders[orderId];
        let button = null;
        if (status != "unpayed")
            if (deliverMode == "selfPickUp") {
                button = ""//TODO
            }
    }

    //买家提货
    // pickUp = () => {
    //     const { orderId } = this.props.match.params;
    //     const { user } = this.props;
    //     console.log("pick up", orderId, user);
    //     Alert.alert(
    //         "确认？",
    //         "确认买家已提货？",
    //         [
    //             {
    //                 text: "取消",
    //                 style: "cancel"
    //             },
    //             {
    //                 text: "确认", onPress: () => {
    //                     this.props.customerPickUp(orderId, user)
    //                         .then(() => {

    //                         })
    //                         .catch(err => {
    //                             this.props.toast("fail", err);
    //                         })
    //                 }
    //             }
    //         ],
    //         { cancelable: false }
    //     );
    // }

    payOrder = () => {
        const { orderId } = this.props.match.params;
        const { currentCustomer } = this.props;
        const key = this.props.toast("loading", 'Loading....', 0);
        const { customerId } = currentCustomer;
        this.props.payOrder(customerId, orderId)
            .then(() => {
                Portal.remove(key);
                this.props.toast("success", "付款成功");
            })
            .catch(err => {
                console.log(err);
                Portal.remove(key);
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
                                    this.props.history.push(`/mobile/pay/${customerId}`);
                                }
                            }
                        ],
                        { cancelable: false }
                    );
                    return;
                } else {
                    this.props.toast("fail", err.error, 8);
                }
            })
    }

    render() {
        const { orderId } = this.props.match.params;
        const { orders, byOrders, byProducts, byBoxes, currentCustomer } = this.props;
        if (byOrders[orderId] == undefined) {
            return (
                <View style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" />
                </View>
            )
        }
        const amountDisplay = this.getAmountDisplay();
        const isReservation = byOrders[orderId].reservations.length > 0;
        const { customerId } = currentCustomer;
        console.log("order id", orderId);
        return (
            <Flex direction="column" style={{ width: "100%", height: "100%", justifyContent: "flex-start" }}>
                <Flex.Item style={{ width: "100%", flex: 1 }}>
                    <Flex style={{ width: "100%", height: "100%", alignItems: "center" }}>
                        <BackArrow {...this.props} />
                        <Text style={{ marginLeft: 10, fontSize: 18 }}>订单详情</Text>
                    </Flex>
                </Flex.Item>
                <Flex.Item style={{ flex: 11, width: "100%" }}>
                    <ScrollView>
                        <Accordion
                            onChange={this.onChange}
                            activeSections={this.state.activeSections}
                        >
                            <Accordion.Panel header="订单信息">
                                <List>
                                    <List.Item>
                                        <Flex>
                                            <Flex.Item>
                                                <Text>订单编号</Text>
                                            </Flex.Item>
                                            <Flex.Item style={{ flex: 3 }}>
                                                <Text>{orderId}</Text>
                                            </Flex.Item>
                                        </Flex>
                                    </List.Item>
                                    <List.Item>
                                        <Flex>
                                            <Flex.Item>
                                                <Text>订单状态</Text>
                                            </Flex.Item>
                                            <Flex.Item style={{ flex: byOrders[orderId].deliverMode == "selfPickUp" && byOrders[orderId].status.status == "payed" ? 2 : 3 }}>
                                                <Flex>
                                                    <Text>{orderStatus[byOrders[orderId].status.status]}{byOrders[orderId].status.processer == null ? null : `(处理人:${byOrders[orderId].status.processer.name})`}</Text>
                                                    {byOrders[orderId].status.status == "unpay" ?
                                                        <TouchableOpacity onPress={this.payOrder}>
                                                            <Text style={{ marginLeft: 15, textDecorationLine: "underline", textDecorationColor: "#108EE9", color: "#108EE9" }}>付款</Text>
                                                        </TouchableOpacity> : null}
                                                </Flex>
                                            </Flex.Item>
                                            {
                                                // byOrders[orderId].deliverMode == "selfPickUp" && byOrders[orderId].status.status == "payed" ?
                                                //     <Flex.Item>
                                                //         <Button type="primary" size="small" style={{ width: 80 }} onPress={this.pickUp}>提货</Button>
                                                //     </Flex.Item> : null
                                            }
                                        </Flex>
                                    </List.Item>
                                    <List.Item>
                                        <Flex>
                                            <Flex.Item>
                                                <Text>提单时间</Text>
                                            </Flex.Item>
                                            <Flex.Item style={{ flex: 3 }}>
                                                <Text>{timeStampConvertToFormatTime(byOrders[orderId].orderTime)}</Text>
                                            </Flex.Item>
                                        </Flex>
                                    </List.Item>
                                    <List.Item>
                                        <Flex>
                                            <Flex.Item>
                                                <Text>订单类型</Text>
                                            </Flex.Item>
                                            <Flex.Item style={{ flex: 3 }}>
                                                <Text>{isReservation ? "包厢预约" : "产品购买"}</Text>
                                            </Flex.Item>
                                        </Flex>
                                    </List.Item>
                                    {isReservation ? null :
                                        <List.Item>
                                            <Flex>
                                                <Flex.Item>
                                                    <Text>下单地点</Text>
                                                </Flex.Item>
                                                <Flex.Item style={{ flex: 3 }}>
                                                    <Text>{byOrders[orderId].deliverMode != null ? "线上" : byOrders[orderId].boxOrder != null ? `包厢 ${byOrders[orderId].boxOrder.name}` : `门店 ${byOrders[orderId].placeOrderWay.name}`}</Text>
                                                </Flex.Item>
                                            </Flex>
                                        </List.Item>}
                                    {byOrders[orderId].deliverMode == null ? null : <List.Item>
                                        <Flex>
                                            <Flex.Item>
                                                <Text>配送方式</Text>
                                            </Flex.Item>
                                            <Flex.Item style={{ flex: 3 }}>
                                                <Text>{deliverMode[byOrders[orderId].deliverMode]}</Text>
                                            </Flex.Item>
                                        </Flex>
                                    </List.Item>}
                                    {
                                        byOrders[orderId].buyerPs == null || byOrders[orderId].buyerPs == "" ? null :
                                            <List.Item>
                                                <Flex>
                                                    <Flex.Item>
                                                        <Text>买家留言</Text>
                                                    </Flex.Item>
                                                    <Flex.Item style={{ flex: 3 }}>
                                                        <Text>{byOrders[orderId].buyerPs}</Text>
                                                    </Flex.Item>
                                                </Flex>
                                            </List.Item>
                                    }
                                    {
                                        byOrders[orderId].buyerRefundReason == null ? null :
                                            <List.Item>
                                                <Flex>
                                                    <Flex.Item>
                                                        <Text>买家退款原因</Text>
                                                    </Flex.Item>
                                                    <Flex.Item style={{ flex: 3 }}>
                                                        <Text>{byOrders[orderId].buyerRefundReason}</Text>
                                                    </Flex.Item>
                                                </Flex>
                                            </List.Item>
                                    }
                                    {
                                        byOrders[orderId].sellerPs == null ? null :
                                            <List.Item>
                                                <Flex>
                                                    <Flex.Item>
                                                        <Text>卖家留言</Text>
                                                    </Flex.Item>
                                                    <Flex.Item style={{ flex: 3 }}>
                                                        <Text>{byOrders[orderId].sellerPs}</Text>
                                                    </Flex.Item>
                                                </Flex>
                                            </List.Item>
                                    }
                                </List>
                            </Accordion.Panel>
                            <Accordion.Panel header="提单人信息">
                                <List>
                                    <List.Item>
                                        <Flex>
                                            <Flex.Item>
                                                <Text>姓名</Text>
                                            </Flex.Item>
                                            <Flex.Item style={{ flex: 3 }}>
                                                <Text>{currentCustomer.name}</Text>
                                            </Flex.Item>
                                        </Flex>
                                    </List.Item>
                                    <List.Item>
                                        <Flex>
                                            <Flex.Item>
                                                <Text>联系方式</Text>
                                            </Flex.Item>
                                            <Flex.Item style={{ flex: 3 }}>
                                                <Text>{currentCustomer.contact}</Text>
                                            </Flex.Item>
                                        </Flex>
                                    </List.Item>
                                </List>
                            </Accordion.Panel>
                            {isReservation?<Text style={{ width: 0, height: 0 }}></Text>:
                            byOrders[orderId].deliverMode == "delivery" ?
                                <Accordion.Panel header="收件人信息">
                                    <List>
                                        <List.Item>
                                            <Flex>
                                                <Flex.Item>
                                                    <Text>姓名</Text>
                                                </Flex.Item>
                                                <Flex.Item style={{ flex: 3 }}>
                                                    <Text>{byOrders[orderId].address.name}</Text>
                                                </Flex.Item>
                                            </Flex>
                                        </List.Item>
                                        <List.Item>
                                            <Flex>
                                                <Flex.Item>
                                                    <Text>联系方式</Text>
                                                </Flex.Item>
                                                <Flex.Item style={{ flex: 3 }}>
                                                    <Text>{byOrders[orderId].address.phone}</Text>
                                                </Flex.Item>
                                            </Flex>
                                        </List.Item>
                                        <List.Item>
                                            <Flex>
                                                <Flex.Item>
                                                    <Text>收货地址</Text>
                                                </Flex.Item>
                                                <Flex.Item style={{ flex: 3 }}>
                                                    <Text>{`${byOrders[orderId].address.province} ${byOrders[orderId].address.city} ${byOrders[orderId].address.district} ${byOrders[orderId].address.detail} `}</Text>
                                                </Flex.Item>
                                            </Flex>
                                        </List.Item>
                                    </List>
                                </Accordion.Panel> : <Text style={{ width: 0, height: 0 }}></Text>}
                            {byOrders[orderId].boxOrder != null ? <Text style={{ width: 0, height: 0 }}></Text> : byOrders[orderId].deliverMode == "selfPickUp" ?
                                <Text style={{ width: 0, height: 0 }}></Text> : byOrders[orderId].trackInfo == null ? <Text style={{ width: 0, height: 0 }}></Text> :
                                    <Accordion.Panel header="配送信息">
                                        <List>
                                            <List.Item>
                                                <Flex>
                                                    <Flex.Item>
                                                        <Text>配送地址</Text>
                                                    </Flex.Item>
                                                    <Flex.Item style={{ flex: 3 }}>
                                                        <Text>{byOrders[orderId].address}</Text>
                                                    </Flex.Item>
                                                </Flex>
                                            </List.Item>
                                            {
                                                byOrders[orderId].trackInfo.companyName == null ?
                                                    <>
                                                        <List.Item>
                                                            <Flex>
                                                                <Flex.Item>
                                                                    <Text>联系方式</Text>
                                                                </Flex.Item>
                                                                <Flex.Item style={{ flex: 3 }}>
                                                                    <Text>{byOrders[orderId].trackInfo.phone}</Text>
                                                                </Flex.Item>
                                                            </Flex>
                                                        </List.Item>
                                                        <List.Item>
                                                            <Flex>
                                                                <Flex.Item>
                                                                    <Text>配送人员描述</Text>
                                                                </Flex.Item>
                                                                <Flex.Item style={{ flex: 3 }}>
                                                                    <Text>{byOrders[orderId].trackInfo.description}</Text>
                                                                </Flex.Item>
                                                            </Flex>
                                                        </List.Item>
                                                    </>
                                                    : <>
                                                        <List.Item>
                                                            <Flex>
                                                                <Flex.Item>
                                                                    <Text>物流公司</Text>
                                                                </Flex.Item>
                                                                <Flex.Item style={{ flex: 3 }}>
                                                                    <Text>{byOrders[orderId].trackInfo.companyName}</Text>
                                                                </Flex.Item>
                                                            </Flex>
                                                        </List.Item>
                                                        <List.Item>
                                                            <Flex>
                                                                <Flex.Item>
                                                                    <Text>快递单号</Text>
                                                                </Flex.Item>
                                                                <Flex.Item style={{ flex: 3 }}>
                                                                    <Text>{byOrders[orderId].trackInfo.trackingId}</Text>
                                                                </Flex.Item>
                                                            </Flex>
                                                        </List.Item>
                                                    </>
                                            }
                                        </List>
                                    </Accordion.Panel>
                            }
                            <Accordion.Panel header={
                                <Flex style={{ margin: 5, marginLeft: 0 }}>
                                    <Flex.Item style={{ flex: 2 }}>
                                        <Text style={{ fontSize: 17 }}>订单产品</Text>
                                    </Flex.Item>
                                    <Flex.Item>
                                        <Text style={{ fontSize: 17 }}>总价:{amountDisplay}</Text>
                                    </Flex.Item>
                                </Flex>
                            }>
                                <List>
                                    {isReservation ?
                                        <List.Item>
                                            <Flex>
                                                <Flex.Item>
                                                    <Text>包厢：{byOrders[orderId].reservations[0].box.name}</Text>
                                                </Flex.Item>
                                                <Flex.Item style={{ flex: 2 }} >
                                                    {
                                                        byOrders[orderId].reservations.map((reservation, index) => (
                                                        <Text key={index}>{convertTimestampToYYYYMMDD(reservation.reservationTime)} {convertTimestampToHHMM(reservation.reservationTime)}~{convertTimestampToHHMM(reservation.reservationTime + byOrders[orderId].reservations[0].box.duration * 1000 * 60)}</Text>
                                                        ))
                                                    }
                                                </Flex.Item>
                                            </Flex>
                                        </List.Item>
                                        : byOrders[orderId].products.length == 0 ?
                                            <List.Item>
                                                <Text>此订单无产品信息</Text>
                                            </List.Item>
                                            : byOrders[orderId].products.map(uid => (
                                                <List.Item key={uid}>
                                                    <Flex>
                                                        <Flex.Item style={{ flex: 2 }}>
                                                            <Text>{byProducts[uid].product.name}</Text>
                                                        </Flex.Item>
                                                        <Flex.Item >
                                                            <Text>{`x${byProducts[uid].number}`}</Text>
                                                        </Flex.Item>
                                                    </Flex>
                                                </List.Item>))}
                                </List>
                            </Accordion.Panel>
                        </Accordion>
                    </ScrollView>
                </Flex.Item>
            </Flex >
        )
    }
}


const mapStateToProps = (state, props) => {
    return {
        orders: getOrders(state),
        byOrders: getByOrders(state),
        byProducts: getByProducts(state),
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


export default connect(mapStateToProps, mapDispatchToProps)(OrderDetail);