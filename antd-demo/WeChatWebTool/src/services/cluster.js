/*群管理*/
import xFetch from './xFetch';

//查询群列表
export async function queryClusterList(params){
  return xFetch('/cluster/queryClusterList', params);
}
//查询大群列表
export async function queryClusterAdvertisementList(params){
  return xFetch('/cluster/queryClusterList', params);
}
//查询客服号
export async function queryClusterCustomerNumber(){
  return xFetch('/cluster/queryClusterOper');
}
//查询群类型
export async function queryClusterType(){
  return xFetch('/common/queryItemValueByKey',{item_key:"ClusterType"});
}
//查询邀请进度
export async function queryClusterInviteFriendCnt(){
  return xFetch('/common/queryItemValueByKey',{item_key:"InviteFriendCnt"});
}
//查询商业属性
export async function queryClusterBusiness(){
  return xFetch('/common/queryItemValueByKey',{item_key:"ClusterBusiness"});
}
//查询运营方
export async function queryClusterBusinessOperator(){
  return xFetch('/common/queryItemValueByKey',{item_key:"BusinessOperator"});
}
//群关闭发广告
export async function closeMockAd(clusterSns){
  return xFetch('/cluster/closeMockAd',{clusterSns:clusterSns});
}
//群开启发广告
export async function openMockAd(clusterSns){
  return xFetch('/cluster/openMockAd',{clusterSns:clusterSns});
}
//配置推荐专员
export async function initAssignReferrer(clusterSns){
  return xFetch('/cluster/initAssignReferrer', {clusterSns});
}
//推荐专员列表
export async function queryOptrToAssignReferrer(values){
  return xFetch('/cluster/queryOptrToAssignReferrer',values);
}
//线上互加提交
export async function assignReferrer(clusterSns,operationSns,cluster_optr_id){
  return xFetch('/cluster/assignReferrer',{clusterSns,operationSns,cluster_optr_id});
}
//线下邀请提交
export async function assignOffline(clusterSns,operationSns,cluster_optr_id){
  return xFetch('/cluster/assignOffline',{clusterSns,operationSns,cluster_optr_id});
}
//群系统消息日志
export async function queryClusterSysNote(values){
  return xFetch('/cluster/queryClusterSysNote',values);
}
/*群身份列表查询
cluster/queryOperIdentity
群身份列表的解绑推荐专员
cluster/operUnbindClusterRef
*/
//群身份列表查询
export async function queryOperIdentity(values){
  return xFetch('/cluster/queryOperIdentity',values);
}
//群身份列表的解绑推荐专员
export async function operUnbindClusterRef(idetitySnList){
  return xFetch('/cluster/operUnbindClusterRef',{idetitySnList:idetitySnList});
}
//运营号状态,用于填充群身份列表查询 运营号状态下拉
export async function queryItemValueByKey(){
  return xFetch('/common/queryItemValueByKey',{item_key:"OperationStatus"});
}
/*
外部群接入配置
初始化查询
cluster/queryMonitorParam
开启监控
cluster/openMonitor
关闭监控
cluster/closeMonitor
*/
//外部群接入配置 初始化查询
export async function queryMonitorParam(){
  return xFetch('/cluster/queryMonitorParam');
}
//开启监控
export async function openMonitor(values){
  return xFetch('/cluster/openMonitor',values);
}
//关闭监控
export async function closeMonitor(){
  return xFetch('/cluster/closeMonitor');
}
/*
发布专员界面初始化
cluster/queryPublishParam
保存发布专员配置参数
cluster/savePublishParam
*/
//发布专员界面初始化
export async function queryPublishParam(){
  return xFetch('/cluster/queryPublishParam');
}
//保存发布专员配置参数
export async function savePublishParam(values){
  return xFetch('/cluster/savePublishParam',values);
}
/*
补中间运营号，只做第一个界面
cluster/clusterPatchOper   调用这个API返回后，如果后台成功返回，则在界面提示 “补中间运营号成功”
 */
 //补中间运营号
 export async function clusterPatchOper(values){
   return xFetch('/cluster/clusterPatchOper', values);
 }
/*
群信息中功能
修改群名称
cluster/updateClusterName
修改群公告
cluster/updateClusterNotice
修改群信息邀请说明
cluster/updateClusterInviteInfo
*/

