import fetchUtils from './fetchUtils';

/**
 * 主播服务接口类
 */
class CustomerService {
  //查询监播主播列表
  queryMonitorList(params) {
    return fetchUtils.json("/customer/queryMonitorPrograms", params);
  }
  //警告主播
  warningAnchor(programId,warnMsg){
    return fetchUtils.json("/customer/warning", {programId, warnMsg});
  }
  //巡查
  checkedMark(values){
    return fetchUtils.json("/customer/checkedMark", values);
  }
  //封禁
  blockProgram(values){
    return fetchUtils.json("/customer/blockProgram",values);
  }
  //停播
  stopLiving(values){
    return fetchUtils.json("/customer/stopLiving",values);
  }
  //标记重点监播
  markImportantMonitor	(programId, anchorId){
    return fetchUtils.json("/customer/markImportantMonitor	",{programId, anchorId});
  }
  //取消标记重点监播
  cancelMarkImportantMonitor(programId, anchorId){
    return fetchUtils.json("/customer/cancelMarkImportantMonitor",{programId, anchorId});
  }
  //标记临时监播
  markTempMonitor	(programId, anchorId){
    return fetchUtils.json("/customer/markTempMonitor	",{programId, anchorId})
  }
  //取消标记临时监播
  cancelMarkTempMonitor(programId, anchorId){
    return fetchUtils.json("/customer/cancelMarkTempMonitor",{programId, anchorId})
  }
  //监播操作日志查询
  findProgramMgrLogs(values){
    return fetchUtils.json("/customer/findProgramMgrLogs",values)
  }
  //发送到朋友圈所需信息查询
  queryShowSnsTemplet(values){
    return fetchUtils.json("/app/queryShowSnsTemplet",values)
  }
  //发送到朋友圈
  saveShowNotifySns(values){
    return fetchUtils.json("/app/saveShowNotifySns",values)
  }
}
export default new CustomerService()
