import React from 'react';
import {Form, Input, Button, Modal,Select} from 'antd';
import {Success, Confirm} from '../Commons/CommonConstants';
import {batchClearClusterWelcomeInfo} from '../../services/cluster';
const FormItem = Form.Item;
/**
 * 关闭进群欢迎用语
 */
 class CloseIntoGroupWelcome extends React.Component{
   constructor(props){
     super(props);
     this.state={
       visible: props.closeWelcomeVisible,
       record: props.closeIntoGroupWelcomeDetails,
     }
     this.handleOk = this.handleOk.bind(this);
     this.handleCancel = this.handleCancel.bind(this);
   }
   handleOk(){
     this.props.form.validateFields((errors, values) => {
       if(!!errors) return;
       Confirm(function(){
          console.log("this.props.clusterSns",this.props.clusterSns);
         batchClearClusterWelcomeInfo({cluster_sn_list:this.props.clusterSns,all_flag:values.all_flag}).then(({jsonResult}) => {
           Success("关闭成功");
           this.handleCancel();
         });
       }.bind(this), "确定关闭进群欢迎用语吗?")
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
       <Modal visible={visible} maskClosable={false} title={`关闭进群欢迎用语`}
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
            <FormItem label="是否全部群" {...formItemLayout}>
              {getFieldDecorator('all_flag', {initialValue:''})(
                <Select allowClear >
                  <Select.Option value="T">是</Select.Option>
                  <Select.Option value="">不是</Select.Option>
                </Select>
              )}
            </FormItem>
         </Form>
       </Modal>
     );
   }
 }
 export default Form.create()(CloseIntoGroupWelcome);
