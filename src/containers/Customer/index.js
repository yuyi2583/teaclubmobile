import React, { Component } from "react";
import { Text, View, TouchableOpacity, Alert, ScrollView, Image } from "react-native";
import { Card, WhiteSpace, WingBlank, Flex, Button, ActivityIndicator, Tabs, Icon, Badge, Modal, InputItem, Result, Portal } from "@ant-design/react-native";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actions as customerActions, getCustomers, getByCustomers, getByCustomerFaces, getCustomerFaces, getBySearchCustomers, getSearchCustomers } from "../../redux/modules/customer";
import { actions as newOrderActions, getSelectedSlot, getSelectedProduct } from "../../redux/modules/newOrder";
import { getByBoxes } from "../../redux/modules/box";
import { getByProducts, getByPhotos, getByActivityRules } from "../../redux/modules/product";
import OrderList from "./components/OrderList";
import ReservationList from "./components/ReservationList";
import { Link, Switch, Route, Redirect } from "react-router-native";
import { matchUrl } from "../../utils/commonUtils";
import connectRoute from "../../utils/connectRoute";
import asyncComponent from "../../utils/AsyncComponent";
import { timeStampConvertToFormatTime ,convertTimestampToHHMM,convertTimestampToYYYYMMDD} from "../../utils/timeUtils";
import Stepper from "../../components/Stepper";
import { ws } from "../../utils/url";
import { WebSocketBalanceConnect } from "../../utils/websocket";


const AsyncAddOrderEntry = connectRoute(asyncComponent(() => import("./components/AddOrderEntry")));
const AsyncBoxList = connectRoute(asyncComponent(() => import("../BoxList")));
const AsyncBoxDetail = connectRoute(asyncComponent(() => import("../BoxDetail")));
const AsyncProductList = connectRoute(asyncComponent(() => import("../ProductList")));

