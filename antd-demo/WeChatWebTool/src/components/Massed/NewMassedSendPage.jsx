import React from 'react';
import {Button} from 'antd';
import NewMassedSendForm from './NewMassedSendForm';
import NewMassedSendTable from './NewMassedSendTable';
import NewMessageList from './NewMessageList';
import NewSendMessageBox from './NewSendMessageBox';
import NewMassedConfirmModal from './NewMassedConfirmModal';
import {Errors} from '../Commons/CommonConstants';
/**
 * 新增群发
 */
export default class NewMassedSendPage extends React.Component {
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
    this.state={
      isReset: false,
    }
    this.handleSearch = this.handleSearch.bind(this);
    this.handleAddMessage = this.handleAddMessage.bind(this);
    this.handleClearMessage = this.handleClearMessage.bind(this);
    this.handleResetData = this.handleResetData.bind(this);
    this.handleSend = this.handleSend.bind(this);
  }
  handleSearch(params){
    this.params = params;
    this.refs.newMassedSendTable.search(params);
  }
  handleAddMessage(message){
    this.refs.newMessageList.addMessage(message);
  }
  handleClearMessage(){
    this.refs.newMessageList.clearMessage();
  }
  handleSend(bool){
    const totalCount = this.refs.newMassedSendTable.getTotalCount();
    if(totalCount == 0){
      Errors("表格数据为空，请选择条件查询");
      return;
    }
    const messageList = this.refs.newMessageList.getMessageList();
    if(messageList.length == 0){
      Errors("请添加要群发的消息");
      return;
    }
    this.refs.newMassedConfirmModal.show(bool, this.params, messageList, totalCount);
  }

  handleResetData(){
    this.setState({ isReset: true });
    delete this.params;
    this.refs.newMessageList.clearMessage();
    this.refs.newMassedSendTable.clearTableData();
    setTimeout(function(){
      this.setState({ isReset: false });
    }.bind(this), 10);
  }
  render(){
    return (
      <div className="new-massed-send">
        <NewMassedSendForm ref="newMassedSendForm" onSearch={this.handleSearch} isReset={this.state.isReset}/>
        <div className="new-massed-main">
          <div className="massed-send-content">
            <NewMessageList ref="newMessageList"/>
            <NewSendMessageBox onAddMessage={this.handleAddMessage} handleSend={this.handleSend}/>
          </div>
          <div className="new-massed-table">
            <NewMassedSendTable ref="newMassedSendTable"/>
          </div>
        </div>

        <NewMassedConfirmModal ref="newMassedConfirmModal" onReset={this.handleResetData}/>
      </div>
    );
  }
}
