import React, {Component, PureComponent} from 'react';
import {Radio, Badge, Avatar, Tag} from 'antd';
import classNames from 'classnames';
import './FriendList.less';
import {LoadingTip, EmptyDataTip, LoadMoreTip} from './TipTools'

import {imgPaddedPrefix, LIMIT_MESSAGE_PAGE, FROM_FRD } from './Utils'
import ChatService from "../../services/ChatService";

const RadioGroup = Radio.Group;
const FRD_KIND_CHAT = 'chat', FRD_KIND_DIGG = 'digg', FRD_KIND_COMMENT = 'comment'

class FriendItem extends Component {
  constructor(props){
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleStickTop = this.handleStickTop.bind(this)
  }
  handleClick(e){
    if(this.props.isActived !== true){
      this.props.onToggleFriend(this.props.friend)
    }
  }
  handleStickTop(e){
    e.stopPropagation()
    const {friend_wechat, is_top} = this.props.friend
    this.props.onStickTop(friend_wechat, is_top)
  }
  render(){
    const {friend, isActived} = this.props
    const {friend_wechat, unread_num, head_url, remark_name, nick_name, chat_content,  is_top} = friend
    const cls = classNames("frd-item", {'actived': isActived === true })
    return (
      <li key={friend_wechat} className={cls} onClick={this.handleClick}>
        {/* 激活状态下就不显示未读数量了 */}
        <Badge count={unread_num}>
          <Avatar shape="square" icon="user" size="large" src={imgPaddedPrefix(head_url)}/>
        </Badge>
        <div className="content">
          <b>{remark_name || nick_name}</b>
          <label>{chat_content}</label>
        </div>
        <Tag color={is_top === 'T' ? '#87d068' : '#108ee9'} className="zd" onClick={this.handleStickTop}>
          {is_top === 'T' ? '取消' : '置顶'}
        </Tag>
      </li>
    )
  }
}

