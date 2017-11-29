import xFetch from './xFetch';

//根据问题，回复内容搜索好友问题自动回复记录
export async function queryChannelQuestionList(values){
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/channel/queryChannelQuestionListByRequest', values);
}

//编辑自动回复信息
export async function saveChannelQuestion(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/channel/saveChannelQuestion', values);
}

//删除自动回复信息
export async function deleteChannelQuestion(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/channel/deleteChannelQuestion', values);
}

//审核自动回复信息列表
export async function queryChannelReplyListForAudit(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/channel/queryChannelReplyListForAudit', values);
}

//自动回复审核
export async function auditChannelReply(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/channel/auditChannelReply', values);
}

//获取客服聊天和离岗自动回复设置
export async function queryChannelAutoReplyForChat() {
  return xFetch('/channel/queryChannelAutoReplyForChat', {optr_id: localStorage.getItem('optr_id')});
}

//保存聊天自动回复和离岗自动回复
export async function saveChannelAutoReplyForChatAndOffDuty(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/channel/saveChannelAutoReplyForChatAndOffDuty', values);
}

//获取广告朋友圈和普通朋友圈自动回复设置
export async function queryChannelAutoReplyForCircle() {
  return xFetch('/channel/queryChannelAutoReplyForCircle', {optr_id: localStorage.getItem('optr_id')});
}

//保存广告圈自动回复
export async function saveChannelAutoReplyForCircle(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/channel/saveChannelAutoReplyForCircle', values);
}



export async function queryReplyHfMsgList(values){
  return xFetch('/api/queryReplyHfMsgList');
}
export async function queryCheckReplyFormData(){
  return xFetch('/api/queryCheckReplyFormData');
}
export async function queryCheckReplyList(values){
  return xFetch('/api/queryCheckReplyList');
}
