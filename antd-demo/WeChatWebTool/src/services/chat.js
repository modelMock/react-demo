import xFetch from './xFetch';

export async function queryWebSocketUrls() {
  return xFetch('/user/queryWebSocketUrls', {location_protocol: window.location.protocol});
}

//根据运营sn和粉丝sn查询广告列表
export async function queryAdByFriendOperation(values) {
  values['service_optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/user/queryAdByFriendOperation', values)
}

export async function queryRecordAdInteract(values) {
  return xFetch('/user/queryRecordAdInteract', values)
}

//查询聊天记录
export async function queryRecordChat(values) {
  return xFetch('/user/queryRecordChat', values)
}

//查询好友信息
export async function queryUserInfo(values) {
  return xFetch('/user/queryUserInfo', values)
}

//查询好友信息列表
export async function queryUserInfoList(values) {
  values['service_optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/user/queryUserInfoList', values);
}

//本地发图片消息
export async function uploadImg(img64Data) {
  let suffix = img64Data.substring(11, img64Data.indexOf(";"))
  img64Data = img64Data.substr(img64Data.indexOf(';base64,')+8);

  return xFetch('/common/uploadFile', {img64Data, suffix, optr_id: localStorage.getItem('optr_id'), upload_type: 'PART'})
}

//UI界面手工回复一条聊天消息   单聊回复
export async function multReplyFriendByHand(values) {
  return xFetch('/mult/replyFriendByHand', values);
}
