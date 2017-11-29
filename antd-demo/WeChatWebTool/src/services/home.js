import xFetch from './xFetch';

//获取好友主页信息
export async function getFriendMainPage(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/user/getFriendMainPage', values);
}

//修改好友备注名
export async function updateFriendRemarkName(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/user/updateFriendRemarkName', values);
}

//客服给好友打广告标签
export async function addMarkedAdsForFriend(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/user/addMarkedAdsForFriend', values);
}
