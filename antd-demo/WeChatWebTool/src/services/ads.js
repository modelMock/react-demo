import xFetch from './xFetch';

//查询广告主题列表
export async function queryAdByName(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/ad/queryAdByName', values);
}

//编辑广告
export async function updateAdName(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/ad/updateAdName', values);
}

//查询发朋友圈
export async function queryPublishAd(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/ad/queryPublishAd', values);
}

//删除 发朋友圈广告
export async function delPublishAd(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/ad/delPublishAd', values);
}

//删除并重发 发朋友圈广告
export async function delAndResendPublishAd(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/ad/delAndResendPublishAd', values);
}

//根据广告名称模糊查询广告列表
export async function queryAdConfigByName(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/ad/queryAdConfigByName', values);
}

//所有省数据
export async function getProvinces() {
  return xFetch('/sys/getProvinces');
}

//查询省下城市
export async function getCitiesByProvinces(values) {
  return xFetch('/sys/getCitiesByProvinces', values);
}

//发朋友圈 提取可投放的运管号统计数据
export async function getPublishOperationsTotal(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/ad/getPublishOperationsTotal', values);
}

//发朋友圈 提取确认界面数据,按运营号过滤
export async function getPublishOperationsConfirm(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/ad/getPublishOperationsConfirm', values);
}

//发朋友圈广告
export async function publishAd(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/ad/publishAd', values);
}

//预览朋友圈
export async function getSnsDetail(values) {
  return xFetch('/ad/getSnsDetail', values);
}

//发朋友圈详情
export async function getPublishAdInfo(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/ad/getPublishAdInfo', values);
}

//发朋友圈审核列表
export async function queryAdPublishListForAudit(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/ad/queryAdPublishListForAudit', values);
}

//允许、拒绝发布朋友圈
export async function auditPublishAd(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/ad/auditPublishAd', values);
}

//获取发送时间间隔
export async function queryChannelByOptrId() {
  return xFetch('/channel/queryChannelByOptrId', {optr_id: localStorage.getItem('optr_id')});
}

//修改朋友圈发送时间间隔
export async function updateAdPublishInterval(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/channel/updateAdPublishInterval', values);
}
//运营方发圈分组列表
export async function queryBusinessOperatorTeamList(values) {
  return xFetch('/ad/queryBusinessOperatorTeamList', values);
}
//获取运营方分组发圈参数
export async function getBusinessOperatorAdTeamParam() {
  return xFetch('/ad/getBusinessOperatorAdTeamParam');
}
//获取单个运营方的统计信息
export async function getOneBusinessOperatorAdTeamParam(value) {
  return xFetch('/ad/getOneBusinessOperatorAdTeamParam',value);
}
//上传图片后保存运营方的二维码url到数据库
export async function saveBusinessOperatorQRCode(value) {
  return xFetch('/ad/saveBusinessOperatorQRCode',value);
}
//保存运营方分组发圈参数
export async function saveBusinessOperatorAdTeamParam(value) {
  return xFetch('/ad/saveBusinessOperatorAdTeamParam',value);
}
//查询运营方
export async function queryClusterBusinessOperator(){
  return xFetch('/common/queryItemValueByKey',{item_key:"BusinessOperator"});
}
//删除运营方所有的二维码
export async function deleteQrcodeByBusinessOperator(value){
  return xFetch('/ad/deleteQrcodeByBusinessOperator',{business_operator:value});
}
//获取某运营方二维码列表
export async function getBusinessOperatorQRCodeByOperator(value){
  return xFetch('/ad/getBusinessOperatorQRCodeByOperator',{business_operator:value});
}
//分配运营方分组
export async function updateBusinessOperatorTeam(value){
  return xFetch('/ad/updateBusinessOperatorTeam',value);
}
//查询一个客服管理的秀场主播列表
export async function queryAnchorToAd() {
  return xFetch('/ad/queryAnchorToAd');
}
