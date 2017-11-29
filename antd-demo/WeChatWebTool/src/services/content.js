import xFetch from './xFetch';

/**
 * 朋友圈内容库
 */
class ContentService{
  /**
   *内容库
   */
  //搜索主播朋友圈库
  queryShowPublishLibList(value){
    return xFetch('/publishlib/queryShowPublishLibList', value);
  }
  //增加一条主播朋友圈库
  addShowPublishLib(value){
    return xFetch('/publishlib/addShowPublishLib', value);
  }
  //审核主播朋友圈库
  auditShowPublishLib(value){
    return xFetch('/publishlib/auditShowPublishLib', value);
  }
  //作废主播朋友圈库
  disableShowPublishLib(value){
    return xFetch('/publishlib/disableShowPublishLib', value);
  }
  //重用主播朋友圈库
  reuseShowPublishLib(value){
    return xFetch('/publishlib/reuseShowPublishLib', value);
  }
  //获取种类 Apply
  queryApply(){
    return xFetch('/common/queryItemValueByKey',{item_key:"Apply"});
  }
  //获取使用范围 Scope
  queryScope(){
    return xFetch('/common/queryItemValueByKey',{item_key:"Scope"});
  }
  //获取状态 PublishLibStatus
  queryPublishLibStatus(){
    return xFetch('/common/queryItemValueByKey',{item_key:"PublishLibStatus"});
  }
  /**
   *朋友圈库采集
   */
   //查询主播朋友圈库采集列表
   getShowPublishPickupConfigList(value){
     return xFetch('/publishlib/getShowPublishPickupConfigList', value);
   }
   //增加一个主播朋友圈库采集配置
   addShowPublishPickupConfig(value){
     return xFetch('/publishlib/addShowPublishPickupConfig', value);
   }
   queryAnchorToAd() {
     return xFetch('/publishlib/queryAnchor');
   }
   /**
    * 小说推广配置
    */
   //获取小说推广配置
    getNovelConfig() {
      return xFetch('/publishlib/getNovelConfig');
    }
    //保存小说推广配置参数
    saveNovelConfig(value) {
      return xFetch('/publishlib/saveNovelConfig',value);
    }
}
export default new ContentService;
