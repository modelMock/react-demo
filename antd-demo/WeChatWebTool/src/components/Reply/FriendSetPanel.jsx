import React, { Component, PropTypes} from 'react';
import {Form,Radio,Select,Button,Input, InputNumber} from 'antd';
import {Confirm, Success} from '../Commons/CommonConstants';
import {queryChannelAutoReplyForChat, saveChannelAutoReplyForChatAndOffDuty} from '../../services/replyMsgService';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;

class FriendSetPanel extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }
  handleSubmit(e){
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if (!!errors) return;

      Confirm(function(){

        saveChannelAutoReplyForChatAndOffDuty(values).then(({jsonResult}) => {
          Success();
          this.fetchData();
        });

      }.bind(this));
    });
  }

  handleReset() {
    this.props.form.resetFields();
  }

  fetchData() {
    queryChannelAutoReplyForChat().then(({jsonResult}) =>{
      this.props.form.setFieldsValue(jsonResult);
    });
  }

  componentDidMount() {
    this.fetchData();
  }
  render(){
    console.log('TransferFrdsModal= > render => ');
    const getFieldDecorator = this.props.form.getFieldDecorator;
    return(
      <Form horizontal onSubmit={this.handleSubmit}>
        <FormItem wrapperCol={{ span: 10, offset: 1 }}>
          <p className="ant-form-text" style={{fontSize:'16px'}}>客服在岗自动回复</p>
        </FormItem>
        <FormItem labelCol={{span:3}} wrapperCol={{span:21}} label="回复机制"
          extra='自定义回复请通过左侧菜单“自动回复消息列表”管理'>
          <p className="ant-form-text">客服连续</p>
          {getFieldDecorator('chat_no_replay_times', {
            rules: [{ required: true, type: 'number', message: '请输入回复次数'}]
          })(<InputNumber min={1} step={1} />)}
          <p className="ant-form-text">次 未回复同一好友发来的消息，将自动回复（自定义回复优先级高于系统智能分析回复）</p>
        </FormItem>
        <FormItem labelCol={{span:3}} wrapperCol={{span:2}} label="自动回复" >
          {getFieldDecorator('chat_is_open', {initialValue: 'F'})(
            <Select>
              <Option key="T">开启</Option>
              <Option key="F">关闭</Option>
            </Select>
          )}
        </FormItem>
        <div style={{'borderBottom':'1px solid #e9e9e9', marginBottom: 24}} />
        <FormItem  wrapperCol={{ span: 10, offset: 1 }}>
          <p className="ant-form-text" style={{fontSize:'16px'}}>客服离岗自动回复</p>
        </FormItem>
        <FormItem labelCol={{span:3}} wrapperCol={{span:16}} label="离岗回复内容">
          {getFieldDecorator('offduty_reply_content', {
            rules: [{ required: true, message: '请输入回复内容'}]
          })(<Input type="textarea" rows={5} placeholder="请输入回复内容" />)}
        </FormItem>
        <FormItem labelCol={{span:3}} wrapperCol={{span:2}} label="自动回复" >
          {getFieldDecorator('offduty_is_open', {initialValue: 'F'})(
            <Select>
              <Option key="T">开启按离岗</Option>
              <Option key="S">开启按在岗</Option>
              <Option key="F">关闭</Option>
            </Select>
          )}
        </FormItem>
        <FormItem labelCol={{span:3}} wrapperCol={{span:16}} label="注" >
          <p>开启离岗回复：客服离岗时，将对一个好友只回复一次 离岗回复内容</p>
          <p>开启按在岗回复： 客服离岗时，将按客服在岗自动回复配置回复好友</p>
        </FormItem>
        <FormItem  wrapperCol={{ span: 10, offset: 6 }}>
          <Button type="primary" icon="check" size="large" htmlType="submit">提交</Button>
          <Button icon="cross" size="large" style={{marginLeft: 16}} onClick={this.handleReset}>重置</Button>
        </FormItem>
      </Form>
    )
  }
}
export default Form.create()(FriendSetPanel);
