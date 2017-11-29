/*分配运营号搜索表单*/
import React, { Component, PropTypes} from 'react'
import { Form, Input, InputNumber, Button, Row, Col, } from 'antd';
import GroupSelectField from './GroupSelectField';
import CommonSelect from '../Commons/CommonSelect';
const FormItem = Form.Item;

class AssignSearchForm extends Component {

  static defaultProps = {
    onSearchChannel(){}
  }

  static propTypes = {
    form: PropTypes.object.isRequired,
    onSearchChannel: PropTypes.func
  }

  constructor(props) {
    super(props);
    this.searchFormItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14　}
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    let values = this.props.form.getFieldsValue();
    if(values['wechat_group']) {
      values['wechat_group'] = values['wechat_group']['key'];
    }
    this.props.onSearchChannel( values );
  }

  render() {
    console.log('AssignSearchForm => render');
    const searchFormItemLayout = {
      labelCol: { span:8 },
      wrapperCol: { span: 16　}
    };

    const getFieldDecorator = this.props.form.getFieldDecorator;

    return (
      <Form horizontal className="ant-advanced-search-form" onSubmit={this.handleSubmit}>
        <Row gutter={16}>
          <Col span={8}>
            <GroupSelectField
              getFieldDecorator={getFieldDecorator('wechat_group', {rules:[{type:'object'}]})}
              formItem={{ label:"原始组号", ...searchFormItemLayout }} />
            <FormItem {...searchFormItemLayout} label="运营微信号">
              {getFieldDecorator('operation_wechat')(
                <Input placeholder="请输入微信号" />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...searchFormItemLayout} label="运营手机号">
              {getFieldDecorator('mobile')(
                <Input placeholder="请输入手机号" />
              )}
            </FormItem>
            <FormItem {...searchFormItemLayout} label="状态">
              <CommonSelect placeholder="请选择状态" item_key="OperationStatus" getFieldDecorator={getFieldDecorator('status')}/>
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...searchFormItemLayout} label="运营号数量">
              {getFieldDecorator('operation_count')(
                <InputNumber min={1} placeholder="请输入运营号数量" style={{width: '100%'}} />
              )}
            </FormItem>
            <FormItem style={{textAlign: 'right'}}>
              <Button icon="reload" onClick={this.props.onRefresh}>刷新</Button>
              <Button icon="search" type="primary" htmlType="submit">搜索</Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}

export default Form.create()(AssignSearchForm);
