import React, { Component } from "react";
import { Text, View, TouchableOpacity, Alert, ScrollView } from "react-native";
import { Card, WhiteSpace, WingBlank, Flex, Button, ActivityIndicator, Tabs, Icon, Badge, Modal, Result, Portal } from "@ant-design/react-native";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actions as customerActions, getCustomers, getByCustomers, getByCustomerFaces, getCustomerFaces } from "../../redux/modules/customer";
import { actions as newOrderActions, getSelectedSlot, getSelectedProduct } from "../../redux/modules/newOrder";
import { getByBoxes } from "../../redux/modules/box";
import { getByProducts, getByPhotos, getByActivityRules } from "../../redux/modules/product";
import OrderList from "./components/OrderList";
import { Link, Switch, Route, Redirect } from "react-router-native";
import { matchUrl } from "../../utils/commonUtils";
import connectRoute from "../../utils/connectRoute";
import asyncComponent from "../../utils/AsyncComponent";
import { timeStampConvertToFormatTime } from "../../utils/timeUtils";
import Stepper from "../../components/Stepper";


const AsyncAddOrderEntry = connectRoute(asyncComponent(() => import("./components/AddOrderEntry")));
const AsyncBoxList = connectRoute(asyncComponent(() => import("../BoxList")));
const AsyncBoxDetail = connectRoute(asyncComponent(() => import("../BoxDetail")));
const AsyncProductList = connectRoute(asyncComponent(() => import("../ProductList")));

