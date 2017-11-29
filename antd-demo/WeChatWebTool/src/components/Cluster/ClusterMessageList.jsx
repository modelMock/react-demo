import React from 'react';
import ReactDOM from 'react-dom';
import {Icon, Tag, Modal, Button} from 'antd';
import classNames from 'classnames';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {hashHistory} from 'react-router';
import {format} from 'date-fns';
import messageUtil from '../Chat/MessageUtil';
import {Errors} from '../Commons/CommonConstants';
import CommonModal from '../Commons/CommonModal';
import service from '../../services/clusterChat';
import {
  imgPaddedPrefix, LINK, TXT, IMG_DATA, AUDIO, C_NOTICE, IMG_LINK,
  TIME, FROM_FRD, FROM_OPT, CMD_PLAY_AUDIO, renderFormatHTML
} from '../Chat/Utils';
import ClusterHomeInfo from './ClusterHomeInfo';
import ClusterMemberHomeInfo from './ClusterMemberHomeInfo';

/**
 * 群消息列表
 */
class ClusterMessageItem extends React.Component {
  static contextTypes = {
    onUpdateMsgReply: React.PropTypes.any,
    addAtTipsDefaultMessage: React.PropTypes.any,
    onCopyMessage: React.PropTypes.any,
  }

  constructor(props) {
    super(props);
    this.jumpToClusterHome = this.jumpToClusterHome.bind(this);
    this.showBigImg = this.showBigImg.bind(this);
  }

  jumpToClusterHome() {
    const {chat_from, chat_type, cluster_sn, cluster_member_sn, cluster_member_nickname, chat_time} = this.props.messageItem;
    if(chat_from === FROM_FRD && chat_type !== C_NOTICE){
      this.props.onShowClusterMemberInfo({
        cluster_sn: cluster_sn,
        member_sn: cluster_member_sn,
        member_nickname: cluster_member_nickname,
        chat_time: chat_time
      })
    }
  }

  showBigImg(e) {
    const {chat_sn, cluster_sn, cluster_member_sn, chat_time_long, chat_content_md5} = this.props.messageItem;
    service.getClusterChatBigPic(cluster_sn, cluster_member_sn, chat_time_long, chat_content_md5).then(({jsonResult}) => {
      if(!jsonResult) return;
      window.open(jsonResult);
    })
  }

  onImgClick(e, imgUrl) {
    e.preventDefault();
    if(imgUrl){
      this.props.onShowImgModal(imgUrl);
    }
  }

  renderAudio(chat_message) {
    return <audio className="msg-audio" src={chat_message} preload="auto" controls/>
  }

  //微信好友发送的图片消息
  renderImage(chat_content, chat_from) {
    return <img className="msg-image" src={imgPaddedPrefix(chat_content)}
                onClick={(e) => {
                  this.onImgClick(e, chat_content)
                }}/>
  }

  //本地运营号发送的本地图片消息
  renderLocalImage(chat_content) {
    return <img className="msg-image" src={chat_content} onClick={(e) => {
      this.onImgClick(e, chat_content)
    }}/>
  }

  //本地运营号发送的文本消息(包含表情)
  renderLocalSendContent(chat_content) {
    return <p dangerouslySetInnerHTML={{__html: chat_content}}></p>
  }

  renderBody() {
    const {messageItem} = this.props;
    const {
      chat_content, rawHtml = false, chat_type, chat_from,
      cluster_member_nickname = "客服", cluster_member_sn, is_cluster_read
    } = messageItem;
    let content, nickname = cluster_member_nickname;
    if(rawHtml === true){
      // 本地发送的文本消息
      content = this.renderLocalSendContent(chat_content);
    }else{
      // 文本消息(微信发过来的换行符\n替换为<br>)
      if(chat_type == TXT || chat_type == C_NOTICE){
        content = renderFormatHTML(chat_content.replace(/\n/g, "<br/>"));
      }
      //按微信好友发送的信息类型分类
      switch (chat_type) {
        case TXT:
          break;
        case IMG_DATA:   // 图片消息
        case IMG_LINK:
          content = (chat_from === FROM_OPT) ? this.renderLocalImage(chat_content) : this.renderImage(chat_content, chat_from);
          break;
        case AUDIO:
          content = this.renderAudio(chat_content);
          break;
        case C_NOTICE:
          nickname = "系统消息";
      }
    }
    const msgItemCss = classNames("cluster-message-item", {"arrow-right": chat_from !== FROM_FRD});
    return (
      <li className={msgItemCss}>
        <p className="msg-item">
          <span onClick={this.jumpToClusterHome}>{nickname}</span>
          {
            cluster_member_sn
              ? <label onClick={() => {
                this.context.addAtTipsDefaultMessage(cluster_member_sn, nickname)
              }}> @提醒 </label>
              : null
          }
          {
            chat_from == FROM_FRD && chat_type != C_NOTICE
              ? <Tag color={is_cluster_read === 'T' ? "#87d068" : "#108ee9"}
                     onClick={() => {
                       this.context.onUpdateMsgReply(messageItem)
                     }}>
                {is_cluster_read === 'T' ? "已回复" : "未回复"}
              </Tag> : null
          }
          {
            chat_from == FROM_FRD && chat_type == IMG_DATA
              ? <Tag color="#f50" onClick={this.showBigImg}>大图</Tag> : null
          }
          {
            chat_type == TXT
              ? <Tag color="#2db7f5" onClick={(e) => {
                this.context.onCopyMessage(chat_content)
              }}>复制</Tag> : null
          }
        </p>
        <a href="javascript:void(0)" className="message">{content}</a>
      </li>
    );
  }

