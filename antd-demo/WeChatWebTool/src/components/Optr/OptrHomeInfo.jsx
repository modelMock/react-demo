import React, { Component } from 'react';
import { Form, Input, Button, Row, Col } from 'antd';
import './OptrHomeInfo.less';
import md5 from 'blueimp-md5';
import { updatePasswd, updateSysOptrName } from '../../services/optr';
import { Confirm, Success, Errors } from '../Commons/CommonConstants';
import {optr_id} from '../../services/commons';
const FormItem = Form.Item;

function noop() {
  return false;
}

class OptrHomeInfo extends Component {

  constructor(props) {
    super(props);
    this.state = {
      account: localStorage.getItem('account'),
    }
    this.editMobile = this.editMobile.bind(this);
    this.checkPass = this.checkPass.bind(this);
    this.checkPass2 = this.checkPass2.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }

  editMobile() {
    const mobile = this.refs.mobile.refs.input.value;
    if(!!mobile) {
      if(mobile === this.state.account) {
        Errors("请输入新的手机号");
        return;
      }
      if (!(/^1[3|4|5|7|8]\d{9}$/.test(mobile))){
        Errors("输入的手机号格式不正确");
        return;
      }
      Confirm(function(){
        updateSysOptrName({
          optr_id: localStorage.getItem('optr_id'),
          mobile
        }).then(({jsonResult}) => {
          Success('修改手机号码成功!');
          //记住密码
          if(localStorage.getItem('record_pwd') === 'true') {
            localStorage.setItem('account', mobile);
          }
          this.setState({ account: mobile });
        });
      }.bind(this), "确定修改手机号吗?");
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFields( (errors, values) => {
      if(!!errors) return;

      Confirm(function(){
        var params = {};
        params['old_login_pd'] = md5(values['old_login_pd']);
        params['new_login_pd'] = md5(values['new_login_pd']);
        updatePasswd(params).then(({jsonResult}) => {
          Success("密码修改成功");
          //记住密码
          if(localStorage.getItem('record_pwd') === 'true') {
            localStorage.setItem('password', values['new_login_pd'])
          }
          this.props.form.resetFields();
        });
      }.bind(this), "确定修改密码吗?");

    });
  }

  handleReset(e) {
    e.preventDefault();
    this.props.form.resetFields();
  }

  checkPass(rule, value, callback) {
    const { validateFields } = this.props.form;
    if (value) {
      validateFields(['rePasswd'], { force: true });
    }
    callback();
  }

  checkPass2(rule, value, callback) {
    const { getFieldValue } = this.props.form;
    if (value && value !== getFieldValue('new_login_pd')) {
      callback('两次输入密码不一致！');
    } else {
      callback();
    }
  }

  render() {
    const formItemLayout = {
      labelCol: {span: 5},
      wrapperCol: {span: 10 },
    };

    const getFieldDecorator = this.props.form.getFieldDecorator;
    return (
      <di>
        <div className="optr-base-info">
          <h1>基本信息</h1>
          <ul>
            <li>客服号：{this.state.account}</li>
            <li>姓名：{localStorage.getItem('nick_name')}</li>
            <li>手机号：
              <Input ref="mobile" placeholder="请输入备注名" style={{width: 200, marginLeft: 8}}
                defaultValue={this.state.account} />
              <Button type="primary" icon="edit" style={{marginLeft:16}} onClick={this.editMobile}>修改</Button>
            </li>
          </ul>
        </div>
        <div className="optr-base-info">
          <h1>修改登录密码</h1>
          <Form horizontal>
            <FormItem label="原始密码" {...formItemLayout} hasFeedback>
              {getFieldDecorator('old_login_pd', {
                rules: [
                  { required: true, whitespace: true, message: '请填写密码' },
                ],
              })(
                <Input type="password" autoComplete="off" onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop} />
              )}
            </FormItem>
            <FormItem label="新密码" {...formItemLayout} hasFeedback>
              {getFieldDecorator('new_login_pd', {
                rules: [
                  { required: true, whitespace: true, message: '请填写密码' },
                  { validator: this.checkPass },
                ],
              })(
                <Input type="password" autoComplete="off" onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop} />
              )}
            </FormItem>
            <FormItem label="确认新密码" {...formItemLayout} hasFeedback>
              {getFieldDecorator('rePasswd', {
                rules: [
                  { required: true, whitespace: true, message: '请再次输入密码'},
                  { validator: this.checkPass2 }
                ]
              })(
                <Input type="password" autoComplete="off" placeholder="两次输入密码保持一致"
                  onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}/>
              )}
            </FormItem>
            <FormItem wrapperCol={{ span: 10, offset: 3 }}>
              <Button type="primary" icon="check" onClick={this.handleSubmit}>确定</Button>
              &nbsp;&nbsp;&nbsp;
              <Button type="ghost" icon="cross" onClick={this.handleReset}>重置</Button>
            </FormItem>
          </Form>
        </div>
      </di>
    );
  }

}

export default Form.create()(OptrHomeInfo);
