import React, {Component, PropTypes} from 'react';
import {Avatar, Button, Icon} from 'antd';
import classNames from 'classnames';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {
  imgPaddedPrefix, TXT, MONEY_MSG, RED_PACKET, IMG_DATA, AUDIO, IMG_LINK, TIME, FROM_FRD, FROM_OPT, renderFormatHTML,
  RECALL_MSG,
} from './Utils'
import {format} from 'date-fns';
import messageUtil from './MessageUtil';
import { Confirm } from '../Commons/CommonConstants';
import CommonModal from '../Commons/CommonModal';
import './MessageList.less'

import {LoadMoreTip} from './TipTools'
import ChatService from "../../services/ChatService";

class MessageItem extends Component{
  static proptypes = {
    head_url: PropTypes.string,
  }
  static defaultProps = {
    head_url: require('../../../assets/images/app/head.png')
  }
  constructor (props){
    super(props)
    this.state = {
      imgStatus: this.props.is_pic_save_20 === 'F' ? 'unsaved' : 'saved'
    }
    this.handlePlay = this.handlePlay.bind(this)
    this.doConfirm = this.doConfirm.bind(this)
    this.handleSaveImgTwentyDays = this.handleSaveImgTwentyDays.bind(this)
  }
  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }
  handleSaveImgTwentyDays(){
    const {is_pic_save_20, operation_sn, friend_sn, message_id, chat_time_long} = this.props
    if(is_pic_save_20 === "T") return false
    this.setState({
      imgStatus: 'loading'
    })
    ChatService.saveImageTwentyDays(operation_sn, friend_sn, message_id, chat_time_long).then(() => {
      this.setState({
        imgStatus: 'saved'
      })
    })
  }
  onImgClick(e, imgUrl) {
    e.preventDefault();
    if(imgUrl) {
      this.props.onShowImgModal(imgUrl);
    }
  }
  handlePlay() {
    if( !('is_play' in this.props) || this.props['is_play'] !== 'T' ) {
      this.props.onPlayedAudio(this.props.chat_sn);
    }
  }
  doConfirm(type){
    let title
    if(type === 'doConfirm'){
      title = '确认收钱吗？'
    }else if(type === 'doRefuse') {
      title = '确认退回转账吗？'
    }else if(type === 'openRed'){
      title = '确认打开红包吗？'
    }
    Confirm(() => {
      if (type === 'doConfirm') {
        this.props.onUpdateTransferStatus(this.props.chat_sn)
      } else if(type === 'doRefuse') {
        this.props.onUpdateRefuseTransferStatus(this.props.chat_sn)
      }else if(type === 'openRed') {
        this.props.onOpenRed(this.props.chat_sn)
      }
    }, title)
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
  renderMonyButton(){
    const {transfer_confirm, transfer_refuse, transfer_status, is_cluster_read, chat_sn, chat_type} = this.props
    const isRead = is_cluster_read === "F"
    const isTransfer = transfer_confirm === 'T'
    const isRefuse = transfer_refuse === 'T'
    if(chat_type !== MONEY_MSG) {
      let allButtons = [<Button key="read" type={isRead ? 'primary' : 'ghost'} onClick={() => this.props.onUpdateReadStatus(chat_sn)}>{isRead ? '未回复' : '已回复'}</Button>]
      if(chat_type === RED_PACKET && isTransfer) {
       allButtons.push(<Button key="red"  type="primary" onClick={()=>this.doConfirm('openRed')}>打开红包</Button>)
      }
      return allButtons
    }
    let buttonArr =[]
    if(transfer_status === '1'){
       buttonArr.push(<Button type="ghost" >已经确认收钱</Button>)
    }else if(transfer_status === '2'){
      buttonArr.push(<Button type="ghost" >已经退回转账</Button>)
    }else{
      isTransfer && buttonArr.push(<Button type="primary" onClick={()=>this.doConfirm('doConfirm')} key={1}>确认收钱</Button>)
      isRefuse && buttonArr.push(<Button type="primary" onClick={()=>this.doConfirm('doRefuse')} key={2}>退回转账</Button>)
    }
    return buttonArr
  }
  renderBody(){
    const imgStatus = this.state.imgStatus
    const {chat_sn,  withdraw_flag, chat_content, rawHtml = false, transfer_refuse, chat_type, chat_from, is_cluster_read, transfer_confirm, is_pic_save_20} = this.props;
    let content
    if(rawHtml === true){
      // 本地发送的文本消息
      content = this.renderLocalSendContent(chat_content);
    }else{
      //按微信好友发送的信息类型分类
      switch (chat_type) {
        case TXT:
        case MONEY_MSG:
        //红包信息
        case RED_PACKET:
          // 文本消息(微信发过来的换行符\n替换为<br>)
          let msg =chat_content && chat_content.replace(/\n/g, "<br>");
          content = renderFormatHTML(msg);
          break;

        case IMG_DATA:   // 图片消息
        case IMG_LINK:
          content = (chat_from === FROM_OPT) ? this.renderLocalImage(chat_content) : this.renderImage(chat_content, chat_from);
          break;
        case AUDIO:
          content= this.renderAudio(chat_content);
          break;
        default:
      }
    }
    //chat_from='0'为运营号消息，显示在左边; 1：好友消息，显示在右边
    const isRight = this.props.chat_from !== FROM_FRD
    //转账消息和文本消息都有按钮提示
    const isText = !isRight && (chat_type === TXT || chat_type === MONEY_MSG || chat_type === RED_PACKET || chat_type === RECALL_MSG)
    const msgItemCss = classNames("message-item", { "right": isRight});
    const msgOptBtnsCls = classNames("opt-btns", { "right": isRight});
    const caretLeftCls = classNames("caret-left", { "txt": isText});
    const isTransfer = transfer_confirm === 'T'
    const contentStyle = isTransfer ? {color: 'red'} : {}
    const imgDownloadIconType = imgStatus === 'unsaved' ? "cloud-download" : imgStatus == 'saved' ?  "cloud" : 'loading'
    const imgDownloadTitle = imgStatus === "unsaved" ? "存图20天" : "已存"
    // withdraw_flag 为T 表示已经撤回成功 需要提示  其他不提示
    const isRecall = withdraw_flag === 'T'
    const recallText = isText && isRecall ? <span style={{color:'red'}}>已撤回</span> : null
    //不显示红包打开按钮的时候需要给一个提示
    const redTips  = (chat_type === RED_PACKET && !isTransfer)?<span style={{color:'red'}}>(红包)</span> : null
    const iconSave20 = chat_type === IMG_DATA && !isRight ? <Icon className="message-img-save" onClick={this.handleSaveImgTwentyDays} type={imgDownloadIconType} title={imgDownloadTitle} /> : null
    return (
      <li className={msgItemCss}>
        {isText && <div className={msgOptBtnsCls}>
          {this.renderMonyButton()}
          <Button type="primary" ghost onClick={() => window.prompt("复制到剪贴板: Ctrl+C, 回车", chat_content)}>复制</Button>
        </div>}
        <Avatar className="photo" shape="square" icon="user" size="large" src={this.props.head_url}/>
        <a href="javascript:void(0)" className="message" style={contentStyle}>{content}{iconSave20}{recallText}{redTips}</a>
        <i className={caretLeftCls} />
      </li>
    )
  }
  renderTimeMsg(content) {
    return <li className="msg-time-split"><b>{content}</b></li>
  }
  render() {
    const {chat_content, chat_type} = this.props;
    return chat_type !== TIME ? this.renderBody() : this.renderTimeMsg(chat_content);
  }
}

