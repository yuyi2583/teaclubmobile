const HOME = "http://192.168.1.228:8080";
const HOST=`${HOME}/mobile`;
const WSHOME="ws://192.168.1.228:8080/websocket";

export default {
   login:()=>`${HOST}/login`,
   verifyToken:(token)=>`${HOST}/verifyToken/${token}`,
   fetchCustomer:(uid,type)=>`${HOST}/customer/${uid}/${type}`,
   fetchSearchCustomer:(uid)=>`${HOST}/searchCustomer/${uid}`,
   customerPickUp:()=>`${HOST}/ordershipped`,
   fetchBoxes:(shopId)=>`${HOST}/boxes/${shopId}`,
   fetchReservations:(boxId,startTime,endTime)=>`${HOST}/reservations/${boxId}/${startTime}/${endTime}`,
   reserve:()=>`${HOST}/reserve`,
   pay:(customerId,value)=>`${HOST}/simulatePay/${customerId}/${value}`,
   fetchProducts:(shopId)=>`${HOST}/products/${shopId}`,
   placeOrder:()=>`${HOST}/order`,
   searchCustomer:(searchText)=>`${HOST}/search/${searchText}`,
   register:(faceId)=>`${HOST}/register/${faceId}`,
   fetchOrders:(customerId)=>`${HOST}/orders/${customerId}`,
}

export const ws={
   pay:(customerId)=>`${WSHOME}/pay/${customerId}`,
   face:(clerkId)=>`${WSHOME}/face/${clerkId}`,
   box:(shopid)=>`${WSHOME}/box/${shopid}`,
   balance:(customerId)=>`${WSHOME}/balance/${customerId}`,

}