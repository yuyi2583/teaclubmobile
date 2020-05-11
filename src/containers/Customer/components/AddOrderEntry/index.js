import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { WingBlank, Flex } from "@ant-design/react-native";
import { Link } from "react-router-native";
import { matchUrl } from "../../../../utils/commonUtils";

function AddOrderEntry(props) {
    console.log("order entry",`${props.match.url}/box`)
    return (
        <>
            <WingBlank size="lg">
                <Link
                    to={{
                        pathname: `${props.match.url}/box`,
                        state: { from: props.match.url }
                    }}
                    onClick={() => console.log("press link")}
                    component={TouchableOpacity}>
                    <Flex style={{ height: 100, width: "100%", backgroundColor: "#108EE9", borderRadius: 5 }}>
                        <Flex.Item style={{ alignItems: "center" }}>
                            <Text style={{ color: "white", fontSize: 18 }}>包厢服务</Text>
                        </Flex.Item>
                    </Flex>
                </Link>
            </WingBlank>
            <WingBlank size="lg">
                <Link
                    to={{
                        pathname: `${props.match.url}/product/${props.shop.uid}`,
                        state: { from: props.match.url }
                    }}
                    onClick={() => console.log("press link")}
                    component={TouchableOpacity}>
                    <Flex style={{ height: 100, width: "100%", backgroundColor: "red", borderRadius: 5, marginTop: 15 }}>
                        <Flex.Item style={{ alignItems: "center" }}>
                            <Text style={{ color: "white", fontSize: 18 }}>产品服务</Text>
                        </Flex.Item>
                    </Flex>
                </Link>
            </WingBlank>
        </>
    )
}

export default AddOrderEntry;