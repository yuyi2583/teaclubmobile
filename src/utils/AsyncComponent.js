import React, { Component } from "react";
import { getRetrieveRequestQuantity, getUpdateRequestQuantity, getModalRequestQuantity, getError } from "../redux/modules/app";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Toast } from "@ant-design/react-native";
import { getUser, getShop } from "../redux/modules/auth";
import { getCurrentCustomer } from "../redux/modules/customer";

//此高阶组件作用为代码分片

//importComponent是使用了import()的函数
export default function asyncComponent(importComponent) {
  class AsyncComponent extends Component {
    constructor(props) {
      super(props);
      this.state = {
        component: null,
      };
    }

    componentDidMount() {
      importComponent().then((mod) => {
        const component = mod.default ? mod.default : mod;
        this.setState({
          // 同时兼容ES6和CommonJS的模块
          component
        });
      });
    }

    toast = (type, message,duration=5) => {
      switch (type) {
        case "success":
          return Toast.success(message, duration);
        case "fail":
          return Toast.fail(message, duration);
        case "info":
          return Toast.info(message, duration);
        case "loading":
          return Toast.loading(message, 0);
        case "offline":
          return Toast.offline(message, duration);
      }
    }


    render() {
      const C = this.state.component;
      return C ?
        <C {...this.props} toast={this.toast} />
        : null;
    }
  }


  const mapStateToProps = (state, props) => {
    return {
      retrieveRequestQuantity: getRetrieveRequestQuantity(state),
      updateRequestQuantity: getUpdateRequestQuantity(state),
      modalRequestQuantity: getModalRequestQuantity(state),
      error: getError(state),
      user: getUser(state),
      shop: getShop(state),
      currentCustomer: getCurrentCustomer(state),
    };
  };

  const mapDispatchToProps = (dispatch) => {
    return {
      //   ...bindActionCreators(customerActions, dispatch),
    };
  };

  return connect(mapStateToProps, mapDispatchToProps)(AsyncComponent);
}