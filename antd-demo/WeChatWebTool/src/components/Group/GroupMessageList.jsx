import React from 'react';
import ReactDOM from 'react-dom';
import {Icon,Tag,Popover,Button} from 'antd';
import EditRemarkInfo from './EditRemarkInfo';
import {Map, List, fromJS, is} from 'immutable';
import { format } from 'date-fns';
import classNames from 'classnames';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {imgPaddedPrefix, TXT, IMG_DATA, AUDIO, IMG_LINK, TIME, FROM_FRD, FROM_OPT,
    CMD_PLAY_AUDIO, renderFormatHTML } from '../Chat/Utils';
import messageUtil from '../Chat/MessageUtil';
import { Errors } from '../Commons/CommonConstants';
import CommonModal from '../Commons/CommonModal';
import groupChatService from '../../services/groupChatService';

class GroupMessageItem extends React.Component {
  static proptypes = {
    messageObj: React.PropTypes.object.isRequired,
    head_url: React.PropTypes.string,
  }
  static defaultProps = {
    head_url: require('../../../assets/images/app/head.png')
  }
  constructor(props) {
    super(props);
    this.handlePlay = this.handlePlay.bind(this);
  }
  onImgClick(e, imgUrl) {
    e.preventDefault();
    if(imgUrl) {
      this.props.onShowImgModal(imgUrl);
    }
  }
  handlePlay() {
    if(this.props.messageObj.get('is_play') !== 'T' ) {
      this.props.onPlayedAudio(this.props.messageObj);
    }
  }
  renderAudio(chat_message){
    return <audio className="msg-audio" src={chat_message} preload="auto" controls onPlaying={this.handlePlay}/>
  }
  //微信好友发送的图片消息
  renderImage(chat_content, chat_from){
    let title;
    if(chat_from === '3'){
      title = "群发";
    } else if(chat_from === '4'){
      title = "主播";
    } else if(chat_from === '5'){
      title = "图灵智能";
    } else if(chat_from === '6'){
      title = "本地智能";
    }
    return <img className="msg-image" src={imgPaddedPrefix(chat_content)} title={title}
      onClick={ (e) => {this.onImgClick(e, chat_content)} }/>
  }
  //本地运营号发送的本地图片消息
  renderLocalImage(chat_content) {
    return <img className="msg-image" src={chat_content} onClick={ (e) => {this.onImgClick(e, chat_content)} }/>
  }
  //本地运营号发送的文本消息(包含表情)
  renderLocalSendContent(chat_content){
    return <p dangerouslySetInnerHTML={{__html: chat_content}}></p>
  }
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.head_url != nextProps.head_url || !is(this.props.messageObj, nextProps.messageObj)
  }
  renderBody() {
    console.log('GroupMessageItem => render', this.props.messageObj.toJS());
    const messageObj = this.props.messageObj;
    const chat_from=messageObj.get('chat_from'), chat_content=messageObj.get('chat_content'),
      chat_type=messageObj.get('chat_type'), rawHtml=messageObj.get('rawHtml');
    const msgItemCss = classNames("message-item", { "right": chat_from !== FROM_FRD});
    let content;
    if(rawHtml === true){       // 本地发送的文本消息
      content = this.renderLocalSendContent(chat_content);
    } else {                    //按微信好友发送的信息类型分类
      if(chat_type === TXT) {
        // 文本消息(微信发过来的换行符\n替换为<br>)
        content = renderFormatHTML(chat_content.replace(/\n/g, "<br>"));
      } else if(chat_type === IMG_DATA || chat_type === IMG_LINK) {
        content = (chat_from === FROM_OPT) ? this.renderLocalImage(chat_content) : this.renderImage(chat_content, chat_from);
      } else if(chat_type === AUDIO) {
        content= this.renderAudio(chat_content);
      }
    }
    return (
      <li className={msgItemCss}>
        <a href="javascript:void(0)" className="photo">
          <img title="好友头像" src={this.props.head_url} />
        </a>
        <a href="javascript:void(0)" className="message">{content}</a>
        <i className="caret-left" />
      </li>
    );
  }
  renderTimeMsg() {
    return <li className="msg-time-split"><b>{this.props.messageObj.get('chat_content')}</b></li>
  }
  render() {
    return this.props.messageObj.get('chat_type') !== TIME ? this.renderBody() : this.renderTimeMsg();
  }
}

