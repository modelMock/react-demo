/*好友偏移设置*/
import React, { Component, PropTypes} from 'react';
import {Form, InputNumber, Button, Modal} from 'antd';
import {getOffsets, setOffsets} from '../../services/params';
import {Confirm, Success} from '../Commons/CommonConstants';
const FormItem = Form.Item;

class SetFriendParams extends Component {
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
        setOffsets(values).then(({jsonResult}) => {
          Success('设置成功');
        })
      }.bind(this));
    });
  }

  handleReset() {
    this.props.form.resetFields();
  }

  fetchData() {
    getOffsets().then(({jsonResult}) => {
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
        <FormItem {...formItemLayout} label="按好友数分配商业渠道偏移量">
          {getFieldDecorator('channel_offset', {
            rules: [{required: true, type: 'number', message: '渠道偏移量不能为空'}]
          })(<InputNumber min={1} />)}
          <p className="ant-form-text">人</p>
        </FormItem>
        <FormItem {...formItemLayout} label="按好友数分配客服偏移量">
          {getFieldDecorator('optr_offset', {
            rules: [{required: true, type: 'number', message: '客服偏移量不能为空'}]
          })(<InputNumber min={1} />)}
          <p className="ant-form-text">人</p>
        </FormItem>
        <FormItem {...formItemLayout} label="按好友数寻找最优运营号组合计算次数上限">
          {getFieldDecorator('cal_sum_max', {
            rules: [{required: true, type: 'number', message: '计算次数不能为空'}]
          })(<InputNumber min={1} max={100} />)}
          <p className="ant-form-text">百万次</p>
        </FormItem>
        <FormItem  wrapperCol={{ span: 10, offset: 7 }} >
          <Button type="primary" icon="check" size="large" htmlType="submit">提交</Button>
          <Button icon="cross" size="large" style={{marginLeft: 16}} onClick={this.handleReset}>重置</Button>
        </FormItem>
      </Form>
    );
  }
}

export default Form.create()(SetFriendParams)
