import xFetch from './xFetch';

//设置偏移量
export async function setOffsets(values) {
  return xFetch('/common/setOffsets', values)
}

//获取偏移量数据
export async function getOffsets() {
  return xFetch('/common/getOffsets', {})
}

//设置回复概率
export async function setCircleReplyProbability(values) {
  return xFetch('/common/setCircleReplyProbability', values)
}

//获取会覆概率数据
export async function queryCircleReplyProbability() {
  return xFetch('/common/queryCircleReplyProbability', {})
}

//根据组号和渠道号解绑运营号的渠道     先获取相应的状态的运营号统计
export async function unbindChannelCount(values) {
  return xFetch('/operation/unbindChannelCount', values)
}

//解绑运营号设置
export async function unbindChannel(values) {
  return xFetch('/operation/unbindChannel', values)
}
//养号查询
export async function queryCultivateList(values) {
  return xFetch('/operation/queryCultivateList', values)
}
//开启或关闭养号组
export async function openOrCloseCultivate(values) {
  return xFetch('/operation/openOrCloseCultivate', values)
}
//添加养号活跃
export async function addCultivate(values) {
  return xFetch('/operation/addCultivate', values)
}
/**
 * 链接消息白名单
 */
 //获取白名单列表
 export async function queryLinkWhitelistList(values) {
   return xFetch('/sys/queryLinkWhitelistList', values)
 }
 //保存链接白名单
 export async function saveLinkWhitelistList(values) {
   return xFetch('/sys/saveLinkWhitelistList', values)
 }
 /**
  * sns图片混淆设置
  */
  // 设置运营方页面的查询
  export async function queryBusinessOperator(){
    return xFetch('/cluster/queryBusinessOperator');
  }
  // 获取图片混淆配置参数
  export async function getImageObfuscationConfig(){
    return xFetch('/sys/getImageObfuscationConfig');
  }
  // 保存图片混淆配置参数
  export async function saveImageObfuscationConfig(value){
    return xFetch('/sys/saveImageObfuscationConfig',value);
  }
