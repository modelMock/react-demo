import React from 'react';
import {Button,Popover,Upload,Popconfirm,Dropdown,Menu,Modal} from 'antd';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import {is,List} from 'immutable';
import FaceCollection from '../Chat/FaceCollection';
import rangeUtil from '../Chat/RangeUtil';
import {TXT, IMG_DATA, CMD_SEND} from '../Chat/Utils'
import {Errors} from '../Commons/CommonConstants';
import socketManage from '../Socket/SocketManage';
import EditUserTags from './EditUserTags';
import EditUserGroup from './EditUserGroup';
import EditUserScreen from './EditUserScreen';
import SearchHistoryChat from './SearchHistoryChat';
import groupChatService from '../../services/groupChatService';
import {uploadImg,multReplyFriendByHand} from '../../services/chat';
/**
 * 单聊多窗口
 */

// 单聊多窗口 工具条
class ToolBar extends React.Component{
  static contextTypes = {
    getCommonLanguageList: React.PropTypes.any,
  }
  constructor (props){
    super(props);
    this.state={
       is_shielded: false, //是否屏蔽
       group_id: props.userInfo.group_id > 0 ? props.userInfo.group_id.toString() : undefined,
       tag_id_list: props.userInfo.tag_id_list ?
                      props.userInfo.tag_id_list.substr(1, props.userInfo.tag_id_list.length): undefined,
       commonLanguageMenu: null,
       sendBtnDisabled: false
    }
    this.handleUpload = this.handleUpload.bind(this);
    this.handleFaceViewVisibleChange = this.handleFaceViewVisibleChange.bind(this);
    this.onShielded = this.onShielded.bind(this);
    this.cancelUserScreening = this.cancelUserScreening.bind(this);
    this.handleMenuClick = this.handleMenuClick.bind(this);
    this.onOpenSearchChatHistoryModal = this.onOpenSearchChatHistoryModal.bind(this);
    this.handleSend = this.handleSend.bind(this);
  }
  handleSend(){
    this.setState({ sendBtnDisabled: true })
    this.props.onSendMessage()
  }
  setSendBtnDisabled(){
    if(!this.state.sendBtnDisabled){
      this.setState({
        sendBtnDisabled: true
      });
    }
  }
  endabledSendBtn(){
    if(this.state.sendBtnDisabled){
      this.setState({
        sendBtnDisabled: false
      })
    }
  }
  getSendBtnStatus(){
    return this.state.sendBtnDisabled;
  }
  onEditGroupId(group_id) {
    if(group_id !== this.state.group_id) {
      this.setState({ group_id });
    }
  }
  onEditSystemTagIds(tag_id_list) {
    if(tag_id_list !== this.state.tag_id_list) {
      this.setState({ tag_id_list });
    }
  }
  onShielded(is_shielded) {
    if(this.state.is_shielded !== is_shielded) {
      this.setState({ is_shielded });
    }
  }
  cancelUserScreening() {
    groupChatService.cancelUserScreening(this.props.userInfo.operation_sn, this.props.userInfo.friend_sn)
      .then(({jsonResult}) => {
        const modal = Modal.success({
          title: '成功提示',
          content: '取消屏蔽成功'
        });
        setTimeout(() => modal.destroy(), 1000);
        this.onShielded(false);
    });
  }
  handleFaceViewVisibleChange(display){
    if(display === true){
      // 保存当前的光标信息
      rangeUtil.saveCurrentSelection();
    }
  }
  handleUpload(file) {
    if(file.type !== 'image/jpeg' && file.type !== 'image/png') {
      Errors('只能上传 JPG或PNG 文件哦！');
      return false;
    }
    if(file.size > 10*1024*1024*1024) {
      Errors('只能上传 小于10M 的文件哦！');
      return false;
    }
    let reader = new FileReader();
    reader.onload = function(e) {
      this.props.onSendMessage(IMG_DATA, e.currentTarget.result);
    }.bind(this);
    reader.readAsDataURL(file);
    return false;
  }
  handleMenuClick(e) {
    this.props.onSendMessage(TXT, e.key);
  }
  onOpenSearchChatHistoryModal(){
    this.refs.searchHistoryChat.show();
  }
  componentDidMount(){
    const commonLanguageList = this.context.getCommonLanguageList();
    if(commonLanguageList.length > 0) {
      const commonLanguageMenu = <Menu onClick={this.handleMenuClick}>
        {
          this.context.getCommonLanguageList().map((content,idx) => (
            <Menu.Item key={content}>{content}</Menu.Item>
          ))
        }
      </Menu>
      this.setState({ commonLanguageMenu })
    }
  }
  render(){
    console.log('ToolBar => render', this.props.userInfo, this.state);
    const {operation_sn, friend_sn, head_url, nick_name} = this.props.userInfo;
    const {is_shielded, group_id, tag_id_list, commonLanguageMenu} = this.state;

    return (
      <div className="toolbar">
        {
          !commonLanguageMenu ? null :
            <Dropdown overlay={commonLanguageMenu} trigger={['click']}>
              <Button type="primary" icon="message" style={{float: 'right', marginRight: 8}} />
            </Dropdown>
        }
        <Button type="primary" icon="enter" style={{float: 'right'}} disabled={this.state.sendBtnDisabled} onClick={this.handleSend}>发送</Button>
        <Popover placement="topLeft" trigger="click" onVisibleChange={this.handleFaceViewVisibleChange}
          content={ <FaceCollection onFaceClick={this.props.onFaceClick} />} >
            <Button type="ghost" icon="smile-circle"/>
        </Popover>
        <Upload action="/temp" beforeUpload={this.handleUpload}>
          <Button type="ghost" icon="picture" />
        </Upload>
        <EditUserTags operation_sn={operation_sn} friend_sn={friend_sn} tag_id_list={tag_id_list} />
        <EditUserGroup operation_sn={operation_sn} friend_sn={friend_sn} group_id={group_id} />
        <Button type="ghost" icon="search" title="查找历史聊天记录" onClick={this.onOpenSearchChatHistoryModal} />

        {is_shielded === false
          ? <EditUserScreen operation_sn={operation_sn} friend_sn={friend_sn}
              onShielded={this.onShielded} />
          : <Popconfirm title="确定取消屏蔽吗?" onConfirm={this.cancelUserScreening}>
              <Button type="ghost" icon="close-circle-o" title="取消屏蔽" />
            </Popconfirm>
        }
        <SearchHistoryChat ref="searchHistoryChat" operation_sn={operation_sn} friend_sn={friend_sn}
          head_url={head_url} nick_name={nick_name} />
      </div>
    );
  }
}

