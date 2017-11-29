import React from 'react';
import {Form, Input, Button, Modal} from 'antd';
import {Success, Confirm} from '../Commons/CommonConstants';
import {transferCluster} from '../../services/../services/cluster';
const FormItem = Form.Item;
/**
 * 转让群主
 */
class TransferCluster extends React.Component{
  constructor(props){
    super(props);
    this.state={
      visible: props.transferVisible,
      record: props.record,
    }
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }
  handleOk(){
    this.props.form.validateFields((errors, values) => {
      if(!!errors) return;
      Confirm(function(){
        transferCluster(values).then(({jsonResult}) => {
          Success("转让群主成功");
          this.handleCancel();
          this.props.onRefresh();
        });
      }.bind(this), "确定转让群主吗?")
    })
  }
  handleCancel(){
    this.setState({
      visible: false,
    });
    this.props.form.resetFields();
    this.props.onUpdateVisible();
  }
  render(){
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 14}
    }
    const {getFieldDecorator} = this.props.form;
    const {visible, record} = this.state;
    return (
      <Modal visible={visible} maskClosable={false} title={`转让群主`}
        onOk={this.handleOk} onCancel={this.handleCancel}
        footer={[
          <Button icon="poweroff" size="large" onClick={this.handleCancel}>取消</Button>,
          <Button type="primary" icon="check" size="large" onClick={this.handleOk}>提交</Button>
        ]}>
        <Form horizontal>
          {getFieldDecorator("cluster_sn", {
            initialValue: record.cluster_sn
          })(
            <Input type='hidden' />
          )}
          <FormItem>
            <p className="ant-form-text">注：请确保新群主在群中，且是群中某个可用状态运营号的好友</p>
          </FormItem>
          <FormItem label="原始群主手机号" {...formItemLayout}>
            <p className="ant-form-text">{record.create_master_info}</p>
          </FormItem>

          <FormItem label="新群主" {...formItemLayout}>
            {getFieldDecorator('new_master_info', {
              rules: [{required: true, type: 'string', message: '请输入手机号/微信号/QQ号'}]
            })(
              <Input placeholder="手机号/微信号/QQ号" />
            )}
          </FormItem>
          <FormItem label="群成员运营号" {...formItemLayout}>
            {getFieldDecorator('oper_moblie', {
              rules: [{required: true, type: 'string', message: '请输入运营手机号'}]
            })(
              <Input placeholder="运营手机号，输入一个即可" />
            )}
            <p className="ant-form-text">注：新群主是群中哪个可用状态运营号的好友</p>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
export default Form.create()(TransferCluster);
