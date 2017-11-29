import fetchUtils from './fetchUtils';

/**
 * 系统配置服务接口类
 */
class ConfigService {

  // 初始化编辑礼物参数
  initAddGiftParams(tagType="GOODS", tagClass="TAG") {
    return fetchUtils.json("/configManage/initAddGiftParams", {tagType, tagClass})
  }
  // 添加礼物配置
  addGift(params) {
    return fetchUtils.json("/configManage/addGift", params)
  }
  // 修改礼物配置
  updateGift(params) {
    return fetchUtils.json("/configManage/updateGift", params)
  }
  // 修改礼物状态
  updateGoodsStatus(goodsId, status) {
    return fetchUtils.json("/configManage/updateGoodsStatus", {goodsId, status})
  }
  // 编辑动画配置
  updateAnimConfig(params) {
    return fetchUtils.json("/configManage/updateAnimConfig", params)
  }
  // 查询动画配置
  selectAnimConfig(params) {
    return fetchUtils.json("/configManage/selectAnimConfig", params)
  }
  // 查询礼物
  selectGoodsConfig(params) {
    return fetchUtils.json("/configManage/selectGoodsConfig", params)
  }
  //根据登录操作员查询渠道代码
  queryChannelCodeByUserId() {
    return fetchUtils.json("/configManage/queryChannelCodeByUserId", {})
  }
  // 根据渠道代码查询批次
  queryChannelIdByCode(channelCode) {
    return fetchUtils.json("/configManage/queryChannelIdByCode", {channelCode})
  }
  // 查询渠道用户统计数据
  queryUserDataByChannel(params) {
    return fetchUtils.json("/configManage/queryUserDataByChannel", params)
  }
  // 根据礼物列表查询
  queryGoodsByType(goodsType = 'BADGE') {
    return fetchUtils.json("/configManage/queryGoodsByType", {goodsType})
  }
  // 查询系统参数列表
  querySysCfg(params){
    return fetchUtils.json("/configManage/querySysCfg", params)
  }
  //添加参数
  addSysCfg(params){
    return fetchUtils.json("/configManage/addSysCfg", params)
  }
  // 修改参数
  updateSysCfg(params){
    return fetchUtils.json("/configManage/updateSysCfg", params)
  }
  // 删除参数
  delSysCfg(params){
    return fetchUtils.json("/configManage/delSysCfg", params)
  }
  // 查询数据字典
  queryItemList(params){
    return fetchUtils.json("/configManage/queryItemList", params)
  }
  //添加数据字典
  addItemValue(params){
    return fetchUtils.json("/configManage/addItemValue", params)
  }
  // 修改数据字典
  updateItemValue(params){
    return fetchUtils.json("/configManage/updateItemValue", params)
  }
  // 删除数据字典
  delItemDefine(itemKey, itemValue){
    return fetchUtils.json("/configManage/delItemDefine", {itemKey, itemValue})
  }
  // 查询广告条数据
  queryCarouselAdList(){
    return fetchUtils.json("/configManage/queryCarouselAdList", {})
  }
  // 添加、修改广告条
  editCarouselAd(params){
    const objs = {platform: 'ALL', ...params}
    return fetchUtils.json("/configManage/editCarouselAd", objs)
  }
  // 禁用广告条
  disabledCarouselAd(adId){
    return fetchUtils.json("/configManage/disabledCarouselAd", {adId})
  }
  // 启用广告条
  enabledCarouselAd(adId){
    return fetchUtils.json("/configManage/enabledCarouselAd", {adId})
  }
  // 查询资源
  queryResList(){
    return fetchUtils.json("/configManage/queryResList")
  }
  // 查询用户角色和资源
  queryRoleListByOptrId(){
    return fetchUtils.json("/configManage/queryRoleListByOptrId")
  }
  // 编辑资源
  editRes(resObj){
    return fetchUtils.json("/configManage/editRes", resObj)
  }
  // 查询菜单、按钮资源权限
  queryMenuNodeRes(){
    return fetchUtils.json("/configManage/queryMenuNodeRes")
  }
  // 根据角色查询资源
  queryResByRoleId(roleId){
    return fetchUtils.json("/configManage/queryResByRoleId", {roleId})
  }
  // 根据角色查询操作员
  queryManagerByRoleId(roleId){
    return fetchUtils.json("/configManage/queryManagerByRoleId", {roleId})
  }
  // 编辑角色资源
  editRoleRes(roleId, resIdList){
    return fetchUtils.json("/configManage/editRoleRes", {roleId, idList: resIdList})
  }
  // 编辑角色操作员
  editOptrRole(optrId, roleId){
    return fetchUtils.json("/configManage/editOptrRole", {optrId, roleId})
  }
  // 查询所有角色
  queryAllRoleList(){
    return fetchUtils.json("/configManage/queryAllRoleList");
  }
  // 查询所有角色
  queryOptrRoleByOptrId(optrId){
    return fetchUtils.json("/configManage/queryOptrRoleByOptrId", {optrId});
  }
}
export default new ConfigService()