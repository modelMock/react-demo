import React,{Component} from 'react';
import {Form ,Icon,Select,Row,Col,Input,Button,Modal,Upload} from 'antd';
import ContentService from '../../services/content';
import {Confirm, Success,Errors} from '../Commons/CommonConstants';
const FormItem = Form.Item;
const Option= Select.Option;
/**
 * 内容库=>批量重用
 */
 class ReuseShowPublishLibModal extends Component{
   constructor(props){
     super(props);
     this.state={
       visible:props.reuseShowVisible,
     };
     this.handleOk = this.handleOk.bind(this);
     this.handleCancel = this.handleCancel.bind(this);
   }

   handleOk(e){
     e.preventDefault();
     this.props.form.validateFields((errors, values) => {
       if(!!errors) return;
       Confirm(function(){
         ContentService.reuseShowPublishLib({record_ids:this.props.recordKeys}).then(({jsonResult})=>{
           Success("提交成功!");
           this.handleCancel();
           this.props.onRefresh();
         });
       }.bind(this), "确定提交吗?");
     });
   }
   handleCancel(){
     this.setState({visible:false});
     this.props.onUpdateVisible();
   }

   render(){
     const formItemLayout = {
       labelCol: { span: 6 },
       wrapperCol: { span: 14 },
     };
     const {getFieldDecorator} = this.props.form;
     const {visible} = this.state;
     const {recordKeys}=this.props;
     return(
       <Modal visible={visible} maskClosable={false} title={`作废`}
          onCancel={this.handleCancel} onOk={this.handleOk}
         footer={[
           <Button icon="poweroff" size="large" onClick={this.handleCancel}>取消</Button>,
           <Button type="primary" icon="check" size="large" onClick={this.handleOk}>提交</Button>
         ]}
         >
         <Form horizontal>
           <FormItem label="内容库记录id" {...formItemLayout}>
             {
               Object.keys(recordKeys).map(key=>{
                 let  value= recordKeys[key]
                 return <span>{value},</span>
               })
             }
           </FormItem>
        </Form>
    </Modal>
     );
   }
 }
export default Form.create()(ReuseShowPublishLibModal);
