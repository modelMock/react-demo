import fetchUtils from './fetchUtils';

/**
 * 审核列表服务类
 */
class AuditService {
  //查询奖惩记录审核列表
  queryAuditList(params){
    return fetchUtils.json("/sanction/queryAuditList", params)
  }
  //获取奖惩记录详细信息
  querySanctionDetail(params){
    return fetchUtils.json("/sanction/querySanctionDetail", params)
  }
  //审核奖惩记录
  auditSanction(params){
    return fetchUtils.json("/sanction/auditSanction", params)
  }
}

export default new AuditService()
