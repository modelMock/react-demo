import xFetch from './xFetch';

//搜索界面 最近热聊好友
export async function queryHotUsers() {
  return xFetch('/user/queryHotUsers', {service_optr_id: localStorage.getItem('optr_id')});
}

//搜索好友
export async function searchFriend(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/user/searchFriend', values)
}

//搜索好友广告列表
export async function queryAdByOptr() {
  return xFetch('/user/queryAdByOptr', {optr_id: localStorage.getItem('optr_id')});
}
