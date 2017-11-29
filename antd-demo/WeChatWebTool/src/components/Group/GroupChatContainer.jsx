import React, {PropTypes} from 'react';
import NavigateContainer from './NavigateContainer';
import MainContainer from './MainContainer';
import SocketComponent from '../Socket/SocketComponent';
import './GroupChatContainer.less';
import '../Chat/FaceCollection.less';
import {FROM_FRD} from '../Chat/Utils';
import groupChatService from '../../services/groupChatService';

export default class GroupChatContainer extends SocketComponent {
  static childContextTypes = {
    onClickFriend: PropTypes.any,
    sendCommandMessage: PropTypes.any,
    refreshCurrentGroupAndWindows: PropTypes.any,
  }
  getChildContext() {
    return {
      onClickFriend: this.onClickFriend.bind(this),
      sendCommandMessage: this.sendCommandMessage.bind(this),
      refreshCurrentGroupAndWindows: this.refreshCurrentGroupAndWindows.bind(this),
    }
  }
  constructor(props) {
    super(props);
    this.onFetchInitData = this.onFetchInitData.bind(this);
    this.onToggleSelectedFriend = this.onToggleSelectedFriend.bind(this);
  }
  // 刷新指定分组所有好友数据 和 更换所有聊天窗口
  refreshCurrentGroupAndWindows(group_id) {
    groupChatService.refreshGroupAndWindow(group_id).then(({jsonResult}) => {
      this.refs.nav.refreshGroupItem(group_id, jsonResult.groupDialogList);
      // 跟换一批聊天框
      this.refs.main.initData(jsonResult.window_max, jsonResult.chatWindows, jsonResult.commonLanguageList);
    });
  }
  //会话、分组中点击好友
  onClickFriend(operation_sn, friend_sn) {
    console.log('onClickFriend ', operation_sn, friend_sn);
    this.refs.main.onClickFriend(operation_sn, friend_sn);
  }
  /**
   * 切换好友选中状态(main中打开聊天框，选中好友；关闭聊天框，取消选中)
   * isSelected true：选中；false：取消选中
   */
  onToggleSelectedFriend(operation_sn, friend_sn, isSelected, oldOperationSn, oldFriendSn, isOldSelected) {
    this.refs.nav.onToggleSelectedFriend(operation_sn, friend_sn, isSelected, oldOperationSn, oldFriendSn, isOldSelected)
  }
  //打开聊天框成功
  onSelectedFriend(operation_sn, friend_sn) {
    console.log('onSelectedFriend', operation_sn, friend_sn)
    this.refs.nav.onSelectedFriend(operation_sn, friend_sn);
  }
  //关闭聊天框
  onUnSelectedFriend(operation_sn, friend_sn) {
    console.log('onUnSelectedFriend', operation_sn, friend_sn)
    this.refs.nav.onUnSelectedFriend(operation_sn, friend_sn);
  }
  //接收消息
  onSocketMessage(recordChatObj) {
    let recordChat = JSON.parse(recordChatObj);
    //来自微信好友的消息才显示、改变导航栏数据
    if(recordChat.chat_from === FROM_FRD) {
      this.refs.nav.receivedMessage(recordChat);
    }
    this.refs.main.receivedMessage(recordChat);
  }
  //初始化数据 或 导航栏刷新全部数据
  onFetchInitData(is_exchange=false) {
    groupChatService.queryMultWindow(null, null, is_exchange).then(({jsonResult}) => {
      console.log('初始化数据', jsonResult);
      this.refs.nav.initData(jsonResult.dialogueList);
      this.refs.main.initData(jsonResult.window_max, jsonResult.chatWindows, jsonResult.commonLanguageList);
    });
  }
  //查询包含指定好友的聊天数据(指定好友在第一位)
  __qyeryfriendWindow(operation_sn, friend_sn) {
    groupChatService.queryMultWindow(operation_sn, friend_sn).then(({jsonResult}) => {
      this.refs.nav.initData(jsonResult.dialogueList);
      this.refs.main.initData(jsonResult.window_max, jsonResult.chatWindows, jsonResult.commonLanguageList);
    });
  }
  componentDidMount() {
    super.componentDidMount();
    console.log('GroupChatContainer => componentDidMount',this.props.location.state)
    const state = this.props.location.state;
    if(!state || !state.operation_sn || !state.friend_sn) {
      this.onFetchInitData();
    } else {
      this.__qyeryfriendWindow(state.operation_sn, state.friend_sn);
    }
  }
  handleKeyDown(e){
    const size = this.refs.main.getChatWindowsSize();
    if(size > 0 && e.keyCode == 9){
      const activeEleId = document.activeElement.id, elePreId = "editArea";
      if(!activeEleId.startsWith(elePreId)) {
        //默认第一个聊天框pre获得焦点
        this.__setEleFocus("editArea1");
        return;
      }
      //焦点转移到下一个聊天框
      let index = parseInt(activeEleId.substr(elePreId.length)) + 1;
      index = index <= size ? index : 1;
      this.__setEleFocus(elePreId+index);
    }
  }
  __setEleFocus(eleId) {
    setTimeout(() => {
      const ele = document.getElementById(eleId);
      ele.focus();
      return true;
    }, 100);
  }
  render() {
    console.log('GroupChatContainer => render');
    return (
      <div className="group-container" onKeyDown={this.handleKeyDown.bind(this)}>
        <NavigateContainer ref="nav" onFetchInitData={this.onFetchInitData} />
        <MainContainer ref="main" onToggleSelectedFriend ={this.onToggleSelectedFriend } />
      </div>
    );
  }
}
