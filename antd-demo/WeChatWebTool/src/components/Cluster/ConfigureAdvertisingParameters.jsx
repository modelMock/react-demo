import React from 'react';
import {Col,Form, Input, Select, Button,InputNumber} from 'antd';
import {queryMockParam,saveMockParam} from '../../services/cluster';
import {Confirm, Success} from '../Commons/CommonConstants';
const FormItem = Form.Item;
const Option = Select.Option;

class ConfigureAdvertisingParameters extends React.Component{
  constructor(props){
     super(props);
     this.state={
         advertisingParameters:{}
     };
     this.handleSubmit=this.handleSubmit.bind(this);
  }

componentDidMount(){
    queryMockParam().then(({jsonResult})=> {
        if(!jsonResult) return;
        this.setState({
          advertisingParameters: jsonResult
        });
    });
}
handleSubmit(e){
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      Confirm(function(){
        saveMockParam(values).then(({jsonResult}) => {
               Success("提交成功！");
               queryMockParam().then(({jsonResult})=> {
                   if(!jsonResult) return;
                   this.setState({
                     advertisingParameters: jsonResult
                   });
               });
          });
      }.bind(this), "确定提交吗?")
    });
}

  render(){
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span:16},
    };
    const {getFieldDecorator} = this.props.form;
    const {advertisingParameters} = this.state;
    return (
      <Form horizontal onSubmit={this.handleSubmit}>
        <FormItem label="每次取广告数据的群个数" {...formItemLayout}>
          {getFieldDecorator("distribut_cnt",{
            initialValue:advertisingParameters.distribut_cnt
          })(
           <InputNumber min={1} />
          )}
          <p className="ant-form-text">个</p>
        </FormItem>

        <FormItem label="每个群发布广告的时间间隔" {...formItemLayout}>
          {getFieldDecorator("publish_second",{
            initialValue:advertisingParameters.publish_second
          })(
           <InputNumber min={1}/>
          )}
          <p className="ant-form-text">秒</p>
        </FormItem>

        <FormItem label="每日取广告时间设置" {...formItemLayout}>
          <Col span={2}>
            {getFieldDecorator("start_time_division",{
              rules:[{required:true, message: '开始工作的时分不能为空'}],
              initialValue:advertisingParameters.start_time_division
            })(
             <Input style={{width:80}}/>
            )}
          </Col>
          <Col span={1} offset={1}>
             <p className="ant-form-text">到</p>
          </Col>
          <Col span={2}>
              {getFieldDecorator("end_time_division",{
                rules:[{required:true, message: '结束工作的时分不能为空'}],
                initialValue:advertisingParameters.end_time_division
              })(
               <Input style={{width:80}}/>
              )}
          </Col>
          <p style={{color:'#7F7F7F'}}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;注:开始结束值相等代表关闭发广告</p>
        </FormItem>
        <FormItem label="每个线程处理广告专员数量" {...formItemLayout}>
          {getFieldDecorator("process_member_cnt",{
            initialValue:advertisingParameters.process_member_cnt
          })(
           <InputNumber min={2} />
          )}
          <p className="ant-form-text">个</p>
        </FormItem>

        <FormItem label="同线程相邻群广告专员相同则强制休眠" {...formItemLayout}>
          {getFieldDecorator("same_pub_sleep",{
            initialValue:advertisingParameters.same_pub_sleep
          })(
           <InputNumber min={1}/>
          )}
          <p className="ant-form-text">秒</p>
        </FormItem>

        <FormItem wrapperCol={{offset: 6, span: 6}}>
          <Button type="primary" icon="check" size="large" htmlType="submit">提交</Button>
        </FormItem>
      </Form>
    );
  }
}
export default Form.create()(ConfigureAdvertisingParameters);
