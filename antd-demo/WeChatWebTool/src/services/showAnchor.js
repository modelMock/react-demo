import xFetch from './xFetch';

/**
 * 秀场管理相关
 */
// 查询可分配客服和运营号来源
export async function queryAssignOptrsAndFromAnchors(anchor_id) {
  return xFetch('/showmanage/queryAssignOptrsAndFromAnchors', {anchor_id});
}

//查询主播或搜索主播
export async function queryAssignAnchors(item){
  return xFetch('/showmanage/queryAssignAnchors', item);
}
//查询主播可分配的客服列表
export async function queryAnchoreAssignOptr(item){
  return xFetch('/showmanage/queryAnchoreAssignOptr', {anchor_id:item});
}
//查询运营号来源列表(客服管理的主播列表)
export async function queryAssignOperFromAnchors(item){
  return xFetch('/showmanage/queryAssignOperFromAnchors',{anchor_id:item});
}
//查询客服和来源对应的运营号
export async function queryAssignOperationList(anchor_id){
  return xFetch('/showmanage/queryAssignOperationList', {anchor_id});
}
//主播运营号回收
export async function updateRecycleOperation(value){
  return xFetch('/showmanage/updateRecycleOperation', value);
}
//查询 省  配置数据
export async function queryProvince(item){
  return xFetch('/sys/queryProvince', item);
}
//查询 城市 配置数据
export async function queryCity(item){
  return xFetch('/sys/queryCity', {province:item});
}
//资料修改类型(默认不选)
export async function queryItemValueByKey(){
  return xFetch('/common/queryItemValueByKey', {item_key:"AnchorOperUpdateType"});
}
//提交主播秀场配置
export async function saveAssignOperToAnchor(item){
  return xFetch('/showmanage/saveAssignOperToAnchor', item);
}
//秀场 保存图片和文本模板
export async function saveShowSnsTemplet(item){
  return xFetch('/showmanage/saveShowSnsTemplet', item);
}
//秀场模板 查询已上传的图片模板
export async function queryShowSnsPicTemplet(item){
  return xFetch('/showmanage/queryShowSnsPicTemplet', {anchor_id:item});
}
//秀场模板 删除已上传的图片模板
export async function delShowSnsPicTemplet(anchor_id,record_id){
  return xFetch('/showmanage/delShowSnsPicTemplet', {anchor_id:anchor_id,record_id:record_id});
}
//主播列表
export async function queryShowAnchorList(values){
  return xFetch('/showmanage/queryShowAnchorList', values);
}
//绑定主播白天或夜晚流量
export async function saveCustomAdBindOper(values){
  return xFetch('/showmanage/saveCustomAdBindOper', values);
}
//解绑主播白天或夜晚流量
export async function saveCustomAdCancelOper(values){
  return xFetch('/showmanage/saveCustomAdCancelOper', values);
}
/**
 * 秀场模板 查询主播的通用文字模板和专用文字模板
 * text 通用模板
 * text_anchor 专用模板
 */
export async function queryShowSnsTextTemplet(values){
  return xFetch('/showmanage/queryShowSnsTextTemplet', values);
}
/**
 * 话术场景列表
 */
//查询机器人场景列表
 export async function queryMassSceneList(){
   return xFetch('/showmanage/queryMassSceneList');
 }
 //查询机器人场景
 export async function queryMassReplyList(value){
   return xFetch('/showmanage/queryMassReplyList',value);
 }
 //初始化套路明细编辑
 export async function initReplyEdit(value){
   return xFetch('/showmanage/initReplyEdit',value);
 }
 //保存和修改一个套路明细
 export async function saveReplyEdit(value){
   return xFetch('/showmanage/saveReplyEdit',value);
 }
