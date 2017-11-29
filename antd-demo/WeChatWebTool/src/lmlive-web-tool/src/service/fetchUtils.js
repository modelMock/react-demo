import webUtils from '../commons/utils/webUtils';
import {hashHistory} from 'react-router';

// 是否调试模式，更多的日志输出
const DEBUG_MODE = webUtils.getDebugMode()

// 临时通过Webpack-dev-server Proxy模式
// 上线的时候需要将api去掉
const MAPPING_PREFFIX = DEBUG_MODE ? "/show-manager/" : "";

// 处理Ajax错误代码
const processAJaxStatusCode = function(response){
  if(response.status === 200){
    return true
  }
  webUtils.alertFailure("请求错误，请检查网络是否通畅")
  return false
}
const processBusinessErrorCode = function(response, jsonValue){
  const {code, message} = jsonValue
  if(code === 200){
    return true
  }else if(code === 500){
    // 清空本地存储
    localStorage.clear();
    webUtils.alertFailureCallback(`登录已失效，您需要重新登录喔~`, function() {
      hashHistory.replace("/login");
    })
    return false
  }else if(code === -1){
    const tip = `Code: ${code} Message: ${message}`
    webUtils.alertFailure(`系统未知错误，${tip}`, 0)
    return false
  }else{
    webUtils.alertFailure(message, 0)
    return false
  }
}

// 发起一个fetch请求
const doJsonFetch = (methodMapping, params) => {
  if(!methodMapping || methodMapping.length === 0){
    console.error("Fetch Error", "Method Mapping is invalid!")
    return ;
  }
  if(methodMapping.substr(0, 1) === '/'){
    methodMapping = methodMapping.substr(1)
  }

  if(DEBUG_MODE){
    console.log("请求服务端API -> ", `URL: ${methodMapping}, Params: ${params?JSON.stringify(params):"{}"}`)
  }
  const bodyJsonString = params ? JSON.stringify(params) : ""
  const OPTIONS = {
    method: 'POST',
    dataType: 'json',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body:bodyJsonString
  }
  return new Promise((resolve, reject) => {
    fetch(MAPPING_PREFFIX + methodMapping, OPTIONS)
      .then(response => {
        // 处理ajax状态代码
        if(!processAJaxStatusCode(response)){
          reject(response, null)
          return
        }
        const contentType = response.headers.get('Content-Type');
        if(contentType !== "application/xls") {
          // 提取业务返回参数
          response.json().then(json => {
            // 统一处理业务错误
            if (!processBusinessErrorCode(response, json)) {
              reject(response, json)
              return
            }
            // DEBUG模式输出返回值
            if (DEBUG_MODE) {
              console.log("服务端响应数据 <- ", json)
            }
            resolve(json["data"])
          })
        } else {
          response.blob().then(blob => {
            resolve(blob)
          })
        }
      })
  })
}

const doFileFetch = (methodMapping, params) => {
  if (!methodMapping || methodMapping.length == 0) {
    console.error("Fetch Error", "Method Mapping is invalid!")
    return;
  }
  if (methodMapping.substr(0, 1) === '/') {
    methodMapping = methodMapping.substr(1)
  }
  params.append("sessionId", localStorage.getItem("sessionId"))
  const OPTIONS = {
    method: 'POST',
    body: params
  }
  return new Promise((resolve, reject) => {
    fetch(MAPPING_PREFFIX + methodMapping, OPTIONS)
      .then(response => {
        // 处理ajax状态代码
        if(!processAJaxStatusCode(response)){
          reject(response)
          return
        }
        // 提取业务返回参数
        response.json().then(json=>{
          // 统一处理业务错误
          if(processBusinessErrorCode(response, json) === false){
            reject(json)
            return
          }
          // DEBUG模式输出返回值
          if(DEBUG_MODE){
            console.log("服务端响应数据 <- ", json)
          }
          resolve(json["data"])
        })
      })
  })
}

export default {
  // 采用Promise 机制
  // 调用时通过then,catch来处理结果集
  json: doJsonFetch,
  file: doFileFetch
}
