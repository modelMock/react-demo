import React from 'react';
import { Tag } from 'antd';

export default function OperationStatusRender(status, statusText) {
  if(status == 'ACTIVE') {  //正常
    return <Tag color="green">{statusText}</Tag>
  } else if(status == 'UNACCOUNT') {  //封号
    return <Tag color="blue">{statusText}</Tag>
  } else if(status == 'NOTACCOUNT') {    //永久封号
    return <Tag color="red">{statusText}</Tag>
  } else if(status == 'PWERROR') {    //密码错误
    return <Tag color="yellow">{statusText}</Tag>
  }
  return statusText;
}
