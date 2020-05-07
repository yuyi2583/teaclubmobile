import React, { Component } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Flex, Card, WingBlank, Icon, ActivityIndicator } from "@ant-design/react-native";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actions as boxActions, getByBoxes, getByReservations } from "../../redux/modules/box";
import { getNDayTimeString, convertTimestampToHHMM, getNDaysTimeStamp, timeStringConvertToTimeStamp } from "../../utils/timeUtils";
import BackArrow from "../../components/BackArrow";
import { actions as newOrderActions, getSelectedSlot, getHasSelectSlot } from "../../redux/modules/newOrder";
import { Prompt } from "react-router-native";

class BoxDetail extends Component {

    state = {
        day: 0,
    }

    getReservationSlotDisplay = () => {
        const { day } = this.state;
        const { boxId } = this.props.match.params;
        const { byBoxes, byReservations, shop, selectedSlot } = this.props;//TODO 每天的startTime可能不同
        const { openHours } = shop;
        const dayOfWeek = (new Date().getDay() + day) % 7 + "";
        let todayOpenHour;
        let display = new Array();
        const { isReservation } = this.props.location.state;
        try {
            openHours.forEach(item => {
                if (item.date.indexOf(dayOfWeek) != -1) {
                    const { startTime, endTime } = item;
                    const today = getNDayTimeString();
                    todayOpenHour = { ...item, startTime: timeStringConvertToTimeStamp(today + startTime), endTime: timeStringConvertToTimeStamp(today + endTime) };
                }
            })
            const startTime = todayOpenHour.startTime + day * 1000 * 60 * 60 * 24;
            const endTime = todayOpenHour.endTime + day * 1000 * 60 * 60 * 24;
            const duration = byBoxes[boxId].duration * 1000 * 60;
            const slotNum = Math.floor((endTime - startTime) / duration);
            for (let i = 0; i < slotNum; i++) {
                const filterResult = byBoxes[boxId].reservations.filter(reservationTime => {
                    if (reservationTime == (startTime + i * duration)) {
                        return true;
                    }
                    return false;
                });
                let isReserved = false;
                if (filterResult.length != 0) {
                    isReserved = true;
                }
                let isClickReserve = false;
                if (selectedSlot.indexOf(startTime + i * duration) != -1) {
                    isClickReserve = true;
                }
                display.push(
                    <WingBlank size="lg" key={i}>
                        <TouchableOpacity disabled={!isReservation || isReserved} onPress={() => this.clickSlot(startTime + i * duration, startTime + (i + 1) * duration)}>
                            <Card style={{ backgroundColor: isClickReserve ? "#3CB371" : isReserved ? "#108EE9" : "white" }}>
                                <Card.Header
                                    title={`${convertTimestampToHHMM(startTime + i * duration)}~${convertTimestampToHHMM(startTime + (i + 1) * duration)}`}
                                    extra={isClickReserve ? <Text style={{ color: "white", fontSize: 17, textAlign: "right" }}>当前预约</Text> : isReserved ? <Text style={{ color: "white", fontSize: 17, textAlign: "right" }}>已预约</Text> : "空闲"}
                                    style={{ height: 50 }}
                                />
                            </Card>
                        </TouchableOpacity>
                    </WingBlank>
                );
            }
        } catch (err) {
            console.log(err);
            display = (
                <View style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ fontSize: 18 }}>{getNDayTimeString(this.state.day)}不营业</Text>
                </View>
            )
        }
        return display;
    }

    componentWillUnmount() {
        this.props.resetSlot();
    }

    clickSlot = (startTime, endTime) => {
        const time = new Date().getTime();
        if (time > endTime) {
            this.props.toast("fail", "该时间段无法预约");
            return;
        }
        this.props.selectSlot(startTime);
    }

    backawrdDay = () => {
        const { boxId } = this.props.match.params;
        const tomorrow = this.state.day + 1;
        this.setState({ day: tomorrow });
        this.props.fetchReservations(boxId, getNDaysTimeStamp(tomorrow), getNDaysTimeStamp(tomorrow + 1))
            .then(() => {

            })
            .catch(err => {
                this.props.toast("fail", err, 6);
            })
    }

    forwardDay = () => {
        const { boxId } = this.props.match.params;
        const yesterday = this.state.day - 1;
        this.setState({ day: yesterday });
        this.props.fetchReservations(boxId, getNDaysTimeStamp(yesterday), getNDaysTimeStamp(yesterday + 1))
            .then(() => {

            })
            .catch(err => {
                this.props.toast("fail", err, 6);
            })
    }

    componentDidMount() {
        const { boxId } = this.props.match.params;
        this.props.fetchReservations(boxId, getNDaysTimeStamp(this.state.day), getNDaysTimeStamp(this.state.day + 1))
            .then(() => {

            })
            .catch(err => {
                this.props.toast("fail", err, 6);
            })
    }

    getPriceDisplay = () => {
        let display = "每泡茶时间：";
        const { boxId } = this.props.match.params;
        const { price, duration } = this.props.byBoxes[boxId];
        display += `${duration}分钟 价格：`;
        if (price.ingot != 0) {
            display += `${price.ingot}元宝 `;
        }
        if (price.credit != 0) {
            display += `${price.credit}积分 `;
        }
        return display;
    }

    render() {
        const { boxId } = this.props.match.params;
        const { byBoxes, byReservations, shop, retrieveRequestQuantity, hasSelectSlot } = this.props;
        const { startTime, endTime } = shop.todayOpenHour;
        const duration = byBoxes[boxId].duration * 1000 * 60;
        const slot = this.getReservationSlotDisplay();
        const { isReservation } = this.props.location.state;
        const priceDisplay = this.getPriceDisplay();
        return (
            <View style={{ height: "100%" }}>
                <Flex direction="column" style={{ width: "100%", height: "100%" }}>
                    <Flex.Item>
                        <Flex direction="row" style={isReservation ? { width: "100%", height: "100%" } : { width: "100%", height: "100%", borderBottomWidth: 1, borderColor: "#DCDCDC" }}>
                            <Flex.Item>{isReservation ? null : <BackArrow {...this.props} />}</Flex.Item>
                            <Flex.Item style={{ flex: 10 }}>
                                <Text style={{ textAlign: "center" }}>{getNDayTimeString(this.state.day)}日预约信息</Text>
                                <Text style={{ textAlign: "center" }}>{priceDisplay}</Text>
                            </Flex.Item>
                            <Flex.Item></Flex.Item>
                        </Flex>
                    </Flex.Item>
                    <Flex.Item style={{ flex: 11, width: "100%" }}>
                        <Flex style={{ width: "100%", height: "100%", paddingTop: 15 }}>
                            <Flex.Item style={{ height: "100%", justifyContent: "center", alignItems: "center" }}>
                                <TouchableOpacity onPress={this.forwardDay}>
                                    <Icon name="caret-left" size="lg" />
                                </TouchableOpacity>
                            </Flex.Item>
                            <Flex.Item style={{ height: "100%", flex: 6 }}>
                                {retrieveRequestQuantity > 0 ?
                                    <View style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                                        <ActivityIndicator size="large" />
                                    </View> :
                                    <ScrollView>
                                        {slot}
                                    </ScrollView>
                                }
                            </Flex.Item>
                            <Flex.Item style={{ height: "100%", justifyContent: "center", alignItems: "center" }}>
                                <TouchableOpacity onPress={this.backawrdDay}>
                                    <Icon name="caret-right" size="lg" />
                                </TouchableOpacity>
                            </Flex.Item>
                        </Flex>
                    </Flex.Item>
                </Flex>
                <Prompt message="当前页面正在输入中，离开此页面您输入的数据不会被保存，是否离开?" when={isReservation && hasSelectSlot} />
            </View>
        )
    }
}

const mapStateToProps = (state, props) => {
    return {
        byBoxes: getByBoxes(state),
        byReservations: getByReservations(state),
        selectedSlot: getSelectedSlot(state),
        hasSelectSlot: getHasSelectSlot(state),
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(boxActions, dispatch),
        ...bindActionCreators(newOrderActions, dispatch),
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(BoxDetail);