class MessageList extends Component {
  constructor(props){
    super(props)
    this.state = {
      messages: [],
      priviewImage: '',
    }
    this.handleCancel = this.handleCancel.bind(this);
    this.onShowImgModal = this.onShowImgModal.bind(this);
    this.onPlayedAudio = this.onPlayedAudio.bind(this);
    this.doLoadMore = this.doLoadMore.bind(this)
    this.doUpdateReadStatus = this.doUpdateReadStatus.bind(this)
    this.doUpdateTransferStatus = this.doUpdateTransferStatus.bind(this)
    this.doUpdateRefuseTransferStatus = this.doUpdateRefuseTransferStatus.bind(this)
    this.handleOpenRed = this.handleOpenRed.bind(this)
  }
  //播放语音，告知服务器已播放，更新is_play标识，后续再点击播放不发送指令
  onPlayedAudio(chatSn) {
    const messages = this.state.messages.concat([])
    const message = messages.find(msg => msg['chat_sn'] === chatSn)
    message['is_play'] = 'T';
    this.props.onPlayedAudio(message);
    this.setState({ messages });
  }
  //本地消息：运营号自己发的消息(rawHtml:true针对本地消息，后台消息设置为false)
  //chat_from="1"运营号所发消息； chat_from="0"微信好友所发消息
  //添加本地消息（显示在左边的）
  addLocalMessageHtml(chat_content, chat_type=TXT){
    let msgObj, chat_time = format(new Date(), 'YYYY-MM-D HH:mm:ss');
    switch (chat_type) {
      case TXT:
        //一串空格，空格替换为空格占位符
        if(chat_content.trim().length == 0) {
          chat_content = chat_content.replace(/ /g, '&nbsp;');
        }
        msgObj = {chat_from: FROM_OPT, rawHtml: true, chat_type, chat_content, chat_time};
        break;
      case IMG_DATA:
      case IMG_LINK:
        msgObj = {chat_from: FROM_OPT, chat_type, chat_content, chat_time};
        break;
      default:
    }
    this.appendMessage(msgObj);
  }
  //切换好友：清空消息，显示新消息
  changeFriendMessages(messageList, hasMore) {
    let messages = [];
    if(messageList.length > 0) {
      messages = messageUtil.processAllMessageList(messageList);
    }
    // messages[messages.length - 1]['transfer_confirm'] = 'T'
    this.hasMore = hasMore;
    this.setState({ messages }, () => {
      hasMore && this.loadMoreRef.loadMoreFinish()
    })
  }
  //同一个好友，加载更多消息：添加到最前面
  //加载更多消息显示在最前面messages
  addFrontMessages(messageList, hasMore){
    this.hasMore = hasMore;
    if(messageList.length == 0) return;
    const messages = messageUtil.processAddFrontMessageList(this.state.messages.concat([]), messageList);
    this.setState({ messages }, () => {
      hasMore && this.loadMoreRef.loadMoreFinish()
    });
  }
  //后台消息，正在聊天的好友，有新消息过来
  appendMessage(message) {
    const messages = messageUtil.processAppendSignMsg(this.state.messages.concat([]), message);
    this.setState({ messages });
  }
  clearMessages(){
    this.hasMore = false
    this.setState({ messages: [] })
  }
  //加载更多后，回调更变加载图标 和 滚动到最上面
  loadMoreFinish() {
    let node = this.msgBodyRef;
    this.scrollTop = node.scrollTop = 0;
  }
  onShowImgModal(imgUrl) {
    this.setState({
      priviewImage: imgUrl,
    });
    this.commonModalRef.show();
  }
  handleCancel() {
    this.commonModalRef.hide();
  }
  doLoadMore(){
    this.isLoadMore = true
    this.props.onLoadMoreMsg()
  }
  doUpdateReadStatus(chatSn){
    const messages = Array.from(this.state.messages)
    const message = messages.find(msg => msg['chat_sn'] === chatSn)
    const isRead = message['is_cluster_read'] === 'T' ? 'F' : 'T'
    message['is_cluster_read'] = isRead
    ChatService.updateReadFriendChat(message['operation_sn'], message['friend_sn'], message['message_id'],
      message['chat_time_long'], isRead).then(({jsonResult}) => {
      this.setState({ messages })
    })
  }
  // 确认转账
  doUpdateTransferStatus(chatSn){
    const messages = Array.from(this.state.messages)
    const message = messages.find(msg => msg['chat_sn'] === chatSn)
    ChatService.confirmTransfer(message['operation_sn'], message['friend_sn'], message['message_id'],
      message['chat_time_long'], message['transactionId']).then(({jsonResult}) => {
      message['transfer_status'] = '1'
      this.setState({ messages })
    })
  }
  //退还转账
  doUpdateRefuseTransferStatus(chatSn){
    const messages = Array.from(this.state.messages)
    const message = messages.find(msg => msg['chat_sn'] === chatSn)
    ChatService.refuseTransfer(message['operation_sn'], message['friend_sn'], message['message_id'],
      message['chat_time_long'], message['transactionId']).then(({jsonResult}) => {
      message['transfer_status'] = '2'
      this.setState({ messages })
    })
    message['transfer_status'] = '2'
    this.setState({ messages })
  }
  //打开红包
  handleOpenRed(chatSn){
    const messages = Array.from(this.state.messages)
    const message = messages.find(msg => msg['chat_sn'] === chatSn)
    ChatService.openRedPacket(message['operation_sn'], message['friend_sn'], message['message_id'], message['chat_time_long'], message['redenvelope_id'],message['chat_content'])
      .then(({jsonResult})=>{
        message['transfer_confirm'] = 'F'
        message['chat_content'] = jsonResult
        this.setState({messages})
      })
  }
  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }
  componentDidUpdate(){
    const node = this.msgBodyRef;
    if(this.isLoadMore){
      setTimeout(() => node.scrollTop = 0)
      this.isLoadMore = false
    } else {
      setTimeout(() => node.scrollTop = node.scrollHeight)
    }
  }
  render (){
    const { messages } = this.state;
    const headUrl = this.props.headUrl
    return (
      <div id="wrapper" ref={obj=>this.msgBodyRef=obj} className="message-body">
        <ul>
          {this.hasMore && <li><LoadMoreTip ref={obj=>this.loadMoreRef=obj} onLoadMore={this.doLoadMore} /></li>}
          {messages.map(item => {
            if(item['chat_from'] == FROM_FRD) {
              return <MessageItem key={item['chat_sn']}
                                  {...item}
                                  head_url={headUrl}
                                  onShowImgModal={this.onShowImgModal}
                                  onPlayedAudio={this.onPlayedAudio}
                                  onUpdateReadStatus={this.doUpdateReadStatus}
                                  onUpdateTransferStatus={this.doUpdateTransferStatus}
                                  onUpdateRefuseTransferStatus={this.doUpdateRefuseTransferStatus}
                                  onOpenRed={this.handleOpenRed}/>
            }
            //运营号的消息，用默认的头像
            return <MessageItem key={item['chat_sn']}
                                {...item}
                                onShowImgModal={this.onShowImgModal} />;
          })}
        </ul>
        <CommonModal ref={obj=>this.commonModalRef=obj} title="" footer={[]} onCancel={this.handleCancel}>
          <img width="450" src={this.state.priviewImage}/>
        </CommonModal>
      </div>
    )
  }
}

export default MessageList;
