/*发朋友圈频率设置*/
import React, { Component, PropTypes} from 'react';
import {Form, InputNumber, Button} from 'antd';
import { queryChannelByOptrId, updateAdPublishInterval } from '../../services/ads';
import {Confirm, Success} from '../Commons/CommonConstants';
const FormItem = Form.Item;
class SetWeChatFreq extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  fetchData() {
    queryChannelByOptrId().then(({jsonResult}) => {
      this.props.form.setFieldsValue({
        publish_interval_hour: jsonResult['publish_interval_hour']
      })
    });
  }

  handleSubmit() {
    this.props.form.validateFields( (errors, values) => {
      if(!!errors) return;
      Confirm(function(){
        updateAdPublishInterval(values).then(({jsonResult}) => {
            Success('修改成功');
        });
      }.bind(this), '确定修改吗?');
    });
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span:2 },
      wrapperCol: { span: 6 }
    };
    return (
      <Form horizontal onSubmit={this.handleSubmit}>
        <FormItem label="时间间隔" {...formItemLayout}>
          {getFieldDecorator("publish_interval_hour",{
            initialValue:""
          })(
           <InputNumber min={0}/>
          )}
          <p className="ant-form-text">小时</p>
          <p className="ant-form-text">0表示无时间间隔限制</p>
        </FormItem>
        <Form.Item wrapperCol={{offset: 2,span: 4}}>
          <Button type="primary" size="large" icon="check" htmlType="submit">提交</Button>
        </Form.Item>
      </Form>
    );
  }
}

export default Form.create()(SetWeChatFreq);
