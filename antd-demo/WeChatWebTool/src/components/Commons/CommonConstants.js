import React from 'react';
import {Modal, Tag, Popover} from 'antd';

export function contentSubRender(text){
  if(text && text.length > 30) {
    return <Popover title="详情" content={text}>
            <span>{text.substr(0, 30) + "..."}</span>
           </Popover>
  }
  return text;
}

export function Confirm(fn=function(){}, content="确认提交吗？", title="提示") {
  Modal.confirm({
    title,
    content,
    onOk: function() {
      fn.call(this);
    }
  });
}

export function Success(content="提交成功", title="成功提示") {
  if(window.successModal)window.successModal.destroy()
  window.successModal = Modal.success({
    title, content
  });
}

export function Errors(content, title="错误提示"){
  if(window.errorModal)window.errorModal.destroy()
  window.errorModal = Modal.error({
    title, content
  });
}

export function statusRender(status, status_text){
  if(status === "ACTIVE") {
    return <Tag color="green">{status_text}</Tag>
  } else if(status === 'DISABLED') {
    return <Tag color="red">{status_text}</Tag>
  }
  return status_text;
}

export function mobileValidate(rule, value, callback){
  if (!value) {
    callback();
  } else {
    setTimeout(() => {
      if (!(/^1[3|4|5|7|8]\d{9}$/.test(value))){
        callback([new Error('输入的手机号格式不正确')]);
      } else {
        callback();
      }
    }, 100);
  }
}