const tabs = [
    { title: '新增' },
    { title: '订单' },
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
        visible: false
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
        var productRegex = /\/mobile\/customer\/\d+\/product\/\d+/;
        let display = null;
        if (reservationRegex.test(pathname)) {
            display = <Button type="primary" size="lg" style={{ width: 100, height: 30 }} onPress={this.reservation}>确认预约</Button>;
        } else if (productRegex.test(pathname)) {
            const { selectedProduct } = this.props;
            let count = 0;
            for (var i in selectedProduct) {
                count += selectedProduct[i];
            }
            display = (
                <TouchableOpacity onPress={() => this.setState({ visible: true })}>
                    <Badge text={count}>
                        <Icon name="shopping-cart" size="lg" color="#108EE9" />
                    </Badge>
                </TouchableOpacity>
            )
        }
        return display;

    }

    getAmountDisplay = () => {
        const { selectedProduct, byActivityRules, byProducts } = this.props;
        let activityBitmap = new Object();//用于记录已参与的活动
        let ingot = 0;
        let credit = 0;
        console.log("selected product", selectedProduct);
        for (var key in selectedProduct) {
            //遍历该产品所参与的活动，产品所参与的活动已按照优先级降序排序
            //即产品优先参与优先级高的活动，每个产品一次只能参与一个活动
            const rule = byProducts[key].activityRules;
            if(rule.length==0){//产品不参与活动
                ingot+=byProducts[key].price.ingot*selectedProduct[key];
                credit+=byProducts[key].price.credit*selectedProduct[key];
            }
            console.log("key", key);
            for (var i = 0; i < rule.length; i++) {
                const activityId = byActivityRules[rule[i]].activity.uid;
                //判断是否与已有活动互斥
                let isMutex = false;
                for (var activityKey in activityBitmap) {
                    if (byActivityRules[rule[i]].activity.mutexActivities.filter(item => item.uid == activityKey).length > 0) {
                        isMutex = true;
                    }
                }
                //互斥则继续判断该产品下一个参与的活动
                if (isMutex) {
                    continue;
                }
                //否则将其记录在bitmap中并结束遍历
                if (!activityBitmap[activityId] || !activityBitmap[activityId][rule[i]]) {
                    activityBitmap[activityId] = new Object();
                    activityBitmap[activityId][rule[i]] = new Array();

                }
                for (var j = 0; j < selectedProduct[key]; j++) {
                    activityBitmap[activityId][rule[i]].push(key);
                }
                break;
            }
        }
        console.log("activity bitmap", activityBitmap);
        //计算总价
        for (var activityId in activityBitmap) {
            for (var ruleId in activityBitmap[activityId]) {
                const { activityRule1, activityRule2 } = byActivityRules[ruleId];
                let ruleIngot = 0;
                let ruleCredit = 0;
                activityBitmap[activityId][ruleId].forEach(productId => {
                    ruleIngot += byProducts[productId].price.ingot;
                    ruleCredit += byProducts[productId].price.credit;
                });
                if (activityRule2 == null) {
                    //折扣
                    ingot += ruleIngot * (100 - activityRule1) / 100;
                    credit += ruleCredit * (100 - activityRule1) / 100;
                } else {
                    //购物满xx赠/减xx积分/元宝
                    if (ruleIngot > activityRule1) {//满足条件
                        if (activityRule2.operation == "minus") {//满减,满赠在后台处理
                            if (activityRule2.currency == "ingot") {
                                ruleIngot -= activityRule2.number;
                            } else {
                                ruleCredit -= activityRule2.number;
                            }
                        }
                    }
                    ingot += ruleIngot;
                    credit += ruleCredit;
                }
            }
        }
        console.log("ingot", ingot, "credit", credit);
        return {
            ingot,
            credit,
            activityBitmap
        }
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
                                this.props.toast("success", "预约成功");
                                this.props.history.push(matchUrl.CUSTOMER(this.props.currentCustomer.uid))
                            })
                            .catch(err => {
                                console.log("err", err);
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

    onProductModalClose = () => {
        this.setState({ visible: false })
    }

    getProductModalDisplay = () => {
        const { selectedProduct, byProducts, byPhotos } = this.props;
        let display = new Array();
        for (var i in selectedProduct) {
            const productId = i;
            if (selectedProduct[productId] > 0) {
                display.push(
                    <WingBlank size="lg" key={i}>
                        <Card style={{ marginTop: 10 }}>
                            <Card.Header
                                title={byProducts[productId].name}
                                thumbStyle={{ width: 80, height: 80 }}
                                thumb={byProducts[productId].photos.length == 0 ? null : byPhotos[byProducts[productId].photos[0]].photo}
                                extra={
                                    <Flex>
                                        <Flex.Item><Text style={{ fontSize: 12 }}>单价:{`${byProducts[productId].price.ingot}元宝 ${byProducts[productId].price.credit}积分`}</Text></Flex.Item>
                                        <Flex.Item>
                                            <Stepper
                                                max={byProducts[productId].storage}
                                                min={0}
                                                value={selectedProduct[productId]}
                                                onChange={(value) => this.props.selectProduct(productId, value)}
                                            />
                                        </Flex.Item>
                                    </Flex>
                                }
                            />
                        </Card>
                    </WingBlank>
                )
            }
        }
        if (display.length == 0) {
            display.push(<Result key={0} title="空空如也..." message="您没有选择商品" />)
        }
        return display;
    }

    selectProduct = (productId, value) => {
        this.props.selectProduct(productId, value);
    }

    placeOrder = (activityBitmap) => {
        const { currentCustomer, selectedProduct, user, byProducts, byActivityRules } = this.props;
        const customerId = currentCustomer.customerId;
        let products = new Array();
        for (var i in selectedProduct) {
            let activityRuleId = null;
            byProducts[i].activityRules.forEach(ruleId => {
                const activityId = byActivityRules[ruleId].activity.uid;
                if (activityBitmap[activityId][ruleId].indexOf(i) != -1) {
                    activityRuleId = ruleId;
                }
            })
            let orderProduct = { product: { uid: i }, number: selectedProduct[i] };
            if (activityRuleId != null) {
                orderProduct = { ...orderProduct, activityRule: { uid: activityRuleId } };
            }
            products.push(orderProduct);
        }
        if (products.length == 0) {
            this.props.toast("fail", "您没有选择商品...", 8);
            return;
        }
        const order = {
            customer: { uid: customerId },
            clerk: { uid: user.uid },
            products
        }
        const key = this.props.toast("loading", 'Loading....', 0);
        this.props.placeOrder(order)
            .then(() => {
                Portal.remove(key);
                this.props.toast("success", "下单成功");
            })
            .catch(err => {
                Portal.remove(key);
                this.props.toast("fail", err.error, 8);
            })

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
        const productModalDisplay = this.getProductModalDisplay();
        const { ingot, credit, activityBitmap } = this.getAmountDisplay();
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
                    <Switch>
                        <Route
                            path={this.props.match.url}
                            exact
                            render={props =>
                                <Tabs tabs={tabs}>
                                    <View style={{ padding: 10 }}>
                                        <AsyncAddOrderEntry {...props} {...this.props} />
                                    </View>
                                    <View>
                                        <OrderList {...this.props} />
                                    </View>
                                </Tabs>
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
                        <Route
                            path={`${this.props.match.url}/product/:shopId`}
                            exact
                            render={props =>
                                <AsyncProductList {...props} customerId={customerId} />
                            }
                        />
                    </Switch>
                </Flex.Item>
                <Modal
                    transparent={false}
                    visible={this.state.visible}
                    animationType="slide-up"
                    onClose={this.onProductModalClose}
                >
                    <Flex style={{ height: "100%", width: "100%" }} direction="column">
                        <Flex.Item style={{ width: "100%" }}>
                            <Flex>
                                <Flex.Item style={{ padding: 10 }}>
                                    <TouchableOpacity onPress={() => this.setState({ visible: false })}>
                                        <Icon name="close" size="md" />
                                    </TouchableOpacity>
                                </Flex.Item>
                                <Flex.Item style={{ padding: 10 }}>
                                    <TouchableOpacity onPress={() => this.props.resetSelectedProduct()}>
                                        <Text style={{ textAlign: "right" }}>
                                            <Icon name="delete" size="md" />
                                        </Text>
                                    </TouchableOpacity>
                                </Flex.Item>
                            </Flex>
                        </Flex.Item>
                        <Flex.Item style={{ flex: 10, width: "100%" }}>
                            <ScrollView style={{ height: "100%" }}>
                                {productModalDisplay}
                            </ScrollView>
                        </Flex.Item>
                        <Flex.Item style={{ width: "100%" }}>
                            <Flex>
                                <Flex.Item>
                                    <Button type="primary" onPress={this.onProductModalClose}>继续选择</Button>
                                </Flex.Item>
                                <Flex.Item>
                                    <Button type="warning" onPress={() => this.placeOrder(activityBitmap)}>总价:{`${ingot}元宝 ${credit}积分`}  下单</Button>
                                </Flex.Item>
                            </Flex>
                        </Flex.Item>
                    </Flex>
                </Modal>
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
        selectedProduct: getSelectedProduct(state),
        byProducts: getByProducts(state),
        byPhotos: getByPhotos(state),
        byActivityRules: getByActivityRules(state),
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(customerActions, dispatch),
        ...bindActionCreators(newOrderActions, dispatch),
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(Customer);