//修改群名称
export async function updateClusterName(cluster_sn,values){
  return xFetch('/cluster/updateClusterName', {cluster_sn,cluster_name:values});
}
//修改群公告
export async function updateClusterNotice(cluster_sn,values){
  return xFetch('/cluster/updateClusterNotice', {cluster_sn,cluster_notice:values});
}
//修改群信息邀请说明
export async function updateClusterInviteInfo(cluster_sn,values){
  return xFetch('/cluster/updateClusterInviteInfo', {cluster_sn,invite_info:values});
}

//编辑群信息
export async function updateCluster(values){
  return xFetch('/cluster/updateCluster', values);
}
//邀请好友进群初始化数据
export async function queryClusterInviteFriends(cluster_sn){
  return xFetch('/cluster/queryClusterInviteFriends', {cluster_sn});
}
//邀请好友进群
export async function saveInviteFriendCnt(cluster_sn, clusterOptaionsFrdList){
  return xFetch('/cluster/saveInviteFriendCnt', {cluster_sn, clusterOptaionsFrdList});
}
//转让群主
export async function transferCluster(values){
  return xFetch('/cluster/transferCluster', values);
}
//303组登陆
export async function qrLogin(values){
  return xFetch('/cluster/qrLogin', values);
}
//广告参数界面初始化
export async function queryMockParam(){
  return xFetch('/cluster/queryMockParam');
}
//保存广告参数
export async function saveMockParam(values){
  return xFetch('/cluster/saveMockParam',values);
}

//批量修改群说明
export async function batchUpdateClusterInviteInfo(values){
  return xFetch('/cluster/batchUpdateClusterInviteInfo',values);
}
//批量关闭群说明
export async function batchClearClusterInviteInfo(values){
  return xFetch('/cluster/batchClearClusterInviteInfo',values);
}
//批量修改群欢迎语
export async function batchUpdateClusterWelcomeInfo(values){
  return xFetch('/cluster/batchUpdateClusterWelcomeInfo',values);
}
//批量关闭群欢迎语
export async function batchClearClusterWelcomeInfo(values){
  return xFetch('/cluster/batchClearClusterWelcomeInfo',values);
}
// 设置运营方页面的查询
export async function queryBusinessOperator(){
  return xFetch('/cluster/queryBusinessOperator');
}
// 批量修改群运营方
export async function batchupdateClusterBusinessOperator(values){
  return xFetch('/cluster/batchupdateClusterBusinessOperator',values);
}
// 批量发送群公告
export async function batchClusterNotice(values){
  return xFetch('/cluster/batchClusterNotice',values);
}

/**
 * 群踢人设置
 */
// 查询踢人配置
export async function queryClusterKickCfg(){
  return xFetch('/cluster/queryClusterKickCfg');
}
// 修改踢人配置
export async function saveClusterKickCfg(values){
  return xFetch('/cluster/saveClusterKickCfg',values);
}
/**
 * 群邀请组补号
 */
//读取补号参数
export async function querySupplementParam(){
  return xFetch('/cluster/querySupplementParam');
}
// 保存补号参数
export async function updateSupplementPara(values){
  return xFetch('/cluster/updateSupplementPara',values);
}
// 保存运营方参数
export async function saveBusinessOperatorForSupplement(values){
  return xFetch('/cluster/saveBusinessOperatorForSupplement',values);
}

//查询创建群设置参数
export async function queryClusterParams(){
  return xFetch('/cluster/queryClusterParams');
}
//保存创建群设置参数
export async function saveClusterParams(values){
  return xFetch('/cluster/saveClusterParams', values);
}
//二维码
export async function getOperationBase64QrCode(values){
  return xFetch('/operation/getOperationBase64QrCode', values);
}
/**
 * 群名称配置
 */
//查询群名称列表
export async function queryClusterNameList(value){
    return xFetch('/cluster/queryClusterNameList',value);
}
//提取相同群名称的群个数上限
export async function queryCluseterNameLimitedCount(){
    return xFetch('/sys/queryCluseterNameLimitedCount');
}
//保存相同群名称的群个数上限
export async function saveCluseterNameLimitedCount(value){
  return xFetch('/sys/saveCluseterNameLimitedCount',value);
}
