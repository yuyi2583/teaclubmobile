const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
  });
  
  function get(url) {
    return fetch(url, {
      method: "GET",
      headers: headers,
      // credentials: "include"  //携带cookie的配置
    }).then(response => {
      return handleResponse(url, response);
    }).catch(err => {
      // callNotification("error", "请求失败，连接不到服务器.");
      // console.error(`Request failed. Url = ${url} . Message = ${err}`);
      return  { msg: "请求失败，连接不到服务器.", code: "404" ,error:"请求失败，连接不到服务器." };
    })
  }
  
  function _delete(url) {
    return fetch(url, {
      method: "DELETE",
      headers: headers,
      // credentials: "include"  //携带cookie的配置
    }).then(response => {
      return handleResponse(url, response);
    }).catch(err => {
      // callNotification("error", "请求失败，连接不到服务器.");
      // console.error(`Request failed. Url = ${url} . Message = ${err}`);
      return {  msg: "请求失败，连接不到服务器.", code: "404" ,error:"请求失败，连接不到服务器." };
    })
  }
  
  function put(url, params) {
    return fetch(url, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(params),
      // credentials: "include"  //携带cookie的配置
    }).then(response => {
      return handleResponse(url, response);
    }).catch(err => {
      // callNotification("error", "请求失败，连接不到服务器.");
      // console.error(`Request failed. Url = ${url} . Message = ${err}`);
      return { msg: "请求失败，连接不到服务器.", code: 404,error:"请求失败，连接不到服务器."  };
    })
  }
  
  
  function post(url, params) {
    return fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(params),
      // credentials: "include"  //携带cookie的配置
    }).then(response => {
      console.log("response",response)
      return handleResponse(url, response);
    }).catch(err => {
      return  { msg: "请求失败，连接不到服务器.", code: 404 ,error:"请求失败，连接不到服务器."};
    })
  }
  
  function handleResponse(url, response) {
    console.log("handle response json", JSON.stringify(response));
    if(response.status==404){
      return { msg: "请求失败，找不到该资源.", code: 404 ,error:"请求失败，连接不到服务器." };
    }
    if (response.status < 500) {
      return response.json();
    } else {
      return { msg: "服务器内部错误，无法获取数据.", code: response.statusText,error:"服务器内部错误，无法获取数据." };
    }
  }
  
  export { post, get, put,_delete };