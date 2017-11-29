import React from 'react';
import { Tag } from 'antd';

export function AdsStatusRender(status, statusText) {
  if(status == 'AUDITING' || status === 'ALLSHOW') {  //待审批、全部展示
    return <Tag color="green">{statusText}</Tag>
  } else if(status == 'PUTTING') {  //投放中
    return <Tag color="blue">{statusText}</Tag>
  } else if(status == 'AUDITFAIL') {    //审批失败
    return <Tag color="red">{statusText}</Tag>
  } else if(status === 'PARTDELETE' || status === 'ALLDELETE') {    //部分删除、全部删除
    return <Tag color="yellow">{statusText}</Tag>
  }
  return statusText;
}

export function AuditResultRender(auditResult, auditResultText) {
  if(auditResult == 'T') {      //审核通过
    return <Tag color="green">{auditResultText}</Tag>;
  } else if(auditResult== 'F') {   //审核不通过
    return <Tag color="red">{auditResultText}</Tag>;
  }
  return auditResultText;
}

export function PublishTypeRender(publishType, publishTypeText) {
  if(publishType == 'CustomDefine') {      //自定义
    return <Tag color="green">{publishTypeText}</Tag>;
  } else if(publishType == 'Transfer') {   //转发
    return <Tag color="blue">{publishTypeText}</Tag>;
  }
  return publishTypeText;
}

export function PutTypeRender(putType, putTypeText) {
  if(putType == 'Chosen') {            //精粉
    return <Tag color="green">{putTypeText}</Tag>;
  } else if(putType == 'NotChosen') {  //范粉
    return <Tag color="blue">{putTypeText}</Tag>;
  }
  return putTypeText;
}
