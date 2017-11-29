import React from 'react';
import {Form, Input, Button, Modal,Select} from 'antd';
import {Success, Confirm} from '../Commons/CommonConstants';
import {queryBusinessOperator,batchupdateClusterBusinessOperator} from '../../services/cluster';
const FormItem = Form.Item;
/**
 * 设置运营方
 */
 class BusinessOperator extends React.Component{
   constructor(props){
     super(props);
     this.state={
       RowsDetails:props.businessOperatorDetails,
       visible: props.businessOperator,
       record: [],
       filterValue:[]
     };
     this.handleOk = this.handleOk.bind(this);
     this.handleCancel = this.handleCancel.bind(this);
     this.handleChange=this.handleChange.bind(this);
   }
   handleOk(){
     this.props.form.validateFields((errors, values) => {
       if(!!errors) return;
       Confirm(function(){
       batchupdateClusterBusinessOperator({business_operator:values.business_operator,cluster_sn_list:this.props.clusterSns}).then(({jsonResult}) => {
         Success("设置成功");
         this.handleCancel();
       });
     }.bind(this), "确定设置运营方吗?");
   });
   }
   handleCancel(){
     this.setState({
       visible: false,
     });
     this.props.onUpdateVisible();
     this.props.onRefresh();
     this.props.handleSubmitCallback();
   }
   handleChange(value){
     let filterValue = this.state.record.filter((ads,idx)=> {
       return ads.value===value;
     });
     console.log(`selected ${value}`,filterValue);
     this.setState({filterValue});
   }
   componentDidMount(){
     queryBusinessOperator().then(({jsonResult})=> {
         if(!jsonResult) return;
         this.setState({
         record: jsonResult
       });
     });
   }
   render(){
     const formItemLayout = {
       labelCol: {span: 8},
       wrapperCol: {span: 14}
     }
     const {getFieldDecorator} = this.props.form;
     const {visible, record,RowsDetails,filterValue} = this.state;
     console.log("record=>",record);
     return (
       <Modal visible={visible} maskClosable={false} title={`设置运营方`}
         onOk={this.handleOk} onCancel={this.handleCancel}
         footer={[
           <Button icon="poweroff" size="large" onClick={this.handleCancel}>取消</Button>,
           <Button type="primary" icon="check" size="large" onClick={this.handleOk}>提交</Button>
         ]}>
         <Form horizontal>
           <FormItem label="群ID" {...formItemLayout} style={{marginTop: -12}}>
             <p>
               {
                RowsDetails.map((item, idx)=> <span style={{with:'60px'}}>{item.cluster_id},</span>)
               }
            </p>
           </FormItem>
           <FormItem label="运营方" {...formItemLayout}>
             {getFieldDecorator("business_operator",{initialValue:'',rules:[{required:true, message:"请选择运营方"}]})(
               <Select
                 allowClear
                 onChange={this.handleChange}
                 placeholder="请选择运营方">
                 {
                   record.map((item, idx)=> <Option key={idx}
                                                value={`${item.value}`}>{item.name}</Option>)
                 }
               </Select>
             )}
           </FormItem>
           <FormItem label="组号" {...formItemLayout}>
             {
               filterValue.map((item, idx)=> <p>{item.wechat_groups_text}</p>)
             }
           </FormItem>
         </Form>
       </Modal>
     );
   }
 }
 export default Form.create()(BusinessOperator);
