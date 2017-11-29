import React, { Component, PropTypes} from 'react';
import {Form,Select,Button,Input} from 'antd';
import {Confirm, Success} from '../Commons/CommonConstants';
import {queryChannelAutoReplyForCircle,saveChannelAutoReplyForCircle} from '../../services/replyMsgService';
import {queryCircleReplyProbability} from '../../services/params';
const FormItem = Form.Item;
const Option = Select.Option;

class CircleSetPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      adcircle_audit_status_text:'',
      adcircle_audit_result_text: '',
      normalcircle_audit_status_text:'',
      normalcircle_audit_result_text:'',
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }
  handleSubmit(e){
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if (!!errors) return;

      Confirm(function(){

        saveChannelAutoReplyForCircle(values).then(({jsonResult}) => {
          Success();
          this.fetchData();
        });

      }.bind(this));
    });
  }

  handleReset() {
    this.props.form.resetFields();
    this.setState({
      adcircle_audit_status_text:'',
      adcircle_audit_result_text: '',
      normalcircle_audit_status_text:'',
      normalcircle_audit_result_text:''
    });
  }

  fetchData() {
    queryChannelAutoReplyForCircle().then(({jsonResult}) =>{
      this.props.form.setFieldsValue(jsonResult);
      this.setState({
        adcircle_audit_status_text: jsonResult['adcircle_audit_status_text'],
        adcircle_audit_result_text: jsonResult['adcircle_audit_result_text'],
        normalcircle_audit_status_text: jsonResult['normalcircle_audit_status_text'],
        normalcircle_audit_result_text: jsonResult['normalcircle_audit_result_text'],
      });
    });
  }

  componentDidMount() {
    this.fetchData();
  }
  render(){
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const { adcircle_audit_status_text, adcircle_audit_result_text,
        normalcircle_audit_status_text, normalcircle_audit_result_text } = this.state;

    return(
      <Form horizontal onSubmit={this.handleSubmit}>
        <FormItem wrapperCol={{ span: 24, offset: 1 }}>
          <p className="ant-form-text" style={{fontSize:'16px',marginLeft:'1px'}}>
            广告朋友圈自动回复（运营微信号的广告朋友圈被评论时，将按系统规则随机自动回复）
          </p>
          <p className="ant-form-text" style={{ color:'red' }}>{adcircle_audit_status_text}: {adcircle_audit_result_text}</p>
        </FormItem>
        <FormItem labelCol={{span:3}} wrapperCol={{span:16}} label="回复内容">
          {getFieldDecorator('adcircle_reply_content', {
            rules: [{ required: true, message: '请输入回复内容'}]
          })(
            <Input type="textarea" rows={5} placeholder="这里描述回复内容，支持表情输入"/>
          )}
        </FormItem>
        <FormItem labelCol={{span:3}} wrapperCol={{span:2}} label="自动回复" >
          {getFieldDecorator('adcircle_is_open', {initialValue: 'F'})(
            <Select>
              <Option key="T">开启</Option>
              <Option key="F">关闭</Option>
            </Select>
          )}
        </FormItem>

        <div style={{'borderBottom':'1px solid #e9e9e9', marginBottom: 24}} />
        <FormItem  wrapperCol={{ span: 24, offset: 1 }}>
          <p className="ant-form-text" style={{fontSize:'16px',marginLeft:'1px'}}>
            普通朋友圈自动回复（运营微信号的普通朋友圈被评论时，将按系统规则随机自动回复）
          </p>
          <p className="ant-form-text" style={{ color:'red' }}>{normalcircle_audit_status_text}: {normalcircle_audit_result_text}</p>
        </FormItem>
        <FormItem labelCol={{span:3}} wrapperCol={{span:16}} label="回复内容">
          {getFieldDecorator('normalcircle_reply_content', {
            rules: [{ required: true, message: '请输入回复内容'}]
          })(
            <Input type="textarea" rows={5} placeholder="这里描述回复内容，支持表情输入" />
          )}
        </FormItem>
        <FormItem labelCol={{span:3}} wrapperCol={{span:2}} label="自动回复" >
          {getFieldDecorator('normalcircle_is_open', {initialValue: 'F'})(
            <Select>
              <Option key="T">开启</Option>
              <Option key="F">关闭</Option>
            </Select>
          )}
        </FormItem>
        <FormItem  wrapperCol={{ span: 10, offset: 6 }}>
          <Button type="primary" icon="check" size="large" htmlType="submit">提交</Button>
          <Button icon="cross" size="large" style={{marginLeft: 16}} onClick={this.handleReset}>重置</Button>
        </FormItem>
      </Form>
    )
  }
}
export default Form.create()(CircleSetPanel);
