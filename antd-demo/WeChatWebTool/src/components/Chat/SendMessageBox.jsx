import React, {Component, PropTypes} from 'react'
import ReactDOM from 'react-dom'
import './SendMessageBox.less'
import classnames from 'classnames'
import {Popover, Button,Upload} from 'antd'
import FaceCollection from './FaceCollection'
import {TXT, IMG_DATA, IMG_LINK} from './Utils'
import {Errors} from '../Commons/CommonConstants';
import socketManage from '../Socket/SocketManage';
import rangeUtil from './RangeUtil';

// 单聊聊天  工具条
class ToolBar extends Component{
  constructor (props){
    super(props);
    this.state = {
      sendBtnDisabled: false
    }
    this.handleUpload = this.handleUpload.bind(this);
    this.handleSend = this.handleSend.bind(this);
  }
  componentWillUnmount(){
    this.timer && clearTimeout(this.timer)
  }
  handleFaceViewVisibleChange (display){
    if(display === true){
      // 保存当前的光标信息
      rangeUtil.saveCurrentSelection()
    }
  }
  handleSend(){
    this.props.onSendMessage()
  }
  // 发送消息时，禁用按钮，发送成功再激活
  disabledSendBtn(){
    if(this.state.sendBtnDisabled) return
    this.setState({ sendBtnDisabled: true })
    // 若后台1分钟内没有返回，提示错误
    this.timer = setTimeout(() => {
      Errors("请求错误,超时");
      this.setState({ sendBtnDisabled: false })
    }, 1000*60)
  }
  doActivedSendBtn(){
    this.timer && clearTimeout(this.timer)
    this.setState({ sendBtnDisabled: false })
  }
  getSendBtnStatus(){
    return this.state.sendBtnDisabled
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

    const reader = new FileReader();
    reader.onload = (e) => {
      this.disabledSendBtn()
      this.props.onSendMessage(IMG_DATA, e.currentTarget.result);
    };
    reader.readAsDataURL(file);

    return false;
  }
  render(){
    return (
      <div className="toolbar">
        <Button type="primary" icon="enter" disabled={this.state.sendBtnDisabled}
          onClick={this.handleSend}
          style={{float: 'right', marginRight: 8}}>发送</Button>
        <span className="tips">按下Ctrl+Enter换行</span>
        <Popover placement="topLeft"
          trigger="click"
          onVisibleChange={this.handleFaceViewVisibleChange}
          content={ <FaceCollection onFaceClick={this.props.onFaceClick} />} >
          <Button type="ghost" icon="smile-circle"/>
        </Popover>
        <Upload action="/temp" beforeUpload={this.handleUpload}>
          <Button type="ghost" icon="picture" />
        </Upload>
      </div>
    )
  }
}

ToolBar.propTypes = {
}

const blankGif = require('../../../assets/images/app/blank.gif')

class SendMessageBox extends Component {
  constructor(props){
    super(props);
    this.handleFaceClick = this.handleFaceClick.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  // 获取消息内容模板，格式化之后的消息内容
  getFormatMessageContent(){
    // debugger;
    let pre = this.editAreaRef;
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
  sendMessage(msgType, localImgUrl) {
    if(socketManage.getIsGone() === true) {
      this.handleSendMessage(msgType, localImgUrl);
    } else {
      Errors('请点击打开"在岗"开关');
    }
  }
  // 聊天消息发送成功回调
  sendMsgSuccess(){
    this.editAreaRef.innerHTML = "";
    this.toolbarRef.doActivedSendBtn();
  }
  sendMsgFail(){
    this.toolbarRef.doActivedSendBtn();
  }
  handleSendMessage(msgType = TXT, localImgUrl){
    if(msgType === TXT) {   //文本消息
      let msg = this.editAreaRef.innerHTML;
      if(!!msg) {
        this.toolbarRef.disabledSendBtn()
        this.props.onSendMessage(msg, this.getFormatMessageContent());
      }
    } else if(msgType === IMG_DATA) { //图片消息：本地图片链接
      this.toolbarRef.disabledSendBtn()
      this.props.onSendMessage(localImgUrl, localImgUrl, IMG_DATA);
    }
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
      this.sendMessage();
    } else if(e.keyCode == 86 && e.ctrlKey) {
      //粘贴
      setTimeout(() => {
        let pre = this.editAreaRef;
        pre.innerHTML = pre.innerText;
      }, 10);
    }
  }
  handleFaceClick(item){
    let faceClass, editDom = this.editAreaRef
    if("qq" === item["type"]){
      faceClass = classnames("qqemoji", item["class"])
    }else{
      faceClass = classnames("emoji", item["class"])
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
  render(){
    return (
      <div className="send-msg-form">
        <ToolBar ref={obj => this.toolbarRef=obj}
          onFaceClick={this.handleFaceClick}
          onSendMessage={this.sendMessage}/>
        <div className="input-conatiner">
          <pre ref={obj=>this.editAreaRef=obj}
            onKeyDown={this.handleKeyDown}
            onContextMenu={(e)=>{e.preventDefault(); return false;}}
            className="editArea"
            contentEditable="true">
          </pre>
        </div>
      </div>
    )
  }
}

export default SendMessageBox;
