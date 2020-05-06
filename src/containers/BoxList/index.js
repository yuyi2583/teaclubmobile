import React, { Component } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Flex, Card, WingBlank, WhiteSpace, ActivityIndicator } from "@ant-design/react-native";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actions as boxActions, getBoxes, getByBoxes, getByReservations } from "../../redux/modules/box";
import { Link } from "react-router-native";
import { matchUrl } from "../../utils/commonUtils";

class BoxList extends Component {
    state={
        isReservation:false,//false=只展示预约列表，true=需要选取包厢时间段预约
    }

    componentDidMount() {
        console.log("box list url", this.props.match.url);
        if(this.props.match.url.indexOf("customer")>0){
            this.setState({isReservation:true});
        }
        const shopId = this.props.shop.uid;
        this.props.fetchBoxes(shopId);
    }

    getCurrentReservationStatus = (boxId) => {
        const { shop, byReservations, byBoxes } = this.props;
        const { duration, reservations } = byBoxes[boxId];
        const { startTime, endTime } = shop.todayOpenHour;
        const currentTime = new Date().getTime();
        const currentReservationTime = startTime + Math.floor((currentTime - startTime) / duration) * duration;
        let hasReservation = false;
        reservations.forEach(uid => {
            if (byReservations[uid].reservationTime == currentReservationTime) {
                hasReservation = true;
            }
        });
        if (hasReservation) {
            return "使用中";
        }
        return "空闲";
    }

    render() {
        const { boxes, byBoxes, byReservations, shop } = this.props;
        if (boxes.length == 0) {
            return (
                <View style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" />
                </View>
            )
        }
        const isOpen = shop.todayOpenHour.startTime != undefined;
        const {isReservation}=this.state;
        return (
            <View style={{ height: "100%" }}>
                <ScrollView style={{ height: "100%" }}>
                    {
                        boxes.map(uid => (
                            <Link
                                to={{
                                    pathname: isReservation?`${this.props.match.url}/${uid}`:matchUrl.BOXDETAIL(uid),
                                    state: { from: this.props.match.url,isReservation }
                                }}
                                component={TouchableOpacity}
                                key={uid}>
                                <WingBlank size="lg">
                                    <Card style={{ marginTop: 15 }}>
                                        <Card.Header
                                            title={byBoxes[uid].name}
                                        />
                                        <Card.Body>
                                            <View style={{ height: 42 }}>
                                                <Text style={{ marginLeft: 16 }}>当前状态：{isOpen ? this.getCurrentReservationStatus(uid) : "今日不营业"}</Text>
                                            </View>
                                        </Card.Body>
                                    </Card>
                                </WingBlank>
                            </Link>
                        ))
                    }
                </ScrollView>
            </View>
        )
    }
}

const mapStateToProps = (state, props) => {
    return {
        boxes: getBoxes(state),
        byBoxes: getByBoxes(state),
        byReservations: getByReservations(state),
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(boxActions, dispatch),
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(BoxList);