const tabs = [
    { title: '下单' },
    { title: '订单' },
    { title: '预约' },
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
        visible: false,
        clerkDiscountModalVisible: false,
        clerkDiscount: 100,
        registerVisible: false,
        registerName: "",
        registerPhone: ""
    }

    componentDidMount() {
        const { currentCustomer } = this.props;
        const { type, uid } = this.props.match.params;
        const customerId = type == "search" ? uid : currentCustomer.customerId;
        const hasRegister = customerId != undefined;
        if (hasRegister) {
            WebSocketBalanceConnect(customerId, type, this.props);
        }
    }

    getButtonDispaly = () => {
        const { pathname } = this.props.location;
        var reservationRegex = /\/mobile\/customer\/(face|search)\/\d+\/box\/\d+/;
        var productRegex = /\/mobile\/customer\/(face|search)\/\d+\/product\/\d+/;
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
        const { selectedProduct, byActivityRules, byProducts, currentCustomer } = this.props;
        const { clerkDiscount } = this.state;
        let activityBitmap = new Object();//用于记录已参与的活动
        let ingot = 0;
        let credit = 0;
        console.log("selectedProduct in getAmountDisplay", selectedProduct);
        for (var key in selectedProduct) {
            //遍历该产品所参与的活动，产品所参与的活动已按照优先级降序排序
            //即产品优先参与优先级高的活动，每个产品一次只能参与一个活动
            //积分不参与折扣
            const rule = byProducts[key].activityRules;
            let isOneOfRuleApplicable = false;
            for (var i = 0; i < rule.length; i++) {
                const activityId = byActivityRules[rule[i]].activity.uid;
                const { activityApplyForCustomerTypes } = byActivityRules[rule[i]];
                //判断用户的vip等级能否参与此活动
                let isApplicable = false;
                if(currentCustomer.customerId){
                    const {customerType}=currentCustomer.customer
                    activityApplyForCustomerTypes.forEach(type => {
                        if (type.uid == customerType.uid) {
                            isApplicable = true;
                        }
                    });
                }
                //vip等级不够则继续判断该产品下一个参与的活动
                if (!isApplicable) {
                    continue;
                }
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
                isOneOfRuleApplicable = true;
                if (!activityBitmap[activityId] || !activityBitmap[activityId][rule[i]]) {
                    activityBitmap[activityId] = new Object();
                    activityBitmap[activityId][rule[i]] = new Array();

                }
                for (var j = 0; j < selectedProduct[key]; j++) {
                    activityBitmap[activityId][rule[i]].push(key);
                }
                break;
            }
            //若这个产品的所有优惠规则不适用
            //即不参加活动
            if (!isOneOfRuleApplicable) {
                ingot += byProducts[key].price.ingot * selectedProduct[key];
                credit += byProducts[key].price.credit * selectedProduct[key];
            }
        }
        //计算总价
        console.log("activityBitmap", activityBitmap);
        for (var activityId in activityBitmap) {
            for (var ruleId in activityBitmap[activityId]) {
                const { activityRule1, activityRule2 } = byActivityRules[ruleId];
                let ruleIngot = 0;
                let ruleCredit = 0;
                activityBitmap[activityId][ruleId].forEach(productId => {
                    ruleIngot += byProducts[productId].price.ingot;
                    ruleCredit += byProducts[productId].price.credit;
                });
                if (activityRule2 == null||activityRule2.number==0) {
                    //折扣
                    ingot += ruleIngot * (100 - activityRule1) / 100;
                    credit += ruleCredit;
                } else {
                    //购物满xx赠/减xx积分/元宝
                    if (ruleIngot > activityRule1) {//满足条件
                        if (activityRule2.operation == "minus") {//满减元宝,满赠在后台处理
                            // if (activityRule2.currency == "ingot") {
                            ruleIngot -= activityRule2.number;
                            // } else {
                            //     ruleCredit -= activityRule2.number;
                            // }
                        }
                    }
                    ingot += ruleIngot;
                    credit += ruleCredit;
                }
            }
        }
        //计算店员优惠
        ingot *= clerkDiscount / 100;
        ingot = ingot.toFixed(2);//保留2位小数
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
        const { currentCustomer, user, selectedSlot, byBoxes, shop } = this.props;
        const { type, uid } = this.props.match.params;
        const customerId = type == "search" ? uid : currentCustomer.customerId;
        const { duration, price } = byBoxes[boxId];
        const hasRegister = customerId != undefined;
        if (selectedSlot.length == 0) {
            this.props.toast("info", "您未选择预约时间段");
            return;
        }
        //区分是否注册,未注册则提供客户姓名和联系方式
        if (!hasRegister) {
            this.setState({ registerVisible: true });
            console.log("not register")
            return;
        }
        const reservations = selectedSlot.map(reservationTime => ({ reservationTime, box:{uid:boxId} }));
        let ingot = 0;
        let credit = 0;
        let confirmationDisplay = "预约以下时间段:\n";
        reservations.forEach(reservation => {
            ingot += price.ingot;
            credit += price.credit;
            confirmationDisplay += `${convertTimestampToYYYYMMDD(reservation.reservationTime)} ${convertTimestampToHHMM(reservation.reservationTime)}~${convertTimestampToHHMM(reservation.reservationTime + duration * 1000 * 60)}\n`;
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
            customer: { uid: customerId },
            clerk: { uid: user.uid, name: user.name },
            reservations,
            placeOrderWay: { uid: shop.uid }
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
                        const key = this.props.toast("loading", "loading...", 0);
                        this.props.reserve(order)
                            .then(() => {
                                Portal.remove(key);
                                this.props.toast("success", "预约成功", 6);
                                // this.props.history.push(matchUrl.CUSTOMER(this.props.currentCustomer.uid))
                            })
                            .catch(err => {
                                Portal.remove(key);
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
                                                    this.props.history.push(`/mobile/pay/${customerId}/${type}`);
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
        const { currentCustomer } = this.props;
        const { type, uid } = this.props.match.params;
        const customerId = type == "search" ? uid : currentCustomer.customerId;
        const hasRegister = customerId != undefined;
        //区分是否注册,未注册则提供客户姓名和联系方式
        if (!hasRegister) {
            this.setState({ registerVisible: true });
            console.log("not register")
            return;
        }
        Alert.alert(
            "确认？",
            `确认订单信息无误？`,
            [
                {
                    text: "取消",
                    style: "cancel"
                },
                {
                    text: "确认", onPress: () => {
                        const { currentCustomer, selectedProduct, user, byProducts, byActivityRules, shop } = this.props;
                        const { type, uid } = this.props.match.params;
                        const customerId = type == "search" ? uid : currentCustomer.customerId;
                        const { clerkDiscount } = this.state;
                        let products = new Array();
                        for (var i in selectedProduct) {
                            let activityRuleId = null;
                            byProducts[i].activityRules.forEach(ruleId => {
                                const activityId = byActivityRules[ruleId].activity.uid;
                                if (activityBitmap[activityId] && activityBitmap[activityId][ruleId]) {
                                    if (activityBitmap[activityId][ruleId].indexOf(i) != -1) {
                                        activityRuleId = ruleId;
                                    }
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
                            products,
                            clerkDiscount,
                            placeOrderWay: { uid: shop.uid },
                        }
                        console.log("order", order);
                        const key = this.props.toast("loading", 'Loading....', 0);
                        this.setState({ visible: false });
                        this.props.placeOrder(order)
                            .then(() => {
                                Portal.remove(key);
                                this.setState({ clerkDiscount: 100 });
                                this.props.toast("success", "下单成功", 8);
                                this.props.history.goBack();
                            })
                            .catch(err => {
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
                                                    this.props.resetSelectedProduct();
                                                    this.props.history.push(`/mobile/pay/${customerId}`);
                                                }
                                            }
                                        ],
                                        { cancelable: false }
                                    );
                                    return;
                                }else{
                                    this.props.toast("fail", err.error, 8);
                                }
                            })
                    }
                }
            ],
            { cancelable: false }
        );
    }

    setClerkDiscount = () => {
        this.setState({ clerkDiscountModalVisible: true })
    }

    getBalanceDisplay = () => {
        const { bySearchCustomers, byCustomers, user, currentCustomer } = this.props;
        const { uid, type } = this.props.match.params;
        const customerId = type == "search" ? uid : currentCustomer.customerId;
        const hasRegister = customerId != undefined
        if (!hasRegister) {
            return "";
        }
        const { balance } = type == "search" ? bySearchCustomers[uid] : byCustomers[customerId];
        let display = `余额:${balance.ingot}元宝 ${balance.credit}积分`;
        return display;

    }

    register = () => {
        const { registerName, registerPhone } = this.state;
        if (registerName.length == 0) {
            this.props.toast("fail", "客户名称不能为空", 6);
            return;
        }
        var phoneRegx = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (!phoneRegx.test(registerPhone)) {
            this.props.toast("fail", "联系方式格式错误，请重新输入", 6);
            return;
        }
        const { uid, type } = this.props.match.params;//此处uid为faceId
        const customer = { name: registerName, contact: registerPhone };
        this.setState({ registerVisible: false });
        this.props.register(uid, customer)
            .then(() => {
                this.props.toast("success", "注册成功", 6);
            })
            .catch(err => {
                this.props.toast("fail", err, 6);
            })
    }


    render() {
        const { byCustomerFaces, byCustomers, user, currentCustomer } = this.props;
        const { uid, type } = this.props.match.params;
        const customerId = type == "search" ? uid : currentCustomer.customerId;
        const hasRegister = customerId != undefined
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
        if (hasRegister && isDataNull) {
            return (
                <View style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" />
                </View>
            )
        }
        const displayButton = this.getButtonDispaly();
        const productModalDisplay = this.getProductModalDisplay();
        const { ingot, credit, activityBitmap } = this.getAmountDisplay();
        const balanceDisplay = this.getBalanceDisplay();
        return (
            <Flex direction="column" style={{ width: "100%", height: "100%" }}>
                <Flex.Item style={{ flex: 1, width: "100%" }}>
                    <Card full style={{ height: "100%" }}>
                        <Card.Header
                            title={
                                <WingBlank>
                                    <Text>{hasRegister ? currentCustomer.name : "未识别客户"}</Text>
                                    <Text>{balanceDisplay}</Text>
                                </WingBlank>
                            }
                            thumbStyle={{ width: 60, height: 60 }}
                            thumb={hasRegister ?
                                byCustomers[customerId].avatar == null ?
                                    <Image source={require("../../assets/default.jpg")} style={{ width: 60, height: 60 }} />
                                    : byCustomers[customerId].avatar.photo : byCustomerFaces[uid].image
                            }
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
                                    <View>
                                        <ReservationList {...this.props}/>
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
                                    <Button type="ghost" onPress={() => this.setState({ clerkDiscountModalVisible: true })}>店员优惠</Button>
                                </Flex.Item>
                                <Flex.Item style={{ flex: 2 }}>
                                    <Button type="warning" onPress={() => this.placeOrder(activityBitmap)}>总价:{`${ingot}元宝 ${credit}积分`}  下单</Button>
                                </Flex.Item>
                            </Flex>
                        </Flex.Item>
                    </Flex>
                </Modal>
                <Modal
                    title="店员折扣"
                    transparent
                    onClose={() => this.setState({ clerkDiscountModalVisible: false })}
                    maskClosable
                    visible={this.state.clerkDiscountModalVisible}
                    closable
                    footer={[
                        { text: '取消', onPress: () => this.setState({ clerkDiscountModalVisible: false }) },
                        { text: '确认', onPress: () => this.setState({ clerkDiscountModalVisible: false }) },
                    ]}
                >
                    <View style={{ paddingVertical: 20 }}>
                        <Text style={{ textAlign: 'center' }}>您最多可以提供{user.leastDiscount}%折扣</Text>
                    </View>
                    <InputItem
                        clear
                        type="number"
                        value={this.state.clerkDiscount}
                        onChange={value => {
                            if (value < 0) {
                                this.props.toast("fail", `优惠折扣不能小于0`, 6);
                                return;
                            }
                            if (value < user.leastDiscount) {
                                this.props.toast("fail", `您不能提供低于${user.leastDiscount}%的折扣`, 6);
                                return;
                            }
                            this.setState({
                                clerkDiscount: value,
                            });
                        }}
                        extra="%"
                        placeholder="折扣数值（1~100）" />
                </Modal>
                <Modal
                    title="请先注册"
                    transparent
                    maskClosable={false}
                    visible={this.state.registerVisible}
                    footer={[
                        { text: '取消', onPress: () => this.setState({ registerVisible: false }) },
                        { text: '确认', onPress: this.register },
                    ]}
                >
                    <View style={{ paddingVertical: 20 }}>
                        <Text style={{ textAlign: 'center' }}>该用户还未注册，请先注册</Text>
                    </View>
                    <InputItem
                        clear
                        type="text"
                        value={this.state.registerName}
                        onChange={value => {
                            this.setState({
                                registerName: value,
                            });
                        }}
                        placeholder="姓名" />
                    <InputItem
                        clear
                        type="text"
                        value={this.state.registerPhone}
                        onChange={value => {
                            this.setState({
                                registerPhone: value,
                            });
                        }}
                        placeholder="联系方式" />
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
        searchCustomers: getSearchCustomers(state),
        bySearchCustomers: getBySearchCustomers(state)
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(customerActions, dispatch),
        ...bindActionCreators(newOrderActions, dispatch),
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(Customer);