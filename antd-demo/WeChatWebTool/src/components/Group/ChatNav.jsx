import React from 'react';
import Icon from 'antd/lib/icon';
import QueueAnim from 'rc-queue-anim';
import {Select} from 'antd';
import classNames from 'classnames';
import {is, Map, fromJS} from 'immutable';
import {Loading, EmptyDataTip} from '../Commons/TipTools';
import {renderFormatHTML, FROM_FRD} from '../Chat/Utils';
import {LIMIT_CHAT_FRIEND_PAGE} from './NavigateUtil.js';
import { Errors } from '../Commons/CommonConstants';
import groupChatService from '../../services/groupChatService';
import SearchInput from '../Search/SearchInput';

class ChatItem extends React.Component {
  static contextTypes = {
    onClickFriend: React.PropTypes.any,
  }
  constructor(props) {
    super(props);
    this.onClickFriend = this.onClickFriend.bind(this);
  }
  onClickFriend() {
    //选中状态的点击无效
    if(this.props.is_select !== true) {
      const operation_sn = this.props.friend.get('operation_sn'), friend_sn = this.props.friend.get('friend_sn');
      this.context.onClickFriend(operation_sn, friend_sn);
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !is(nextProps.friend, this.props.friend);
  }
  render() {
    // console.log('ChatItem => render', this.props.friend);
    const friend = this.props.friend;
    const group_name=friend.get('group_name'), anchor_name=friend.get('anchor_name'),
      unread_num=friend.get('unread_num'), is_select=friend.get('is_select');
    const activedCls = classNames("chat-item", {"group-left-active": friend.get('is_select')});
    return (
      <div className={activedCls} onClick={this.onClickFriend}>
        <div className="item-start">
          <h1>{!!group_name ? group_name : "无"}</h1>
          <span>{!!anchor_name ? anchor_name : "无"}</span>
          {
            (is_select === false && unread_num && unread_num > 0) ? <label className="red-circle">{unread_num}</label> : null
          }
        </div>
        <div className="item-body">
          <h1>{friend.get('nick_name')}</h1>
          {renderFormatHTML(friend.get('chat_content'))}
        </div>
        <Icon type="pushpin"/>
      </div>
    );
  }
}

export default class ChatNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: 'loading',
      initDialog:{},
      friendList: fromJS([]),   //好友集合,需要加载更多，所以要自己管理状态
    };
    this.onSearch = this.onSearch.bind(this);
    this.onLoadMore = this.onLoadMore.bind(this);
    this.selectChang=  this.selectChang.bind(this);
  }
  componentDidMount(){
    groupChatService.initDialogMode().then(({jsonResult}) => {
      if(!jsonResult) return;
      this.setState({initDialog:jsonResult});
      console.log("initDialog",this.state.initDialog);
    });
  }
  selectChang(select){
    console.log("this.selectChang",select);
    if(select==null||select===undefined){
      return;
    }
    groupChatService.updateDialogMode(select).then(({jsonResult}) => {
      console.log("jsonResult",jsonResult);
      });
  }
  shouldComponentUpdate(nextProps, nextState) {
    //当前激活的是会话列表才render
    if(nextProps.activeKey !== '1') return false;
    return this.state.show != nextState.show || !is(this.state.friendList, nextState.friendList);
  }
  onToggleSelectedFriend(operation_sn, friend_sn, isSelected, oldOperationSn, oldFriendSn, isOldSelected) {
    const index = this.state.friendList.findIndex(
        friend => (friend.get('operation_sn') === operation_sn && friend.get('friend_sn') === friend_sn));
    let oldIndex = -1;
    if(!!oldOperationSn) {
      oldIndex = this.state.friendList.findIndex(
          friend => (friend.get('operation_sn') === oldOperationSn && friend.get('friend_sn') === oldFriendSn));
    }
    if(index > -1 && oldIndex > -1) {
      this.setState(({friendList}) => ({
        friendList: friendList.update(index, friend => friend.set('is_select', isSelected).set('unread_num', 0))
          .updateIn([oldIndex, "is_select"], () => isOldSelected)
      }))
    } else if(index > -1) {
      this.setState(({friendList}) => ({
        friendList: friendList.update(index, friend => friend.set('is_select', isSelected).set('unread_num', 0))
      }))
    }
  }
  //接收到新消息，判断好友在不在列表中
  receivedMessage(recordChat) {
    console.log('会话 => 收到新消息：', recordChat, this.state.friendList);
    const operation_sn = recordChat.operation_sn, friend_sn = recordChat.friend_sn;
    let arr;
    if(this.state.friendList.size > 0) {
      console.log('开始循环会话列表')
      arr = this.state.friendList.findEntry(frd => (
        frd.get('operation_sn') === operation_sn && frd.get('friend_sn') == friend_sn
      ));
    }
    if(!!arr) {
      console.log('好友已找到')
      let index=arr[0], friend = arr[1];
      //修改最新消息和未读数量
      //未选中状态，没有聊天中，显示未读消息数量并加1
      if(friend.get('is_select') === false) {
        friend = friend.set('unread_num', friend.get('unread_num') + 1);
      }
      if(recordChat.chat_from === FROM_FRD){
        //更新最新消息(自动回复，机器人等不作最新消息)
        friend = friend.set('chat_content', recordChat.chat_content);
      }
      if(index === 0) {
        //替换第一个
        this.setState(({friendList}) => ({
          friendList: friendList.set(0, friend)
        }));
      } else {
        //删除原来的再添加到第一个
        this.setState(({friendList}) => ({
          friendList: friendList.delete(index).insert(0, friend)
        }));
      }
    } else {
      console.log('未找到好友，开始请求好友数据')
      //当前好友没有在会话列表中，添加进去
      groupChatService.getMultUserInfo(operation_sn, friend_sn).then(({jsonResult}) => {
        if(!jsonResult) return;
        this.setState(({friendList}) => ({
          show: 'normal',
          friendList: friendList.insert(0, Map(jsonResult))
        }));
      });
    }
  }

  //搜索好友
  onSearch(nickName){
    this.__queryDialogueList(0, function(data){
      if(data.length > 0) {
        this.setState({
          show: 'normal',
          friendList: fromJS(data)
        })
      } else {
        this.setState({ show: 'empty' });
      }
    }.bind(this), nickName);
  }
  __queryDialogueList(offset, callback, nickName, limit) {
    limit = limit === 0 ? undefined : limit;
    groupChatService.queryDialogueList(offset, nickName, limit).then(({jsonResult}) => {
      callback.call(this, jsonResult);
    });
  }
  //切换激活tab，重新查询数据
  activedTab(){
    this.__queryDialogueList(0, function(data){
      if(data.length > 0) {
        console.log("切换会话，查询到新会话数据");
        this.setState({
          show: 'normal',
          friendList: fromJS(data)
        })
      } else {
        console.log("切换会话, 数据为空");
        this.setState({ show: 'empty' });
      }
    }, undefined, this.state.friendList.size);
  }
  //加载更多
  onLoadMore() {
    this.__queryDialogueList(this.state.friendList.size, function(data){
      if(data.length > 0) {
        console.log('加载更多数据：', data);
        //分页，加载更多数据
        this.setState(({friendList}) => ({
          friendList: friendList.concat(fromJS(data))
        }));
      } else {
        Errors('没有更多会话好友数据了');
      }
    });
  }
  initData(friendList) {
    //第一次从父类中传入数据初始化
    if(friendList.length > 0) {
      this.setState({
        show: 'normal',
        friendList: fromJS(friendList)
      })
    } else {
      this.setState({ show: 'empty' });
    }
  }
  renderBody() {
    const friendList = this.state.friendList.size>200?this.state.friendList.slice(0,200):this.state.friendList;
    console.log('ChatNav => render => ', friendList, "friendList.size",friendList.size,"friendList.toJS()",friendList.toJS());
    const loadMoreCls = classNames("load-more", {"no-page": friendList.size < LIMIT_CHAT_FRIEND_PAGE})
    return (
      <div>
        <div className="ant-select-selection__rendered" style={{marginBottom:8}} >
           <label style={{width:'20%'}}>模式</label>
            <Select
              onChange={this.selectChang}
              defaultValue={  this.state.initDialog.current_dialog_id}
              allowClear
              placeholder="请选择会话模式"
              style={{ marginLeft:5, marginTop:10, width:'60%'}}>
              {
                this.state.initDialog.dialogModeList.map((item, idx)=> <Option key={idx}
                                                               value={`${item.dialog_id}`}>{item.dialog_name}</Option>)
              }
            </Select>
        </div>
        <QueueAnim type={['right', 'left']} >
          {
            friendList.map(friend => {
              return <ChatItem key={friend.get('friend_wechat')} friend={friend} />
            })
          }
          <p className={loadMoreCls} onClick={this.onLoadMore}>加载更多？</p>
        </QueueAnim>
      </div>
    );
  }
  render() {
    if(this.state.show === 'loading'){
      return <Loading />
    }else if(this.state.show === "empty"){
      return (
        <div>
          {/* <div className="search-ads-input">
            <SearchInput placeholder="请输入好友名称过滤" onSearch={this.onSearch}/>
          </div> */}
          <div className="ant-select-selection__rendered" style={{marginBottom:8}}>
             <label style={{width:'20%'}}>模式</label>
             <Select
               onChange={this.selectChang}
               defaultValue={  this.state.initDialog.current_dialog_id}
               allowClear
               placeholder="请选择会话模式"
               style={{ marginLeft:5, marginTop:10, width:'60%'}}>
               {
                 this.state.initDialog.dialogModeList.map((item, idx)=> <Option key={idx}
                                                                value={`${item.dialog_id}`}>{item.dialog_name}</Option>)
               }
             </Select>
          </div>
          <EmptyDataTip />
        </div>
      );
    }else if(this.state.show === "normal"){
      return this.renderBody();
    }
  }
}
