import React, { Component } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Flex, Icon, InputItem, Accordion, List, Button } from "@ant-design/react-native";
import BackArrow from "../../components/BackArrow";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actions as orderActions, getByOrders, getOrders, getByProducts } from "../../redux/modules/order";
import { getByBoxes } from "../../redux/modules/box";
import { deliverMode, orderStatus } from "../../utils/common";
import { timeStampConvertToFormatTime } from "../../utils/timeUtils";
import { Link } from "react-router-native";

class OrderDetail extends Component {

    state = {
        activeSections: [0],
    };

    onChange = activeSections => {
        this.setState({ activeSections });
    };

    getAmountDisplay = () => {
        const { orderId } = this.props.match.params;
        const { byOrders } = this.props;
        const { ingot, credit } = byOrders[orderId].amount;
        let display = "";
        if (ingot != 0) {
            display += ingot + "元宝";
        }
        if (credit != 0) {
            display += credit + "积分";
        }
        if (ingot == 0 && credit == 0) {
            display = 0;
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
                button = ""
            }
    }

    //买家提货
    pickUp = () => {
        const { orderId } = this.props.match.params;
        const { user } = this.props;
        console.log("pick up", orderId, user);
        Alert.alert(
            "确认？",
            "确认买家已提货？",
            [
                {
                    text: "取消",
                    style: "cancel"
                },
                {
                    text: "确认", onPress: () => {
                        this.props.customerPickUp(orderId, user)
                            .then(() => {

                            })
                            .catch(err => {
                                this.props.toast("fail", err);
                            })
                    }
                }
            ],
            { cancelable: false }
        );
    }

    render() {
        const { orderId } = this.props.match.params;
        const { orders, byOrders, byProducts, byBoxes } = this.props;
        const amountDisplay = this.getAmountDisplay();
        const isReservation = byOrders[orderId].reservations.length > 0;
        const customerId = byOrders[orderId].customer.uid;
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
                                                <Text>订单状态</Text>
                                            </Flex.Item>
                                            <Flex.Item style={{ flex: byOrders[orderId].deliverMode == "selfPickUp" && byOrders[orderId].status.status == "payed" ? 2 : 3 }}>
                                                <Flex>
                                                    <Text>{orderStatus[byOrders[orderId].status.status]}(处理人:{byOrders[orderId].status.processer.name})</Text>
                                                    {byOrders[orderId].status.status=="unpay"?
                                                    <TouchableOpacity onPress={() => this.props.history.push(`/mobile/pay/${customerId}`)}>
                                                        <Text style={{ marginLeft: 15, textDecorationLine: "underline", textDecorationColor: "#108EE9", color: "#108EE9" }}>付款</Text>
                                                    </TouchableOpacity>:null}
                                                </Flex>
                                            </Flex.Item>
                                            {
                                                byOrders[orderId].deliverMode == "selfPickUp" && byOrders[orderId].status.status == "payed" ?
                                                    <Flex.Item>
                                                        <Button type="primary" size="small" style={{ width: 80 }} onPress={this.pickUp}>提货</Button>
                                                    </Flex.Item> : null
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
                                    <List.Item>
                                        <Flex>
                                            <Flex.Item>
                                                <Text>下单地点</Text>
                                            </Flex.Item>
                                            <Flex.Item style={{ flex: 3 }}>
                                                <Text>{byOrders[orderId].placeOrderWay == null ? "线上" : `门店${byOrders[orderId].placeOrderWay.name}`}</Text>
                                            </Flex.Item>
                                        </Flex>
                                    </List.Item>
                                    <List.Item>
                                        <Flex>
                                            <Flex.Item>
                                                <Text>配送方式</Text>
                                            </Flex.Item>
                                            <Flex.Item style={{ flex: 3 }}>
                                                <Text>{deliverMode[byOrders[orderId].deliverMode]}</Text>
                                            </Flex.Item>
                                        </Flex>
                                    </List.Item>
                                    {
                                        byOrders[orderId].buyerPs == null ? null :
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
                                                <Text>{byOrders[orderId].customer.name}</Text>
                                            </Flex.Item>
                                        </Flex>
                                    </List.Item>
                                    <List.Item>
                                        <Flex>
                                            <Flex.Item>
                                                <Text>联系方式</Text>
                                            </Flex.Item>
                                            <Flex.Item style={{ flex: 3 }}>
                                                <Text>{byOrders[orderId].customer.contact}</Text>
                                            </Flex.Item>
                                        </Flex>
                                    </List.Item>
                                </List>
                            </Accordion.Panel>
                            {byOrders[orderId].deliverMode == "selfPickUp" ?
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
                                                    <Text>包厢：{byBoxes[byOrders[orderId].reservations[0].boxId].name}</Text>
                                                </Flex.Item>
                                                <Flex.Item style={{ flex: 2 }} >
                                                    {
                                                        byOrders[orderId].reservations.map((reservation, index) => (
                                                            <Text key={index}>{timeStampConvertToFormatTime(reservation.reservationTime)}~{timeStampConvertToFormatTime(reservation.reservationTime + byBoxes[byOrders[orderId].reservations[0].boxId].duration * 1000 * 60)}</Text>
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
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(orderActions, dispatch),
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(OrderDetail);