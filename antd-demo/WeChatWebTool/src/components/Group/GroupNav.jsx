import React from 'react';
import {Icon,Button} from 'antd';
import QueueAnim from 'rc-queue-anim';
import classNames from 'classnames';
import {is, Map, fromJS} from 'immutable';
import {renderFormatHTML, FROM_FRD} from '../Chat/Utils';
import {LIMIT_GROUP_FRIEND_PAGE} from './NavigateUtil.js';
import {Loading, EmptyDataTip} from '../Commons/TipTools';
import {Errors} from '../Commons/CommonConstants';
import groupChatService from '../../services/groupChatService';

class FriendItem extends React.Component {
  static contextTypes = {
    onClickFriend: React.PropTypes.any
  }
  constructor(props) {
    super(props);
    this.onClickFriend = this.onClickFriend.bind(this);
  }
  onClickFriend(e) {
    e.stopPropagation();
    this.context.onClickFriend(this.props.friend.get('operation_sn'), this.props.friend.get('friend_sn'));
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !is(nextProps.friend, this.props.friend);
  }
  render() {
    console.debug('FriendItem => render => ', this.props);
    const friend = this.props.friend;
    const isSelect = friend.get('is_select'), unreadNum = friend.get('unread_num'), anchorName = friend.get('anchor_name'),
      userLevel = friend.get('show_user_level_text');
    const activeCls = classNames("group-frd-item", {"group-left-active": isSelect === true});
    return (
      <div className={activeCls} onClick={this.onClickFriend}>
        <div className="item-start">
          <h1>{!!userLevel ? userLevel : "无"}</h1>
          <span>{!!anchorName ? anchorName : "无"}</span>
          {
            (isSelect === false && unreadNum && unreadNum > 0) ? <label className="red-circle">{unreadNum}</label> : null
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

class GroupItem extends React.Component {
  static contextTypes = {
    refreshCurrentGroupAndWindows: React.PropTypes.any
  }
  constructor(props) {
    super(props);
    this.state = {
      is_open: props.group.get('is_open')
    };
    this.openGroupItem = this.openGroupItem.bind(this);
    this.onLoadMore = this.onLoadMore.bind(this);
    this.handleRefreshCurrentNav = this.handleRefreshCurrentNav.bind(this);
  }
  // 刷新当前分组所有数据和 当前分组在主页面存在的聊天窗口
  handleRefreshCurrentNav(e) {
    e.stopPropagation();
    this.context.refreshCurrentGroupAndWindows(this.props.group.get('group_id'))
  }
  openGroupItem() {
    this.setState({
      is_open: !this.state.is_open
    })
  }
  onLoadMore() {
    this.props.onLoadMore(this.props.group.get('userList').size, this.props.group.get('group_id'))
  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextState.is_open !== this.state.is_open || !is(nextProps.group, this.props.group)
  }
  render() {
    const group = this.props.group;
    console.debug('GroupItem => render => ', group.get('is_open'));

    const isOpen = this.state.is_open === true;
    const activeCls = classNames("group-ul", {"open": isOpen});
    const iconType = isOpen ? 'caret-down' : 'caret-right';
    const userList = group.get('userList');
    const loadMoreCls = classNames("group-load-more", {"no-show": userList.size < LIMIT_GROUP_FRIEND_PAGE});

    return (
      <div className={activeCls} onClick={this.openGroupItem}>
        <p className="group-name">
          <Icon type={iconType} /> {group.get('group_name')}&nbsp;{group.get('chat_cnt')}/{group.get('friend_cnt')}
          <Button type="ghost" size="small" icon="reload" title="刷新" style={{float:"right"}} onClick={this.handleRefreshCurrentNav}/>
        </p>
        {
          //折叠组或没有好友，不加载好友数据
          isOpen && userList.size > 0 ?
            <QueueAnim component="ul" type={['right', 'left']}>
              {
                userList.map(friend => (
                  <li key={friend.get('friend_wechat')}>
                    <FriendItem friend={friend} />
                  </li>
                ))
              }
            </QueueAnim> : null
        }
        <div className={loadMoreCls} onClick={this.onLoadMore}>加载更多？</div>
      </div>
    );
  }
}

class EmptyGroupItem extends React.Component {
  render() {
    return (
      <div className="group-ul">
        <p className="group-name">
          <Icon type="caret-right"/> {this.props.group_name}&nbsp;{this.props.chat_cnt}/{this.props.friend_cnt}
        </p>
      </div>
    );
  }
}

export default class GroupNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: 'loading',
      groupList: fromJS([]),
    }
    this.onLoadMore = this.onLoadMore.bind(this);
  }
  shouldComponentUpdate(nextProps, nextState) {
    if(nextProps.activeKey !== '2') return false;
    console.log("GroupNav => shouldComponentUpdate", this.state.groupList.toJS(), nextState.groupList.toJS());
    return this.state.show != nextState.show || !is(this.state.groupList, nextState.groupList);
  }
  /**
   * 刷新指定分组数据
   */
  refreshGroupItem(group_id, currentGroupList) {
    if(this.state.groupList.size == 0) return
    const index = this.state.groupList.findIndex(group => group.get('group_id') == group_id);
    if(index == -1) return;
    this.setState(({groupList}) => ({
      groupList: groupList.set(index, fromJS(currentGroupList[0]))
    }));
  }
  /**
   * 查找好友所在分组index、分组中好友index、好友具体数据
   */
  getFriendPosition(operation_sn, friend_sn) {
    if(this.state.groupList.size == 0) return false;
    let userArray;  //找到当前好友所在位置
    const groupIndex = this.state.groupList.findIndex(group => {
      userArray = group.get('userList').findEntry(user => (
        user.get('operation_sn') === operation_sn && user.get('friend_sn') === friend_sn
      ));
      return !!userArray;
    });
    if(!userArray) return [groupIndex, -1, -1];
    return [groupIndex, userArray[0], userArray[1]];
  }
  /**
   * 找到分组中的目标好友is_select=true
   * 取消替换好友选中状态is_select=false;
   */
  onToggleSelectedFriend(operation_sn, friend_sn, isSelected, oldOperationSn, oldFriendSn, isOldSelected) {
    const data = this.getFriendPosition(operation_sn, friend_sn);
    let groupIndex, userIndex = -1, oldGroupIndex, oldUserIndex = -1;
    if(!!data && data[1] > -1) {
      groupIndex = data[0];
      userIndex = data[1];
    }

    if(!!oldOperationSn) {
      const oldData = this.getFriendPosition(oldOperationSn, oldFriendSn);
      if(!!oldData && oldData[1] > -1) {
        oldGroupIndex = oldData[0];
        oldUserIndex = oldData[1];
      }
    }

    //新旧好友is_select一起更改，以免出现2次render
    if(userIndex > -1 && oldUserIndex > -1) {
      this.setState(({groupList}) => ({
        groupList: groupList.updateIn([groupIndex, "userList"], userList => (
          userList.update(userIndex, user => user.set('is_select', isSelected).set('unread_num', 0))
        ))
        .updateIn([oldGroupIndex, "userList", oldUserIndex, "is_select"], () => isOldSelected)
        .update(groupIndex, group => group.set('is_open', group.is_open || isSelected))
      }));
    } else if(userIndex > -1) {
      this.setState(({groupList}) => ({
        groupList: groupList.updateIn([groupIndex, "userList"], userList => (
          userList.update(userIndex, user => user.set('is_select', isSelected).set('unread_num', 0))
        ))
        .update(groupIndex, group => group.set('is_open', group.is_open || isSelected))
      }));
    }
  }
  //收到新消息
  receivedMessage(recordChat){
    //好友找到对应分组，添加到分组中第一位(chat_cnt热聊数量不改)
    //好友对应分组找不到，请求后台，添加分组
    const operation_sn = recordChat.operation_sn, friend_sn = recordChat.friend_sn;
    const data = this.getFriendPosition(operation_sn, friend_sn);
    if(data && data[1] > -1) {
      console.log("在分组中找到该好友")
      const groupIndex = data[0], index = data[1];
      let friend = data[2];
      if(friend.get('is_select') === false) {
        friend = friend.set('unread_num', friend.get('unread_num') + 1);
      }
      if(recordChat.chat_from === FROM_FRD){
        //更新最新消息(自动回复，机器人等不作最新消息)
        friend = friend.set('chat_content', recordChat.chat_content);
      }
      if(index === 0) {
        console.log("好友在分组第一位")
        //替换第一个
        this.setState(({groupList}) => ({
          groupList: groupList.updateIn([groupIndex, "userList"], userList => userList.set(0, friend))
        }))
      } else {
        console.log("好友不在分组第一位");
        //删除原来的再添加到第一个
        this.setState(({groupList}) => ({
          groupList: groupList.updateIn([groupIndex, "userList"], userList => userList.delete(index).insert(0, friend))
        }))
      }
    } else {
      console.log("分组中未找到该好友")
      groupChatService.getMultUserInfo(operation_sn, friend_sn).then(({jsonResult}) => {
        if(!jsonResult.group_id) return; //没有分组
        const index = this.state.groupList.findIndex(group => (
          group.get('group_id') === jsonResult.group_id
        ));
        if(index === -1) return;
        console.log("添加好友到分组第一位")
        this.setState(({groupList}) => ({
          groupList: groupList.updateIn([index, "userList"], userList => userList.insert(0, Map(jsonResult)))
        }));
      });
    }
  }
  //加载更多
  onLoadMore(offset, group_id) {
    this.__queryGroupList(offset, function(data){
      const newUserList = data[0].userList;
      if(newUserList.length > 0) {
        const index = this.state.groupList.findIndex(group => group.get('group_id') === group_id);
        this.setState(({groupList}) => ({
          groupList: groupList.updateIn([index, "userList"], userList => userList.concat(fromJS(newUserList)))
        }))
      } else {
        Errors('该分组没有更多好友数据了');
      }
    }, group_id);
  }
  activedTab(){
    this.__queryGroupList(0, function(data){
      if(data.length > 0) {
        this.setState({
          show: 'normal',
          groupList: fromJS(data)
        })
      } else {
        this.setState({ show: 'empty' });
      }
    }, undefined, this.state.groupList.size);
  }
  __queryGroupList(offset, callback, group_id, limit){
    limit = limit === 0 ? undefined : limit;
    //重新加载分组数据，offset=0
    groupChatService.queryGroupList(group_id, offset, limit).then(({jsonResult}) => {
      callback.call(this, jsonResult);
    });
  }
  componentDidMount() {
    this.activedTab();
  }
  renderBody() {
    console.log('GroupNav => render => ', this.state.groupList.toJS());
    return (
      <div>
        <QueueAnim type={['top', 'bottom']}>
          {
            this.state.groupList.map(group => (
              !!group.get('userList') && group.get('userList').size > 0
                ? <GroupItem key={group.get('group_id')} group={group} onLoadMore={this.onLoadMore} />
                : <EmptyGroupItem key={group.get('group_id')}
                    group_name={group.get('group_name')} chat_cnt={group.get('chat_cnt')} friend_cnt={group.get('friend_cnt')} />
            ))
          }
        </QueueAnim>
      </div>
    );
  }
  render() {
    if(this.state.show === 'loading'){
      return <Loading />
    }else if(this.state.show === "empty"){
      return <EmptyDataTip />
    }else if(this.state.show === "normal"){
      return this.renderBody();
    }
  }
}
