import React from 'react';
import {TXT, IMG_DATA, LINK, renderFormatContent } from '../Chat/Utils';

export default class NewMessageItem extends React.Component {
  constructor(props){
    super(props);
  }
  renderTextMsg(msgHTML){
    return <p className="msg-txt" dangerouslySetInnerHTML={{__html: msgHTML}}></p>
  }
  renderImgMsg(chat_content){
    return <img className="msg-image" src={chat_content} />;
  }
  renderLinkMsg(link, msgHTML){
    return <div className="msg-link">
      <p dangerouslySetInnerHTML={{__html: msgHTML}}></p>
      <a href={link} target="_blank">{link}</a>
    </div>
  }
  shouldComponentUpdate(nextProps, nextState){
    return nextProps.message !== this.props.message;
  }
  render(){
    console.log('NewMessageItem => render', this.props.message);
    const {chatType, chat_content, link, msgHTML} = this.props.message;
    let msgItem,msg = msgHTML;
    if(chatType !== IMG_DATA && !msgHTML) {
      msg = chat_content;
    }
    if(!!msg) {
      msg = renderFormatContent(msg.replace(/\n/g, "<br>"));
    }
    if(chatType === TXT){           //文本
      msgItem = this.renderTextMsg(msg);
    } else if(chatType === IMG_DATA){  //图片
      msgItem = this.renderImgMsg(chat_content);
    } else if(chatType === LINK){  //链接
      msgItem = this.renderLinkMsg(link, msg);
    }
    return <li className="massed-message-item">{msgItem}</li>
  }
}
