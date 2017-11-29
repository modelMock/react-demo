import React from 'react';
import {Form, Row, Col, Input, Select, Button, Table, Tag,Modal,InputNumber,DatePicker} from 'antd';
import {Success, Confirm,Errors} from '../Commons/CommonConstants';
import clusterService from '../../services/clusterService';
const FormItem = Form.Item;
const Option = Select.Option;

class OperatorallianceManagementModal extends React.Component{
  constructor(props){
    super(props);
    this.state={
      visible:props.allianceVisible,
      clusterBusinessOperator:[]
    };
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }
  handleOk(e){
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if(!!errors) return;
      Confirm(function(){
        clusterService.addTaopwd(values).then(({jsonResult})=>{
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
    //查询运营方
    clusterService.queryClusterBusinessOperator().then(({jsonResult})=> {
        if(!jsonResult) return;
        this.setState({
        clusterBusinessOperator: jsonResult
      });
    });
  }

  render(){
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const {getFieldDecorator} = this.props.form;
    const {visible} = this.state;
    return(
      <Modal visible={visible} maskClosable={false} title={`添加联盟号`}
        onOk={this.handleOk} onCancel={this.handleCancel}
        footer={[
          <Button icon="poweroff" size="large" onClick={this.handleCancel}>取消</Button>,
          <Button type="primary" icon="check" size="large" onClick={this.handleOk}>提交</Button>
        ]}
        >
        <Form horizontal>
          <FormItem label="运营方" {...formItemLayout}>
            {getFieldDecorator("business_operator")(
              <Select allowClear placeholder="请选择运营方">
                {
                  this.state.clusterBusinessOperator.map((item, idx)=> <Option key={idx}
                                                                 value={`${item.item_value}`}>{item.item_name}</Option>)
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="联盟号" {...formItemLayout} >
            {getFieldDecorator('pid', {initialValue:""})(
              <Input />
            )}
          </FormItem>
          <FormItem label="所属淘宝账号" {...formItemLayout} >
            {getFieldDecorator('tao_pwd', {initialValue:""})(
              <Input />
            )}
          </FormItem>
          <FormItem label="验证位置" {...formItemLayout}>
            {getFieldDecorator('check_kind', {initialValue:''})(
              <Select allowClear placeholder="请选择验证位置">
                <Option value="CLUSTER_MESSAGE">群消息</Option>
                <Option value="PUBLISH">朋友圈</Option>
              </Select>
            )}
          </FormItem>
        </Form>
    </Modal>
    );
  }
}
export default Form.create()(OperatorallianceManagementModal);