export default class FriendList extends Component{
  constructor(props){
    super(props)
    this.state = {
      show: 'loading',
      // 当前选中粉丝id
      currentFriendWechat: null,
      // 粉丝数组
      friendList: [],
      // 全粉 NULL， 非大号粉 F, 大号粉 T
      chatBigfans: '',
      // 聊天chat, 点赞like, 评论comment
      chatFriendKind: FRD_KIND_CHAT
    }
    this.handleStickTop = this.handleStickTop.bind(this)
    this.handleToggleFriend = this.handleToggleFriend.bind(this)
    this.handleChangeBigFans = this.handleChangeBigFans.bind(this)
    this.handleLoadMore = this.handleLoadMore.bind(this)
  }
  // 初始化好友列表，默认激活第一个粉丝
  initFriendList(friendList){
    if(friendList.length > 0) {
      // 由于要修改激活的好友未读数量，加个字段备份下，暂时注释，后续需要这个真实未读数量再启用
      // friendList.forEach(friend => friend['unread_num_bak'] = friend['unread_num'])
      const firstFriend = friendList[0]
      firstFriend['unread_num'] = 0
      this.setState({
        friendList,
        show: 'normal',
        currentFriendWechat: firstFriend["friend_wechat"]
      })
    } else {
      this.setState({
        show: 'empty',
        currentFriendWechat: null,
        friendList: []
      })
    }
  }
  // 新增好友
  appendFriendList(friendList) {
    if(friendList.length > 0) {
      this.setState({friendList: this.state.friendList.concat(friendList)});
    }
    this.loadMoreRef.loadMoreFinish()
  }
  // 激活指定好友
  activedFriend(operationSn, friendSn){
    let friend
    const friendList = this.state.friendList.concat([])
    const index = this._findIndex(operationSn, friendSn)
    if(index >= 0){
      friend = friendList[index]
      friend['unread_num'] = 0
      if(this.state.currentFriendWechat !== friend['friend_wechat']){
        this.setState({ show: 'normal', currentFriendWechat: friend['friend_wechat'] })
      }
    }
    return friend
  }
  // 将好友添加到第一位
  unshiftFriend(friend){
    const friendList = this.state.friendList.concat([])

    const index = this._findIndex(friend['operation_sn'], friend['friend_sn'])
    if(index === 0) return

    friendList.splice(index, 1)
    this._moveToFront(friendList, friend)

    this.setState({
      friendList,
      show: 'normal'
      //仅仅只将好友添加到非置顶的第一位，不激活该窗口
      // currentFriendWechat: friend["friend_wechat"]
    })
  }
  _findIndex(operationSn, friendSn){
    return this.state.friendList.findIndex(friend => friend['operation_sn'] === operationSn && friend['friend_sn'] === friendSn)
  }
  // 移到未置顶第一位
  _moveToFront(friendList, friend){
    const index = friendList.filter(friend => friend.is_top === 'T').length
    friendList.splice(index, 0, friend)
  }
  //该好友是否存在当前好友列表中
  isExistsFriend(operationSn, friendSn) {
    return this._findIndex(operationSn, friendSn) >= 0;
  }
  //更新正在聊天好友的最新消息
  updateFriendNewMsg(operationSn, friendSn, recordChat) {
    const friendList = this.state.friendList.concat([])
    const index = this._findIndex(operationSn, friendSn)
    const friend = friendList[index]
    const {chat_content, chat_from} = recordChat
    // 微信好友发送的消息，运营号自己排除
    if(chat_from === FROM_FRD) {
      friend['chat_content'] = chat_content
    }
    this.setState({ friendList });
  }
  //有新消息过来，好友置顶，显示最新聊天消息
  stickFriend(operationSn, friendSn, recordChat) {
    const index = this._findIndex(operationSn, friendSn)
    if(index === -1) return

    const friendList = this.state.friendList.concat([])
    const friend = friendList[index]
    const {chat_content, chat_from} = recordChat
    // 微信好友发送的消息，运营号自己排除
    if(chat_from === FROM_FRD) {
      friend['unread_num'] += 1;
      friend['chat_content'] = chat_content
    }

    if(index > 0) {
      friendList.splice(index, 1);
      this._moveToFront(friendList, friend)
    }
    this.setState({ friendList });
  }
  // 点击切换不同好友
  handleToggleFriend(friend){
    const index = this._findIndex(friend['operation_sn'], friend['friend_sn'])
    const friendList = this.state.friendList.concat([])
    friendList[index]['unread_num'] = 0
    this.setState({
      friendList,
      currentFriendWechat: friend['friend_wechat']
    })
    this.props.onToggle(friend, this.state.chatFriendKind)
  }
  // 置顶
  handleStickTop(friend_wechat, isTop){
    const friendList = this.state.friendList.concat([])
    const index = friendList.findIndex(friendList => friendList.friend_wechat === friend_wechat)
    const isNewTop = isTop === 'F' ? 'T' : 'F'
    const friend = friendList.splice(index, 1)[0]
    friend['is_top'] = isNewTop
    // 置顶
    if(isTop === 'F'){
      friendList.unshift(friend)
      this.setState({ friendList })
    } else if(isTop === 'T'){
      // 取消置顶（排在所有没有置顶好友第一位）
      this._moveToFront(friendList, friend)
      this.setState({ friendList })
    }
    ChatService.toTopUser(friend['operation_sn'], friend['friend_sn'], this.state.chatBigfans, this.state.chatFriendKind, isNewTop)
  }
  // 全粉、大号粉change方法
  handleChangeBigFans(e){
    e.preventDefault();
    const chatBigfans = e.target.value;
    if(chatBigfans !== this.state.chatBigfans){
      this.setState({ chatBigfans, show: 'loading' })
      this.props.onQuery(this.state.chatFriendKind, chatBigfans)
    }
  }
  // 聊天、点赞、评论
  handleClickFrdKind(chatFriendKind, e){
    e.preventDefault();
    if(chatFriendKind !== this.state.chatFriendKind){
      this.setState({ chatFriendKind, show: 'loading' }, () => {
        this.props.onQuery(chatFriendKind, this.state.chatBigfans)
      })
    }
  }
  handleLoadMore(){
    this.props.onLoadMore(this.state.friendList.length, this.state.chatFriendKind, this.state.chatBigfans)
  }
  render() {
    const {friendList, chatBigfans, chatFriendKind} = this.state;
    const chatItemCls = classNames('kind', {'actived': chatFriendKind === FRD_KIND_CHAT}),
      commentItemCls = classNames('kind', {'actived': chatFriendKind === FRD_KIND_COMMENT}),
      likeItemCls = classNames('kind', {'actived': chatFriendKind === FRD_KIND_DIGG})
    return (
      <div className="chat-frd">
        <div className="frd-top">
          <RadioGroup className="frd-type" value={chatBigfans} onChange={this.handleChangeBigFans}>
            <Radio value="">全部粉</Radio>
            <Radio value="F">非大号粉</Radio>
            <Radio value="T">大号粉</Radio>
          </RadioGroup>
          <div className="frd-kind">
            <span className={chatItemCls} onClick={this.handleClickFrdKind.bind(this, FRD_KIND_CHAT)}>聊天</span>
            <span className={commentItemCls} onClick={this.handleClickFrdKind.bind(this, FRD_KIND_COMMENT)}>看评论</span>
            <span className={likeItemCls} onClick={this.handleClickFrdKind.bind(this, FRD_KIND_DIGG)}>看点赞</span>
          </div>
        </div>
        <div className="frd-list">
          {this.renderBody()}
        </div>
        {friendList.length >= LIMIT_MESSAGE_PAGE && <LoadMoreTip ref={obj=>this.loadMoreRef=obj} cls="load-more-bottom" onLoadMore={this.handleLoadMore} />}
      </div>
    )
  }
  renderBody(){
    const {show, currentFriendWechat, friendList} = this.state
    let body
    if(show === 'loading'){
      body = <LoadingTip/>
    } else if(show === 'normal'){
      body = friendList.map(friend => <FriendItem friend={friend}
                                                  isActived={currentFriendWechat===friend.friend_wechat}
                                                  onToggleFriend={this.handleToggleFriend}
                                                  onStickTop={this.handleStickTop}/>)
    } else if(show === 'empty'){
      body = <EmptyDataTip/>
    }
    return body
  }
}
