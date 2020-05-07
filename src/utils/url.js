const HOME = "http://192.168.1.228:8080";
const HOST=`${HOME}/mobile`;
const WSHOME="ws://192.168.1.228:8080/websocket";

export default {
   login:()=>`${HOST}/login`,
   verifyToken:(token)=>`${HOST}/verifyToken/${token}`,
   fetchCustomer:(uid)=>`${HOST}/customer/${uid}`,
   customerPickUp:()=>`${HOST}/ordershipped`,
   fetchBoxes:(shopId)=>`${HOST}/boxes/${shopId}`,
   fetchReservations:(boxId,startTime,endTime)=>`${HOST}/reservations/${boxId}/${startTime}/${endTime}`,
   reserve:()=>`${HOST}/reserve`,
   pay:(customerId)=>`${HOST}/simulatePay/${customerId}`,
}

export const ws={
   pay:(customerId)=>`${WSHOME}/pay/${customerId}`,
   face:(clerkId)=>`${WSHOME}/face/${clerkId}`,
   box:(shopid)=>`${WSHOME}/box/${shopid}`,

}