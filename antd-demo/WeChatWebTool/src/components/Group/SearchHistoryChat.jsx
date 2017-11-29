import React from 'react';
import {Form,Row,Col,Input,DatePicker,Button} from 'antd';
import moment from 'moment';
import CommonModal from '../Commons/CommonModal';
import groupChatService from '../../services/groupChatService';
import {Errors} from '../Commons/CommonConstants';
import {LIMIT_HISTORY_MESSAGE_PAGE} from './NavigateUtil.js';
import {imgPaddedPrefix, TXT, IMG_DATA, AUDIO, IMG_LINK, TIME, FROM_FRD, FROM_OPT, renderFormatHTML } from '../Chat/Utils'
import classNames from 'classnames';
const FormItem=Form.Item;

const UserInfo = (props) => {
  return (
    <div className="search-history-head">
      <img title="好友头像" src={props.head_url} />
      <h1>{props.nick_name}</h1>
    </div>
  );
}
/**
 * 搜索历史聊天消息
 */
const now = moment().add(1, "days").valueOf();
class ChatSearchForm extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      startValue: null,
      endValue: null,
    }
    this.disabledStartDate = this.disabledStartDate.bind(this);
    this.disabledEndDate = this.disabledEndDate.bind(this);
    this.onStartChange = this.onStartChange.bind(this);
    this.onEndChange = this.onEndChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }
  disabledStartDate(startValue){
    if(startValue && startValue.valueOf() > now) return true;
    if(!startValue || !this.state.endValue) return false;
    return startValue.valueOf() > this.state.endValue.valueOf();
  }
  disabledEndDate(endValue){
    if(endValue && endValue.valueOf() > now) return true;
    if(!endValue || !this.state.startValue) return false;
    return endValue.valueOf() < this.state.startValue.valueOf();
  }
  onStartChange(value){
    this.setState({
      startValue: value
    })
  }
  onEndChange(value){
    this.setState({
      endValue: value
    })
  }
  handleSubmit(e){
    e.preventDefault();
    const values = this.props.form.getFieldsValue();
    if(!values.chat_content){
      Errors("请输入要查询的聊天消息");
      return;
    }
    if(!!values.start_date){
      values['start_date']= values.start_date.format("YYYY-MM-DD HH:mm:ss");
    }
    if(!!values.end_date){
      values['end_date']= values.end_date.format("YYYY-MM-DD HH:mm:ss");
    }
    this.props.onSearch(values);
  }
  handleReset(){
    this.props.form.resetFields();
  }
  render(){
    const { getFieldDecorator } = this.props.form;
    return (
      <Form horizontal className="history-chat-form" onSubmit={this.handleSubmit}>
        <Row>
          <Col sm={20}>
            <FormItem label="聊天消息" labelCol={{span: 4}} wrapperCol={{span: 20}} required>
              {getFieldDecorator('chat_content', {
                rules: [{required: true, message:"请输入要搜索的聊天消息"}]
              })(
                <Input placeholder="请输入要搜索的聊天消息"/>
              )}
            </FormItem>
          </Col>
          <Col span={3} offset={1}>
            <Button type="ghost" icon="cross" size="large" onClick={this.handleReset}>重置</Button>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <FormItem label="开始时间" labelCol={{span: 8}} wrapperCol={{span: 16}}>
              {getFieldDecorator('start_date')(
                <DatePicker disabledDate={this.disabledStartDate} onChange={this.onStartChange}
                  placeholder="请选择搜索开始时间" style={{width:'100%'}} />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem label="结束时间" labelCol={{span: 8}} wrapperCol={{span: 16}}>
              {getFieldDecorator('end_date')(
                <DatePicker disabledDate={this.disabledEndDate} onChange={this.onEndChange}
                  placeholder="请选择搜索结束时间" style={{width:'100%'}} />
              )}
            </FormItem>
          </Col>
          <Col span={3} offset={1}>
            <Button type="primary" icon="search" size="large" htmlType="submit">搜索</Button>
          </Col>
        </Row>
      </Form>
    );
  }
}
ChatSearchForm = Form.create()(ChatSearchForm);

class MessageItem extends React.Component {
  constructor(props){
    super(props);
    this.onClickMsg = this.onClickMsg.bind(this);
  }
  onClickMsg() {
    this.props.onViewMsgSearch(this.props.message);
  }
  //微信好友发送的图片消息
  renderImage(chat_content){
    return <img className="msg-image" src={imgPaddedPrefix(chat_content)} onClick={ (e) => {this.onImgClick(e, chat_content)} }/>
  }
  //本地运营号发送的本地图片消息
  renderLocalImage(chat_content) {
    return <img className="msg-image" src={chat_content} onClick={ (e) => {this.onImgClick(e, chat_content)} }/>
  }
  //语音消息
  renderAudio(chat_message){
    return <audio className="msg-audio" src={chat_message} preload="auto" controls onPlaying={this.handlePlay}/>
  }
  render(){
    const {chat_from, chat_type, chat_time, chat_content} = this.props.message;
    const ownerCls=classNames("msg-head", {"owner": chat_from === '0'});
    let content;
    switch (chat_type) {
      case TXT:       //文本消息
        let msg = chat_content.replace(/\n/g, "<br>");
        content = renderFormatHTML(msg);
        break;
      case IMG_DATA:   // 图片消息
      case IMG_LINK:
        content = (chat_from === FROM_FRD) ? this.renderImage(chat_content) : this.renderLocalImage(chat_content);
        break;
      case AUDIO:
        content= this.renderAudio(chat_content);
        break;
      default:
    }
    const viewMsgCls = classNames("view-msg", {"hidden": this.props.isSearch === false})

    return (
      <li className={ownerCls}>
        <h1>{chat_from === '0' ? '好友' : '客服'}</h1>
        <span className="date">{chat_time}</span>
        <a href="javascript:void(0)" className={viewMsgCls} onClick={this.onClickMsg}>查看前后消息</a>
        <span className="msg"> {content} </span>
      </li>
    );
  }
}

export default class SearchHistoryChat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSearch: true,     //默认为上面搜索框form查询；message: 消息前后查询
      messageList: [],
      prevBtnDisabled: false,
      nextBtnDisabled: false,
    }
    this.params={
      operation_sn: props.operation_sn,
      friend_sn: props.friend_sn,
      offset: 0,
      limit: LIMIT_HISTORY_MESSAGE_PAGE,
    }
    this.onClose = this.onClose.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.onViewMsgSearch = this.onViewMsgSearch.bind(this);
    this.onPrevPage = this.onPrevPage.bind(this)
    this.onNextPage = this.onNextPage.bind(this);
  }
  onClose(){
    this.refs.commonModal.hide();
    this.setState({ messageList:[] })
  }
  show(){
    this.refs.commonModal.show();
  }
  /**
   * 搜索框查询
   * 返回匹配查询的最新几条消息
   */
  searchRecrodChat(params){
    groupChatService.searchRecrodChat(params).then(({jsonResult}) => {
      let messageList = jsonResult.records;
      if(messageList.length > 0) messageList.reverse();
      this.setState({
        messageList,
        isSearch: true,
        nextBtnDisabled: params.offset <= 0,   //起始页为0，已经是最新消息，不能向后翻页了
        prevBtnDisabled: messageList.length < LIMIT_HISTORY_MESSAGE_PAGE,  //小于limit数，不能向后翻了
       });
       if(messageList.length === 0) {
         Errors('未搜索到相关聊天记录')
       }
    })
  }
  /**
   * 消息前后查询
   * @param back_limit 往前翻页聊天条数（比当前新的聊天记录）
   * @param next_limit 往后翻页聊天条数（比当前旧的聊天记录）
   * @param startChat  翻页开始消息对象
   */
  queryChatPageBackAndNext(back_limit, next_limit, startChat) {
    groupChatService.queryChatPageBackAndNext(
      this.props.operation_sn, this.props.friend_sn,
      back_limit, next_limit, startChat
    ).then(({jsonResult}) => {
      this.nextPageStart = jsonResult.nextPageStart;
      this.backPageStart = jsonResult.backPageStart;
      let messageList = jsonResult.data;
      if(messageList.length > 0) messageList.reverse();
      this.setState({
        messageList,
        isSearch: false,  //不是form搜索，查询消息前后
        prevBtnDisabled: !this.nextPageStart,
        nextBtnDisabled: !this.backPageStart,
       });
    });
  }
  //前一页：查询旧一点的消息
  onPrevPage(){
    if(this.state.isSearch === true){
      this.params.offset = this.params.offset + LIMIT_HISTORY_MESSAGE_PAGE;
      this.searchRecrodChat(this.params);
    } else {
      this.queryChatPageBackAndNext(0, LIMIT_HISTORY_MESSAGE_PAGE, this.nextPageStart);
    }
  }
  //下一页：查询新一点的消息
  onNextPage(){
    if(this.state.isSearch === true){
      this.params.offset = this.params.offset - LIMIT_HISTORY_MESSAGE_PAGE;
      this.searchRecrodChat(this.params);
    } else {
      this.queryChatPageBackAndNext(LIMIT_HISTORY_MESSAGE_PAGE, 0, this.backPageStart);
    }
  }
  //查询聊天前后
  onViewMsgSearch(startChat){
    console.log('查询消息前后', startChat);
    //前后各一半的记录数
    this.queryChatPageBackAndNext(LIMIT_HISTORY_MESSAGE_PAGE/2, LIMIT_HISTORY_MESSAGE_PAGE/2, startChat);
  }
  //搜索
  handleSearch(values) {
    this.params.offset = 0; //重新搜索，翻页重置为0
    Object.assign(this.params, values);
    this.searchRecrodChat(this.params);
  }
  render(){
    const {messageList, firstBtnDisabled, prevBtnDisabled, nextBtnDisabled, lastBtnDisabled, isSearch} = this.state;
    return (
        <CommonModal ref="commonModal" className="history-chat-container" title="历史聊天消息" width={700} onCancel={this.onClose}
          footer={[
            <Button key="close" icon="poweroff" type="primary" size="large" onClick={this.onClose}>关 闭</Button>
          ]}>
            <UserInfo head_url={this.props.head_url} nick_name={this.props.nick_name}/>
            <ChatSearchForm onSearch={this.handleSearch}/>
            {
              messageList.length > 0
              ? <div className="history-msg">
                  <ul>
                    {
                      messageList.map(message => (
                        <MessageItem key={message.chat_sn} message={message}
                          isSearch={isSearch} onViewMsgSearch={this.onViewMsgSearch} />
                      ))
                    }
                  </ul>
                  <div className="msg-page">
                    <Button icon="left" title="前一页" disabled={prevBtnDisabled} onClick={this.onPrevPage}/>
                    <Button icon="right" title="后一页" disabled={nextBtnDisabled} onClick={this.onNextPage}/>
                  </div>
                </div> : null
            }
        </CommonModal>
    );
  }
}
