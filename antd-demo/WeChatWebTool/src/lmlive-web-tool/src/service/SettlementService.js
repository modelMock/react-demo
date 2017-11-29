import fetchUtils from './fetchUtils';

/**
 * 薪资结算类
 */
class SettlementService {
  /**
   * 主播结算
   * @param params
   */
  //查询主播工资结算列表
  queryAnchorSettlementList(params){
    return fetchUtils.json("/settlementAnchor/querySettlementList", params)
  }
  //对当前登录运营名下的主播工资进行结算，结算记录入库
  saveAnchorSettlement(params){
    return fetchUtils.json("/settlementAnchor/saveSettlement", params)
  }
  // 取消主播结算
  cancelSettlement(recordId) {
    return fetchUtils.json("/settlementAnchor/cancelSettlement", {recordId});
  }
  //主播结算列表（待结算） 获取有待结算的主播对应的所有账期
  getUnsettledBillPeriod(){
    return fetchUtils.json("/settlementAnchor/getUnsettledBillPeriod", {})
  }
  //获取指定账期下未结算的主播对应的公会信息
  getUnsettledGuild(params){
    return fetchUtils.json("/settlementAnchor/getUnsettledGuild", params)
  }

  /**
   * 公会结算
   * @param params
   */
  //查询公会薪酬列表
  queryGuildSettlementList(params){
    return fetchUtils.json("/settlementGuild/querySettlementList", params)
  }
  //根据公会id和账户名称查询发票余额
  queryInvoiceFee(accountName, guildId, guildBankId,shouldFee){
    const params = {
      accountName,
      guildId,
      guildBankId,
      shouldFee
    }
    return fetchUtils.json("/settlementGuild/queryInvoiceFee", params)
  }
  // 公会结算
  saveGuildSettlement(settlementList, billPeriod){
    const params = {
      settlementList,
      billPeriod
    }
    return fetchUtils.json("/settlementGuild/saveSettlement", params)
  }
  // 公会结算记录审核
  audit(params){
    return fetchUtils.json("/settlementGuild/audit", params)
  }
  // 公会结算回退审核通过(单个回退)
  resetGuildAudit(params){
    return fetchUtils.json("/settlementGuild/resetAudit", params)
  }
  // 取消公会计算
  cancelGuildSett(params){
    return fetchUtils.json("/settlementGuild/cancelSett", params)
  }
  // 根据用户类型查询用户数据
  queryUserByType(userType = "MANAGER") {
    return fetchUtils.json("/anchorManage/queryUserByType", {userType});
  }
}

export default new SettlementService()
