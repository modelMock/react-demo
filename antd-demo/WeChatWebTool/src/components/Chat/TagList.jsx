import React, {Component} from 'react';
import {Avatar, Button, Modal,Form, Input} from 'antd';
import './TagList.less';
import ChatService from '../../services/ChatService'
import {imgPaddedPrefix, LIMIT_MESSAGE_PAGE} from "./Utils";
import {LoadingTip, EmptyDataTip, LoadMoreTip} from './TipTools'
const FormItem = Form.Item
const TextArea = Input.TextArea
const tagPageSize = 10;

class AddFriendModal extends Component{
  constructor(props){
    super(props)
  }
  handleCancel = ()=>{
    this.props.onCancel()
    this.props.form.resetFields()
  }

  handleAddFriend =()=>{
    this.props.form.validateFields((err,values)=>{
      if(!err){
        ChatService.addFriend(values).then(({jsonResult})=>{
          this.handleCancel()
          Modal.success({
            title:'添加好友提示',
            content:'添加好友成功！'
          })
        })
      }
    })
  }
  render(){
    const {form,visible, operationSn} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 16}
    }
    return (
      <Modal visible={visible}
             onCancel={this.handleCancel}
             title="添加好友"
             onOk={this.handleAddFriend}>
        <Form>
          <FormItem label="运营号id" {...formItemLayout}>
            {getFieldDecorator('operation_sn',{initialValue:operationSn})(
              <Input disabled={true}/>
            )}
          </FormItem>
          <FormItem label="好友id" {...formItemLayout}>
            {getFieldDecorator('friend_sn',{rules:[{required:true,message:'请输入要添加的好友id'}]})(
              <Input/>
            )}
          </FormItem>
          <FormItem label="请求语" {...formItemLayout}>
            {getFieldDecorator('request',{rules:[{required:true,message:'请输入请求语'}]})(
              <TextArea row={2}/>
            )}
          </FormItem>
        </Form>
    </Modal>
    )
  }
}
AddFriendModal = Form.create()(AddFriendModal)
export default class TagList extends Component{
  constructor(props){
    super(props)
    this.state = {
      show: 'loading',
      friendShow: 'empty',
      activedTagId: null,
      tagList: [],
      friendList: []
    }
    this.handleClick = this.handleClick.bind(this)
    this.handleLoadMore = this.handleLoadMore.bind(this)
    this.handleAddFriend = this.handleAddFriend.bind(this)
    this.handleOpenAddFriend = this.handleOpenAddFriend.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }
  initTagList(tagList){
    if(tagList.length > 0) {
      this.setState({
        tagList,
        show: 'normal',
        visible:false
      })
    } else {
      this.setState({ show: 'empty' })
    }
  }
  _queryFriendListByKefuTag(callback, offset, activedTagId=this.state.activedTagId){
    ChatService.queryFriendListByKefuTag(activedTagId, offset, tagPageSize).then(({jsonResult}) => {
      callback && callback(jsonResult.records)
    })
  }
  handleClick(activedTagId){
    this.setState({ friendShow: 'loading' })
    this._queryFriendListByKefuTag((friendList) => {
      this.setState({
        activedTagId,
        friendList,
        friendShow: friendList.length > 0 ? 'normal' : 'empty'
      })
    }, 0, activedTagId)
  }
  handleLoadMore(){
    this._queryFriendListByKefuTag((newFriendList) => {
      const friendList = this.state.friendList.concat(newFriendList)
      this.setState({ friendList })
      this.loadMoreRef.loadMoreFinish()
    }, this.state.friendList.length)
  }
  handleOpenAddFriend(){
    ChatService.getAddContactOperationSn().then(({jsonResult})=>{
      this.operationSn = jsonResult
      this.setState({visible:true})
    })
  }
  handleAddFriend(){

  }
  handleCancel(){
    this.setState({
      visible:false
    })
  }
  render() {
    return (
      <div className="chat-tags">
        <div className="tag-head">
          <span>好友标签分组 </span>
          <Button type="primary" onClick={this.handleOpenAddFriend}>添加好友</Button>
        </div>
        {this.renderTagList()}
        <AddFriendModal visible={this.state.visible} operationSn={this.operationSn} onCancel={this.handleCancel} />
      </div>
    )
  }
  renderTagList(){
    const {show, activedTagId} = this.state
    let body
    if(show === 'loading'){
      body = <LoadingTip/>
    } else if(show === 'normal'){
      body = (
        <div className="tag-body">
          <ul className="tag-item-body">
            {this.state.tagList.map(tag => <li key={tag.tag_id} className={activedTagId === tag.tag_id ? "tag-item actived" : "tag-item"}
                                    onClick={this.handleClick.bind(this, tag.tag_id)}>{tag.tag_name}({tag.friend_cnt})</li>)}
          </ul>
          <ul className="tag-user-list">
            {this.renderFriendList()}
          </ul>
          {this.state.friendList.length >= LIMIT_MESSAGE_PAGE && <LoadMoreTip ref={obj=>this.loadMoreRef=obj} cls="load-more-bottom" onLoadMore={this.handleLoadMore} />}
        </div>
      )
    } else if(this.state.show === 'empty'){
      body = <EmptyDataTip/>
    }
    return body
  }
  renderFriendList(){
    let body
    if(this.state.friendShow === 'loading'){
      body =  <LoadingTip/>
    } else if(this.state.friendShow === 'normal'){
      body =  this.state.friendList.map(friend =>
        <li>
          <Avatar shape="square" icon="user" size="large" src={imgPaddedPrefix(friend.head_url)} />
          <div className="content">
            <b>{friend.remark_name || friend.nick_name}</b>
            <span>
                  <a href="javascript:void(0)" onClick={() => this.props.onTagUserChat(friend.operation_sn, friend.friend_sn)}>聊天</a>
                  <a href="javascript:void(0)" onClick={() => this.props.onTagUserDigg(friend.operation_sn, friend.friend_sn)}>点赞</a>
                  <a href="javascript:void(0)" onClick={() => this.props.onTagUserComment(friend.operation_sn, friend.friend_sn)}>评论</a>
                </span>
          </div>
        </li>
      )
    } else if(this.state.friendShow === 'empty'){
      body =  <EmptyDataTip/>
    }
    return body
  }
}
