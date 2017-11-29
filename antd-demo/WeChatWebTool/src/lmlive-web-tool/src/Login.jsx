import React from 'react';
import { Form, Icon, Input, Button, Checkbox } from 'antd';
import { hashHistory } from 'react-router';
import AppService from './service/AppService';
import './Login.less';
const FormItem = Form.Item;

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    }
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  // 登录
  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if(!!err) return;

      // 正在登录中
      this.setState({ loading: true });

      const loginName = values.loginName;
      const password = values.password;
      AppService.login(loginName, password).then(user => {
        // 先清空所有本地存储数据
        localStorage.clear();
        // 记住密码
        if(values.remember === true) {
          localStorage.setItem("loginName", loginName);
          localStorage.setItem("password", password);
          localStorage.setItem("remember", values.remember);
        }
        if(!!user) {
          localStorage.setItem("userId", user.userId);
          localStorage.setItem("nickname", user.nickname);
        }

        // 登录成功
        this.setState({ loading: false });
        this.props.form.resetFields();
        // 跳转到首页
        hashHistory.replace("/manage")
      }).catch(err => {
        this.setState({ loading: false });
      });
    })
  }
  render() {
    const {getFieldDecorator} = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className="login-form">
        <FormItem>
          {getFieldDecorator('loginName', {
            rules: [{ required: true, message: '请输入登录名称' }],
            initialValue: localStorage.getItem('loginName'),
          })(
            <Input addonBefore={<Icon type="user" />} placeholder="登录名" />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: '请输入密码' }],
            initialValue: localStorage.getItem('password'),
          })(
            <Input addonBefore={<Icon type="lock" />} type="password" placeholder="密码" />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('remember', {
            valuePropName: 'checked',
            initialValue: localStorage.getItem('remember') === "true",
          })(
            <Checkbox>记住</Checkbox>
          )}
          {/* <a className="login-form-forgot">忘记密码</a> */}
          <Button type="primary" htmlType="submit" className="login-form-button" loading={this.state.loading}>
            登 录
          </Button>
          {/* 或 <a>现在注册!</a> */}
        </FormItem>
      </Form>
    )
  }
}
export default Form.create()(Login);
