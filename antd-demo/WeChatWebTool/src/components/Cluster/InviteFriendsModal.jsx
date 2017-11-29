import React from 'react';
import {Form, Input, InputNumber, Button, Modal} from 'antd';
import {Success, Confirm} from '../Commons/CommonConstants'
import {saveInviteFriendCnt} from '../../services/../services/cluster';
const FormItem = Form.Item;
/**
 * 邀请好友进群
 */
class InviteFriendsModal extends React.Component{
  constructor(props){
    super(props);
    this.state={
      visible: props.inviteVisible,
      cluster_sn: props.cluster_sn,
      inviteFrdData: props.inviteFrdData,
    }
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }
  handleOk(){
    this.props.form.validateFields((errors, values) => {
      if(!!errors) return;
      Confirm(function(){
        let params = [];
        for(let [key, value] of Object.entries(values)){
          params.push({"operation_sn": key, "inivte_friend_cnt": value});
        }
        saveInviteFriendCnt(this.state.cluster_sn, params).then(({jsonResult}) => {
          Success("邀请进群成功");
          this.handleCancel();
          this.props.onRefresh();
        });
      }.bind(this), "确定邀请好友进群吗?");
    });
  }
  handleCancel(){
    this.setState({
      visible: false
    });
    this.props.form.resetFields();
    this.props.onUpdateVisible();
  }
  render(){
    console.log('InviteFriendsModal => render')
    const {visible, cluster_sn, inviteFrdData} = this.state;
    return (
      <Modal visible={visible} maskClosable={false} width={650} title={`邀请好友进群[群ID: ${cluster_sn}]`}
        onOk={this.handleOk} onCancel={this.handleCancel}
        footer={[
          <Button icon="poweroff" size="large" onClick={this.handleCancel}>取消</Button>,
          <Button type="primary" icon="check" size="large" onClick={this.handleOk}>提交</Button>
        ]}>
        <Form horizontal>
          <p className="ant-form-text" style={{marginBottom: 8}}>
            邀请本群中运营号的好友进群（可用运营号{inviteFrdData.active_opts}个）：
          </p>
           {
             inviteFrdData.operationStatisticsList.map(obj => (
               this.renderInviteItem(obj)
             ))
           }
        </Form>
      </Modal>
    )
  }
  renderInviteItem(obj){
    const {getFieldDecorator} = this.props.form;
    return (
      <FormItem labelCol={{span: 3}} wrapperCol={{span: 21}} label="运营号" key={obj.mobile}>
        <p className="ant-form-text">{obj.mobile}</p>
        {this.renderInviteTxt(obj.status)}
        {getFieldDecorator(obj.mobile, {
          initialValue: obj.invite_friend_cnt,
          rules:[{required: true, type: 'number', message: '请输入邀请进群人数'}]
        })(
          <InputNumber min={1} max={obj.invite_friend_cnt} />
        )}
        <p className="ant-form-text">人进群</p>
        <p className="ant-form-text">当前可邀请进群{obj.invite_friend_cnt}人，群中好友{obj.friend_cnt}人</p>
      </FormItem>
    );
  }
  renderInviteTxt(status){
    if(status === 'ACTIVE'){
      return <p className="ant-form-text" style={{marginLeft: 48}}>可邀请</p>
    }else if(status === 'UNACCOUNT'){
      return <p className="ant-form-text" style={{marginLeft: 24}}>不可用邀请</p>
    }else if(status === 'NOTACCOUNT'){
      return <p className="ant-form-text" style={{marginLeft: 24}}>冻结可邀请</p>
    }else if(status === 'PWERROR'){
      return <p className="ant-form-text" style={{marginLeft: 24}}>密错可邀请</p>
    }
  }
}

export default Form.create()(InviteFriendsModal);
