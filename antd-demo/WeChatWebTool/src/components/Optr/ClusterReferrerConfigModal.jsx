import React from 'react';
import {Form, Input, Button,Row, Col,Modal,Select,InputNumber} from 'antd';
import {Success, Confirm} from '../Commons/CommonConstants';
import {queryBusinessOperator,
  batchUpdateSysOptrBusinessOperator,
  queryClusterReferrerConfig,
  queryClusterBusinessOperator,
  saveClusterReferrerConfig} from '../../services/optr';
const FormItem = Form.Item;
const Option = Select.Option;
/**
 * 客服设置运营方
 */
 class ClusterReferrerConfigModal extends React.Component{
   constructor(props){
     super(props);
     this.state={
       configData:{},//群客服自动分配参数
       visible: props.clusterReferrerConfigVisible,
       optrBusinessOperator:[],//运营方数据
       configDataOperator:[],//运营方初始化数据
     };
     this.handleOk = this.handleOk.bind(this);
     this.handleCancel = this.handleCancel.bind(this);
   }
   handleOk(){
     this.props.form.validateFields((errors, values) => {
       if(!!errors) return;
       console.log("values",values);
       const array = [], busiOptrStr = "business_operator", clusterCountStr = "cluster_count";
       const processFun = (objKey,value,constKey, array) => {
         if(objKey.startsWith(constKey)){
           const index = parseInt(objKey.substring(constKey.length))
           if(array.length > index){
             array[index][constKey] = value
           } else {
             const obj = {}
             obj[constKey] = value
             array.push(obj)
           }
         }
       }
       for(let [key, value] of Object.entries(values)){
         processFun(key,value, busiOptrStr, array);
         processFun(key,value, clusterCountStr, array);
       }
       console.log("array",array);
       Confirm(function(){
       saveClusterReferrerConfig({team_referrer_count:values.team_referrer_count,referrer_max_cluster:values.referrer_max_cluster,business_operator_param_list:array}).then(({jsonResult}) => {
         Success("设置成功");
         this.handleCancel();
         this.props.onRefresh();
       });
     }.bind(this), "确定设置自动分配吗?");
   });
   }
   handleCancel(){
     this.setState({
       visible: false,
     });
     this.props.updateVisible();
   }
   componentDidMount(){
     //提取群客服自动分配参数
     queryClusterReferrerConfig().then(({jsonResult})=> {
         if(!jsonResult) return;
         console.log("jsonResult",jsonResult)
         this.setState({
         configData: jsonResult,
         configDataOperator:jsonResult.business_operator_param_list
       });
     });
     //查询运营方
     queryClusterBusinessOperator().then(({jsonResult})=> {
         if(!jsonResult) return;
         this.setState({
         optrBusinessOperator: jsonResult
       });
     });
   }
   render(){
     const formItemLayout = {
       labelCol: {span: 12},
       wrapperCol: {span: 12}
     }
     const {getFieldDecorator} = this.props.form;
     const {visible,configData,optrBusinessOperator,configDataOperator} = this.state;
     console.log("configData=>",configData,configDataOperator);
     return (
       <Modal visible={visible} maskClosable={false} title={`群客服自动配置`} width={800}
         onOk={this.handleOk} onCancel={this.handleCancel}
         footer={[
           <Button icon="poweroff" size="large" onClick={this.handleCancel}>取消</Button>,
           <Button type="primary" icon="check" size="large" onClick={this.handleOk}>提交</Button>
         ]}>
         <Form horizontal>
           <Row gutter={16}>
             <Col sm={12}>
               <FormItem label="推荐专员号分组个数" {...formItemLayout}>
                 {getFieldDecorator("team_referrer_count",{initialValue:configData.team_referrer_count})(
                   <InputNumber />
                 )}
                 <p className="ant-form-text">个一组;</p>
               </FormItem>
             </Col>
             <Col sm={12}>
               <FormItem label="同一组号允许最多同时配进" {...formItemLayout}>
                 {getFieldDecorator('referrer_max_cluster', {initialValue:configData.referrer_max_cluster})(
                   <InputNumber />
                 )}
                 <p className="ant-form-text">个群</p>
               </FormItem>
             </Col>
           </Row>
           {
             configDataOperator.length>0?
             <div>
             {
               configDataOperator.map((items, idx)=>{
                 return(
                   <FormItem label="运营方" labelCol={{span: 4}} wrapperCol={{span: 20}}>
                     {getFieldDecorator(`business_operator${idx}`, {initialValue:items.business_operator})(
                       <Select style={{width:100}} disabled>
                         <Option value="">全部</Option>
                         {
                           optrBusinessOperator.map((item, idx)=> <Option value={`${item.item_value}`}>{item.item_name}</Option>)
                         }
                       </Select>
                     )}
                     {getFieldDecorator(`cluster_count${idx}`, {initialValue:items.cluster_count})(
                       <InputNumber style={{marginLeft:20}}/>
                     )}
                     <p className="ant-form-text">个群，分配同一组推荐专员号，由一个客服管理</p>
                   </FormItem>
                 )
               })
             }
             </div>
             :
             <div>
             <FormItem label="运营方" labelCol={{span: 4}} wrapperCol={{span: 20}}>
               {getFieldDecorator("business_operator0", {initialValue:""})(
                 <Select style={{width:100}} disabled>
                   <Option value="">全部</Option>
                   {
                     optrBusinessOperator.map((item, idx)=> <Option value={`${item.item_value}`}>{item.item_name}</Option>)
                   }
                 </Select>
               )}
               {getFieldDecorator("cluster_count0", {initialValue:""})(
                 <InputNumber style={{marginLeft:20}}/>
               )}
               <p className="ant-form-text">个群，分配同一组推荐专员号，由一个客服管理</p>
             </FormItem>
             <FormItem label="运营方" labelCol={{span: 4}} wrapperCol={{span: 20}}>
               {getFieldDecorator("business_operator1", {initialValue:""})(
                 <Select style={{width:100}} disabled>
                   <Option value="">全部</Option>
                   {
                     optrBusinessOperator.map((item, idx)=> <Option value={`${item.item_value}`}>{item.item_name}</Option>)
                   }
                 </Select>
               )}
               {getFieldDecorator("cluster_count1", {initialValue:""})(
                 <InputNumber style={{marginLeft:20}}/>
               )}
               <p className="ant-form-text">个群，分配同一组推荐专员号，由一个客服管理</p>
             </FormItem>
             </div>
           }
         </Form>
       </Modal>
     );
   }
 }
 export default Form.create()(ClusterReferrerConfigModal);
