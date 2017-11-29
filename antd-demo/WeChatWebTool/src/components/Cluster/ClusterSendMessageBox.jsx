import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import {Popover, Button, Upload} from 'antd';
import FaceCollection from '../Chat/FaceCollection';
import {uploadImg} from '../../services/chat.js';
import service from '../../services/clusterChat';
import {TXT, IMG_DATA, CMD_C_SEND, replaceImgByText} from '../Chat/Utils'
import {Errors} from '../Commons/CommonConstants';
import socketManage from '../Socket/SocketManage';
import rangeUtil from '../Chat/RangeUtil';
/**
 * 群聊
 */

//群聊 工具条
class ToolBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sendBtnDisabled: false
    }
    this.handleUpload = this.handleUpload.bind(this);
    this.handleSend = this.handleSend.bind(this);
  }
  handleSend(){
    this.setState({ sendBtnDisabled: true })
    this.props.onSendMessage()
  }
  endabledSendBtn(){
    if(this.state.sendBtnDisabled){
      this.setState({
        sendBtnDisabled: false
      })
    }
  }
  getSendBtnDisabled(){
    return this.state.sendBtnDisabled;
  }
  setSendBtnDisabled(){
    if(!this.state.sendBtnDisabled){
      this.setState({
        sendBtnDisabled: true
      });
    }
  }
  handleFaceViewVisibleChange(display) {
    if (display === true) {
      // 保存当前的光标信息
      rangeUtil.saveCurrentSelection()
    }
  }
  handleUpload(file) {
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      Errors('只能上传 JPG或PNG 文件哦！');
      return false;
    }

    if (file.size > 10 * 1024 * 1024 * 1024) {
      Errors('只能上传 小于10M 的文件哦！');
      return false;
    }

    let reader = new FileReader();
    reader.onload = function (e) {
      console.log("e.currentTarget.result",e.currentTarget.result);
      this.props.onSendMessage(IMG_DATA, e.currentTarget.result);
    }.bind(this);
    reader.readAsDataURL(file);

    return false;
  }
  render() {
    return (
      <div className="toolbar">
        <Button type="primary" icon="enter" disabled={this.state.sendBtnDisabled} onClick={this.handleSend}
                style={{float: 'right', marginRight: 8}}>发送</Button>
        <span className="tips">按下Ctrl+Enter换行</span>
        <Popover placement="topLeft" trigger="click"
                 onVisibleChange={this.handleFaceViewVisibleChange}
                 content={ <FaceCollection onFaceClick={this.props.onFaceClick}/>}>
          <Button type="ghost" icon="smile-circle"/>
        </Popover>
        <Upload action="/temp" beforeUpload={this.handleUpload}>
          <Button type="ghost" icon="picture"/>
        </Upload>
      </div>
    )
  }
}

const blankGif = require('../../../assets/images/app/blank.gif')

