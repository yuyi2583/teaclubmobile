/**
 * 返回时间yyyy-MM-dd hh:mm
 * @param {*} timeStamp 时间戳
 */
export const timeStampConvertToFormatTime = (timeStamp) => {
    let date = new Date(timeStamp);
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    let h = (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ':';
    let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    let s = date.getSeconds();
    return Y + M + D + h + m;
}

/**
 * 将时间字符串转换为时间戳
 * @param {*} timeString 
 */
export const timeStringConvertToTimeStamp = (timeString) => {
    let date = new Date(timeString);
    return date.getTime();
}

/**
 * 将moment格式时间数据转为时间戳
 * @param {*} time 
 */
export const momentConvertToTimeStamp = (time) => {
    return new Date(time().format()).getTime();
}

/**
 * 获取n天后凌晨0点的时间戳
 * @param {*} n 今天为0，明天1，昨天-1,以此类推
 */
export const getNDaysTimeStamp = (n) => {
    return new Date(new Date().setHours(0, 0, 0, 0)).getTime() + n * 1000 * 60 * 60 * 24;
}

/**
 * 返回n天后的时间格式yyyy-MM-dd
 * @param {*} n 今天为0，明天1，昨天-1,以此类推
 */
export const getNDayTimeString = (n = 0) => {
    let date = new Date(new Date().getTime() + n * 1000 * 60 * 60 * 24);
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    return Y + M + D;
}


/**
 * 将时间戳转化为hh:mm格式返回
 * @param {*} timestamp 
 */
export const convertTimestampToHHMM = (timestamp) => {
    let date = new Date(timestamp);
    let h = (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ':';
    let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    return h + m;
}