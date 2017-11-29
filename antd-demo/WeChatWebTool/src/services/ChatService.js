import xFetch from "./xFetch";

class ChatService{

  queryWebSocketUrls(){
    return xFetch('/user/queryWebSocketUrls', {location_protocol: window.location.protocol});
  }
  // 单聊回复: 手工回复一条聊天消息
  replyFriendByHand(operation_sn, friend_sn, chat_type, chat_content) {
    return xFetch('/mult/replyFriendByHand', {chat_type, operation_sn, friend_sn, chat_content});
  }
  uploadImg(img64Data) {
    let suffix = img64Data.substring(11, img64Data.indexOf(";"))
    img64Data = img64Data.substr(img64Data.indexOf(';base64,')+8);

    return xFetch('/common/uploadFile', {img64Data, suffix, optr_id: localStorage.getItem('optr_id'), upload_type: 'PART'})
  }
  // 查询聊天消息
  queryRecordChat(operation_sn, friend_sn, startChat, limit=10){
    return xFetch("/user/queryRecordChat", {operation_sn, friend_sn, startChat, limit})
  }

  /**
   * 查询好友列表
   * @param offset
   * @param limit
   * @param chatBigfans  全粉 NULL， 非大号粉 F, 大号粉 T
   * @param chatFriendKind     聊天chat, 点赞digg, 评论comment
   */
  queryUserInfoListNew(offset, limit=10, chatFriendKind='chat', chatBigfans=''){
    return xFetch("/user/queryUserInfoListNew", {chatFriendKind, chatBigfans, offset, limit, service_optr_id: localStorage.getItem('optr_id')})
  }

  /**
   * 查询单个好友信息
   * @param operation_sn
   * @param friend_sn
   */
  queryUserInfo(operation_sn, friend_sn){
    return xFetch("/user/queryUserInfo", {operation_sn, friend_sn})
  }

  /**
   * 获取当前operation_sn
   */
  getAddContactOperationSn(){
    return xFetch('/user/getAddContactOperationSn')
  }
  /**
   * 添加好友
   * @param operation_sn
   * @param friend_sn
   * @param request
   */
  addFriend(params){
    return xFetch('/user/addContact',{...params})
  }

  /**
   * 查询朋友圈点赞评论
   * @param operation_sn    运营微信sn
   * @param friend_sn       好友微信sn
   * @param interact_type   互动类型 1:点赞 2:评论
   * @param limit
   * @param startRecord
   */
  queryRecordAdInteractNew(operation_sn, friend_sn, interact_type, limit, startRecord){
    return xFetch("/user/queryRecordAdInteractNew", {operation_sn, friend_sn, interact_type, limit, startRecord})
  }
  /**
   * 查询朋友圈回复
   * @param operation_sn    运营微信sn
   * @param friend_sn       好友微信sn
   * @param publish_sn
   * @param limit
   * @param startRecord
   */
  queryRecordAdInteractReply(operation_sn, friend_sn, publish_sn, limit, startRecord ){
    return xFetch('/user/queryRecordAdInteractReply',{operation_sn, friend_sn, publish_sn, limit, startRecord})
  }
  /**
   * 查询朋友圈自评论
   * @param operation_sn    运营微信sn
   * @param friend_sn       好友微信sn
   * @param publish_sn
   * @param limit
   * @param startRecord
   */
  queryRecordAdInteractSnsComment(operation_sn, friend_sn, publish_sn, limit, startRecord){
    return xFetch('/user/queryRecordAdInteractSnsComment',{operation_sn, friend_sn, publish_sn, limit, startRecord})
  }

  /**
   * 设置单聊阅读状态
   * @param operation_sn
   * @param friend_sn
   * @param message_id      聊天消息编号
   * @param is_read         T 设置已阅读   ，  F 设置未阅读
   * @param chat_time_long  聊天时间使用毫秒表示，表格存储分页键值要使用
   */
  updateReadFriendChat(operation_sn, friend_sn, message_id, chat_time_long, is_read){
    return xFetch("/user/updateReadFriendChat", {operation_sn, friend_sn, message_id, chat_time_long, is_read})
  }

