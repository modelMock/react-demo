import fetchUtils from './fetchUtils';

/**
 * 通用服务接口
 */
class AppService {

  // 用户资源列表
  queryResByUserId() {
    return fetchUtils.json("/app/queryResByUserId")
  }
  // 首页用户资源树形结构
  queryRoleRes(){
    return fetchUtils.json("/app/queryRoleResByUserId")
  }
  // 登录
  login(loginName, password) {
    const params = {
      loginName,
      password,
      platformType: 'PC_MANAGER',
    }
    return fetchUtils.json("/app/login", params)
  }
  // 修改密码
  modifyPassword(oldPwd, newPwd) {
    const params = {
      userId: localStorage.getItem('userId'),
      oldPwd, newPwd
    };
    return fetchUtils.json("/app/modifyPassword", params);
  }
  // 数据字典查询
  getItemValueList(itemKey) {
    return fetchUtils.json("/app/getItemValueList", {itemKey})
  }
}
export default new AppService()
