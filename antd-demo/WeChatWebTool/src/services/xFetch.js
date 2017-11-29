import fetch from 'isomorphic-fetch';
import {Errors} from '../components/Commons/CommonConstants';
import { hashHistory } from 'react-router';

const errorMessages = (res) => `${res.status} ${res.statusText}`;

function check401(res) {
  if (res.status === 401) {
    location.href = '/401';
  }
  return res;
}

function check404(res) {
  if (res.status === 404) {
    return Promise.reject(errorMessages(res));
  }
  return res;
}

function jsonParse(res) {
  return res.json().then(jsonResult => {
    if("data" in jsonResult) {
      jsonResult = jsonResult.data;
    }
    return ({ ...res, jsonResult });
  });
}

function errorMessageParse(res) {
  const jsonResult = res.jsonResult;
  const { code=200, message="" } = jsonResult;
  if (code == 200) {
    return res;
  } else {
    if(code == 20 || code == 25) {
      //登录失效 或 资源为null，没有访问权限
      if(!localStorage.getItem("sessionId")) {
        localStorage.clear();
      }
      Errors(message);
      hashHistory.replace("/signIn");
    }else {
      Errors(message);
    }
    return Promise.reject(message);
  }
}

function xFetch(url, options = {}) {
  url = ServerHost + url;
  options['sessionId'] = localStorage.getItem('sessionId');
  options = {
    "body": JSON.stringify(options),
    "method": 'POST'
  };
  const opts = { ...options };
  opts.headers = {
    "Content-Type": "application/json;charset=UTF-8",
  };

  return fetch(url, opts)
    .then(check401)
    .then(check404)
    .then(jsonParse)
    .then(errorMessageParse);
}

export default xFetch;