const blankGif = require('../../../assets/images/app/blank.gif')

class GroupSendMessageBox extends React.Component {
  static contextTypes = {
    sendCommandMessage: React.PropTypes.any,
  }
  constructor(props){
    super(props);
    this.handleFaceClick = this.handleFaceClick.bind(this);
    this.handleSendMessage = this.handleSendMessage.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }
  clearEditContent(){
    ReactDOM.findDOMNode(this.refs.editArea).innerHTML = "";
    this.__groupToolBarRef.endabledSendBtn()
  }
  onEditGroupId(group_id) {
    this.__groupToolBarRef.onEditGroupId(group_id);
  }
  onEditSystemTagIds(tag_id_list) {
    this.__groupToolBarRef.onEditSystemTagIds(tag_id_list);
  }
  // 获取消息内容模板，格式化之后的消息内容
  getFormatMessageContent(){
    // debugger;
    let pre = ReactDOM.findDOMNode(this.refs.editArea);
    // 提取内容
    let nodes = pre.childNodes;
    let msgFormat = "";
    for (let i = 0; i < nodes.length; i++){
      let node = nodes[i], name = node.nodeName;
      if("IMG" === name){
        msgFormat += "[" + node.getAttribute("alt") + "]";
      }else if("#text" === name){
        msgFormat += node.nodeValue;
      }else if("BR" === name) {
        msgFormat += node.outerHTML;
      }
    }
    return msgFormat;
  }
  handleSendMessage(chatType=TXT, content) {
    if(socketManage.getIsGone() === true) {
      chatType === TXT ? this.sendTxtMessage(content) : this.sendImgMessage(content);
    } else {
      Errors('请点击打开"在岗"开关');
    }
  }
  sendTxtMessage(chat_content) {
    let msgHTML, pre = ReactDOM.findDOMNode(this.refs.editArea);
    if(!chat_content) {
      msgHTML = pre.innerHTML;
      if(!msgHTML) return;
      chat_content = this.getFormatMessageContent();
      pre.innerHTML = "";
    }
    if(chat_content.endsWith("<br>")) {
      //用户输入ctrl+enter换行后，又backspace去掉回车，但是浏览器会在最后面遗留一个<br>
      chat_content = chat_content.substr(0, chat_content.length - 4);
    }
    //标签替换
    chat_content = chat_content.replace(/_qq/g, "").replace(/_emoji/g, "").replace(/<br>/g, "\n");
    const {operation_sn,friend_sn}=this.props.userInfo;
    // 用户自己发送消息，超时1分钟给提示信息
    this.groupTimer = setTimeout(() =>{
      Errors("请求错误,超时");
      this.__groupToolBarRef && this.__groupToolBarRef.endabledSendBtn();
    }, 1000*60);
    // UI界面手工回复一条聊天消息   单聊回复
    multReplyFriendByHand({chat_type:TXT, operation_sn, friend_sn, chat_content}).then(({jsonResult}) => {
      clearTimeout(this.groupTimer);
      //添加到聊天框中
      this.props.onAddLocalMessage(operation_sn, friend_sn, msgHTML || chat_content)
      pre.focus();
      this.clearEditContent();
    }).catch((err) => {
      clearTimeout(this.groupTimer);
      Errors(err);
      this.__groupToolBarRef && this.__groupToolBarRef.endabledSendBtn();
      });
  }
  sendImgMessage(img64Data) {
    if(!img64Data) return;
    uploadImg(img64Data).then(({jsonResult}) => {
      console.log('上传图片服务器已经返回图片URL：', jsonResult);
      if(!!jsonResult) {
        const {operation_sn,friend_sn}=this.props.userInfo;
        // UI界面手工回复一条聊天消息   单聊回复
        multReplyFriendByHand({chat_type: IMG_DATA, operation_sn, friend_sn, chat_content: jsonResult}).then(({jsonResult}) => {
          //添加到聊天框中
          this.props.onAddLocalMessage(operation_sn, friend_sn, img64Data, IMG_DATA);
          ReactDOM.findDOMNode(this.refs.editArea).focus();
        }).catch((err) => {
          setTimeout(()=>this.__groupToolBarRef.enabledSendbtn(), 2000);
        });
      }
    });
  }
  handleKeyDown(e){
    // 回车
    if(e.keyCode == 13){
      if(e.ctrlKey){
        // 换行
        document.execCommand("insertHTML", false, "<br><br>");
        return;
      }
      // 立即发送
      e.preventDefault();
      if(!this.__groupToolBarRef.getSendBtnStatus()){
        this.__groupToolBarRef.setSendBtnDisabled();
        this.handleSendMessage();
      }
    } else if(e.keyCode == 86 && e.ctrlKey) {
      //粘贴
      setTimeout(function(){
        let pre = ReactDOM.findDOMNode(this.refs.editArea);
        pre.innerHTML = pre.innerText;
      }.bind(this), 10);
    }
  }
  handleFaceClick(item){
    this.clearPlaceHolder();
    let faceClass, editDom = ReactDOM.findDOMNode(this.refs.editArea);
    if("qq" === item["type"]){
      faceClass = classNames("qqemoji", item["class"])
    }else{
      faceClass = classNames("emoji", item["class"])
    }
    let ele = document.createElement("img")
    ele.setAttribute("class", faceClass)
    ele.setAttribute("src", blankGif)
    ele.setAttribute("alt", item["title"] + "_" + item["type"])

    // 恢复光标
    rangeUtil.restoreLastSelection();
    if(rangeUtil.getSelectionRange()){
      editDom.focus()
      // 插入元素
      rangeUtil.insertElement(ele)
    }else{
      editDom.innerHTML += `<img src="${blankGif}" class="${faceClass}" alt='${item["title"]}' />`
    }
  }
  handleFocus(event) {
    this.clearPlaceHolder();
  }
  handleBlur() {
    const editDom = ReactDOM.findDOMNode(this.refs.editArea);
    if(!editDom.innerHTML) {
      this.setEditAreaForPlaceHolder();
    }
  }
  clearPlaceHolder() {
    const editDom = ReactDOM.findDOMNode(this.refs.editArea);
    if(editDom.hasChildNodes() && editDom.childNodes[0].nodeType === Node.ELEMENT_NODE
      && editDom.childNodes[0].getAttribute('class') === 'placeholder') {
        editDom.innerHTML="";
    }
    editDom.focus();
    rangeUtil.showSelectionRang(editDom);
  }
  setEditAreaForPlaceHolder() {
    ReactDOM.findDOMNode(this.refs.editArea).innerHTML = "<b class='placeholder'>在这儿输入回复内容，Enter键发送，Ctrl+Enter换行..</b>";
  }
  componentDidMount() {
    this.setEditAreaForPlaceHolder();
    ReactDOM.findDOMNode(this.refs.editArea).focus();
  }
  componentWillUnmount(){
    this.groupTimer && clearTimeout(this.groupTimer)
  }
  render(){
    return (
      <div className="group-send-msg-form">
        <ToolBar ref={obj => this.__groupToolBarRef=obj} userInfo={this.props.userInfo}
          onFaceClick={this.handleFaceClick} onSendMessage={this.handleSendMessage}/>
        <div className="input-conatiner">
          <pre ref="editArea" className="editArea"
            id={"editArea"+this.props.index}
            tabIndex={this.props.index}
            onKeyDown={this.handleKeyDown}
            onContextMenu={(e)=>{e.preventDefault(); return false;}}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            contentEditable="true" />
        </div>
      </div>
    )
  }
}

export default GroupSendMessageBox;