export default class GroupMessageList extends React.Component {
  static contextTypes = {
    sendCommandMessage: React.PropTypes.any
  }
  constructor(props) {
    super(props);
    this.state = {
      loadIcon: 'reload',
      priviewImage: '',
      friend: props.activeFriend.get('userInfo'),
      messageList: props.activeFriend.getIn(['recordChat', 'data']),
    }
    this.nextPageStart = props.activeFriend.getIn(['recordChat', 'nextPageStart']); //分页用的

    this.jumpToFriendHome = this.jumpToFriendHome.bind(this);
    this.onLoadMoreMessage = this.onLoadMoreMessage.bind(this);
    this.onShowImgModal = this.onShowImgModal.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.onPlayedAudio = this.onPlayedAudio.bind(this);
    this.onEditRemark = this.onEditRemark.bind(this);
  }
  onShowImgModal(imgUrl) {
    this.setState({
      priviewImage: imgUrl,
    });
    this.refs.commonModal.show();
  }
  handleCancel() {
    this.refs.commonModal.hide();
  }
  //播放语音，告知服务器已播放，更新is_play标识，后续再点击播放不发送指令
  onPlayedAudio(chatMessage) {
    const index = this.state.messageList.findIndex(msg => msg.get('chat_sn') == chatMessage.get('chat_sn'));
    if(index >= 0) {
      console.log('你播放了语音：',chatMessage);
      this.context.sendCommandMessage(CMD_PLAY_AUDIO, JSON.stringify(chatMessage))
      this.setState(({messageList}) => ({
        messageList: messageList.updateIn([index, "is_play"], () => "T")
      }));
    }
  }
  //添加本地运营号消息
  addLocalMessageHtml(chat_content, chat_type=TXT){
    let msgObj, chat_time = format(new Date(), 'YYYY-MM-D HH:mm:ss');
    if(chat_type === TXT) {
      if(chat_content.trim().length == 0) {   //一串空格，空格替换为空格占位符
        chat_content = chat_content.replace(/ /g, '&nbsp;');
      }
      msgObj = {chat_from: FROM_OPT, rawHtml: true, chat_type, chat_content, chat_time};
    } else if(chat_type === IMG_DATA) {
      msgObj = {chat_from: FROM_OPT, chat_type, chat_content, chat_time};
    }
    this.addNewMessage(msgObj);
  }
  //后台消息，正在聊天的好友，有新消息过来
  addNewMessage(message) {
    this.isLoadMore = false;
    const messageList = messageUtil.processImmutableAppendSignMsg(this.state.messageList, message);
    this.setState({ messageList });
  }
  onLoadMoreMessage() {
    if(!this.nextPageStart) {
      Errors("没有更多聊天记录了");
      return;
    }
    this.setState({ loadIcon: 'loading' });
    groupChatService.queryMultRecordChat(this.state.friend.get('operation_sn'), this.state.friend.get('friend_sn'),
        this.nextPageStart).then(({jsonResult}) => {
      let msgList = jsonResult.data;
      if(msgList.length === 0) {
        console.log("没有更多聊天记录了");
        this.nextPageStart = null;
        this.setState({ loadIcon: 'reload' });
        return;
      }
      console.log("加载更多聊天记录", jsonResult);
      //加载更多状态
      this.isLoadMore = true;
      this.nextPageStart = jsonResult.nextPageStart;
      //消息区总是处于最上面
      let node = ReactDOM.findDOMNode(this.refs.msgBody);
      this.scrollTop = node.scrollTop = 0;

      msgList.reverse();  //倒序消息，让最新消息处于最下面
      const messageList = messageUtil.processImmutableAddFrontMessageList(this.state.messageList, msgList);
      this.setState({ messageList, loadIcon: 'reload' });
    });
  }
  //待开发：跳转到好友个人信息页面
  jumpToFriendHome() {}
  //修改备注
  onEditRemark(newRemark="") {
    this.setState(({friend}) => ({
      friend: friend.set('remark', newRemark)
    }))
  }
  //修改好友系统标签回调
  onEditSystemTags(tags=[]) {
    this.setState(({friend}) => ({
      friend: friend.set('sys_tagname_list', List(tags))
    }));
  }
  //修改好友特征标签
  onEditFeatureTags(group_id, tags=[]) {
    this.setState(({friend}) => ({
      friend: friend.set('feature_tagname_list', List(tags)).set('group_id', group_id)
    }));
  }
  componentWillUpdate() {
    let node = ReactDOM.findDOMNode(this.refs.msgBody);
    if(!!node && this.scrollTop != node.scrollHeight) {
      this.scrollTop = node.scrollHeight;
    }
  }
  componentDidUpdate(){
    let node = ReactDOM.findDOMNode(this.refs.msgBody);
    //如果是加载更多，不修改滚动条到最下面，保持在最上面
    if(!!node && this.state.loadIcon == 'reload' && this.scrollTop != node.scrollHeight && this.isLoadMore !== true) {
      setTimeout(function(){
        this.scrollTop = node.scrollTop = node.scrollHeight;
      }.bind(this), 500);
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return this.state.loadIcon !== nextState.loadIcon || this.state.priviewImage != nextState.priviewImage
      || !is(this.state.friend, nextState.friend) || !is(this.state.messageList, nextState.messageList);
  }
  componentDidMount() {
    let node = ReactDOM.findDOMNode(this.refs.msgBody);
    if(!!node) this.scrollTop = node.scrollTop = node.scrollHeight;
  }
  render() {
    const {loadIcon, friend, messageList} = this.state;
    console.log('GroupMessageList => render', messageList.toJS(), friend.toJS())
    const friendHeadUrl = imgPaddedPrefix(friend.get('head_url')),
      featureTagLis = friend.get('feature_tagname_list') || [],
      sysTagList = friend.get('sys_tagname_list') || [];
    return (
      <div>
        <div className="group-message-head" onClick={this.jumpToFriendHome}>
          <img title="好友头像" src={friendHeadUrl} />
          <div className="nicknames">
            <h1>{friend.get('nick_name')}</h1>
            <div className="remark-name">
              <EditRemarkInfo operation_sn={friend.get('operation_sn')}
                friend_sn={friend.get('friend_sn')} remark={friend.get('remark')} onEditRemark={this.onEditRemark} />
            </div>
          </div>
          {
            <TagList feature_tagname_list={featureTagLis} sys_tagname_list={sysTagList} />
          }
        </div>
        {
          messageList.size == 0 ? null :
          <div className="group-message-body" id="wrapper" ref="msgBody">
            <ul>
              <li>
                <a href="javascript:void(0)" className="msg-load-more" onClick={this.onLoadMoreMessage}>
                  <Icon type={loadIcon} /> 加载更多
                </a>
              </li>
              {
                messageList.map(item => {
                  if(item.get('chat_from') == FROM_FRD) {
                    return <GroupMessageItem key={item.get('chat_sn')} messageObj={item}
                      head_url={friendHeadUrl} onShowImgModal={this.onShowImgModal} onPlayedAudio={this.onPlayedAudio} />
                  }
                  //运营号的消息，用默认的头像
                  return <GroupMessageItem key={item.get('chat_sn')} messageObj={item} onShowImgModal={this.onShowImgModal} />;
                })
              }
            </ul>
            <CommonModal ref="commonModal" title="" footer={[]} onCancel={this.handleCancel}>
              <img width="450" src={this.state.priviewImage}/>
            </CommonModal>
          </div>
        }
      </div>
    );
  }
}

const TagList = (props) => {
  return <div className="tags">
    {
      props.feature_tagname_list.map((name,index) => (
        <Tag color="blue" key={index}>{name}</Tag>
      ))
    }
    {
      (props.feature_tagname_list.size > 0 && props.sys_tagname_list.size > 0)  ? " | " : null
    }
    {
      props.sys_tagname_list.map((name,index) => (
        <Tag color="green" key={index}>{name}</Tag>
      ))
    }
  </div>
}
