import React from 'react'
import {Form, Button, Modal,Select} from 'antd'
import {Success, Confirm} from '../Commons/CommonConstants'
import {updateRecycleOperation} from '../../services/showAnchor'
const FormItem = Form.Item
/**
 * 主播运营号回收
 */
 class RecycleOperationModal extends React.Component{
   constructor(props){
     super(props)
     this.handleOk = this.handleOk.bind(this)
     this.handleCancel = this.handleCancel.bind(this)
   }
   handleOk(){
     this.props.form.validateFields((errors, values) => {
       if( errors ) return false
       const {anchorInfo, operationSn} = this.props
       const assign_anchor_id = anchorInfo.assign_anchor_id
       const operationSnList = operationSn
       const all_flag = values.all_flag
       Confirm(() => {
         updateRecycleOperation({assign_anchor_id, operationSnList, all_flag}).then(() => {
           Success("回收成功!")
           this.props.onClose(true)
         })
       }, "确定运营号回收吗?")
     })
   }
   handleCancel(){
     this.props.onClose(false)
   }
   render(){
     const {visible, selectedRows, anchorInfo} = this.props
     const {getFieldDecorator} = this.props.form
     const formItemLayout = {
       labelCol: {span: 6},
       wrapperCol: {span: 16}
     }
     return (
       <Modal visible={visible}
              maskClosable={false}
              title={`运营号回收`}
              onOk={this.handleOk}
              onCancel={this.handleCancel}
              footer={[
                <Button icon="poweroff" size="large" onClick={this.handleCancel}>取消</Button>,
                <Button type="primary" icon="check" size="large" onClick={this.handleOk}>提交</Button>
              ]}>
         <Form horizontal>
           <FormItem label="主播名称" {...formItemLayout} style={{marginTop: -12}}>
             <span style={{with:'60px'}}>{anchorInfo.anchor_name}</span>
            </FormItem>
            <FormItem {...formItemLayout} label={`已选择${selectedRows.length}个运营号`}>
              <p className="ant-form-text" id="userName" name="userName" >
                {selectedRows.map((item, idx)=> <span style={{ color:'red' }}>{item.mobile},</span>)}
              </p>
            </FormItem>
            <FormItem label="是否回收全部运营号" {...formItemLayout}>
              {getFieldDecorator('all_flag')(
                <Select allowClear >
                  <Select.Option value="T">是</Select.Option>
                  <Select.Option value="F">不是</Select.Option>
                </Select>
              )}
            </FormItem>
         </Form>
       </Modal>
     );
   }
 }
 export default Form.create({
   mapPropsToFields(props){
     return {
       all_flag: {
         value: props.selectedRows.length > 0 ? "F" : "T"
       }
     }
   }
 })(RecycleOperationModal);
