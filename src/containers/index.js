import React from "react";
import { View, Text } from "react-native";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actions as appActions } from "../redux/modules/app";
import { AppLoading } from 'expo';
import * as Font from 'expo-font';
import { Provider } from "@ant-design/react-native";
import {Switch,Route,NativeRouter as Router} from "react-router-native";
import connectRoute from "../utils/connectRoute";
import asyncComponent from "../utils/AsyncComponent";

const AsyncLogin = connectRoute(asyncComponent(() => import("./Login")));
const AsyncHome=connectRoute(asyncComponent(()=>import("./Home")));

class Container extends React.Component {
    state = {
        theme: null,
        currentTheme: null,
        isReady: false,
    };
    changeTheme = (theme, currentTheme) => {
        this.setState({ theme, currentTheme });
    };

    async componentDidMount() {
        await Font.loadAsync(
            'antoutline',
            // eslint-disable-next-line
            require('@ant-design/icons-react-native/fonts/antoutline.ttf')
        );

        await Font.loadAsync(
            'antfill',
            // eslint-disable-next-line
            require('@ant-design/icons-react-native/fonts/antfill.ttf')
        );
        // eslint-disable-next-line
        this.setState({ isReady: true });
    }
    render() {
        const { theme, currentTheme, isReady } = this.state;
        // if (!isReady) {
        //     return <AppLoading />;
        // }
        return (
            <Provider theme={theme}>
                <Router>
                    <Switch>
                        <Route exact path="/" component={AsyncLogin}/>
                        <Route path="/mobile" component={AsyncHome}/>
                    </Switch>
                </Router>
            </Provider>
        );
    }
}


const mapStateToProps = (state, props) => {
    return {
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(appActions, dispatch),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Container);