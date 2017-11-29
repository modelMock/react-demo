import React from 'react';
import {Form, Input, Button, Modal,Select} from 'antd';
import {Success, Confirm,Errors} from '../Commons/CommonConstants';
import {querySelectedParty,batchUpdateSysOptrSelectedParty} from '../../services/optr';
const FormItem = Form.Item;
/**
 * 设置选品方
 */
 class SetOptrSelectedParty extends React.Component{
   constructor(props){
     super(props);
     this.state={
       visible: props.selectedPartyVisible,
       record: [],
     };
     this.handleOk = this.handleOk.bind(this);
     this.handleCancel = this.handleCancel.bind(this);
   }
   handleOk(){
     this.props.form.validateFields((errors, values) => {
       if(!!errors) return;
       Confirm(function(){
       batchUpdateSysOptrSelectedParty({selected_party:values.selected_party,optr_ids:this.props.optrId}).then(({jsonResult}) => {
         Success("设置成功");
         this.handleCancel();
       });
     }.bind(this), "确定设置选品方吗?");
   });
   }
   handleCancel(){
     this.setState({
       visible: false,
     });
     this.props.onUpdateVisible();
     this.props.onRefreshTable();
   }
   componentDidMount(){
     querySelectedParty().then(({jsonResult})=> {
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
     const {visible, record} = this.state;
     console.log("record=>",record);
     return (
       <Modal visible={visible} maskClosable={false} title={`设置选品方`}
         onOk={this.handleOk} onCancel={this.handleCancel}
         footer={[
           <Button icon="poweroff" size="large" onClick={this.handleCancel}>取消</Button>,
           <Button type="primary" icon="check" size="large" onClick={this.handleOk}>提交</Button>
         ]}>
         <Form horizontal>
           <FormItem label="客服ID" {...formItemLayout} style={{marginTop: -12}}>
             <p>
               {
                this.props.optrRowsDetails.map((item, idx)=> <span style={{with:'60px'}}>{item.optr_id},</span>)
               }
            </p>
           </FormItem>
           <FormItem label="选品方" {...formItemLayout}>
             {getFieldDecorator("selected_party",{initialValue:'',rules:[{required:true, message:"请选择选品方"}]})(
               <Select
                 allowClear
                 placeholder="请选择选品方">
                 {
                   record.map((item, idx)=> <Option key={idx}
                                                value={item.item_value}>{item.item_name}</Option>)
                 }
               </Select>
             )}
           </FormItem>
         </Form>
       </Modal>
     );
   }
 }
 export default Form.create()(SetOptrSelectedParty);
