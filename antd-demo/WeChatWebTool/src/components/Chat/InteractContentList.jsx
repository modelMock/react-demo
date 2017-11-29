import React, {Component} from 'react';
import {Button, Modal, Input, Form, Tag} from 'antd';
import './InteractContentList.less'
import ChatService from '../../services/ChatService'
import {LoadingTip, EmptyDataTip, LoadMoreTip} from './TipTools'
import {Success} from '../Commons/CommonConstants'
import AdPublishDetailInfoModal from "../Ads/AdPublishDetailInfoModal";

const FormItem = Form.Item
const TextArea = Input.TextArea

const interactPageSize = 10
const REPLY_TO_OTHER = 'other'      /*对他人一对一回复*/
const REPLY_TO_MYSELF = 'myself'      /*自评论*/
const COMMENTS_NAME = 'comments'
const REPLY_NAME = 'reply'

class InformationsModal extends Component{
  constructor(props){
    super(props)
    this.renderItem = this.renderItem.bind(this)
  }
  renderItem({interact_sn, interact_time, interact_content}){
    return (
      <li className='as-information-item' key={interact_sn}>
        <p>时间： {interact_time}</p>
        <p>内容： {interact_content}</p>
      </li>
    )
  }
  renderBody(){
    const {visible, informaionData}= this.props
    if(visible === 'loading'){
      return <LoadingTip/>
    }else if(informaionData.length > 0) {
      return informaionData.map(this.renderItem)
    }else if(informaionData.length === 0){
      return <EmptyDataTip/>
    }
  }
  render(){
    const {visible, onClose, showMore}= this.props
    let title = ''
    if(visible === REPLY_NAME){
      title = '回复记录'
    }
    if(visible === COMMENTS_NAME){
      title = '自评论记录'
    }
    return (
      <Modal
        visible={visible!=='none'}
        footer={null}
        onCancel={onClose}
      >
        <div className="as-information-container">
          <p className="as-information-name"><b>{title}</b></p>
          {showMore && <LoadMoreTip onLoadMore={this.props.onLoadMoreInformation}/>}
          <ul>
            {this.renderBody()}
          </ul>
        </div>
      </Modal>
    )
  }
}

class InteractItem extends Component {
  constructor(props) {
    super(props)
  }
  // 标记未读、已读
  handleReply( record ) {
    this.props.onReplay( record )
  }
  // 自评论或者一对一回复
  handleWriteComment( type ){
    this.props.onWriteComment( type, this.props.record )
  }
  // 显示朋友圈详情弹框
  handleShowDetail( publish_sn ){
    this.props.onShow( publish_sn )
  }
  //显示评论和回复记录详情
  handleShowInformationModal(type, publish_sn){
    this.props.showInformationModal(type, publish_sn)
  }
  render() {
    const {interact_time, is_read, interact_content, publish_content, publish_sn} = this.props.record
    const isRead = {opText: "标记为未读", statusText: "已读", statusColor: '#87d068'}
    const notRead = {opText: "标记为已读", statusText: "未读", statusColor: '#f50'}
    const readStatus = is_read === 'T' ? isRead : notRead
    const {opText, statusText, statusColor} = readStatus
    const content = publish_content.indexOf('text_content') >= 0 ? JSON.parse(publish_content)['text_content'] : publish_content
    return (
      <li className="comment-item">
        <p>
          状态：<Tag color={statusColor}>{statusText}</Tag >
        </p>
        <p>
          时间：<label>{interact_time}</label>
        </p>
        <p>内容：<label>{interact_content}</label></p>
        <p>
          朋友圈信息：<label>{content}</label>
          <Button.Group size="small" className="comment-op">
            <Button type='primary' ghost onClick={this.handleReply.bind(this, this.props.record)}>{opText}</Button>
            {interact_content && <Button type='primary' ghost onClick={this.handleWriteComment.bind(this, REPLY_TO_OTHER)}>一对一回复</Button>}
            <Button type='primary' ghost onClick={this.handleWriteComment.bind(this, REPLY_TO_MYSELF)}>自评论</Button>
            <Button type='primary' ghost onClick={this.handleShowDetail.bind(this, publish_sn)}>详情</Button>
            <Button type='primary' ghost onClick={this.handleShowInformationModal.bind(this, REPLY_NAME, publish_sn)}>回复记录</Button>
            <Button type='primary' ghost onClick={this.handleShowInformationModal.bind(this, COMMENTS_NAME, publish_sn)}>自评论记录</Button>
          </Button.Group>
        </p>
      </li>
    )
  }
}

