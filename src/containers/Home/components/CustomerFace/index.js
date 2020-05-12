import React, { Component } from "react";
import { View, Text ,Image} from "react-native";
import { Flex, Card, WhiteSpace, WingBlank } from "@ant-design/react-native";
import PropTypes from "prop-types";

class CustomerFace extends Component {

    render() {
        const { content } = this.props;
        return (
            <View style={{ paddingTop: 15 }}>
                <WingBlank size="lg">
                    <Card>
                        <Card.Header
                            thumbStyle={{ width: 80, height: 80 }}
                            thumb={
                                content.image ||
                                    (content.avatar == null ?
                                    <Image source={require("../../../../assets/default.jpg")} style={{ width: 60, height: 60 }} />
                                    : content.avatar.photo)
                            }
                            extra={
                                <Flex direction="column">
                                    <Flex.Item><Text>{content.name ? content.name : "未注册客户"}</Text></Flex.Item>
                                </Flex>
                            }
                        />
                    </Card>
                </WingBlank>
                <WhiteSpace size="lg" />
            </View>
        )
    }
}


CustomerFace.propTypes = {
    content: PropTypes.object.isRequired,
}

export default CustomerFace;