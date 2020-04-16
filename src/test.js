import React from "react";
import { Provider } from "react-redux";
import {View,Text} from "react-native";
import configureStore from "./redux/configureStore";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {actions as appActions} from "./redux/modules/app";

const store = configureStore();

function Test(props){
    props.setError("errr");
    return (
        <Provider store={store}>
            <View>
                <Text>asdfasf</Text>
            </View>
        </Provider>
    )
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

  export default connect(mapStateToProps, mapDispatchToProps)(Test);