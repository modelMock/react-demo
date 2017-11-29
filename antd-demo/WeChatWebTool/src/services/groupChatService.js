import xFetch from './xFetch';
import {LIMIT_CHAT_FRIEND_PAGE, LIMIT_GROUP_FRIEND_PAGE, LIMIT_GROUP_MESSAGE_PAGE} from '../components/Group/NavigateUtil';

class GroupChatService {

  //查询会话列表
  async queryDialogueList(offset, nickname=undefined, limit=LIMIT_CHAT_FRIEND_PAGE) {
    return xFetch('/mult/queryDialogueList', { offset, limit, nickname, service_optr_id: localStorage.getItem('optr_id') })
  }
  /**
   * 查询分组列表
   * group_id为undefined，查询所有分组数据，否组加载更多分组数据
   */
  async queryGroupList(group_id, offset, limit=LIMIT_GROUP_FRIEND_PAGE) {
    return xFetch('/mult/queryGroupList', { offset, limit, group_id, service_optr_id: localStorage.getItem('optr_id') })
  }
  //查询单个好友信息
  async getMultUserInfo(operation_sn, friend_sn) {
    return xFetch('/mult/getMultUserInfo', { operation_sn, friend_sn })
  }
  //查询聊天记录
  async queryMultRecordChat(operation_sn, friend_sn, startChat, limit=LIMIT_GROUP_MESSAGE_PAGE) {
    return xFetch('/mult/queryMultRecordChat', { operation_sn, friend_sn, limit, startChat })
  }
  /**
   * 查询多个窗口对象
   * @param operation_sn  指定好友operation_sn
   * @param friend_sn     指定好友friend_sn
   * @param limit 聊天框中显示多少条数据
   * @param dialogue_limit: 会话列表中好友分页数
   */
  async queryMultWindow(operation_sn, friend_sn, is_exchange=false,
      limit=LIMIT_GROUP_MESSAGE_PAGE, dialogue_limit=LIMIT_CHAT_FRIEND_PAGE) {
    return xFetch('/mult/queryMultWindow', { operation_sn, friend_sn, is_exchange,
      limit,  dialogue_limit, service_optr_id: localStorage.getItem('optr_id') })
  }
  //打开单个聊天框
  async querySingleWindow(operation_sn, friend_sn, oldOperationSn=undefined, oldFriendSn=undefined, limit=LIMIT_GROUP_MESSAGE_PAGE) {
    const oldWindowUser = !!oldOperationSn ? {operation_sn: oldOperationSn, friend_sn: oldFriendSn} : undefined;
    return xFetch('/mult/querySingleWindow', { operation_sn, friend_sn, oldWindowUser, limit })
  }
  //关闭一个聊天窗口
  async closeSingleWindow(operation_sn, friend_sn) {
    return xFetch('/mult/closeSingleWindow', { operation_sn, friend_sn })
  }
  //修改用户备注
  async updateUserRemark(operation_sn, friend_sn, remark="") {
    return xFetch('/mult/updateUserRemark', { operation_sn, friend_sn, remark })
  }
  //查询好友可选标签
  async queryShowTagDefines(operation_sn, friend_sn) {
    return xFetch('/mult/queryShowTagDefines', { operation_sn, friend_sn })
  }
  //修改好友标签
  async updateUserTag(operation_sn, friend_sn, tag_ids=[]) {
    return xFetch('/mult/updateUserTag', { operation_sn, friend_sn, tag_ids })
  }
  //查询有效分组标签定义
  async queryShowGroupDefines() {
    return xFetch('/mult/queryShowGroupDefines')
  }
  //变更好友分组
  async updateUserGroup(operation_sn, friend_sn, group_id="") {
    return xFetch('/mult/updateUserGroup', { operation_sn, friend_sn, group_id })
  }
  //屏蔽
  async updateUserScreening(operation_sn, friend_sn, screening_hour="") {
    return xFetch('/mult/updateUserScreening', { operation_sn, friend_sn, screening_hour })
  }
  //取消屏蔽
  async cancelUserScreening(operation_sn, friend_sn) {
    return xFetch('/mult/cancelUserScreening', { operation_sn, friend_sn })
  }
  //查询聊天常用语
  async queryShowCommonLanguages(){
    return xFetch('/mult/queryShowCommonLanguages');
  }
  //搜索历史聊天记录
  async searchRecrodChat(params={}) {
    return xFetch('/mult/searchRecrodChat', params);
  }
  //历史聊天记录翻页
  async queryChatPageBackAndNext(operation_sn, friend_sn, back_limit=0, next_limit=0, startChat=undefined) {
    return xFetch('/mult/queryChatPageBackAndNext', {operation_sn, friend_sn, back_limit, next_limit, startChat});
  }
  //初始化会话模式
  async initDialogMode() {
    return xFetch('/mult/initDialogMode');
  }
  //设置会话模式
  async updateDialogMode(value) {
    return xFetch('/mult/updateDialogMode',{dialog_id:value});
  }
  // 分组列表 换一批刷新
  async refreshGroupAndWindow(group_id) {
    return xFetch('/mult/refreshGroupAndWindow',{group_id, service_optr_id: localStorage.getItem('optr_id')});
  }
}

export default new GroupChatService();
