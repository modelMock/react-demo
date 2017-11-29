import React from 'react';
import ReactDOM from 'react-dom';
import {Popover, Upload, Button, Input, Select, Dropdown, Menu} from 'antd';
import classNames from 'classnames';
import FaceCollection from '../Chat/FaceCollection';
import rangeUtil from '../Chat/RangeUtil';
import {LINK, TXT, IMG_DATA} from '../Chat/Utils';
import {uploadImg} from '../../services/chat';
import {queryShowCommonLanguages} from '../../services/multManage';

class ToolBar extends React.Component{
  static contextTypes = {
    clearMessage: React.PropTypes.any,
  }
  constructor(props){
    super(props);
    this.state = {
      commonLanguageMenu: null
    }
    this.handleUpload = this.handleUpload.bind(this);
    this.handleFaceViewVisibleChange = this.handleFaceViewVisibleChange.bind(this);
    this.handleMenuClick = this.handleMenuClick.bind(this);
  }
  handleFaceViewVisibleChange(display){
    if(display === true){
      // 保存当前的光标信息
      rangeUtil.saveCurrentSelection();
    }
  }
  handleUpload(file){
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
  handleMenuClick(e){
    console.log(e);
    this.props.onSendMessage(TXT, e.key);
  }
  componentDidMount(){
    queryShowCommonLanguages().then(({jsonResult}) => {
      if(!!jsonResult){
        const commonLanguageMenu = <Menu onClick={this.handleMenuClick}>
          {
            jsonResult.map(cl => (
              <Menu.Item key={cl.content}>{cl.content}</Menu.Item>
            ))
          }
        </Menu>
        this.setState({ commonLanguageMenu })
      }
    });
  }
  render(){
    console.log('NewSendMessageBox => render', this.state.commonLanguageMenu)
    return (
      <div className="toolbar">
        <Button type="ghost" icon="close" style={{float: 'right', marginRight: 8}}
            onClick={() => {this.context.clearMessage()}}>重置</Button>
        <Button type="primary" icon="save" style={{float: 'right'}} onClick={() => {this.props.onSendMessage()}}>保存</Button>
        <Popover placement="topLeft" trigger="click" onVisibleChange={this.handleFaceViewVisibleChange}
          content={ <FaceCollection onFaceClick={this.props.onFaceClick} />} >
            <Button type="ghost" icon="smile-circle"/>
        </Popover>
        <Upload action="/temp" beforeUpload={this.handleUpload}>
          <Button type="ghost" icon="picture" />
        </Upload>
        {
          !this.state.commonLanguageMenu ? null :
            <Dropdown overlay={this.state.commonLanguageMenu} trigger={['click']}>
              <Button type="primary" icon="message"/>
            </Dropdown>
        }
      </div>
    )
  }
}

const blankGif = require('../../../assets/images/app/blank.gif');
export default class NewSendMessageBox extends React.Component{
  constructor(props){
    super(props);
    this.state={
      beforeTxt: 'http://',
    }
    this.handleSendMessage = this.handleSendMessage.bind(this);
    this.handleFaceClick = this.handleFaceClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleBeforeTxt = this.handleBeforeTxt.bind(this);
  }
  handleBeforeTxt(beforeTxt){
    if(this.state.beforeTxt !== beforeTxt) {
      this.setState({ beforeTxt })
    }
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
  handleSendMessage(chatType=TXT, chat_content){
    if(chatType === TXT){
      this.__processTxtContent(chat_content);
    } else {
      this.__processImgContent(chat_content);
    }
  }
  __processTxtContent(chat_content) {
    let message = {chatType: TXT, msgHTML: chat_content };
    if(!chat_content){
      let pre = ReactDOM.findDOMNode(this.refs.editArea);
      //pre标签原始文本，用来浏览器显示用的
      let msgHTML = pre.innerHTML;
      //输入了链接，必须输入文本描述；纯文本也是必输
      if(!msgHTML || msgHTML.trim().length == 0) return;
      message.msgHTML = msgHTML;
      //格式化后的文本，发给后台用的
      chat_content = this.getFormatMessageContent();
      let link = this.refs.editLink.refs.input.value;
      if(link){
        link = this.state.beforeTxt + link
        //链接消息
        message = {chatType: LINK, link, msgHTML };
        this.refs.editLink.refs.input.value = '';
      }
      pre.innerHTML = '';
    }
    if(chat_content.endsWith("<br>")) {
      chat_content = chat_content.substr(0, chat_content.length - 4);
    }
    chat_content = chat_content.replace(/_qq/g, "").replace(/_emoji/g, "").replace(/<br>/g, "\n");
    message.chat_content = chat_content;
    this.props.onAddMessage(message);
  }
  __processImgContent(chat_content) {
    if(!chat_content) return;
    uploadImg(chat_content).then(({jsonResult}) => {
      console.log('上传图片服务器已经返回图片URL：', jsonResult);
      if(!!jsonResult) {
        this.props.onAddMessage({chatType: IMG_DATA, chat_content: jsonResult})
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
      this.handleSendMessage();
    } else if(e.keyCode == 86 && e.ctrlKey) {
      //粘贴
      setTimeout(function(){
        let pre = ReactDOM.findDOMNode(this.refs.editArea);
        pre.innerHTML = pre.innerText;
      }.bind(this), 10);
    }
  }
  handleFaceClick(item){
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
  render(){
    return (
      <div className="massed-send-form">
        <ToolBar ref="toolBar" userInfo={this.props.userInfo}
          onFaceClick={this.handleFaceClick} onSendMessage={this.handleSendMessage}/>
        <div className="input-conatiner">
          <pre ref="editArea" className="editArea" contentEditable="true" onKeyDown={this.handleKeyDown}
            onContextMenu={(e)=>{e.preventDefault(); return false;}}/>
          <div className="editLink">
            <Input ref="editLink" placeholder="请输入超链接" onKeyDown={this.handleKeyDown}
              addonBefore={
                <Select refs="linkBefore" value={this.state.beforeTxt} style={{width: 70}} onChange={this.handleBeforeTxt}>
                  <Option value="http://">http://</Option>
                  <Option value="https://">https://</Option>
                </Select>
              }/>
          </div>
        </div>
        <div className="new-massed-bottom">
          <Button type="primary" size="large" onClick={()=>{this.props.handleSend(true)}}>立即发送</Button>
          <Button size="large" onClick={()=>{this.props.handleSend(false)}}>延时随机发送</Button>
        </div>
      </div>
    )
  }
}
