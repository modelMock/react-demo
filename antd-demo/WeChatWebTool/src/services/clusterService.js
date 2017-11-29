import xFetch from './xFetch';

class ClusterService {
  /**
   * 群名称配置
   */
  //查询群名称列表
  queryClusterNameList(value){
      return xFetch('/cluster/queryClusterNameList',value);
  }
  //提取相同群名称的群个数上限
  queryCluseterNameLimitedCount(){
      return xFetch('/sys/queryCluseterNameLimitedCount');
  }
  //保存相同群名称的群个数上限
  saveCluseterNameLimitedCount(value){
    return xFetch('/sys/saveCluseterNameLimitedCount',value);
  }
  //保存群名称的群名称
  addClusterNamelist(value){
      return xFetch('/cluster/addClusterNamelist',value);
  }
  //查询运营方
  queryClusterBusinessOperator(){
    return xFetch('/common/queryItemValueByKey',{item_key:"BusinessOperator"});
  }
  /**
   * 运营方联盟号管理界面接口
   */
  //搜索套口令列表
  queryTaopwdList(value){
    return xFetch('/sys/queryTaopwdList',value);
  }
  //开启淘口令验证
  openTaopwd(value){
    return xFetch('/sys/openTaopwd',value);
  }
  //关闭淘口令验证
  closeTaopwd(value){
    return xFetch('/sys/closeTaopwd',value);
  }
  //添加联盟号
  addTaopwd(value){
    return xFetch('/sys/addTaopwd',value);
  }
}

export default new ClusterService();
