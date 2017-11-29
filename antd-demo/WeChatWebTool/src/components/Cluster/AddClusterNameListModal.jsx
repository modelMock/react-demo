import React from 'react';
import {Form, Row, Col, Input, Select, Button, Table, Tag,Modal,InputNumber,DatePicker} from 'antd';
import {Success, Confirm,Errors} from '../Commons/CommonConstants';
import CommonTable from '../Commons/CommonTable';
import clusterService from '../../services/clusterService';
const FormItem = Form.Item;
const Option = Select.Option;

class AddClusterNameListModal extends React.Component{
  constructor(props){
    super(props);
    this.state={
      visible:props.clusterNameVisible,
    };
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }
  handleOk(e){
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if(!!errors) return;
      Confirm(function(){
        clusterService.addClusterNamelist(values).then(({jsonResult})=>{
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
    return(
      <Modal visible={visible} maskClosable={false} title={`添加群名称`}
        onOk={this.handleOk} onCancel={this.handleCancel}
        footer={[
          <Button icon="poweroff" size="large" onClick={this.handleCancel}>取消</Button>,
          <Button type="primary" icon="check" size="large" onClick={this.handleOk}>提交</Button>
        ]}
        >
        <Form horizontal>
          <FormItem label="群名称" {...formItemLayout} required>
            {getFieldDecorator('cluster_name', {initialValue:"",rules:[{required:true, message:"请输入群名称"}]})(
              <Input/>
            )}
          </FormItem>
          <FormItem label="备注" {...formItemLayout} >
            {getFieldDecorator('remark', {initialValue:""})(
              <Input />
            )}
          </FormItem>
        </Form>
    </Modal>
    );
  }
}
export default Form.create()(AddClusterNameListModal);
