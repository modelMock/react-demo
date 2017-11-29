import React from 'react';
import { Form, Col, Row, Input, Button } from 'antd';
import ChannelSelectField from '../Operations/ChannelSelectField';
import OptrSelectField from '../Operations/OptrSelectField';
import CommonSelect from '../Commons/CommonSelect';
import { hashHistory } from 'react-router';
const FormItem = Form.Item;
/**
 * 群发搜索form
 */
class SendSearchForm extends React.Component {
  constructor(props){
    super(props);
    this.handleSearch = this.handleSearch.bind(this);
  }
  handleSearch(e) {
    e.preventDefault();
    let params = this.props.form.getFieldsValue();
    if(!!params.channel_id) {
      params['channel_id'] = params['channel_id']['key'];
    }
    if(!!params.service_optr_id) {
      params['service_optr_id'] = params['service_optr_id']['key'];
    }
    this.props.onSearch(params);
  }
  render(){
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 18},
    };
    const getFieldDecorator = this.props.form.getFieldDecorator;
    return (
      <Form horizontal className="ant-advanced-search-form" onSubmit={this.handleSearch}>
        <Row>
          <Col sm={9}>
            <ChannelSelectField formItem={{...formItemLayout, label: "商业渠道"}}
              getFieldDecorator={getFieldDecorator("channel_id", {rules:[{type:'object'}]})}/>
          </Col>
          <Col sm={6}>
            <FormItem {...formItemLayout} label="状态">
              <CommonSelect placeholder="请选择状态" item_key="MassStatus"
                getFieldDecorator={getFieldDecorator("status")}/>
            </FormItem>
          </Col>
          <Col sm={6}>
            <FormItem {...formItemLayout} label="审核结果">
              <CommonSelect placeholder="请选择审核结果" item_key="AuditResult" getFieldDecorator={getFieldDecorator("audit_result")}/>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={9}>
            <OptrSelectField formItem={{...formItemLayout, label: "客服"}}
              getFieldDecorator={getFieldDecorator("service_optr_id")} />
          </Col>
          <Col sm={12}>
            <FormItem labelCol={{span: 3}} wrapperCol={{span: 21}} label="备注">
              {getFieldDecorator('remark')(
                <Input placeholder="请输入群发备注"/>
              )}
            </FormItem>
          </Col>
          <Col sm={2} offset={1}>
            <Button type="primary" icon="search" size="large" htmlType="submit">搜  索</Button>
          </Col>
        </Row>
      </Form>
    );
  }
}
export default Form.create()(SendSearchForm);
