import xFetch from './xFetch';
import {LIMIT_CLUSTER_ITEM, LIMIT_CLUSTER_MESSAGE_ITEM, LIMIT_CLUSTER_MY_MSG_ITEM,
  LIMIT_CLUSTER_MANAGE_ITEM} from '../components/Cluster/CulsterChatConstants'

class ClusterChatService {
  // 加载群会话列表
  async queryChatInfoList(offset=0, limit=LIMIT_CLUSTER_ITEM){
    return xFetch('/clusterchat/queryChatInfoList', {service_optr_id: localStorage.getItem('optr_id'), offset, limit});
  }
  // 加载单个群会话信息
  async queryChatInfo(friend_wechat){
    return xFetch('/clusterchat/queryChatInfo', {operation_sn: friend_wechat, friend_sn: friend_wechat});
  }
  // 加载群聊天记录
  async queryRecordChat(friend_wechat, startChat, limit=LIMIT_CLUSTER_MESSAGE_ITEM){
    return xFetch('/clusterchat/queryRecordChat', {operation_sn: friend_wechat, friend_sn: friend_wechat, startChat, limit});
  }
  // 加载群@专员聊天记录
  async queryRecordChatByExtra(friend_wechat, startChat, limit=LIMIT_CLUSTER_MY_MSG_ITEM){
    return xFetch('/clusterchat/queryRecordChatByExtra', {operation_sn: friend_wechat, friend_sn: friend_wechat, startChat, limit});
  }
  // 加载客服管理的群清单
  async queryClusterByOptrManager(offset=0, cluster_search="", limit=LIMIT_CLUSTER_MANAGE_ITEM){
    return xFetch('/clusterchat/queryClusterByOptrManager', {offset, cluster_search,
      limit, service_optr_id: localStorage.getItem('optr_id')});
  }
  // 发布专员发布广告
  async publishAdCluster(clusterSns){
    return xFetch('/clusterchat/publishAdCluster', {clusterSns});
  }
  // 群主页
  async getClusterMainPage(params){
    return xFetch('/clusterchat/getClusterMainPage', params);
  }
  // 群成员主页
  async getMemberMainPage(params){
    return xFetch('/clusterchat/getMemberMainPage', params);
  }
  // 群成员主页踢人
  async kickClusterMember(cluster_sn, member_sn,optr_id){
    return xFetch('/clusterchat/kickClusterMember', {cluster_sn, member_sn,optr_id});
  }
  // 设置群的聊天模式
  async updateChatMode(cluster_sn, cluster_chat_mode){
    return xFetch('/clusterchat/updateChatMode', {cluster_sn, cluster_chat_mode});
  }
  // 设置群聊消息为 已回复、未回复
  async updateChatReply(cluster_sn, cluster_member_sn, chat_time_long, chat_content_md5, reply){
    return xFetch('/clusterchat/updateChatReply', {cluster_sn, cluster_member_sn, chat_time_long,
      chat_content_md5, reply});
  }
  // 获取大图路径
  async getClusterChatBigPic(cluster_sn, cluster_member_sn, chat_time_long, chat_content_md5) {
    return xFetch('/clusterchat/getClusterChatBigPic', {cluster_sn, cluster_member_sn, chat_time_long, chat_content_md5});
  }
  //UI手工 群聊发言回复 不走socket
  async replyClusterByHand(params) {
    return xFetch('/clusterchat/replyClusterByHand', params);
  }
}

export default new ClusterChatService()
