import xFetch from './xFetch';

//查询运营号列表
export async function queryOperationList(values) {
  return xFetch('/working/queryOperationList', values);
}

//查询运营号原始组号
export async function queryOperationGroup(values) {
  return xFetch('/working/queryOperationGroup', values);
}

//运营号解除绑定
export async function updateUnbind(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/working/updateUnbind', values);
}

//刷新对端接口
export async function updateOperation() {
  return xFetch('/operation/updateOperation', {});
}

//查询未分配渠道的运营号列表
export async function queryOperationForChannelIdIsNul(values) {
  return xFetch('/working/queryOperationForChannelIdIsNul', values);
}

//查询未分配客服的运营号列表
export async function queryOperationForOptrIdIsNul(values) {
  return xFetch('/working/queryOperationForOptrIdIsNul', values);
}

//分配渠道
export async function updateAssignChannel(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/working/updateAssignChannel', values);
}

//分配客服
export async function updateAssignOptr(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/working/updateAssignOptr', values);
}

//查询运营号未分配渠道的统计数据
export async function queryUnassignChannelCount(values) {
  return xFetch('/working/queryUnassignChannelCount', values);
}

//查询运营号未分配客服的统计数据
export async function queryUnassignOptrCount() {
  return xFetch('/working/queryUnassignOptrCount');
}

//渠道：根据输入好友数 估算 运营号记录数 和 这些运营号记录数好友总数
export async function queryAssignChanellForFrdCnt(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/working/queryAssignChanellForFrdCnt', values);
}

//客服：根据输入好友数 估算 运营号记录数 和 这些运营号记录数好友总数
export async function queryAssignOptrForFrdCnt(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/working/queryAssignOptrForFrdCnt', values);
}

//分配渠道(按好友数模糊分配)
export async function updateAssignChanellForFrdCnt(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/working/updateAssignChanellForFrdCnt', values);
}

export async function updateAssignOptrForFrdCnt(values) {
    values['optr_id'] = localStorage.getItem('optr_id');
    return xFetch('/working/updateAssignOptrForFrdCnt', values);
}
//二维码
export async function getOperationBase64QrCode(values){
  return xFetch('/operation/getOperationBase64QrCode', values);
}

// 获取微信组号
export async function queryAllWechatGroup(){
  return xFetch('/operation/queryAllWechatGroup');
}
