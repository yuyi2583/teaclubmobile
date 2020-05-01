const HOME = "http://192.168.1.228:8080";
const HOST=`${HOME}/mobile`;

export default {
   login:()=>`${HOST}/login`,
   verifyToken:(token)=>`${HOST}/verifyToken/${token}`,
}