  renderTimeMsg(chat_content) {
    return (
      <li className="cluster-message-item">
        <p className="msg-time-split">
          <b>{chat_content}</b>
        </p>
      </li>
    );
  }

  render() {
    const {chat_content, chat_type} = this.props.messageItem;
    return chat_type !== TIME ? this.renderBody() : this.renderTimeMsg(chat_content);
  }
}

export default class ClusterMessageList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadIcon: 'reload',
      messageList: [],
      priviewImage: '',
      chVisible: false,
      chParams: null,
      cmVisible: false,
      cmParams: null,
    }
    this.handleCancel = this.handleCancel.bind(this);
    this.onShowImgModal = this.onShowImgModal.bind(this);
    this.onLoadMessage = this.onLoadMessage.bind(this);
    this.updateReplyMode = this.updateReplyMode.bind(this);
    this.showClusterMemberInfo = this.showClusterMemberInfo.bind(this);
    this.onCancelMember = this.onCancelMember.bind(this);
  }

  //初始化消息列表
  initMessages(messageList) {
    this.setState({
      messageList: messageUtil.processAllMessageList(messageList)
    });
  }

  //后台消息，正在聊天的好友，有新消息过来
  addServerMessage(message) {
    this.isLoadMore = false;
    this.setState({
      messageList: messageUtil.processAppendSignMsg(this.state.messageList.concat([]), message)
    });
  }

  //前台消息：手动输入的消息
  addLocalMessageHtml(chat_content, chat_type = TXT) {
    let msgObj, chat_time = format(new Date(), 'YYYY-MM-D HH:mm:ss');
    if(chat_type === TXT){
      //一串空格，空格替换为空格占位符
      if(chat_content.trim().length === 0){
        chat_content = chat_content.replace(/ /g, '&nbsp;');
      }
      msgObj = {chat_from: FROM_OPT, rawHtml: true, chat_type, chat_content, chat_time};
    }else if(chat_type === IMG_DATA){
      msgObj = {chat_from: FROM_OPT, chat_type, chat_content, chat_time};
    }
    this.addServerMessage(msgObj);
  }

  onLoadMessage() {
    this.setState({loadIcon: 'loading'})
    this.props.onLoadMessages();
  }

  noMoreMessage() {
    this.setState({
      loadIcon: 'reload'
    });
  }

  //加载更多，添加消息
  loadMoreMessages(messageList) {
    this.isLoadMore = true;
    this.setState({
      loadIcon: 'reload',
      messageList: messageUtil.processAddFrontMessageList(this.state.messageList.concat([]), messageList)
    });
  }

  onShowImgModal(imgUrl) {
    this.setState({priviewImage: imgUrl});
    this.refs.commonModal.show();
  }

  handleCancel() {
    this.refs.commonModal.hide();
  }

  // 修改某条消息回复模式
  updateReplyMode(chat_sn, is_cluster_read) {
    let messageList = [].concat(this.state.messageList);
    for (let msg of messageList) {
      if(msg.chat_sn === chat_sn){
        msg['is_cluster_read'] = is_cluster_read;
        break;
      }
    }
    this.setState({messageList});
  }

  componentWillUpdate() {
    let node = ReactDOM.findDOMNode(this.refs.msgBody);
    if(this.scrollTop != node.scrollHeight){
      this.scrollTop = node.scrollHeight;
    }
  }

  componentDidUpdate() {
    let node = ReactDOM.findDOMNode(this.refs.msgBody);
    //不是正在加载翻页状态
    if(this.state.loadIcon === 'reload' && this.scrollTop != node.scrollHeight && this.isLoadMore !== true){
      setTimeout(function () {
        this.scrollTop = node.scrollTop = node.scrollHeight;
      }.bind(this), 100);
    }
  }

  showClusterMemberInfo(cmParams) {
    this.setState({cmVisible: true, cmParams});
  }

  onCancelMember() {
    this.setState({cmVisible: false, cmParams: null});
  }

  render() {
    const {messageList, priviewImage, loadIcon, cmVisible, cmParams} = this.state;
    return (
      <div ref="msgBody" className="cluster-message-body">
        <ul>
          <li>
            <a href="javascript:void(0)" className="load-more" onClick={this.onLoadMessage}>
              <Icon type={loadIcon}/> 加载更多
            </a>
          </li>
          {
            messageList.map(messageItem => (
              <ClusterMessageItem key={messageItem.chat_sn} messageItem={messageItem}
                                  onShowImgModal={this.onShowImgModal} onPlayedAudio={this.onPlayedAudio}
                                  onShowClusterMemberInfo={this.showClusterMemberInfo}/>
            ))
          }
        </ul>
        <CommonModal ref="commonModal" title="" footer={[]} onCancel={this.handleCancel}>
          <img width="450" src={priviewImage}/>
        </CommonModal>
        {
          cmVisible && (
            <Modal visible={cmVisible} title="群成员主页" onCancel={this.onCancelMember}
                   footer={[<Button icon="cross" size="large" onClick={this.onCancelMember}>关闭</Button>]}>
              <ClusterMemberHomeInfo params={cmParams}/>
            </Modal>
          )
        }

      </div>
    )
  }
}
