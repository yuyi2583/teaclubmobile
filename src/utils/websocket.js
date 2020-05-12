import {ws} from "./url";

export const WebSocketBalanceConnect = (customerId,type,props) => {
    var wsbalance = new WebSocket(ws.pay(customerId));
    wsbalance.onopen = () => {
        // connection opened
        wsbalance.send('something'); // send a message
    };

    wsbalance.onmessage = (e) => {
        // a message was received
        const result = JSON.parse(e.data)
        console.log("wsbalance receive message", result);
        if (result.code == 200) {
            props.changeBalance(customerId, type, result.data);
        }
    };

    wsbalance.onerror = (e) => {
        // an error occurred
        console.log("wsbalance websocket error", e.message);
    };

    wsbalance.onclose = (e) => {
        // connection closed
        console.log("wsbalance websocket close", e.code, e.reason);
    };
}

export const WebSocketFaceConnect = (clerkId,props) => {
    var wsface = new WebSocket(ws.face(clerkId));
    wsface.onopen = () => {
        // connection opened
        wsface.send('something'); // send a message
    };

    wsface.onmessage = (e) => {
        // a message was received
        console.log("wsface receive message", JSON.parse(e.data));
        props.receieveCustomerFaces(JSON.parse(e.data));
    };

    wsface.onerror = (e) => {
        // an error occurred
        console.log("wsface websocket error", e.message);
    };

    wsface.onclose = (e) => {
        // connection closed
        console.log("wsface websocket close", e.code, e.reason);
    };
}

export const WebSocketBoxConnect = (shopId,props) => {
    var wsbox = new WebSocket(ws.box(shopId));
    wsbox.onopen = () => {
        // connection opened
        wsbox.send('something'); // send a message
    };

    wsbox.onmessage = (e) => {
        // a message was received
        console.log("wsbox receive message", JSON.parse(e.data));
        // this.props.receieveCustomerFaces(JSON.parse(e.data));
    };

    wsbox.onerror = (e) => {
        // an error occurred
        console.log("wsbox websocket error", e.message);
    };

    wsbox.onclose = (e) => {
        // connection closed
        console.log("wsbox websocket close", e.code, e.reason);
    };
}
