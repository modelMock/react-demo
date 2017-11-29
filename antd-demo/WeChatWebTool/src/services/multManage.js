import xFetch from './xFetch';

//查询一个客服管理的秀场主播列表
export async function queryAnchorByOptr() {
  return xFetch('/multmanage/queryAnchorByOptr');
}
//查询一个客服管理的秀场主播列表
export async function queryAnchorToAd() {
  return xFetch('/ad/queryAnchorToAd');
}
/*群发表格操作开始*/
//群发列表查询
export async function queryMassTextingRecord(offset, limit, condition={}) {
  condition['offset'] = offset;
  condition['limit'] = limit;
  return xFetch('/multmanage/queryMassTextingRecord', condition);
}
//群发 允许发布
export async function updateMassAllow(record_sn) {
  return xFetch('/multmanage/updateMassAllow', {record_sn});
}
//群发 拒绝发布
export async function updateMassRefuse(record_sn, reason) {
  return xFetch('/multmanage/updateMassRefuse', {record_sn, reason});
}
/*群发表格操作结束*/

//群发搜索初始化
export async function initMassSearch() {
  return xFetch('/multmanage/initMassSearch');
}

//群发搜索 (限定单个客服)
export async function massSearch(offset, limit, condition) {
  return xFetch('/multmanage/massSearch', {offset, limit, condition:condition });
}

//查询常用语
export async function queryShowCommonLanguages() {
  return xFetch('/mult/queryShowCommonLanguages');
}
//保存群发
export async function saveMassTexting(condition, chatContents, need_friend_cnt, delay_minute, remark,tag_ids){
  return xFetch('/multmanage/saveMassTexting', {condition, chatContents, need_friend_cnt, delay_minute, remark,tag_ids});
}
//群发详情
export async function getMassTextingInfo(record_sn){
  return xFetch('/multmanage/getMassTextingInfo', {record_sn});
}
//删除群发
export async function deleteMass(record_sn){
  return xFetch('/multmanage/deleteMass', {record_sn});
}
//设置：查询客服基础配置
export async function initMultManage(){
  return xFetch('/multmanage/initMultManage');
}
//增加修改或作废一个分组
export async function modShowGroup(group_id, group_name, status='ACTIVE'){
  return xFetch('/multmanage/modShowGroup',{group_id, group_name, status});
}
//增加修改或作废一条常用语
export async function modShowLanguage(record_id, content, status){
  return xFetch('/multmanage/modShowLanguage',{record_id, content, status});
}
//设置操作员的基础配置(窗口设置等)
export async function updateOptrConfig(configMap){
  return xFetch('/multmanage/updateOptrConfig',{configMap});
}
