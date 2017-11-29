//好友主页信息
import React, {Component} from 'react';
import {Form, Input, Button, Tag, Checkbox} from 'antd';
import { hashHistory } from 'react-router';
import './FriendHomeInfo.less';
import { Confirm, Success, Errors} from '../Commons/CommonConstants';
import ChatService from '../../services/ChatService'

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

export default class FriendHomeInfo extends Component {

  constructor(props) {
    super(props);
    this.state = {
      remarkName: '',
      // 所有标签集合
      tagList: [],
      // 好友已打标签集合
      markTagIds: [],
    }
    this.doEditRemarkName = this.doEditRemarkName.bind(this);
    this.doMarkTags = this.doMarkTags.bind(this);
    this.onSendMsg = this.onSendMsg.bind(this);
    this.doAddTag = this.doAddTag.bind(this);
    this.userFriend = {}
  }
  // 新增标签
  doAddTag(){
    const tagEle = document.getElementById('tag_name_id')
    const tagName = tagEle.value;
    if(!tagName){
      Errors('请输入标签名称');
      return;
    }
    ChatService.addKefuTag(tagName).then(({jsonResult}) => {
      const tagList = this.state.tagList.concat([])
      tagList.push({tag_id: jsonResult, tag_name: tagName})
      this.setState({ tagList })
      tagEle.value = ''
    })
  }
  // 选中标签：给好友打标签
  doMarkTags(markTagIds) {
    ChatService.addMarkedAdsForFriendNew(this.operation_sn, this.friend_sn, markTagIds).then(({jsonResult}) => {
      this.setState({ markTagIds })
    })
  }
  // 修改备注名称
  doEditRemarkName() {
    const remarkEle = document.getElementById('remark_name')
    const remarkName = remarkEle.value;
    if(!remarkName){
      Errors('请输入备注名称');
      return;
    }
    if(remarkName === this.userFriend['remark_name']){
      Errors('备注名没有修改')
      return;
    }
    Confirm(() => {
      ChatService.updateFriendRemarkNameNew(this.operation_sn, this.friend_sn, remarkName).then(({jsonResult}) => {
        Success("修改备注名成功");
        this.setState({ remarkName })
      })
    }, "确定修改备注名吗?");
  }
  // 跳转到单聊页面
  onSendMsg() {
    hashHistory.push({
      pathname: "/chat",
      state: {
        friend_sn: this.friend_sn,
        operation_sn: this.operation_sn
      }
    });
  }
  componentDidMount(){
    const {state} = this.props.location;
    if(!state) return

    this.friend_sn = this.props.location.state['friend_sn'];
    this.operation_sn = this.props.location.state['operation_sn'];
    ChatService.getFriendMainPageNew(this.operation_sn, this.friend_sn).then(({jsonResult}) => {
      if(!!jsonResult['remark_name']) {
        document.getElementById('remark_name').value = jsonResult['remark_name'];
      }
      this.userFriend = jsonResult
      const remarkName = jsonResult['remark_name']
      const friendTagList = jsonResult['friend_tag_list'], markTagIds = []
      if(friendTagList.length > 0){
        friendTagList.forEach(tag => {
          if(tag['marked'] === 'T'){
            markTagIds.push(tag['tag_id'])
          }
        })
      }
      this.setState({
        remarkName,
        markTagIds,
        tagList: friendTagList
      });
    })
  }
  render() {
    const {nick_name, head_url, operation_mobile, friend_wechat, gender_text, province_id, city_id, create_time} = this.userFriend
    const {tagList, markTagIds, remarkName} = this.state
    const showName = !!remarkName ? remarkName : nick_name
    const tagOptions = tagList.map(tag => ({label: tag['tag_name'], value: tag['tag_id']}))
    return (
      <div>
        <div className="friend-head">
          <img alt="好友头像" src={head_url} />
          <h1>{showName}</h1>
          <Button type="primary" style={{marginLeft: 16}} onClick={this.onSendMsg}>发送消息</Button>
        </div>
        <div className="base-info">
          <ul>
            <li>基本信息</li>
            <li>来源运营手机号: {operation_mobile}</li>
            <li>好友号: {friend_wechat}</li>
            <li>昵称: {nick_name}</li>
            <li>性别: {gender_text}</li>
            <li>地区: {province_id} {city_id}</li>
            <li>备注名:
              <Input id="remark_name" placeholder="请输入备注名" style={{width: 200, marginLeft: 8}} />
              <Button type="primary" icon="edit" style={{marginLeft:16}} onClick={this.doEditRemarkName}>修改</Button>
            </li>
            <li>添加时间: {create_time}</li>
          </ul>
        </div>
        <div className="base-info">
          <ul>
            <li>添加标签</li>
            <li>标签:
              <Input id="tag_name_id" placeholder="请输入标签" style={{width: 200, marginLeft: 8}} />
              <Button type="primary" icon="plus" style={{marginLeft:16}} onClick={this.doAddTag}>添加</Button>
            </li>
            <li><CheckboxGroup id="adids" options={tagOptions} value={markTagIds} onChange={this.doMarkTags} /></li>
          </ul>
        </div>
      </div>
    );
  }

}
