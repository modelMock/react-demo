import fetchUtils from './fetchUtils';

/**
 * 主播服务接口类
 */
class AnchorService {
  //录入主播 先注册为普通用户，再申请成为主播
  registerAnchor(userParams) {
    const params = Object.assign({}, userParams, {
      // 识别号
      identificationNumber: userParams.mobile,
      // 注册类型：账号
      registerType: "ACCOUNT",
      certName: '身份证',
      // 是否执行自动登录
      autoLogin: false,
      // 后台这2个参数现在是必填的，但是现阶段没用，先这样，等后台改造
      tutorUserId: 1000,
      preference: "无"
    });
    return fetchUtils.json("/anchorManage/registerAnchor", params);
  }

  // 查询 主播 或 待审核的主播
  queryAnchorList(params) {
    return fetchUtils.json("/anchorManage/queryAnchorList", params);
  }

  // 审核主播申请
  auditApplyAnchor(params) {
    return fetchUtils.json("/anchorManage/auditApplyAnchor", params);
  }

  // 主播上、下线
  modifyProgramStatus(programId, status) {
    return fetchUtils.json("/anchorManage/modifyProgramStatus", {programId, status});
  }

  // 修改主播头像，节目封面
  modifyAnchor(params) {
    return fetchUtils.json("/anchorManage/modifyAnchor", params);
  }

  // 查询标签列表
  queryTagByType(tagType = "ANCHOR", tagClass = "TAG") {
    return fetchUtils.json("/anchorManage/queryTagByType", {tagType, tagClass});
  }

  // 修改主播密码
  modifyAnchorPwd(userId, newPwd) {
    return fetchUtils.json("/anchorManage/modifyAnchorPwd", {userId, newPwd});
  }

  // 给主播打标签
  markAnchorTag(params) {
    return fetchUtils.json("/anchorManage/markAnchorTag", params);
  }

  // 查询主播按天统计的在线时长，橙点数据，可实时查询
  searchAnchorCollect(params) {
    return fetchUtils.json("/anchorManage/searchAnchorCollect", params);
  }

  // 查询主播开播记录
  queryAnchorShowList(params) {
    return fetchUtils.json("/anchorManage/queryAnchorShowList", params);
  }

  // 查询手机直播审核记录
  queryAppLivingList(params) {
    return fetchUtils.json("/anchorManage/queryAppLivingList", params);
  }

  // 处理手机直播审核
  processsAppLivingApply(params) {
    return fetchUtils.json("/anchorManage/processsAppLivingApply", params);
  }

  // 根据用户类型查询用户数据
  queryUserByType(userType = "MANAGER") {
    return fetchUtils.json("/anchorManage/queryUserByType", {userType});
  }

  // 查询主播直播数据
  queryAnchirLivingData(params) {
    return fetchUtils.json("/anchorManage/queryAnchirLivingData", params);
  }

  // 总金额
  sumMoneyAnchorLiving(params) {
    return fetchUtils.json("/anchorManage/sumMoneyAnchorLiving", params);
  }

  // 导出主播直播数据
  getAnchorLivingDataExcel(params) {
    return fetchUtils.json("/anchorManage/getAnchorLivingDataExcel", params);
  }

  queryEventByManager(params){
    return fetchUtils.json("/anchorManage/queryEventByManager", params);
  }
  //添加事件
  saveNewEvent(params){
    return fetchUtils.json("/anchorManage/saveNewEvent", params);
  }
  //事件处理
  saveDealEvent(params){
    return fetchUtils.json("/anchorManage/saveDealEvent", params);
  }
  //查询主播假期
  queryLeaveList(params){
    return fetchUtils.json("/anchor/queryLeaveList", params);
  }
  //录入主播请假信息
  leave(params){
    return fetchUtils.json("/anchor/leave", params);
  }
  //获取所有的主播信息
  queryAllAnchor(){
    return fetchUtils.json("/anchor/queryAllAnchor", {userType:"ANCHOR"});
  }
  // 根据房间ID查询主播信息
  queryByProgramId(programId){
    return fetchUtils.json("/anchorManage/queryByProgramId", {programId});
  }
  //获取主播奖惩记录
  querySanction(params){
    return fetchUtils.json("/sanction/querySanction", params);
  }
  //添加/修改奖惩记录,奖励,惩罚,暂扣
  addSanction(guildRecord){
    return fetchUtils.json("/sanction/addSanction", {...guildRecord});
  }
  //修改奖惩记录
  modifySanction(params){
    return fetchUtils.json("/sanction/modifySanction", {...params});
  }
  //取消暂扣
  cancel(recordId){
    return fetchUtils.json("/sanction/cancel", {recordId});
  }
  //解冻暂扣
  deVjkb(params){
    return fetchUtils.json("/sanction/deVjkb", params);
  }
  //保底工资
  listMinSalary(){
    return fetchUtils.json("/anchorManage/listMinSalary",{});
  }

}
export default new AnchorService()
