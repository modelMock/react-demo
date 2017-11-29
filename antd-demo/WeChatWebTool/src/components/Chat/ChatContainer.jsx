import React from 'react';
import {hashHistory} from 'react-router';
import SocketComponent from "../Socket/SocketComponent";
import './ChatContainer.less';

import {Avatar, Button, message} from 'antd';
import { Errors } from '../Commons/CommonConstants';


import MessageList from "./MessageList";
import SendMessageBox from "./SendMessageBox";
import TagList from "./TagList";
import FriendList from "./FriendList";
import InteractContentList from "./InteractContentList";
import ChatService from '../../services/ChatService'

import {
  TXT, IMG_DATA, FROM_FRD, FROM_OPT, CMD_HEARTBEAT, CMD_FEEDBACK,
  CMD_SEND, CMD_PLAY_AUDIO, LIMIT_MESSAGE_PAGE, imgPaddedPrefix
} from './Utils';

const OPT_TYPE_CHAT = 'chat', OPT_TYPE_DIGG = 'digg',  OPT_TYPE_COMMENT = 'comment'
class ChatContainer extends SocketComponent {
  constructor(props) {
    super(props);
    this.state = {
      // 当前激活好友
      friend: {},
      type: OPT_TYPE_CHAT,
      // 是否显示加载更多
      loadMoreShow: false,
    }
    this.doLoadMoreFriend = this.doLoadMoreFriend.bind(this)
    this.doResetQueryFriend = this.doResetQueryFriend.bind(this)
    this.jumpToFriendHome = this.jumpToFriendHome.bind(this)
    this.doSendMessage = this.doSendMessage.bind(this)
    this.doPlayedAudio = this.doPlayedAudio.bind(this)
    this.doLoadMoreMsg = this.doLoadMoreMsg.bind(this)
    this.doCopy = this.doCopy.bind(this)

    this.doChangeFriend = this.doChangeFriend.bind(this)
    this.doChangeAll = this.doChangeAll.bind(this)
  }
  componentDidMount() {
    super.componentDidMount()
    this._initQueryFriendList()
    ChatService.queryKefuTagList().then(({jsonResult}) => {
      this.tagListRef.initTagList(jsonResult)
    })
  }
  //收到后台消息
  onSocketMessage(recordChatMsg) {
    let recordChat = JSON.parse(recordChatMsg);
    console.log('收到后台消息', recordChat);
    const {operation_sn, friend_sn} = recordChat
    if(this.operationSn == operation_sn && this.friendSn == friend_sn) {
      //当前粉丝处于激活聊天状态，直接添加粉丝的聊天信息到聊天框中，并回复后台
      console.log('当前好友正在聊天中...', recordChat);
      this.friendListRef.updateFriendNewMsg(operation_sn, friend_sn, recordChat);
      this.messageListRef && this.messageListRef.appendMessage(recordChat);
    } else if(!this.friendListRef.isExistsFriend(operation_sn, friend_sn)) {
      //当前粉丝列表中不包含当前粉丝，查询粉丝信息，加入粉丝列表
      console.log('当前好友不在列表中');
      this._queryUserInfo(operation_sn, friend_sn, (newFriend) => {
        // 显示微信好友新消息，机器人和运营号发送消息不显示
        if(newFriend['chat_from'] === FROM_FRD) {
          newFriend['chat_content'] = recordChat['chat_content']
        }
        // 不激活当前聊天窗口
        // this._activedFriend(newFriend)
        this.friendListRef.unshiftFriend(newFriend);
      });
    } else {
      //在粉丝列表中，没有处于激活状态，更新用户信息：未读消息数量+1
      //数组不可变：state里面放int型标识，friendList放到this中 或 复写friendItemList中shouldupdate
      console.log('当前好友在列表中,不是置顶状态 ', recordChat);
      this.friendListRef.stickFriend(operation_sn, friend_sn, recordChat);
    }
  }
  //本地运营号发送消息
  //1、消息添加到消息框中；
  //2、发送消息给服务器
  //默认chat_type='1'文本消息： 4：图片
  //msgHTML： 原消息；formatMsg: 格式化后的消息(格式化了表情)
  doSendMessage(msgHTML, formatMsg, chat_type=TXT) {
    if(!this.operationSn || !this.friendSn) {
      Errors('当前没有好友');
      return;
    }
    //回复好友消息
    this.replyMessage(formatMsg, chat_type,msgHTML);
  }
  //回复后台消息
  replyMessage(formatMsg, chat_type, msgHTML) {
    const _replyFriendMsg = (message) => {
      ChatService.replyFriendByHand(this.operationSn, this.friendSn, chat_type, message).then(({jsonResult}) => {
        // 消息发送成功后，本地消息添加到聊天框面板中
        this.messageListRef.addLocalMessageHtml(msgHTML, chat_type);
        // 激活按钮，清除定时器
        this.sendMessageBoxRef.sendMsgSuccess();
      }).catch((err) => {
        Errors(err);
        this.sendMessageBoxRef.sendMsgFail();
      });
    }
    if(chat_type === TXT) {
      let chat_content
      //发送给服务器消息中的表情格式化
      //换行符替换
      if(formatMsg.endsWith("<br>")) {
        //用户输入ctrl+enter换行后，又backspace去掉回车，但是浏览器会在最后面遗留一个<br>
        chat_content = formatMsg.substr(0, formatMsg.length - 4);
      }
      chat_content = formatMsg.replace(/_qq/g, "").replace(/_emoji/g, "").replace(/<br>/g, "\n");
      _replyFriendMsg(chat_content)
    } else if(chat_type === IMG_DATA) {
      //上传图片：服务器返回图片链接，再发指令
      ChatService.uploadImg(formatMsg).then(({jsonResult}) => {
        _replyFriendMsg(jsonResult)
      });
    }
  }
  //private：查询用户资料，加入到粉丝列表并置顶
  _queryUserInfo(operation_sn, friend_sn, callback) {
    ChatService.queryUserInfo(operation_sn, friend_sn).then( ({jsonResult}) => {
      callback && callback(Object.assign({}, jsonResult))
    })
  }
  // 好友参数是否从路由中带过来
  _getFriendForRoute(friendList){
    const state = this.props.location.state
    // 路由中没有参数
    if(!state){
      friendList.length > 0 && this._activedFriend(friendList[0])
    } else {
      // 路由中有参数，好友主页跳转过来的
      const {operation_sn, friend_sn} = state
      const index = friendList.findIndex(friend => friend['operation_sn'] === operation_sn && friend['friend_sn'] === friend_sn)
      // 参数好友不在当前好友列表中，查询用户并添加到第一位
      if (index === -1) {
        this._queryUserInfo(operation_sn, friend_sn, (newFriend) => {
          if(newFriend){
            this.friendListRef.unshiftFriend(newFriend)
            this._activedFriend(newFriend)
          }
        })
      } else {
        let friend = friendList[index]
        this.friendListRef.unshiftFriend(friend)
        this._activedFriend(friend)
      }
    }
  }
  // 初始化查询好友数据
  _initQueryFriendList(){
    ChatService.queryUserInfoListNew(0, LIMIT_MESSAGE_PAGE).then(({jsonResult}) => {
      const friendList = [].concat(jsonResult)
      this.friendListRef.initFriendList(friendList)
      this._getFriendForRoute(friendList)
    })
  }
  // 左侧好友数据加载更多
  doLoadMoreFriend(friendCount, chatFriendKind='chat', chatBigfans=''){
    ChatService.queryUserInfoListNew(friendCount, LIMIT_MESSAGE_PAGE, chatFriendKind, chatBigfans).then(({jsonResult}) => {
      this.friendListRef.appendFriendList(jsonResult);
      if(jsonResult.length === 0){
        message.info('没有更多好友了', 3)
      }
    })
  }
  // 激活当前聊天好友、类型
  _activedFriend(friend, type=this.state.type){
    this.nextMsgPageStart = null
    this.operationSn = friend['operation_sn']
    this.friendSn = friend['friend_sn']
    this.setState({ friend, type }, () => {
      this._reQueryTypeData()
    })
    // 告知后台正在跟谁聊天
    this.sendCommandMessage(CMD_FEEDBACK,
      JSON.stringify({operation_sn: this.operationSn, friend_sn: this.friendSn, type}));
  }
  // 好友变更
  doChangeFriend(friend, type){
    const {operation_sn, friend_sn} = friend
    if(this.operationSn !== operation_sn || this.friendSn !== friend_sn){
      this._activedFriend(friend, type)
    }
  }
  // 根据不同类型查询好友数据（点赞、评论用的同一个组件，DIdMount去初始化数据，不然判断麻烦了）
  _reQueryTypeData(){
    if(!this.operationSn || !this.friendSn) return

    const type = this.state.type
    if(this.messageListRef && type === OPT_TYPE_CHAT){
      this._queryRecordChat(this.operationSn, this.friendSn, (messageList) => {
        this.messageListRef.changeFriendMessages(messageList, !!this.nextMsgPageStart);
      })
    } else if(this.diggRef && type === OPT_TYPE_DIGG){
      this.diggRef.queryInteractContent(type, this.operationSn, this.friendSn)
    } else if(this.commentRef && type === OPT_TYPE_COMMENT){
      this.commentRef.queryInteractContent(type, this.operationSn, this.friendSn)
    }
  }
  // 清空中间区域数据 和 当前好友数据
  _clearData(type=this.state.type){
    this.nextMsgPageStart = null
    this.operationSn = null
    this.friendSn = null
    this.setState({
      type,
      friend: {}
    }, () => {
      if(this.messageListRef && type === OPT_TYPE_CHAT){
        this.messageListRef.clearMessages()
      } else if(this.diggRef && type === OPT_TYPE_DIGG){
        this.diggRef.clearAllData()
      } else if(this.commentRef && type === OPT_TYPE_COMMENT){
        this.commentRef.clearAllData()
      }
    })
  }
  // 好友不变，类型变更
  doChangeType(type, e){
    e.stopPropagation();
    if(type === this.state.type) return
    this.setState({ type }, () => {
      this._reQueryTypeData()
    })
  }
  // 去下单页面
  handlePlaceOrder(e){
    e.stopPropagation();
    const friend = this.state.friend
    // 新开标签页
    window.open(`http://114.55.144.84:82/addOrder.aspx?nickname=${friend.remark_name || friend.nick_name}&buywechatid=${this.friendSn}&wechatid=${this.operationSn}`, '_blank');
  }
  // 好友、类型都变更
  doChangeAll(type, operation_sn, friend_sn){
    if(type === this.state.type && this.operationSn === operation_sn && this.friendSn === friend_sn) return

    const friend = this.friendListRef.activedFriend(operation_sn, friend_sn)
    // 好友不在当前列表中，查询并添加到第一位
    if(!friend){
      ChatService.queryUserInfo(operation_sn, friend_sn).then(({jsonResult}) => {
        if(!jsonResult) return
        this._activedFriend(jsonResult, type)
        this.friendListRef.unshiftFriend(jsonResult)
      })
    } else {
      this._activedFriend(friend, type)
    }
  }
  // 选择了不同条件，重新查询好友数据
  doResetQueryFriend(chatFriendKind, chatBigfans){
    ChatService.queryUserInfoListNew(0, LIMIT_MESSAGE_PAGE, chatFriendKind, chatBigfans).then(({jsonResult}) => {
      this.friendListRef.initFriendList(jsonResult)
      if(jsonResult.length > 0) {
        this._activedFriend(jsonResult[0], chatFriendKind)
      } else {
        // 当前类型没有数据，清空中间区域数据
        this._clearData(chatFriendKind)
      }
    })
  }
  // 查询好友聊天记录
  _queryRecordChat(operation_sn = this.operationSn, friend_sn = this.friendSn, callback){
    ChatService.queryRecordChat(operation_sn, friend_sn, this.nextMsgPageStart).then(({jsonResult}) => {
      this.nextMsgPageStart = jsonResult['nextPageStart'];   //下一页开始对象
      let messageList = jsonResult['data']
      if(messageList.length > 0){
        //倒序：后台发过来 最新的消息在最上面
        messageList.reverse()
      }
      callback && callback(messageList)
    })
  }
  //加载更多历史聊天记录
  doLoadMoreMsg() {
    this._queryRecordChat(this.operationSn, this.friendSn, (messageList) => {
      this.messageListRef.addFrontMessages(messageList, !!this.nextMsgPageStart);
      this.messageListRef.loadMoreFinish()
    });
  }
  //首次播放了语音
  doPlayedAudio(chatMessage) {
    this.sendCommandMessage(CMD_PLAY_AUDIO, JSON.stringify(chatMessage))
  }
  doCopy(e){
    e.stopPropagation();
    if(!this.operationSn || !this.friendSn) return
    ChatService.copyFriendName(this.operationSn, this.friendSn).then(({jsonResult}) => {
      window.prompt("复制到剪贴板: Ctrl+C, 回车", jsonResult);
    })
  }
  // 跳转到好友主页
  jumpToFriendHome(e){
    e.stopPropagation();
    if(!this.operationSn || !this.friendSn) return
    hashHistory.push({
      pathname: "/friend",
      state: {
        operation_sn: this.operationSn,
        friend_sn: this.friendSn,
      }
    });
  }
  render() {
    const {type, friend} = this.state
    const chatType = type === OPT_TYPE_CHAT ? 'primary' : 'ghost',
      diggType = type === OPT_TYPE_DIGG ? 'primary' : 'ghost',
      commentType = type === OPT_TYPE_COMMENT ? 'primary' : 'ghost'
    return (
      <div className="chat-container">
        <FriendList ref={obj => this.friendListRef = obj}
                    onToggle={this.doChangeFriend}
                    onQuery={this.doResetQueryFriend}
                    onLoadMore={this.doLoadMoreFriend}/>
        <div className="chat-main">
          <div className="main-header" onClick={this.jumpToFriendHome}>
            <Avatar shape="square" icon="user" size="large" src={imgPaddedPrefix(friend.head_url)} />
            <h1>{friend.remark_name || friend.nick_name}</h1>
            <a href="javascript:void(0)" onClick={this.doCopy}>复制</a>
            <span className="opt-btns">
              <Button type="ghost" size="large" onClick={this.handlePlaceOrder.bind(this)}>下单提交</Button>
              <Button type={chatType} size="large" onClick={this.doChangeType.bind(this, OPT_TYPE_CHAT)}>去聊天</Button>
              <Button type={diggType} size="large" onClick={this.doChangeType.bind(this, OPT_TYPE_DIGG)}>看点赞</Button>
              <Button type={commentType} size="large" onClick={this.doChangeType.bind(this, OPT_TYPE_COMMENT)}>看评论</Button>
            </span>
          </div>
          {type === OPT_TYPE_CHAT && <MessageList ref={obj=>this.messageListRef=obj}
                                                  headUrl={friend['head_url']}
                                                  onLoadMoreMsg={this.doLoadMoreMsg}
                                                  onPlayedAudio={this.doPlayedAudio}/>}
          {type === OPT_TYPE_CHAT && <SendMessageBox ref={obj => this.sendMessageBoxRef=obj}
                                                     onSendMessage={this.doSendMessage}/>}
          {type === OPT_TYPE_DIGG && <InteractContentList ref={obj=>this.diggRef=obj}/>}
          {type === OPT_TYPE_COMMENT && <InteractContentList ref={obj=>this.commentRef=obj}/>}
        </div>
        <TagList ref={obj=>this.tagListRef=obj}
                 onTagUserChat={this.doChangeAll.bind(this, OPT_TYPE_CHAT)}
                 onTagUserDigg={this.doChangeAll.bind(this, OPT_TYPE_DIGG)}
                 onTagUserComment={this.doChangeAll.bind(this, OPT_TYPE_COMMENT)}/>
        <input type="hidden" ref={obj=>this.copyInputRef=obj} />
      </div>
    )
  }
}

export default ChatContainer;