export default class ClusterSendMessageBox extends Component {
  static contextTypes = {
    sendCommandMessage: React.PropTypes.any,
  }
  constructor(props) {
    super(props);
    this.handleFaceClick = this.handleFaceClick.bind(this);
    this.handleSendMessage = this.handleSendMessage.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }
  //清除发送的消息
  clearEditContent(){
    ReactDOM.findDOMNode(this.refs.editArea).innerHTML = "";
    this.__clusterToolBarRef.endabledSendBtn()
  }
  onEditGroupId(group_id) {
    this.refs.toolBar.onEditGroupId(group_id);
  }
  insertCopyMessage(content) {
    /*let message = content;
    const arr = content.match(/\[[a-zA-Z0-9\u4E00-\u9FA5]+\]/g);
    if(!!arr && arr.length) {
      message = '';
      let startIdx = 0;
      arr.forEach(str => {
        const curIdx = content.indexOf(str);
        const text = startIdx != curIdx ?  content.substring(startIdx, curIdx) : '';
        const imgHTML = replaceImgByText(str.substring(1, str.length -1));
        startIdx = curIdx + str.length;
        message += text + imgHTML;
      });
      message += content.substring(startIdx);
    }
    let editDom = ReactDOM.findDOMNode(this.refs.editArea)
    editDom.innerHTML = message
    this.atType = true
    editDom.focus()*/
    let editDom = ReactDOM.findDOMNode(this.refs.editArea)
    editDom.innerHTML = content
    this.atType = true
    editDom.focus()
  }
  // 插入At消息
  insertAtMessage(targetSn, nickname){
    let editDom = ReactDOM.findDOMNode(this.refs.editArea)
    editDom.innerHTML = `<a href="#" sn="${targetSn}"> @${nickname} </a>`
    this.atType = true
    rangeUtil.showSelectionRang(editDom);
  }
  // 获取消息内容模板，格式化之后的消息内容
  getFormatMessageContent() {
    let pre = ReactDOM.findDOMNode(this.refs.editArea);
    // 提取内容
    let nodes = pre.childNodes;
    let msgFormat = "";
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i], name = node.nodeName;
      if ("IMG" === name) {
        msgFormat += "[" + node.getAttribute("alt") + "]";
      } else if ("#text" === name) {
        msgFormat += node.nodeValue;
      } else if ("BR" === name) {
        msgFormat += node.outerHTML;
      }
    }
    return msgFormat;
  }
  //本地发送消息
  handleSendMessage(chatType=TXT, content) {
    if(!this.props.friend_wechat) {
      Errors("当前没有好友");
      return;
    }
    if(socketManage.getIsGone() === true) {
      if(this.atType === true){
        // 发送At提醒消息
        this.atType = false
        this.__sendAtMessage();
        return
      }
      // 发送其它消息
      chatType === TXT ? this.__sendTxtMessage(content) : this.__sendImgMessage(content);
    } else {
      Errors('请点击打开"在岗"开关');
    }
  }
  __sendAtMessage(){
    let dom = ReactDOM.findDOMNode(this.refs.editArea)
    let msg = dom.innerHTML.trim(), chatContent = ""
  	var endTag = "</a>", atTagEndIndex = msg.indexOf(endTag)
  	if(msg.indexOf("<a href") !== 0 || atTagEndIndex <= 0){
      // 不合法，当普通文本发送
      this.__sendTxtMessage()
  	}else{
  		var atSpecMark = msg.substring(0, atTagEndIndex + endTag.length)
  	  var content = msg.substring(atTagEndIndex + endTag.length)
      if(!content){
        alert("请输入@提醒内容~");
        return ;
      }
      chatContent = atSpecMark + this.getFormatMessageContent()
        .replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/_qq/g, "").replace(/_emoji/g, "").replace(/<br>/g, "\n")
      // this.context.sendCommandMessage(CMD_C_SEND, JSON.stringify({
      //   chat_type:TXT,
      //   operation_sn: this.props.friend_wechat,
      //   friend_sn: this.props.friend_wechat,
      //   chat_content: chatContent
      // }));
      //UI手工 群聊发言回复
      // 用户自己发送消息，超时1分钟给提示信息
      this.clusterTimerAtMessage = setTimeout(() =>  Errors("请求错误,超时"), 1000*60);
      service.replyClusterByHand({chat_type:TXT, cluster_sn: this.props.friend_wechat, chat_content:chatContent}).then(({jsonResult}) => {
        clearTimeout(this.clusterTimerAtMessage);
        this.props.onAddLocalMessage(msg)
        dom.innerHTML = "";
        dom.focus();
        this.clearEditContent();
      }).catch((err) => {
        clearTimeout(this.clusterTimerAtMessage);
        dom.innerHTML =chatContent;
        dom.focus();
        Errors(err);
        this.__clusterToolBarRef && this.__clusterToolBarRef.endabledSendBtn();
      });
  	}
  }
  __sendTxtMessage(chat_content) {
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
    // this.context.sendCommandMessage(CMD_C_SEND, JSON.stringify({chat_type:TXT,
    //   operation_sn: this.props.friend_wechat, friend_sn: this.props.friend_wechat, chat_content}));

    // 用户自己发送消息，超时1分钟给提示信息
    this.clusterTimerTxtMessage = setTimeout(() =>{
      Errors("请求错误,超时");
      this.__clusterToolBarRef && this.__clusterToolBarRef.endabledSendBtn();
    }, 1000*60);
    //UI手工 群聊发言回复
    service.replyClusterByHand({chat_type:TXT, cluster_sn: this.props.friend_wechat, chat_content}).then(({jsonResult}) => {
      clearTimeout(this.clusterTimerTxtMessage);
      this.props.onAddLocalMessage(msgHTML || chat_content)
      pre.focus();
      this.clearEditContent();
    }).catch((err) => {
      clearTimeout(this.clusterTimerTxtMessage);
      pre.innerHTML =chat_content;
      pre.focus();
      Errors(err);
      this.__clusterToolBarRef && this.__clusterToolBarRef.endabledSendBtn();
    });
  }
  __sendImgMessage(img64Data) {
    if(!img64Data) return;
    uploadImg(img64Data).then(({jsonResult}) => {
      console.log('上传图片服务器已经返回图片URL：', jsonResult);
      if(!!jsonResult) {
        // this.context.sendCommandMessage(CMD_C_SEND, JSON.stringify({chat_type: IMG_DATA,
        //     operation_sn: this.props.friend_wechat, friend_sn: this.props.friend_wechat, chat_content: jsonResult}))
        //UI手工 群聊发言回复
        service.replyClusterByHand({chat_type: IMG_DATA,cluster_sn: this.props.friend_wechat, chat_content: jsonResult}).then(({jsonResult}) => {
          if(!jsonResult){
            return;
          }else{
            this.props.onAddLocalMessage(img64Data, IMG_DATA);
            ReactDOM.findDOMNode(this.refs.editArea).focus();
          }
        })
      }
    });
  }
  handleKeyDown(e) {
    if (e.keyCode == 13) {  // 回车
      if (e.ctrlKey) {
        // 换行
        document.execCommand("insertHTML", false, "<br><br>");
        return;
      }
      // 立即发送
      e.preventDefault();
      if(!this.__clusterToolBarRef.getSendBtnDisabled()){
        this.__clusterToolBarRef.setSendBtnDisabled();
        this.handleSendMessage();
      }
    } else if (e.keyCode == 86 && e.ctrlKey) {
      //粘贴
      setTimeout(function () {
        let pre = ReactDOM.findDOMNode(this.refs.editArea);
        pre.innerHTML = pre.innerText;
      }.bind(this), 10);
    }
  }
  handleFaceClick(item) {
    console.log(item)
    let faceClass, editDom = ReactDOM.findDOMNode(this.refs.editArea);
    if ("qq" === item["type"]) {
      faceClass = classNames("qqemoji", item["class"]);
    } else {
      faceClass = classNames("emoji", item["class"]);
    }
    let ele = document.createElement("img");
    ele.setAttribute("class", faceClass);
    ele.setAttribute("src", blankGif);
    ele.setAttribute("alt", item["title"] + "_" + item["type"]);

    // 恢复光标
    rangeUtil.restoreLastSelection();
    if (rangeUtil.getSelectionRange()) {
      editDom.focus();
      // 插入元素
      rangeUtil.insertElement(ele)
    } else {
      editDom.innerHTML += `<img src="${blankGif}" class="${faceClass}" alt='${item["title"]}' />`
    }
  }
  componentWillUnmount(){
    this.clusterTimerTxtMessage && clearTimeout(this.clusterTimerTxtMessage);
    this.clusterTimerAtMessage && clearTimeout(this.clusterTimerAtMessage);
  }
  render() {
    console.log('ClusterSendMessageBox => render');
    return (
      <div className="cluster-send-msg-form">
        <ToolBar ref={obj => this.__clusterToolBarRef=obj}
          onFaceClick={this.handleFaceClick}
          onSendMessage={this.handleSendMessage}/>
        <div className="input-conatiner">
          <pre ref="editArea"
             onKeyDown={this.handleKeyDown}
             onContextMenu={(e)=> {
               e.preventDefault();
               return false;
             }}
             className="editArea"
             contentEditable="true">
          </pre>
        </div>
      </div>
    )
  }
}
