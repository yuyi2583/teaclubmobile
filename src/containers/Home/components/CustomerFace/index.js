import React, { Component } from "react";
import { View, Text } from "react-native";
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
                            thumb={content.image}
                            extra={
                                <Flex direction="column">
                                    <Flex.Item><Text>{content.name}</Text></Flex.Item>
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