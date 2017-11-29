import React from 'react';
import { Form, Input, Button, Modal} from 'antd';
const FormItem = Form.Item;

function noop() {
  return false;
}

class ModifyPassword extends React.Component {
  state = {
    passwordDirty: false
  }
  handlePasswordBlur = (e) => {
    const value = e.target.value;
    this.setState({ passwordDirty: this.state.passwordDirty || !!value });
  }
  checkPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('newPwd')) {
      callback('您输入的两次密码不一致！');
    } else {
      callback();
    }
  }
  checkConfirm = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.passwordDirty) {
      form.validateFields(['rePasswd'], { force: true });
    }
    callback();
  }
  render() {
    const { visible, onCancel, onOk, form, loading } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <Modal
        visible={visible}
        title="修改密码"
        onCancel={onCancel}
        footer={[
          <Button key="cancel" icon="cross" size="large" onClick={onCancel}>取消</Button>,
          <Button key="submit" type="primary" icon="check" size="large" loading={loading} onClick={onOk}>提交</Button>
        ]}>
        <Form layout="horizontal">
          <FormItem label="原密码" {...formItemLayout} hasFeedback>
            {getFieldDecorator('oldPwd', {
              rules: [
                { required: true, whitespace: true, message: '请输入原密码' },
              ],
            })(
              <Input type="password" autoComplete="off" onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop} />
            )}
          </FormItem>
          <FormItem label="新密码" {...formItemLayout} hasFeedback>
            {getFieldDecorator('newPwd', {
              rules: [{
                required: true, message: '请输入新密码',
              }, {
                validator: this.checkConfirm,
              }],
            })(
              <Input type="password" onBlur={this.handlePasswordBlur} />
            )}
          </FormItem>
          <FormItem label="确认新密码" {...formItemLayout} hasFeedback>
            {getFieldDecorator('rePasswd', {
              rules: [{
                required: true, message: '请确认您的密码',
              }, {
                validator: this.checkPassword,
              }],
            })(
              <Input type="password" />
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

export default Form.create()(ModifyPassword);
