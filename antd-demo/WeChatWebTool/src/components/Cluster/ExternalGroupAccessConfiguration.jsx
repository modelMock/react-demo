import React from 'react';
import {Form, Input, InputNumber,Select, Button} from 'antd';
import {queryClusterBusiness,queryMonitorParam,openMonitor,closeMonitor} from '../../services/cluster';
import {Confirm, Success} from '../Commons/CommonConstants';
const FormItem = Form.Item;
const Option = Select.Option;

class ExternalGroupAccessConfiguration extends React.Component{
  constructor(props){
     super(props);
     this.state = {
       clusterBusiness:[],
       queryMonitor:[],
        updata:0
     };
   this.handleSubmit=this.handleSubmit.bind(this);
  }
  componentDidMount(){
        //查询 商业属性下拉值填充
        queryClusterBusiness().then(({jsonResult})=> {
            if(!jsonResult) return;
            this.setState({
              clusterBusiness: jsonResult
            });
        });
    queryMonitorParam().then(({jsonResult})=> {
          if(!jsonResult) return;
          this.setState({
            queryMonitor: jsonResult
          });
        });
    }
  handleSubmit(e){
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if(values.isMonitor=="true"){
          if(!!errors) return;
          Confirm(function(){
              openMonitor(values).then(({jsonResult}) => {
                 Success("提交成功！");
              });
          }.bind(this), "确定提交吗?")
      }
      if(values.isMonitor=="false"){
        if(!!errors) return;
          Confirm(function(){
               closeMonitor().then(({jsonResult}) => {
                     Success("提交成功！");
                 });
         }.bind(this), "确定提交吗?")
       }
    });
  }
  render(){
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 6},
    };
    const {getFieldDecorator} = this.props.form;
    const {queryMonitor} = this.state;
    return (
      <Form horizontal onSubmit={this.handleSubmit}>
        <FormItem label="当前群数据" labelCol={{span:3}} wrappCol={{span:22}}>
          <p className="ant-form-text">
            本次计划接入外部群{queryMonitor.monitor_cluster_cnt}个,已接入{queryMonitor.monitor_capture_cnt}个
          </p>
        </FormItem>
        <FormItem label="本次接入外部群的中间运营手机号" {...formItemLayout}>
          {getFieldDecorator("mobile",{
            initialValue:queryMonitor.mobile
          })(
           <Input/>
          )}
        </FormItem>
        <FormItem label="该运营号本次将接入外部群数量" labelCol={{span:6}} wrappCol={{span:18}}>
          {getFieldDecorator("monitor_cluster_cnt",{
            initialValue:queryMonitor.monitor_cluster_cnt
          })(
           <InputNumber/>
          )}
          <p className="ant-form-text">个</p>
        </FormItem>
        <FormItem label="运营号进群后，群成员需要" labelCol={{span:6}} wrappCol={{span:18}}>
          {getFieldDecorator("time_minutes",{
            initialValue:queryMonitor.time_minutes
          })(
           <InputNumber/>
          )}
            <p className="ant-form-text">分钟内,在群中顺序发出以下3条消息</p>
        </FormItem>
        <FormItem label="消息内容设置" {...formItemLayout}>
          {getFieldDecorator("text_key1",{
            initialValue:queryMonitor.text_key1
          })(
           <Input />
          )}
        </FormItem>
        <FormItem wrapperCol={{offset: 6, span: 6}}>
          {getFieldDecorator("text_key2",{
            initialValue:queryMonitor.text_key2
          })(
           <Input/>
          )}
        </FormItem>
        <FormItem  wrapperCol={{offset: 6, span: 6}}>
          {getFieldDecorator("text_key3",{
            initialValue:queryMonitor.text_key3
          })(
           <Input/>
          )}
        </FormItem>
        <FormItem label="商业属性" {...formItemLayout}>
          {getFieldDecorator('cluster_business',{
            initialValue:`${queryMonitor.cluster_business}`
          })(
            <Select allowClear placeholder="请选择商业属性" style={{width: 200}}>
              {
                this.state.clusterBusiness.map((item, idx)=> <Option key={idx}
                                                               value={`${item.item_value}`}>{item.item_name}</Option>)
              }
            </Select>
          )}
        </FormItem>
        <FormItem label="接入外部群" {...formItemLayout}>
          {getFieldDecorator("isMonitor",{
            initialValue:`${queryMonitor.isMonitor}`
          })(
            <Select style={{width: 200}}>
              <Option value="true">开启</Option>
              <Option value="false">关闭</Option>
            </Select>
          )}
        </FormItem>
        <FormItem wrapperCol={{offset: 6, span: 6}}>
          <Button type="primary" icon="check" size="large" htmlType="submit">提交</Button>
        </FormItem>
      </Form>
    );
  }
}
export default Form.create()(ExternalGroupAccessConfiguration);
