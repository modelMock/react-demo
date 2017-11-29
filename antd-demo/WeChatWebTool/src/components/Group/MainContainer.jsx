import React from 'react';
import GroupMessageList from './GroupMessageList';
import GroupSendMessageBox from './GroupSendMessageBox';
import QueueAnim from 'rc-queue-anim';
import Button from 'antd/lib/button';
import {TXT, IMG_DATA, CMD_SEND, CMD_FEEDBACK} from '../Chat/Utils';
import { Errors } from '../Commons/CommonConstants';
import {fromJS, is, List} from 'immutable';
import {Loading, EmptyDataTip} from '../Commons/TipTools';
import messageUtil from '../Chat/MessageUtil';
import groupChatService from '../../services/groupChatService';
import {uploadImg} from '../../services/chat';

const  msgPanelMap = (operation_sn, friend_sn) => {
  return `M_${operation_sn}_${friend_sn}`;
}
const boxPanelMap = (operation_sn, friend_sn) => {
  return `B_${operation_sn}_${friend_sn}`;
}
/*右侧聊天区域*/
export default class MainContainer extends React.Component {
  static contextTypes = {
    sendCommandMessage: React.PropTypes.any
  }
  static childContextTypes = {
    onEditSystemTags: React.PropTypes.any,
    onEditGroup: React.PropTypes.any,
    getCommonLanguageList: React.PropTypes.any,
  }
  getChildContext() {
    return {
      onEditSystemTags: this.onEditSystemTags.bind(this),
      onEditGroup: this.onEditGroup.bind(this),
      getCommonLanguageList: this.getCommonLanguageList.bind(this),
    }
  }
  constructor(props) {
    super(props);
    this.state = {
      show: 'loading',
      window_max: 0,
      chatWindows: fromJS([]),
    }
    this.onAddLocalMessage = this.onAddLocalMessage.bind(this);
    this.onCloseWindow = this.onCloseWindow.bind(this);
  }
  //当前操作员常用语
  getCommonLanguageList() {
    return this.commonLanguageList || [];
  }
  //修改好友系统标签(工具栏中打标签按钮：选择标签调用)
  onEditSystemTags(operation_sn, friend_sn, tagNameList, tagIds){
    this.refs[msgPanelMap(operation_sn, friend_sn)].onEditSystemTags(tagNameList);
    this.refs[boxPanelMap(operation_sn, friend_sn)].onEditSystemTagIds(tagIds);
  }
  /**
   * 工具栏变更好友分组信息
   * 1、刷新左侧当前激活的好友数据
   * 2、修改好友聊天框中特征标签
   */
  onEditGroup(operation_sn, friend_sn, group_id, tagNameList) {
    //刷新左侧暂时不做，因为切换tab就会重新查询数据
    this.refs[msgPanelMap(operation_sn, friend_sn)].onEditFeatureTags(group_id, tagNameList)
    this.refs[boxPanelMap(operation_sn, friend_sn)].onEditGroupId(group_id);
  }
  /**
   * 本地消息添加到聊天消息框中
   * msgHTML: 原始html消息文本
   * chat_type: 消息类型(默认为文本)
   */
  onAddLocalMessage(operation_sn, friend_sn, msgHTML, chat_type=TXT) {
    this.refs[msgPanelMap(operation_sn, friend_sn)].addLocalMessageHtml(msgHTML, chat_type);
  }
  __existFriendChatWindow(operation_sn, friend_sn) {
    return this.state.chatWindows.size != 0 && this.state.chatWindows.findIndex(cw => (
      cw.getIn(['userInfo', 'operation_sn']) === operation_sn && cw.getIn(['userInfo', 'friend_sn']) === friend_sn
    )) >= 0;
  }
  //更换被激活正在聊天的好友聊天框
  onClickFriend(operation_sn, friend_sn) {
    //好友聊天框已经打开，不作处理，否则打开聊天框
    if(this.__existFriendChatWindow(operation_sn, friend_sn)) return;
    console.log("没找到好友聊天框，将在第一个位置打开好友聊天框");
    let oldOperationSn, oldFriendSn;
    //打开窗口已经最大了，默认替换最后一个窗口
    if(this.state.window_max <= this.state.chatWindows.size) {
      const fristWinFriend = this.state.chatWindows.get(this.state.chatWindows.size - 1).get('userInfo');
      oldOperationSn = fristWinFriend.get('operation_sn');
      oldFriendSn = fristWinFriend.get('friend_sn');
    }
    //查询打开单个聊天框数据
    groupChatService.querySingleWindow(operation_sn, friend_sn, oldOperationSn, oldFriendSn).then(({jsonResult}) => {
      console.log('查询单个聊天框数据: ', jsonResult);

      if(!!oldOperationSn) {
        console.log('打开窗口已达最大数，替换最后一个聊天框')
        //原好友关闭聊天框糊掉
        this.props.onToggleSelectedFriend(operation_sn, friend_sn, true, oldOperationSn, oldFriendSn, false);
      } else {
        console.log('新增窗口')
        this.props.onToggleSelectedFriend(operation_sn, friend_sn, true);
      }
      //聊天消息反序，添加时间标记消息
      let messageList = jsonResult.recordChat.data;
      if(messageList.length > 0) {
        messageList.reverse();
        jsonResult.recordChat.data = messageUtil.processAllMessageList(messageList);
      }
      this.setState(({chatWindows}) => ({
        show: 'normal',
        chatWindows: !!oldOperationSn
          ? chatWindows.delete(chatWindows.size - 1).insert(0, fromJS(jsonResult))
          : chatWindows.insert(0, fromJS(jsonResult))
      }))
    });
  }
  //接收到新消息
  receivedMessage(recordChat) {
    console.log('主窗口收到新消息', recordChat);
    const operation_sn = recordChat.operation_sn, friend_sn = recordChat.friend_sn;
    //找到聊天框，回复指令3，添加新消息
    if(this.__existFriendChatWindow(operation_sn, friend_sn)){
      console.log("找到好友聊天框, 发送回复指令{cmd:3}");
      this.context.sendCommandMessage(CMD_FEEDBACK, JSON.stringify({operation_sn, friend_sn}));
      this.refs[msgPanelMap(operation_sn, friend_sn)].addNewMessage(recordChat);
    }
  }
  //初始化数据
  initData(window_max, chatWindows, commonLanguageList) {
    if(commonLanguageList.length > 0) {
      this.commonLanguageList = commonLanguageList.map(cl => {return cl.content});
    }
    //查询聊天常用语
    if(chatWindows.length > 0) {
      chatWindows.forEach(cw => {
        //倒序：后台发过来 最新的消息在最上面
        let messageList = cw.recordChat.data;
        messageList.reverse();
        //加上时间标记消息
        cw.recordChat.data = messageUtil.processAllMessageList(messageList);
      });
      this.setState({
        show: 'normal',
        window_max,
        chatWindows: fromJS(chatWindows),
      });
    } else {
      this.setState({
        show: 'empty',
        window_max,
        chatWindows: fromJS([]),
      });
    }
  }
  //关闭聊天框
  onCloseWindow(index, operation_sn, friend_sn) {
    groupChatService.closeSingleWindow(operation_sn, friend_sn).then(({jsonResult}) => {
      //通知导航栏关闭聊天框了
      this.props.onToggleSelectedFriend(operation_sn, friend_sn, false);
      const show = this.state.chatWindows.size > 1 ? 'normal' : 'empty';
      this.setState(({chatWindows}) => ({
        chatWindows: chatWindows.delete(index),
        show,
      }))
    });
  }
  getChatWindowsSize() {
    return this.state.chatWindows.size;
  }
  renderBody() {
    const chatWindows = this.state.chatWindows;
    console.log('MainContainer => render', this.state.chatWindows.toJS());
    return (
      <QueueAnim type={['left', 'right']} className="group-main">
       {
        chatWindows.map((cw,index) => {
          const userInfo = cw.get('userInfo');
          const operation_sn=userInfo.get('operation_sn'), friend_sn=userInfo.get('friend_sn');
          return (
            <div className="group-item" key={operation_sn+"_"+friend_sn}>
              <a href="javascript:void(0)" className="win-close"
                onClick={() => {this.onCloseWindow(index, operation_sn, friend_sn)}}>
                <Button icon="cross" size="small" />
              </a>
              <GroupMessageList ref={msgPanelMap(operation_sn, friend_sn)} activeFriend={cw} />
              <GroupSendMessageBox ref={boxPanelMap(operation_sn, friend_sn)}
                index={index+1}
                onAddLocalMessage={this.onAddLocalMessage}
                userInfo={userInfo.toJS()}/>
            </div>
          )
        })
      }
      </QueueAnim>
    );
  }
  render() {
    if(this.state.show === 'normal') return this.renderBody();

    let body;
    if(this.state.show === 'loading') {
      body = <Loading />
    } else if(this.state.show === 'empty') {
      body = <EmptyDataTip msg="没有更多未读消息好友"/>
    }
    return (
      <div className="group-main">
        {body}
      </div>
    );
  }
}
