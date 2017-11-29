/*添加、修改客服号弹出框*/
import React, { Component, PropTypes} from 'react'
import { Form, Input } from 'antd';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {updateSysOptrName} from '../../services/optr.js';
import { Confirm, Success, Errors, mobileValidate } from '../Commons/CommonConstants';
import CommonModal from '../Commons/CommonModal';
const FormItem = Form.Item;
class EditOptrModal extends Component {

  static propTypes = {
    title: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    onRefreshTable: PropTypes.func.isRequired,
    form: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    if(!this.refs.commonModal.isShow() && !!nextProps['title']) {
      this.props.form.setFieldsValue(nextProps['data'])
      this.refs.commonModal.show();
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if(!nextProps['title']) {
      return false;
    }
    return PureRenderMixin.shouldComponentUpdate.apply(this, nextProps, nextState);
  }
  handleCancel() {
    this.props.form.resetFields();  //清空数据
    this.props.onResetState();
    this.refs.commonModal.hide();
  }
  handleOk() {
    this.props.form.validateFields( (errors, values) => {
      if(!!errors) return;
      const content = <div>确认{this.props.title}<span style={{color:'blue'}}>[{values['optr_name']}]</span>吗?</div>;
      Confirm(function(){
        updateSysOptrName(values).then( ({jsonResult}) => {
          Success(
            <div>
              <p>{this.props.title}成功</p>
              <p>客服姓名：{jsonResult['optr_name']}</p>
              <p>客服账号：{jsonResult['login_account']}</p>
              <p>密码：{jsonResult['password']}</p>
            </div>
          );
          this.props.form.resetFields();
          this.props.onRefreshTable();
          this.refs.commonModal.hide();
        });
      }.bind(this), content);
    });
  }
  render() {
    console.log('EditOptrModal => render =>');
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 12 },
    };
    const getFieldDecorator = this.props.form.getFieldDecorator;
    return (
      <CommonModal ref="commonModal" title={this.props.title} onOk={this.handleOk} onCancel={this.handleCancel}>
        <Form horizontal>
          <Input type="hidden" {...getFieldDecorator('optr_id')} />
          <FormItem {...formItemLayout} label="客服姓名" hasFeedback >
            {getFieldDecorator('optr_name', {
              rules: [
                { required: true, message: '客服姓名不能为空' }
              ],
            })(<Input placeholder="请输入客服姓名"/>)}
          </FormItem>
          <FormItem {...formItemLayout} label="客服手机号" hasFeedback>
            {getFieldDecorator('mobile', {
              rules: [
                { required: true, message: '请输入客服手机号' },
                { validator: mobileValidate}
              ]
            })(
              <Input placeholder="请输入客服手机号" />
            )}
          </FormItem>
        </Form>
      </CommonModal>
    );
  }
}

export default Form.create()(EditOptrModal);
