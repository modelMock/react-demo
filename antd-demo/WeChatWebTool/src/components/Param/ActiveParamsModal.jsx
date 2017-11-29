import React from 'react';
import {Form, Input, Button, Modal,Select} from 'antd';
import {Success, Confirm,Errors} from '../Commons/CommonConstants';
import {queryCultivateList, openOrCloseCultivate,addCultivate} from '../../services/params';
const FormItem = Form.Item;
/**
 * 添加活跃
 */
 class ActiveParamsModal extends React.Component{
   constructor(props){
     super(props);
     this.state={
       visible: props.addCultivateVisible,
     };
     this.handleOk = this.handleOk.bind(this);
     this.handleCancel = this.handleCancel.bind(this);
   }
   handleOk(){
     this.props.form.validateFields((errors, values) => {
       if(!!errors) {
         return;
       }
       Confirm(function(){
         addCultivate(values).then(({jsonResult}) => {
           Success("添加成功！");
           this.handleCancel();
         });
       }.bind(this), "确定添加活跃吗?");
       });
   }
   handleCancel(){
     this.setState({
       visible: false,
     });
     this.props.updateVisible();
   }
   render(){
     const formItemLayout = {
       labelCol: {span: 8},
       wrapperCol: {span: 14}
     }
     const {getFieldDecorator} = this.props.form;
     const {visible, record} = this.state;
     return (
       <Modal visible={visible} maskClosable={false} title={`添加活跃`}
         onOk={this.handleOk} onCancel={this.handleCancel}
         footer={[
           <Button icon="poweroff" size="large" onClick={this.handleCancel}>取消</Button>,
           <Button type="primary" icon="check" size="large" onClick={this.handleOk}>提交</Button>
         ]}>
         <Form horizontal>
           <FormItem label="运营组号" {...formItemLayout}>
             {getFieldDecorator('wechat_group',{rules: [{ required: true, message: '请输入运营组号' }]})(
               <Input  placeholder="请输入运营组号"/>
             )}
           </FormItem>
           <FormItem label="活跃类型" {...formItemLayout}>
             {getFieldDecorator('cultivate_type',{rules: [{ required: true, message: '请选择活跃类型' }]})(
               <Select allowClear placeholder="请选择活跃类型">
                 <Option value="Publish">朋友圈</Option>
                 <Option value="Cluster">群聊</Option>
                 <Option value="Chat">单聊</Option>
               </Select>
             )}
           </FormItem>
         </Form>
       </Modal>
     );
   }
 }
 export default Form.create()(ActiveParamsModal);
