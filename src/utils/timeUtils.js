//返回时间yyyy-MM-dd hh:mm
export const timeStampConvertToFormatTime = (timeStamp) => {
    let date = new Date(timeStamp);
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    let D = date.getDate() + ' ';
    let h = date.getHours() + ':';
    let m = date.getMinutes();
    let s = date.getSeconds();
    return Y + M + D + h + m;
}

//将时间字符串转换为时间戳
export const timeStringConvertToTimeStamp = (timeString) => {
    let date = new Date(timeString);
    return date.getTime();
}

//将moment格式时间数据转为时间戳
export const momentConvertToTimeStamp = (time) => {
    return new Date(time().format()).getTime();
}

//获取n天前凌晨0点的时间戳
export const getNDaysAgoTimeStamp=(n)=>{
   return new Date(new Date().setHours(0, 0, 0, 0)).getTime()-n*1000*60*60*24;
}