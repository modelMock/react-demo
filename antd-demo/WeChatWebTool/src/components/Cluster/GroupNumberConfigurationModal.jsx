import React from 'react';
import {Form, Row, Col, Input, Select, Button, Table, Tag,Modal,InputNumber,DatePicker} from 'antd';
import {Success, Confirm,Errors} from '../Commons/CommonConstants';
import CommonTable from '../Commons/CommonTable';
import clusterService from '../../services/clusterService';
const FormItem = Form.Item;
const Option = Select.Option;

class GroupNumberConfigurationModal extends React.Component{
  constructor(props){
    super(props);
    this.state={
      visible:props.numberVisible,
      numberResult:0
    };
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }
  handleOk(){
    this.props.form.validateFields((errors, values) => {
      if(!!errors) return;
      Confirm(function(){
        clusterService.saveCluseterNameLimitedCount(values).then(({jsonResult})=>{
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
  componentDidMount(){
    clusterService.queryCluseterNameLimitedCount().then(({jsonResult})=>{
      if(!jsonResult){return;}
      this.setState({numberResult:jsonResult});
    });
  }

  render(){
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 14 },
    };
    const {getFieldDecorator} = this.props.form;
    const {visible,numberResult} = this.state;
    return(
      <Modal visible={visible} maskClosable={false} title={`群个数配置`}
        onOk={this.handleOk} onCancel={this.handleCancel}
        footer={[
          <Button icon="poweroff" size="large" onClick={this.handleCancel}>取消</Button>,
          <Button type="primary" icon="check" size="large" onClick={this.handleOk}>提交</Button>
        ]}
        >
        <Form horizontal>
          <FormItem label="相同群名称的群个数上限" {...formItemLayout} >
            {getFieldDecorator('limit_count', {initialValue:numberResult,rules:[{required:true, message:"请输入群个数上限"}]})(
              <InputNumber style={{width:150}} min={0}/>
            )}
            <p className="ant-form-text">个</p>
          </FormItem>

        </Form>
    </Modal>
    );
  }
}
export default Form.create()(GroupNumberConfigurationModal);
