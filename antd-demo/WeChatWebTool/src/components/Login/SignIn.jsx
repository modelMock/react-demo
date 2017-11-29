import React, { Component, PropTypes } from 'react';
import { Form, Row, Col, Input, Select, Button, Table, Checkbox } from 'antd';
import md5 from 'blueimp-md5';
import {login} from '../../services/optr';
import { hashHistory } from 'react-router';
import {Errors} from '../Commons/CommonConstants';
import socketManage from '../Socket/SocketManage';
import resourceManage from '../ResourceManage';
const FormItem = Form.Item;
const noop = function(){ return false; }

class SignIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleRecordPwd = this.handleRecordPwd.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if(!!errors) return;
      let params = {};
      params['account'] = values['account'];
      params['password'] = md5(values['password']);
      params['sub_system'] = 'WEB';
      params['platform_type'] = 'WEB';
      params['sub_system'] = 'WEB';
      params['platform_type'] = 'WEB';

      this.setState({ loading: true });

      login(params).then(({jsonResult}) => {
        this.setState({ loading: false });
        if(jsonResult) {

          localStorage.clear();

          localStorage.setItem('record_pwd', values['record_pwd']);
          localStorage.setItem('account', jsonResult['account']);
          localStorage.setItem('sessionId', jsonResult['sessionId']);
          localStorage.setItem('optr_id', jsonResult['userId']);
          localStorage.setItem('nick_name', jsonResult['nick_name']);

          //记住密码
          if(values['record_pwd'] === true){
            localStorage.setItem('password', values['password']);
          }

          hashHistory.replace("/");
        }
      }).catch(function(err){
        this.setState({ loading: false });
      }.bind(this));

    });
  }

  handleReset(e) {
    e.preventDefault();
    this.props.form.resetFields();
    localStorage.setItem('password', null);
  }

  handleRecordPwd(e) {
    if(e.target.checked === false) {
      localStorage.setItem('password', null);
    }
  }

  componentDidMount() {
    //记住密码
    if(localStorage.getItem('record_pwd') === 'true') {
      this.props.form.setFieldsValue({
        account: localStorage.getItem('account'),
        password: localStorage.getItem('password'),
      });
    } else {
      this.props.form.setFieldsValue({
        account: localStorage.getItem('account'),
      });
    }

    //重置为上岗
    socketManage.closeSocket();
    resourceManage.clearMenu();
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 9 },
    };

    const getFieldDecorator = this.props.form.getFieldDecorator;

    return (
      <Form horizontal onSubmit={this.handleSubmit} style={{margin: '15% auto 0px auto', width: '500px'  }}>
        <FormItem {...formItemLayout} label="账 号" hasFeedback>
          {getFieldDecorator('account', {
            rules: [
              { required: true, whitespace: true, message: '请填写账号' }
            ]
          })(
            <Input placeholder="请输入账号" autoComplete="off" />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="密 码" hasFeedback>
          {getFieldDecorator('password', {
            rules: [
              { required: true, whitespace: true, message: '请填写密码' }
            ],
          })(
            <Input type="password" autoComplete="off"
              onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop} placeholder="请输入密码"/>
          )}
        </FormItem>
        <FormItem wrapperCol={{ span: 10, offset: 3 }}>
          {getFieldDecorator('record_pwd', {
            valuePropName: 'checked',
            initialValue: localStorage.getItem('record_pwd') === 'true',
            onChange: this.handleRecordPwd
          })(
            <Checkbox style={{float: 'left'}}>记录密码</Checkbox>
          )}
        </FormItem>
        <FormItem wrapperCol={{ span: 10, offset: 3 }}>
          <Button type="primary" icon="check" htmlType="submit" loading={this.state.loading}>确定</Button>
          <Button type="ghost" icon="cross" onClick={this.handleReset} style={{marginLeft: 16}}>重置</Button>
        </FormItem>
      </Form>
    );
  }
}

export default Form.create()(SignIn);
