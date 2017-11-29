/*数据同步设置*/
import React, { Component} from 'react';
import {Form, InputNumber, Button} from 'antd';
import {queryCircleReplyProbability, setCircleReplyProbability} from '../../services/params';
import {Confirm} from '../Commons/CommonConstants';
const FormItem = Form.Item;

class SetReplyParams extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if (!!errors) return;
      Confirm(function(){
        setCircleReplyProbability(values).then(({jsonResult}) => {
          Success('设置成功');
        })
      }.bind(this));
    });
  }

  handleReset() {
    this.props.form.resetFields();
  }

  fetchData() {
    queryCircleReplyProbability().then(({jsonResult}) => {
      this.props.form.setFieldsValue(jsonResult);
    })
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    const formItemLayout= {
      labelCol: {span: 9},
      wrapperCol: {span: 15}
    }
    const getFieldDecorator = this.props.form.getFieldDecorator;
    return (
      <Form horizontal onSubmit={this.handleSubmit}>
        <FormItem {...formItemLayout} label="广告朋友圈回复好友概率">
          {getFieldDecorator('ad_circle_probability', {
            rules: [{required: true, type: 'number', message: '广告朋友圈回复好友概率不能为空'}]
          })(<InputNumber min={0} max={100} />)}
          <p className="ant-form-text">%</p>
        </FormItem>
        <FormItem {...formItemLayout} label="普通朋友圈回复好友概率">
          {getFieldDecorator('normal_circle_probability', {
            rules: [{required: true, type: 'number', message: '普通朋友圈回复好友概率不能为空'}]
          })(<InputNumber min={0} max={100} />)}
          <p className="ant-form-text">%</p>
        </FormItem>
        <FormItem {...formItemLayout} label="广告朋友圈回复好友延时范围">
          {getFieldDecorator('ad_circle_delay_hour', {
            rules: [{required: true, type: 'number', message: '广告朋友圈回复好友延时范围不能为空'}]
          })(<InputNumber min={1} max={100} />)}
          <p className="ant-form-text">小时</p>
        </FormItem>
        <FormItem {...formItemLayout} label="普通朋友圈回复好友延时范围">
          {getFieldDecorator('normal_circle_delay_hour', {
            rules: [{required: true, type: 'number', message: '普通朋友圈回复好友延时范围不能为空'}]
          })(<InputNumber min={1} max={100} />)}
          <p className="ant-form-text">小时</p>
        </FormItem>
        <FormItem  wrapperCol={{ span: 10, offset: 7 }}>
          <Button type="primary" icon="check" size="large" htmlType="submit">提交</Button>
          <Button icon="cross" size="large" style={{marginLeft: 16}} onClick={this.handleReset}>重置</Button>
        </FormItem>
      </Form>
    );
  }
}

export default Form.create()(SetReplyParams);
