import React from 'react';
import {Form, Input, Button, Modal,Select} from 'antd';
import {Success, Confirm,Errors} from '../Commons/CommonConstants';
import {batchUpdateClusterWelcomeInfo} from '../../services/cluster';
const FormItem = Form.Item;
/**
 * 开启进群欢迎用语
 */
 class OpenIntoGroupWelcome extends React.Component{
   constructor(props){
     super(props);
     this.state={
       visible: props.openWelcomeVisible,
       record: props.openIntoGroupWelcomeDetails,
     }
     this.handleOk = this.handleOk.bind(this);
     this.handleCancel = this.handleCancel.bind(this);
   }
   handleOk(){
     this.props.form.validateFields((errors, values) => {
       if(values.invite_info==null||values.invite_info=='') {
         Errors("进群欢迎用语不能为空！");
         return;
       }
       let value={
         cluster_sn_list:this.props.clusterSns,
         invite_info:values.invite_info,
         all_flag:values.all_flag,
         default_flag:values.default_flag
       };
       Confirm(function(){
         console.log("this.props.clusterSns",this.props.clusterSns);
         batchUpdateClusterWelcomeInfo(value).then(({jsonResult}) => {
           Success("开启成功");
           this.handleCancel();
         });
       }.bind(this), "确定开启进群欢迎用语吗?")
     })
   }
   handleCancel(){
     this.setState({
       visible: false,
     });
     this.props.onUpdateVisible();
     this.props.onRefresh();
     this.props.handleSubmitCallback();

   }
   render(){
     const formItemLayout = {
       labelCol: {span: 8},
       wrapperCol: {span: 14}
     }
     const {getFieldDecorator} = this.props.form;
     const {visible, record} = this.state;
     return (
       <Modal visible={visible} maskClosable={false} title={`开启进群欢迎用语`}
         onOk={this.handleOk} onCancel={this.handleCancel}
         footer={[
           <Button icon="poweroff" size="large" onClick={this.handleCancel}>取消</Button>,
           <Button type="primary" icon="check" size="large" onClick={this.handleOk}>提交</Button>
         ]}>
         <Form horizontal>
           <FormItem label="群ID" {...formItemLayout} style={{marginTop: -12}}>
             <p>
               {
                record.map((item, idx)=> <span style={{with:'60px'}}>{item.cluster_id},</span>)
               }
            </p>
           </FormItem>
           <FormItem label="是否默认" {...formItemLayout}>
             {getFieldDecorator('default_flag', {initialValue:'F'})(
               <Select allowClear >
                 <Select.Option value="T">是</Select.Option>
                 <Select.Option value="F">不是</Select.Option>
               </Select>
             )}
           </FormItem>
           <FormItem label="是否全部群" {...formItemLayout}>
             {getFieldDecorator('all_flag', {initialValue:''})(
               <Select allowClear >
                 <Select.Option value="T">是</Select.Option>
                 <Select.Option value="">不是</Select.Option>
               </Select>
             )}
           </FormItem>
           <FormItem label="进群欢迎用语" {...formItemLayout} required>
             {getFieldDecorator('invite_info', {
               initialValue:"",
               }
             )(
               <Input type="textarea" rows={5} placeholder="进群欢迎用语，跟ta说句话吧~"/>
             )}
            </FormItem>
         </Form>
       </Modal>
     );
   }
 }
 export default Form.create()(OpenIntoGroupWelcome);
