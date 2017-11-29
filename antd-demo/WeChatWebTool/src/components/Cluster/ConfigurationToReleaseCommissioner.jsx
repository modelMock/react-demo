import React from 'react';
import {Form, Input, Select, Button,InputNumber,Row,Col} from 'antd';
import {savePublishParam,queryPublishParam} from '../../services/cluster';
import {Confirm, Success} from '../Commons/CommonConstants';
const FormItem = Form.Item;
const Option = Select.Option;

class ConfigurationToReleaseCommissioner extends React.Component{
  constructor(props){
     super(props);
     this.state={
         PublishParam:[]
     };
     this.handleSubmit=this.handleSubmit.bind(this);
  }

componentDidMount(){
    queryPublishParam().then(({jsonResult})=> {
        if(!jsonResult) return;
        this.setState({
          PublishParam: jsonResult
        });
    });
}
handleSubmit(e){
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      Confirm(function(){
        savePublishParam(values).then(({jsonResult}) => {
               Success("提交成功！");
          });
      }.bind(this), "确定提交吗?")
    });
}

  render(){
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 8 },
    };
    const {getFieldDecorator} = this.props.form;
    const {PublishParam} = this.state;
    return (
      <Form horizontal onSubmit={this.handleSubmit}>
        <Row gutter={16}>
          <Col span={24}>
            <FormItem label="运营号配置比" {...formItemLayout}>
              <InputNumber min={1} max={1} defaultValue='1'/>
              <p className="ant-form-text">：</p>
              {getFieldDecorator("join_cluster_cnt",{initialValue:PublishParam.join_cluster_cnt})(
               <InputNumber/>
              )}
              <p className="ant-form-text">注：代表1个运营号最多会分布到多少个群里</p>
            </FormItem>
            <FormItem label="每个新群里配置运营号" {...formItemLayout}>
              {getFieldDecorator("cluster_publish_cnt",{initialValue:PublishParam.cluster_publish_cnt})(
               <InputNumber/>
              )}
              <p className="ant-form-text">个，用于运营号状态异常时自动切换</p>
            </FormItem>
            <FormItem label="运营号进百人群需要运营号互加，以下输入的是互加限制" labelCol={{span:8}} wrapperCol={{span:14}}>
            </FormItem>
            <FormItem label="运营号互加接口日调用限制" {...formItemLayout}>
              {getFieldDecorator("oper_mutual_call_cnt",{initialValue:PublishParam.oper_mutual_call_cnt})(
               <InputNumber/>
              )}
              <p className="ant-form-text">次</p>
            </FormItem>
            <FormItem label="运营号每次互加运营号的个数" {...formItemLayout}>
              {getFieldDecorator("oper_add_cnt",{initialValue:PublishParam.oper_add_cnt})(
               <InputNumber/>
              )}
              <p className="ant-form-text">个</p>
            </FormItem>
            <FormItem label="同一个运营号每次互加间隔" {...formItemLayout}>
              {getFieldDecorator("oper_add_interval",{initialValue:PublishParam.oper_add_interval})(
               <InputNumber/>
              )}
              <p className="ant-form-text">小时</p>
            </FormItem>
            <FormItem label="汇入发布组302组的运营组号" labelCol={{span:6}} wrapperCol={{span:6}}>
              {getFieldDecorator("publish_oper_group_extend",{initialValue:PublishParam.publish_oper_group_extend})(
               <Input />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8} offset={3}>
            <FormItem label="发布组新组过渡组号" labelCol={{span:10}} wrapperCol={{span:10}}>
              {getFieldDecorator("publish_oper_group_weight_list",{initialValue:PublishParam.publish_oper_group_weight_list})(
               <Input />
              )}
            </FormItem>
          </Col>
          <Col span={11} pull={2}>
            <FormItem label="设置组号的使用概率" labelCol={{span:8}} wrapperCol={{span:6}}>
              {getFieldDecorator("publish_oper_group_weight",{initialValue:PublishParam.publish_oper_group_weight})(
               <InputNumber />
              )}
              <p className="ant-form-text">%</p>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <FormItem wrapperCol={{offset: 6, span: 6}}>
              <Button type="primary" icon="check" size="large" htmlType="submit">提交</Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
export default Form.create()(ConfigurationToReleaseCommissioner);
