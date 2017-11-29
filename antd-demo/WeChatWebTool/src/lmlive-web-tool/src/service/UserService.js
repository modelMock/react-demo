import fetchUtils from './fetchUtils';

/**
 * 用户服务接口类
 */
class UserService {

  // 查询封禁列表
  queryDisabledUserList(params){
    return fetchUtils.json("/userManage/queryDisabledUserList", params)
  }
  // 封禁接口
  disabledUser(params){
    return fetchUtils.json("/userManage/disabledUser", params)
  }
  // 解封用户
  enabledUser(params){
    return fetchUtils.json("/userManage/enabledUser", params)
  }
  //查询用户奖励记录
  queryUserAwardRecord(params){
    return fetchUtils.json("/userManage/queryUserAwardRecord", params)
  }
  // 赠送萌豆
  presentUserWealth(params){
    const obj = {
      ...params,
      wealthType: 'COIN',
      presentType: ''
    }
    return fetchUtils.json("/userManage/presentUserWealth", obj)
  }
  // 扣除萌豆
  deductUserWealth(params){
    const obj = {
      ...params,
      wealthType: 'COIN',
      presentType: ''
    }
    return fetchUtils.json("/userManage/deductUserWealth", obj)
  }
  // 赠送经验
  presentUserExp(params){
    return fetchUtils.json("/userManage/presentUserExp", params)
  }
  // 赠送勋章
  presentUserGoods(params){
    return fetchUtils.json("/userManage/presentUserGoods", params)
  }
  // 回收勋章
  deductUserGoods(params){
    return fetchUtils.json("/userManage/deductUserGoods", params)
  }
  // 查询用户基础信息
  queryUserByUserId(userId){
    return fetchUtils.json("/userManage/queryUserByUserId", {userId})
  }
  // 查询用户封禁、解封记录
  selectForbidenRecord(params){
    return fetchUtils.json("/userManage/selectForbidenRecord", params)
  }
  // 查询用户充值记录
  selectRechargeRecord(params){
    return fetchUtils.json("/userManage/selectRechargeRecord", params)
  }
  // 查询用户送礼记录
  selectSendGiftRecord(params){
    return fetchUtils.json("/userManage/selectSendGiftRecord", params)
  }
  // 查询直播间小黑屋用户列表
  queryBlockUserList(programId){
    return fetchUtils.json("/userManage/queryBlockUserList", {programId})
  }
  // 解除直播间封禁小黑屋用户
  blockRollback(programId, userId){
    return fetchUtils.json("/userManage/blockRollback", {programId, userId})
  }
  //开通公会账户
  openUnionAccount(params){
    return fetchUtils.json("/userManage/openUnionAccount", params)
  }
}
export default new UserService()
