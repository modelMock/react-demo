import React from 'react';
import NewMessageList from './NewMessageList';
import NewSendMessageBox from './NewSendMessageBox';
/**
 * 新增群发main区域
 */
export default class MassedMessageContent extends React.Component{
  static childContextTypes = {
    clearMessage: React.PropTypes.any,
  }
  getChildContext() {
    return {
      clearMessage: this.handleClearMessage.bind(this),
    }
  }
  constructor(props){
    super(props);
    this.handleAddMessage = this.handleAddMessage.bind(this);
  }
  //添加本地新消息
  handleAddMessage(message){
    this.refs.newMessageList.addMessage(message);
  }
  //清空本地搜索消息
  handleClearMessage(){
    this.refs.newMessageList.clearMessage();
  }
  render(){
    return (
      <div className="massed-send-content">
        <NewMessageList ref="newMessageList"/>
        <NewSendMessageBox onAddMessage={this.handleAddMessage}/>
      </div>
    )
  }
}
