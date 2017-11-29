import xFetch from './xFetch';


//重置密码
export async function resetPasswd(to_optr_id) {
  return xFetch('/sys/resetPasswd', {to_optr_id});
}

//修改密码
export async function updatePasswd(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/sys/updatePasswd', values);
}

//登录
export async function login(values) {
  return xFetch('/sys/login', values);
}

//检查session是否存在
export async function checkSession() {
  return xFetch('/sys/checkSession');
}

//登出
export async function logout() {
  return xFetch('/sys/logout');
}

//根据操作员获取资源列表
export async function queryWebMappingListOfOptr() {
  return xFetch('/sys/queryWebMappingListOfOptr');
}

//查询客服列表
export async function queryKefuList(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/sys/queryKefuList', values);
}
//查询选品方
export async function querySelectedParty(){
  return xFetch('/common/queryItemValueByKey',{item_key:"SelectedParty"});
}

//添加客服
export async function addKefu(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/sys/addKefu', values);
}

//编辑客服
export async function updateSysOptrName(values) {
  return xFetch('/sys/updateSysOptrName', values);
}

//封号
export async function updateKefuDisabled(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/sys/updateKefuDisabled', values);
}

//根据输入模糊查询客服数据
export async function queryOptrByName(optrName) {
  return xFetch('/sys/queryOptrByName', optrName);
}

//根据输入模糊查询客服集合 和 运营号统计数据
export async function queryOptrAndOpCountByName(optrName) {
  return xFetch('/sys/queryOptrAndOpCountByName', {optr_name: optrName});
}

//查询相同渠道的客服集合
export async function queryOptrByChannelId() {
  return xFetch('/sys/queryOptrByChannelId', {optr_id: localStorage.getItem('optr_id')});
}

//查询客服下运营号统计数据
export async function queryOperCountByOptrId(values) {
  return xFetch('/sys/queryOperCountByOptrId', values);
}

//根据客服id查询客服对应渠道id ，再根据渠道id查询客服下运营号统计数据
export async function queryOptrCountInfoByChannelId() {
  return xFetch('/sys/queryOptrCountInfoByChannelId', {optr_id: localStorage.getItem('optr_id')});
}

//按客服和输入好友数 估算可分配渠道的运营号数据
export async function queryOperByOptrIdAndFrdCnt(values) {
  return xFetch('/sys/queryOperByOptrIdAndFrdCnt', values);
}
//批量修改选品方
export async function batchUpdateSysOptrSelectedParty(values) {
  return xFetch('/sys/batchUpdateSysOptrSelectedParty', values);
}
//转移
export async function transferKefuFriends(values) {
  values['optr_id'] = localStorage.getItem('optr_id');
  return xFetch('/sys/transferKefuFriends', values);
}
//查询运营方
export async function queryClusterBusinessOperator(){
  return xFetch('/common/queryItemValueByKey',{item_key:"BusinessOperator"});
}
// 设置运营方页面的查询
export async function queryBusinessOperator(){
  return xFetch('/cluster/queryBusinessOperator');
}
// 批量修改群运营方
export async function batchUpdateSysOptrBusinessOperator(values){
  return xFetch('/sys/batchUpdateSysOptrBusinessOperator',values);
}
// 提取群客服自动分配参数
export async function queryClusterReferrerConfig(){
  return xFetch('/sys/queryClusterReferrerConfig');
}
// 保存群客服自动分配参数
export async function saveClusterReferrerConfig(value){
  return xFetch('/sys/saveClusterReferrerConfig',value);
}
