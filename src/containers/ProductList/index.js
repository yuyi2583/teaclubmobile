import React, { Component } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Tabs, Card, WingBlank, ActivityIndicator } from "@ant-design/react-native";
import {
    actions as productActions,
    getByActivityRules, getByPhotos, getByProducts, getProducts, getByProductTypes, getProductTypes
} from "../../redux/modules/product";
import { getSelectedProduct } from "../../redux/modules/newOrder";
import { actions as newOrderActions } from "../../redux/modules/newOrder";
import Stepper from "../../components/Stepper";
import { Prompt } from "react-router-native";

class ProductList extends Component {

    componentDidMount() {
        const { shopId } = this.props.match.params;
        this.props.fetchProducts(shopId);
    }

    getTabs = () => {
        const { productTypes, byProductTypes } = this.props;
        let tabs = productTypes.map(uid => ({ title: byProductTypes[uid].name }));
        console.log("tabs", tabs)
        return tabs;
    }

    onProductChange = (pId, value) => {
        console.log("on product change", pId, value);
        this.props.selectProduct(pId, value);
    }

    getCount = () => {
        const { selectedProduct } = this.props;
        let count = 0;
        for (var i in selectedProduct) {
            count += selectedProduct[i];
        }
        return count;
    }

    componentWillUnmount() {
        this.props.resetSelectedProduct();
    }

    render() {
        const { productTypes, byProductTypes, byProducts, byPhotos, retrieveRequestQuantity, selectedProduct } = this.props;
        const tabs = this.getTabs();
        const count = this.getCount();
        if (retrieveRequestQuantity > 0) {
            return (
                <View style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" />
                </View>
            )
        }
        return (
            <View style={{ width: "100%", height: "100%" }}>
                <Tabs
                    tabs={tabs}
                    onChange={(tab, index) => this.myScrollView.scrollTo({ x: index * 100, animated: true })}
                    renderTabBar={tabProps => (
                        <ScrollView
                            horizontal
                            ref={(view) => { this.myScrollView = view; }}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ justifyContent: "center", alignItems: "center" }}
                            style={{ height: 40 }}
                        >
                            {tabProps.tabs.map((tab, i) => (
                                // change the style to fit your needs
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    key={tab.key || i}
                                    style={{
                                        width: 100,
                                        padding: 6,
                                    }}
                                    onPress={() => {
                                        console.log(`press ${i} header`);
                                        const { goToTab, onTabClick } = tabProps;
                                        // tslint:disable-next-line:no-unused-expression
                                        onTabClick && onTabClick(tabs[i], i);
                                        // tslint:disable-next-line:no-unused-expression
                                        goToTab && goToTab(i);
                                        this.myScrollView.scrollTo({ x: i * 100, animated: true });
                                    }}
                                >
                                    <Text
                                        style={{
                                            textAlign: "center",
                                            color: tabProps.activeTab === i ? 'green' : undefined,
                                        }}
                                    >
                                        {tab.title}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                >
                    {
                        productTypes.map(uid => (
                            <View
                                style={{
                                    alignItems: 'center',
                                    width: "100%",
                                    backgroundColor: '#fff',
                                }}
                                key={uid}>
                                <ScrollView style={{ height: "100%", width: "100%" }}>
                                    {
                                        byProductTypes[uid].products.map(pId =>
                                            <WingBlank size="lg" key={pId}>
                                                <Card style={{ marginTop: 10 }}>
                                                    <Card.Header
                                                        title={byProducts[pId].name}
                                                        thumbStyle={{ width: 80, height: 80 }}
                                                        thumb={byProducts[pId].photos.length == 0 ? null : byPhotos[byProducts[pId].photos[0]].photo}
                                                        extra={
                                                            <Stepper
                                                                max={byProducts[pId].storage}
                                                                min={0}
                                                                value={selectedProduct[pId]?selectedProduct[pId]:0}
                                                                onChange={(value) => this.onProductChange(pId, value)}
                                                            />
                                                        }
                                                    />
                                                </Card>
                                            </WingBlank>
                                        )
                                    }
                                </ScrollView>
                            </View>
                        ))
                    }
                </Tabs>
                <Prompt message="当前页面正在输入中，离开此页面您输入的数据不会被保存，是否离开?" when={count > 0} />
            </View>
        )
    }
}

const mapStateToProps = (state, props) => {
    return {
        products: getProducts(state),
        byProducts: getByProducts(state),
        byPhotos: getByPhotos(state),
        byActivityRules: getByActivityRules(state),
        productTypes: getProductTypes(state),
        byProductTypes: getByProductTypes(state),
        selectedProduct: getSelectedProduct(state),
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(productActions, dispatch),
        ...bindActionCreators(newOrderActions, dispatch),
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(ProductList);