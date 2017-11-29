import fetchUtils from './fetchUtils';

/**
 * 公会管理服务类
 */
class UnionService {
  queryUnionStatData(params){
    return fetchUtils.json("/union/queryUnionStatData", params)
  }
  //查询公会列表
  queryGuilds(guild){
    return fetchUtils.json("/guild/queryGuilds", {...guild})
  }

  /**
   * 添加公会
   * @param guild     公会基本信息
   */
  addGuilds(guild){
    return fetchUtils.json("/guild/addGuilds", {...guild})
  }
  // 修改公会
  modifyGuilds(guild){
    return fetchUtils.json("/guild/modifyGuilds", {...guild})
  }
  modifyTutor(guildId, tutorUserId){
    return fetchUtils.json("/guild/modifyTutor", {guildId, tutorUserId})
  }
	modifyInvoiceAhead(guildId, invoiceAhead){//修改  先票后款/先款后票
    return fetchUtils.json("/guild/modifyInvoiceAhead", {guildId, invoiceAhead})
  }
  //作废公会
  delGuilds(guildId){
    return fetchUtils.json("/guild/delGuilds", {guildId})
  }
  //修改公会
  modifyGuilds(params){
    return fetchUtils.json("/guild/modifyGuilds", params)
  }
  //查询公会发票列表
  queryInvoices(params){
    return fetchUtils.json("/guild/queryInvoices", {...params})
  }
  //查询打印的发票的内容
	queryInvoicesForPrint(records){
    return fetchUtils.json("/guild/queryInvoicesForPrint", {records})
  }
  //获取所有的有效公会信息
  queryAllGuild(params){
    return fetchUtils.json("/guild/queryAllGuild", params)
  }
  //录入发票
  addInvoice(params){
    return fetchUtils.json("/guild/addInvoice", params)
  }
  //修改发票
  modifyInvoice(params){
    return fetchUtils.json("/guild/modifyInvoice", params)
  }
  //审核发票（审核通过，或者审核拒绝）
  auditInvoice(params){
    return fetchUtils.json("/guild/auditInvoice", params)
  }
  //发票财务二次审核
	auditInvoiceFinance(params){
    return fetchUtils.json("/guild/auditInvoiceFinance", params)
  }
  //作废发票
	invalidInvoice(recordId,guildId){
    return fetchUtils.json("/guild/cancelInvoice", {recordId,guildId})
  }
  //获取所有的发票号码
  queryAllInvoiceNum(params){
    return fetchUtils.json("/guild/queryAllInvoiceNum", params)
  }
  //查询公会详细信息（包含联系人和银行账户）
  queryGuildDetail(guildId){
    return fetchUtils.json("/guild/queryGuildDetail", {guildId})
  }
  /**
   * 公会联系人信息
   * @param params
   */
  //添加公会联系人
  addLinkman(params){
    return fetchUtils.json("/guild/addLinkman", params)
  }
  //修改公会的联系人
  modifyLinkman(params){
    return fetchUtils.json("/guild/modifyLinkman", params)
  }
  // 删除公会的联系人
  delLinkman(params){
    return fetchUtils.json("/guild/delLinkman", params)
  }
  /**
   * 公会账户信息
   * @param params
   */
  //添加银行账户
  addBank(params){
    return fetchUtils.json("/guild/addBank", params)
  }
  //修改银行账户
  modifyBank(params){
    return fetchUtils.json("/guild/modifyBank", params)
  }
  // 删除公会的银行账号
  delBank(params){
    return fetchUtils.json("/guild/delBank", params)
  }
  // 设置默认的银行账户
  saveDefaultBank(params){
    return fetchUtils.json("/guild/saveDefaultBank", params)
  }
  // 查询当前公会下的主播列表
  queryMember(params){//{guildId:'公会id，必填',keywork:'节目关键字,可选'}
    return fetchUtils.json("/guild/queryMember", params)
  }
  // 查询工会下的账户列表
	queryAccounts(guildId){//{guildId:'公会id，必填'}
    return fetchUtils.json("/guild/queryAccounts", {guildId})
  }

}

export default new UnionService()