  /**
   * 设置朋友圈点赞、评论阅读状态
   * @param operation_sn
   * @param friend_sn
   * @param interact_type       互动类别点赞 1、评论 2 等
   * @param is_read             T 设置已阅读   ，  F 设置未阅读
   * @param commentid           父回复
   * @param interact_time_long  互动时间使用毫秒表示，表格存储分页键值要使用
   */
  updateReadSns(operation_sn, friend_sn, interact_type, is_read, commentid, interact_time_long){
    return xFetch("/user/updateReadSns", {operation_sn, friend_sn,interact_type, is_read, commentid, interact_time_long})
  }

  /**
   * 一对一回复
   * @param operation_sn
   * @param friend_sn
   * @param article_id       文章id
   * @param commentId        父回复id
   * @param replyCommentId   子回复id
   * @param publish_sn       朋友圈sn
   * @param content  回复内容
   */
  replySnsComment(operation_sn, friend_sn, article_id, commentId, replyCommentId, publish_sn, content){
    return xFetch("/user/replySnsComment", {operation_sn, friend_sn, article_id, commentId, replyCommentId, publish_sn, content})
  }

  /**
   * 自评论
   * @param operation_sn
   * @param friend_sn
   * @param article_id       文章id
   * @param commentId        父回复id
   * @param replyCommentId   子回复id
   * @param publish_sn       朋友圈sn
   * @param content  回复内容
   */
  selfSnsComment(operation_sn, friend_sn, article_id, commentId, replyCommentId, publish_sn, content){
    return xFetch("/user/selfSnsComment", {operation_sn, friend_sn, article_id, commentId, replyCommentId, publish_sn, content})
  }

  /**
   * 根据客服id和标签名获取好友列表
   * @param tag_id  标签id
   * @param offset
   * @param limit
   */
  queryFriendListByKefuTag(tag_id, offset, limit=10){
    return xFetch("/user/queryFriendListByKefuTag", {tag_id, offset, limit, service_optr_id: localStorage.getItem('optr_id')});
  }

  /**
   * 获取客服的标签列表
   */
  queryKefuTagList(){
    return xFetch("/user/queryKefuTagList")
  }

  /**
   * 复制好友微信号数据
   */
  copyFriendName(operation_sn, friend_sn){
    return xFetch("/user/copyFriendName", {operation_sn, friend_sn})
  }

  /**
   * 好友置顶
   */
  toTopUser(operation_sn, friend_sn, chatBigfans, chatFriendKind, is_top){
    return xFetch("/user/toTopUser", {operation_sn, friend_sn, chatBigfans, chatFriendKind, is_top, service_optr_id: localStorage.getItem('optr_id')})
  }

  //获取好友主页
  getFriendMainPageNew(operation_sn, friend_sn){
    return xFetch("/user/getFriendMainPageNew", {operation_sn, friend_sn})
  }
  // 客服修改运营号好友备注名
  updateFriendRemarkNameNew(operation_sn, friend_sn, remark_name){
    return xFetch("/user/updateFriendRemarkNameNew", {operation_sn, friend_sn, remark_name})
  }
  // 客服增加新标签
  addKefuTag(tag_name){
    return xFetch("/user/addKefuTag", {tag_name});
  }
  // 客服给运营号好友打标签
  addMarkedAdsForFriendNew(operation_sn, friend_sn, adids){
    return xFetch("/user/addMarkedAdsForFriendNew", {operation_sn, friend_sn, adids})
  }
  // 确认转账
  confirmTransfer(operation_sn, friend_sn, message_id, chat_time_long, transactionId){
    return xFetch("/user/confirmTransfer", {operation_sn, friend_sn, message_id, chat_time_long, transactionId})
  }
  //退回转账
  refuseTransfer(operation_sn, friend_sn, message_id, chat_time_long, transactionId){
    return xFetch("/user/refuseTransfer", {operation_sn, friend_sn, message_id, chat_time_long, transactionId})
  }
  //打开红包
  openRedPacket(operation_sn, friend_sn, message_id, chat_time_long, redenvelope_id,chat_content){
    return xFetch("/user/openRedenvelope",{operation_sn, friend_sn, message_id, chat_time_long, redenvelope_id,chat_content})
  }
  // 存图20天
  saveImageTwentyDays(operation_sn, friend_sn, message_id, chat_time_long){
    return xFetch("/user/savePic20", {operation_sn, friend_sn, message_id, chat_time_long})
  }
}
export default new ChatService()
