import React from 'react';
import {Modal, Form, Input, Button} from 'antd';
import {updateCluster} from '../../services/cluster';
import {Confirm, Success} from '../Commons/CommonConstants';
const FormItem = Form.Item;
/**
 * 编辑群主信息
 */
class EditClusterModal extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      visible: props.editVisible,
      record: props.record,
    }
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    console.log('EditClusterModal => constructor', props)
  }
  handleOk(){
    this.props.form.validateFields((errors, values) => {
      if(!!errors)return;
      Confirm(function(){
        updateCluster(values).then(({jsonResult}) => {
          Success("修改群信息成功");
          this.handleCancel();
          this.props.onRefresh();
        });
      }.bind(this), "确定修改群信息吗?")
    })
  }
  handleCancel(){
    this.setState({visible: false});
    this.props.form.resetFields();
    this.props.onUpdateVisible();
  }
  render(){
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    }
    const {visible, record} = this.state;
    const {getFieldDecorator} = this.props.form;
    return (
      <Modal visible={visible} maskClosable={false} title={`编辑群信息[群ID: ${record.cluster_sn}]`}
        onOk={this.handleOk} onCancel={this.handleCancel}
        footer={[
          <Button icon="poweroff" size="large" onClick={this.handleCancel}>取消</Button>,
          <Button type="primary" icon="check" size="large" onClick={this.handleOk}>提交</Button>
        ]}>
        <Form horizontal>
          {getFieldDecorator('cluster_sn', { initialValue: record.cluster_sn })(
            <Input type="hidden"/>
          )}
          <FormItem label="初创群运营手机号" {...formItemLayout}>
            <p className="ant-form-text">{record.create_master_info}</p>
          </FormItem>
          <FormItem label="当前群主" {...formItemLayout} style={{marginTop: -18}}>
            <p className="ant-form-text">{record.master_info}</p>
          </FormItem>
          <FormItem label="群名称" {...formItemLayout} help="最多输入16个汉字" style={{marginTop: -12}} required>
            {getFieldDecorator('cluster_name', {
              initialValue: record.cluster_name,
              rules:[{required: true, max: 16, message: '群名称最多输入16个汉字'}]}
            )(
              <Input placeholder="请输入群名称" />
            )}
          </FormItem>
          <FormItem label="群公告" {...formItemLayout} required>
            {getFieldDecorator('cluster_notice', {
              initialValue: record.cluster_notice,
              rules:[{required: true}]}
            )(
              <Input type="textarea" rows={3} placeholder="请输入群公告" />
            )}
          </FormItem>
          <FormItem label="邀请进群说明" {...formItemLayout} required>
            {getFieldDecorator('invite_info', {
              initialValue: record.invite_info,
              rules:[{required: true}]}
            )(
              <Input type="textarea" rows={5} placeholder="邀请好友进群，跟ta说句话吧~" />
            )}
          </FormItem>
          <div style={{textAlign: 'center', marginTop: -16}}>
            <img width="150" height="150" src={record.cluster_pic_url} />
          </div>
        </Form>
      </Modal>
    );
  }
}
export default Form.create()(EditClusterModal);
