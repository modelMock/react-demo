import fetchUtils from './fetchUtils';

/**
 * 主播服务接口类
 */
class PrintService {
  //列出所有的可打印项目配置
  listConfigs(params){
    return fetchUtils.json('/print/listConfigs',params||{});
  }
  //新增一个打印配置
  addConfig(itemConfig){
    return fetchUtils.json('/print/addConfig',itemConfig);
  }
  //修改打印的配置
  modifyConfig(itemConfig){
    return fetchUtils.json('/print/addConfig',itemConfig);
  }
  //作废一个配置
	invalidConfig(itemId){
    return fetchUtils.json('/print/invalidConfig',{itemId});
  }
  //重新激活 配置
	activeConfig(itemId){
    return fetchUtils.json('/print/activeConfig',{itemId});
  }
  //加载打印的配置信息
  loadConfig(itemId){
    return fetchUtils.json('/print/loadConfig',{itemId});
  }
  //加载打印的配置信息
	loadConfig4edit(itemId){
    return fetchUtils.json('/print/loadConfig4edit',{itemId});
  }

}
export default new PrintService()