export default class InteractContentList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      show: 'loading',
      itemList: [],
      // 是否显示评论框
      showReplyModal: false,
      // 回复类型，对自己  对他人
      replyType: "",
      // 回复对象
      replyRecord: null,
      informaionData:[],
      showInformationModal:'none'
    }
    this.handleClose = this.handleClose.bind(this)
    this.handleReplay = this.handleReplay.bind(this)
    this.handleLoadMore = this.handleLoadMore.bind(this)
    this.handleShowDetail = this.handleShowDetail.bind(this)
    this.handleWriteComment = this.handleWriteComment.bind(this)
    this.showInformationModal = this.showInformationModal.bind(this)
    this.handleLoadMoreInformation=this.handleLoadMoreInformation.bind(this)

  }
  queryInteractContent( type, operationSn, friendSn ) {
    this.operationSn = operationSn
    this.friendSn = friendSn
    this.interactType = type === 'digg' ? 1 : 2
    ChatService.queryRecordAdInteractNew( operationSn, friendSn, this.interactType, interactPageSize ).then(({ jsonResult }) => {
      this.startRecord = jsonResult.nextPageStart
      let itemList = jsonResult.data
      itemList.reverse()
      this.setState({
        itemList,
        show: itemList.length > 0 ? 'normal' : 'empty'
      })
    })
  }
  handleLoadMore(callback) {
    ChatService.queryRecordAdInteractNew( this.operationSn, this.friendSn, this.interactType, interactPageSize, this.startRecord ).then(({ jsonResult }) => {
      this.startRecord = jsonResult.nextPageStart
      let data = jsonResult.data
      data.reverse()
      const itemList = data.concat( this.state.itemList )
      this.setState({itemList})
      callback && callback()
    })
  }
  clearAllData() {
    this.setState({itemList: [], show: 'empty'})
  }
  handleReplay({ interact_sn, is_read, commentid, interact_time_long }) {
    const isRead = is_read === 'T' ? 'F' : 'T'
    ChatService.updateReadSns( this.operationSn, this.friendSn, this.interactType, isRead, commentid, interact_time_long ).then(({jsonResult}) => {
      const itemList = this.state.itemList.concat([])
      const index = itemList.findIndex( item => item['interact_sn'] === interact_sn )
      itemList[index]['is_read'] = isRead
      this.setState({itemList})
    })
  }
  handleShowDetail( publish_sn ){
    this.pubDetailModalRef.show( publish_sn )
  }
  handleWriteComment( type, someone ){
    this.setState({
      showReplyModal: true,
      replyType: type,
      replyRecord: someone
    })
  }
  handleClose(){
    this.informationStartRecord = null
    this.setState({
      showReplyModal: false,
      showInformationModal:'none',
      informaionData: []
    })
  }
  handleLoadMoreInformation(){
    if(this.informationType === REPLY_NAME){
      ChatService.queryRecordAdInteractReply(this.operationSn, this.friendSn, publish_sn, interactPageSize, this.informationStartRecord)
        .then(({jsonResult})=>{
          this.informationStartRecord = jsonResult.nextPageStart
          let data = Array.from(jsonResult.data)
          data.reverse()
          this.setState({
            informaionData:this.state.informaionData.concat(jsonResult.data)
          })
        })
    }else if(this.informationType === COMMENTS_NAME){
      ChatService.queryRecordAdInteractSnsComment(this.operationSn, this.friendSn, publish_sn, interactPageSize, this.informationStartRecord)
        .then(({jsonResult})=>{
          this.informationStartRecord = jsonResult.nextPageStart
          this.setState({
            informaionData:this.state.informaionData.concat(jsonResult.data)
          })
        })
    }
  }
  showInformationModal(type, publish_sn){
    this.publishSn = publish_sn
    this.informationType = type
    this.setState({
      showInformationModal:'loading'
    })
    if(type === REPLY_NAME){
      ChatService.queryRecordAdInteractReply(this.operationSn, this.friendSn, publish_sn, interactPageSize)
        .then(({jsonResult})=>{
          this.informationStartRecord = jsonResult.nextPageStart
          let informaionData = Array.from(jsonResult.data)
          this.setState({
            informaionData,
            showInformationModal:type
          })
        })
    }else{
      ChatService.queryRecordAdInteractSnsComment(this.operationSn, this.friendSn, publish_sn, interactPageSize)
        .then(({jsonResult})=>{
          this.informationStartRecord = jsonResult.nextPageStart
          let informaionData = Array.from(jsonResult.data)
          this.setState({
            informaionData,
            showInformationModal:type
          })
        })
    }
  }
  render() {
    const {show, itemList, replyType, replyRecord, showReplyModal, showInformationModal, informaionData} = this.state
    const body = show === 'loading' ? <LoadingTip/> : show === 'normal' ?
      itemList.map(item => <InteractItem key={item['interact_sn']}
                                         record={item}
                                         onShow={this.handleShowDetail}
                                         onWriteComment={this.handleWriteComment}
                                         onReplay={this.handleReplay}
                                         showInformationModal={this.showInformationModal}/>) : <EmptyDataTip/>
    return (
      <ul className="comment-list">
        {this.startRecord && <LoadMoreTip onLoadMore={this.handleLoadMore}/>}
        {body}
        <AdPublishDetailInfoModal ref={obj=>this.pubDetailModalRef=obj} encapsulationAuditPublishAd={this.encapsulationAuditPublishAd}/>
        <ReplyMoadal visible={showReplyModal}
                     record={replyRecord}
                     replyType={replyType}
                     onReplay={this.handleReplay}
                     onClose={this.handleClose} />
        <InformationsModal visible={showInformationModal}
                           informaionData={informaionData}
                           onClose={this.handleClose}
                           showMore={this.informationStartRecord}
                           onLoadMoreInformation={this.handleLoadMoreInformation}/>
      </ul>
    )
  }
}

