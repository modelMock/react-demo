import React from 'react';
import {Icon,Tag} from 'antd';

class ClusterMyMessageItem extends React.Component {
  static contextTypes = {
    onUpdateMsgReply: React.PropTypes.any,
    addAtTipsDefaultMessage: React.PropTypes.any
  }
  constructor(props) {
    super(props);
  }
  render() {
    console.log('ClusterMyMessageItem => render');
    const {message} = this.props;
    const {chat_sn,cluster_member_nickname,chat_content,cluster_member_sn,chat_time,is_cluster_read} = message;
    return (
      <li key={chat_sn} className="cluster-message-item">
        <p>
          {cluster_member_nickname}
          <label>{chat_time}</label>&nbsp;&nbsp;
          {cluster_member_sn
            ? <a onClick={()=>{this.context.addAtTipsDefaultMessage(cluster_member_sn, cluster_member_nickname)}}>
                @{cluster_member_nickname}
              </a> : null
          }
          <Tag color={is_cluster_read === 'T' ? "#87d068" : "#108ee9"}
              onClick={()=>{this.context.onUpdateMsgReply(message)}}>
            {is_cluster_read === 'T' ? "已回复" : "未回复"}
          </Tag>
        </p>
        <a href="javascript:void(0)" className="message">{chat_content}</a>
      </li>
    );
  }
}
/**
 * @我的消息列表
 */
 export default class ClusterMyMessageList extends React.Component {
   constructor(props) {
     super(props);
     this.state = {
       loadIcon: 'reload',
       messageList: []
     }
     this.onLoadMore = this.onLoadMore.bind(this);
   }
   //初始化@我的消息
  initMessages(messageList){
    console.log('initMessages', messageList)
    this.setState({
      messageList
    });
  }
  updateReplyMode(chat_sn, is_cluster_read){
    let messageList = [].concat(this.state.messageList);
    for(let msg of messageList) {
      if(msg.chat_sn === chat_sn) {
        msg['is_cluster_read'] = is_cluster_read;
        break;
      }
    }
    this.setState({ messageList });
  }
  //添加新增@我消息
  addMessage(message) {
    let messageList = this.state.messageList.concat([]);
    messageList.push(message);
    this.setState({ messageList })
  }
  //加载更多
  onLoadMore() {
    this.setState({
      loadIcon: 'loading'
    })
    this.props.onLoadMyMessages();
  }
  //没有更多消息了
  noMoreMessage() {
    this.setState({
      loadIcon: 'reload'
    })
  }
  //加载更多消息回调
  loadMoreMessages(messageList) {
    if(messageList.length > 0) {
      this.setState({
        loadIcon: 'reload',
        messageList: messageList.concat(this.state.messageList)
      })
    } else {
      this.setState({
        loadIcon: 'reload'
      })
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextState.loadIcon !== this.state.loadIcon
      || nextState.messageList !== this.state.messageList;
  }
   render(){
     const {messageList, loadIcon} = this.state;
     console.log('ClusterMyMessageList => render', messageList);
     return (
       <ul className="cluster-at-items">
         <li>
           <a href="javascript:void(0)" className="load-more" onClick={this.onLoadMore}>
              <Icon type={loadIcon} /> 加载更多
           </a>
         </li>
         {
           messageList.map(message => (
             <ClusterMyMessageItem parent={this.props.parent} key={message.chat_sn} message={message} />
           ))
         }
       </ul>
     )
   }
 }
