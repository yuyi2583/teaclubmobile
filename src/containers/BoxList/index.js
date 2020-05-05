import React, { Component } from "react";
import { View, Text, ScrollView } from "react-native";
import { Flex, Card, WingBlank, WhiteSpace } from "@ant-design/react-native";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actions as boxActions, getBoxes, getByBoxes } from "../../redux/modules/box";

class BoxList extends Component {

    componentDidMount() {
        console.log("box list url", this.props.match.url);
    }

    render() {
        const { boxes, byBoxes } = this.props;
        return (
            <View style={{ height: "100%" }}>
                <ScrollView style={{ height: "100%" }}>
                    {
                        boxes.map(uid => (
                            <WingBlank size="lg" key={uid}>
                                <Card style={{marginTop:15}}>
                                    <Card.Header
                                        title={byBoxes[uid].name}
                                    />
                                    <Card.Body>
                                        <View style={{ height: 42 }}>
                                            <Text style={{ marginLeft: 16 }}>当前状态：</Text>
                                        </View>
                                    </Card.Body>
                                </Card>
                            </WingBlank>
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
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(boxActions, dispatch),
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(BoxList);