class ReplyMoadal extends Component{
  constructor(props){
    super(props)
    this.handleSave = this.handleSave.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }
  // 提交评论、回复
  handleSave( e ){
    e.preventDefault()
    this.props.form.validateFields(( err, values ) => {
      if( !!err ) return false
      const {record, replyType} = this.props
      // 获取评论或者一对一回复接口
      const chatService = replyType === REPLY_TO_OTHER ? ChatService.replySnsComment : ChatService.selfSnsComment
      // 列出需要提交的字段
      const {operation_sn, friend_sn, article_id, commentid, replycommentid, publish_sn, is_read} = record
      // 调用接口
      chatService(operation_sn, friend_sn, article_id, commentid, replycommentid, publish_sn, values['content']).then(({ jsonResult }) => {
        Success(replyType === REPLY_TO_OTHER ? "回复成功~" : "评论成功~")
        this.handleClose()
        // 如果是一对一回复并且回复状态为未回复，调用更新回复状态接口
        replyType === REPLY_TO_OTHER && is_read === "F" && (this.props.onReplay(record))
      })
    })
  }
  // 关闭模态框
  handleClose(){
    this.props.onClose()
    this.props.form.resetFields()
  }
  render(){
    const {visible, form, replyType} = this.props;
    const {getFieldDecorator} = form;
    const modalTitle = replyType === REPLY_TO_OTHER ? "一对一回复" : "自评论"
    const formItemLayout = {
      labelCol: {span: 0},
      wrapperCol: {span: 24}
    }
    return(
      <Modal title={modalTitle}
             width={660}
             visible={visible}
             okText="确定"
             cancelText="取消"
             onOk={this.handleSave}
             onCancel={this.handleClose}>
        <Form>
          <FormItem {...formItemLayout}>
            {getFieldDecorator("content",{rules: [{required: true, message: "请输入文本内容！"}]})(
              <TextArea autosize={{ minRows: 12, maxRows: 26 }} placeholder="请谨慎输入，确定后不可撤销。"/>
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
ReplyMoadal=Form.create()(ReplyMoadal)