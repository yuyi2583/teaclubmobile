import React, { Component } from "react";
import { View, Text } from "react-native";
import { WingBlank, InputItem, Flex, List, Button, Toast, Portal } from "@ant-design/react-native";
import { actions as authActions, getUser } from "../../redux/modules/auth";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

class Login extends Component {

    state = {
        id: "",
        password: ""
    }

    login = () => {
        // const { id, password } = this.state;
        // if (id.length == 0 || password.length == 0) {
        //     Toast.fail("身份证或密码不能为空！");
        //     return;
        // }
        const key = Toast.loading('Loading....', 0);
        fetch('http://192.168.56.1:8080/mobile/login', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })
            .then((response) => response.json())
            .then((json) => {
                console.log(json);
                Portal.remove(key);
                // return json.movies;
            })
            .catch((error) => {
                Portal.remove(key);
                console.error(error);
            });
        // this.props.login(id, password)
        //     .then(() => {
        //         Portal.remove(key);
        //     })
        //     .catch(err => {
        //         Portal.remove(key);
        //         Toast.fail(err);
        //     })
    }

    render() {
        const { retrieveRequestQuantity } = this.props;
        return (
            <Flex direction="column" justify="center" align="center" style={{ width: "100%", height: "100%" }}>
                <Flex.Item style={{ width: "100%", marginTop: 30 }}>
                    <WingBlank size="lg">
                        <List renderHeader={'身份证密码登陆'}>
                            <InputItem
                                clear
                                value={this.state.id}
                                onChange={value => {
                                    this.setState({
                                        id: value
                                    });
                                }}
                            >
                                身份证
                                </InputItem>
                            <InputItem
                                clear
                                type="password"
                                value={this.state.password}
                                onChange={value => {
                                    this.setState({
                                        password: value,
                                    });
                                }}
                            >
                                密码
                                </InputItem>
                            <List.Item>
                                <WingBlank size="lg">
                                    <Button type="primary" onPress={this.login}>登陆</Button>
                                </WingBlank>
                            </List.Item>
                        </List>
                    </WingBlank>
                </Flex.Item>
            </Flex>
        )
    }
}

const mapStateToProps = (state, props) => {
    return {
        user: getUser(state),
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(authActions, dispatch),
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(Login);