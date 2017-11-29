import React from 'react';
import { Form, Row, Col, Input, Select, Button, Table, Tag,Modal } from 'antd';
import {clusterPatchOper} from '../../services/cluster';
import {Errors} from '../Commons/CommonConstants';
import {Confirm, Success} from '../Commons/CommonConstants';
const FormItem = Form.Item;
const Option = Select.Option;

class FillMiddleMumberOperations extends React.Component{
  constructor(props){
     super(props);
     this.handleSubmit=this.handleSubmit.bind(this);
  }

handleSubmit(e){
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
         if(values.cluster_id.trim()==null||values.cluster_id.trim()==''){
           Errors("群ID不能为空！");
           return;
         }
       clusterPatchOper(values).then(({jsonResult}) => {
              console.log("closeMonitorjsonResult",jsonResult);
         });
    });
}

  render(){
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span:18},
    };
    const {getFieldDecorator} = this.props.form;
    return (
      <Form horizontal onSubmit={this.handleSubmit}  className="ant-advanced-search-form">
          <Row gutter={16}>
              <Col span={8}>
                <FormItem label="群ID" {...formItemLayout}>
                    {getFieldDecorator('cluster_id', {initialValue:''})(
                        <Input placeholder="请输入群ID" />
                    )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="运营手机号" {...formItemLayout}>
                  {getFieldDecorator('mobile', {initialValue:''})(
                      <Input placeholder="运营手机号" />
                  )}
                </FormItem>
              </Col>
               <Col span={8}>
                <FormItem {...formItemLayout}>
                  <Button type="primary" icon="check" size="large" htmlType="submit">提交</Button>
                </FormItem>
              </Col>
           </Row>
      </Form>
    );
  }
}
export default Form.create()(FillMiddleMumberOperations);
