import React from 'react';
import {Form, Row, Col, Input, Select, Button, Modal} from 'antd';
import AnchorService from '../../service/AnchorService';
import webUtils from '../../commons/utils/webUtils';
import validateUtils from '../../commons/utils/validateUtils';
import ImageUpload from '../../commons/widgets/ImageUpload';
import CustomSelect from '../../commons/widgets/CustomSelect';
const FormItem = Form.Item;
const Option = Select.Option;

class AddAnchor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }
  handleReset() {
    this.props.form.resetFields();
  }
  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if(!!err) return;
      webUtils.confirm(()=>{
        this.setState({ loading: true })
        AnchorService.registerAnchor(values).then(result => {
          /*Modal.confirm({
            title: '提示',
            content: "录入主播成功",
            okText: '去审核',
            cancelText: '留在本页',
            onOk:()=>{
              hashHistory.replace({
                pathname: '/anchor/manage',
                state: {
                  accountName: values['accountName'],
                  // 主播管理按钮权限必须手动加上
                  btnResList: webUtils.getButtonResByResId(3)
                }
              })
            }
          });*/
          webUtils.alertSuccess("录入主播成功");
          this.props.form.resetFields();
          this.setState({ loading: false });
        }).catch(err=>{
          this.setState({ loading: false })
        });
      }, "确定录入主播吗?")
    });
  }
  render() {
    const {getFieldDecorator} = this.props.form;
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    return (
      <Form layout="horizontal" className="ant-advanced-search-form" onSubmit={this.handleSubmit}>
        <Row>
          <Col sm={12}>
            <FormItem label="主播姓名" {...formItemLayout}>
              {getFieldDecorator("accountName", {
                rules:[{required: true, message: "请输入主播姓名"}]
                // ,initialValue: '王晓丽'
              })(<Input placeholder="请正确填写，将作为银行开户人使用" />)}
            </FormItem>
            <FormItem label="身份证号" {...formItemLayout}>
              {getFieldDecorator("certNum", {
                rules:[{required: true, message: "请输入身份证号"}, {validator: validateUtils.checkCertNum}]
                // ,initialValue: '423584199402124512'
              })(<Input placeholder="身份证号" />)}
            </FormItem>
            <FormItem label="银行名称" {...formItemLayout}>
              {getFieldDecorator("bankCode", {
                // rules: [{required: true, message: "请选择银行名称"}]
                // ,initialValue: 'ICBC'
              })(<CustomSelect placeholder="请选择银行" itemKey="BankCode" />)}
            </FormItem>
            <FormItem label="银行账号" {...formItemLayout}>
              {getFieldDecorator("bankAccount", {
                rules:[/*{required: true, message: "请输入银行账号"}, */{validator: validateUtils.checkBankCardNum}]
                // ,initialValue: '6224582687153658'
              })(<Input placeholder="银行账号" />)}
            </FormItem>
            <FormItem label="银行联号" {...formItemLayout}>
              {getFieldDecorator("bankLineNum")(<Input placeholder="银行联号" />)}
            </FormItem>
            <FormItem label="省" {...formItemLayout}>
              {getFieldDecorator("province", {
                rules: [{required: true, message: '请选择所在省'}],
                // initialValue: '浙江省'
              })(<Input placeholder="请选择所在省" />)}
            </FormItem>
            <FormItem label="QQ" {...formItemLayout}>
              {getFieldDecorator("qq", {
                rules:[{required: true, validator: validateUtils.checkQQ, message: '请输入正确QQ号'}]
                // ,initialValue: '42154'
              })(<Input placeholder="QQ" />)}
            </FormItem>
            <FormItem label="微信号" {...formItemLayout}>
              {getFieldDecorator("weixin", {
              })(<Input placeholder="微信号" />)}
            </FormItem>
          </Col>
          <Col sm={12}>
            <FormItem label="昵称" {...formItemLayout}>
              {getFieldDecorator("nickname", {
                rules:[{required: true, message: "请输入主播昵称"}]
                // ,initialValue: '小萝莉'
              })(<Input placeholder="昵称" />)}
            </FormItem>
            <FormItem label="手机号码" {...formItemLayout}>
              {getFieldDecorator("mobile", {
                rules:[{required: true, message: "请输入手机号码"}, {validator: validateUtils.checkMobile}]
                // ,initialValue: '13000000000'
              })(<Input placeholder="手机号码" />)}
            </FormItem>
            <FormItem label="支行名称" {...formItemLayout}>
              {getFieldDecorator("branchName", {
                // rules:[{required: true, message: "请输入支行名称"}]
                // ,initialValue: '杭州文二路支行'
              })(<Input placeholder="支行名称" />)}
            </FormItem>
            {/* <FormItem label="星探" {...formItemLayout}>
              {getFieldDecorator("sourceType")(<CustomSelect placeholder="请选择星探" itemKey="Scout" />)}
            </FormItem> */}
            <FormItem label="支付宝账号" {...formItemLayout}>
              {getFieldDecorator("alipayAccount")(<Input placeholder="支付宝账号" />)}
            </FormItem>
            <FormItem label="性别" {...formItemLayout}>
              {getFieldDecorator("sex", {
                rules: [{required: true}],
                initialValue: "0"
              })(
                <Select placeholder="请选择性别">
                  <Option value="0">女</Option>
                  <Option value="1">男</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="市" {...formItemLayout}>
              {getFieldDecorator("city", {
                rules: [{required: true, message: '请输入所在城市'}],
                // initialValue: '杭州市'
              })(<Input placeholder="请输入所在城市" />)}
            </FormItem>
            <FormItem label="登录密码" {...formItemLayout}>
              {getFieldDecorator("loginPassword", {
                rules:[{required: true, message: "请输入登录密码"}],
                initialValue: '123456789'
              })(<Input placeholder="登录密码" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <FormItem label="主播头像" {...formItemLayout}>
              {getFieldDecorator("picId", {
               rules: [{required: true, message: "请上传主播头像"}],
                valuePropName: 'fileList',
                // initialValue: 'headimg/770556acefa4414db00ae5054d5d7a85.jpg',
              })(<ImageUpload uploadFolderName={webUtils.getUploadFolderName("HeadingPic")} uploadButtonText="上传头像"/>)}
            </FormItem>
          </Col>
          <Col sm={12}>
            <FormItem label="主播封面" {...formItemLayout}>
              {getFieldDecorator("coverId", {
                rules: [{required: true, message: "请上传主播封面"}],
                valuePropName: 'fileList',
                // initialValue: 'headimg/770556acefa4414db00ae5054d5d7a85.jpg',
              })(<ImageUpload uploadFolderName={webUtils.getUploadFolderName("ProgramPic")} uploadButtonText="上传封面"/>)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={24} style={{ textAlign: 'center' }}>
            <Button type="primary" icon="save" size="large" htmlType="submit" loading={this.state.loading}>保存</Button>
            <Button type="ghost" icon="cross" size="large" onClick={this.handleReset}>重置</Button>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default Form.create()(AddAnchor)
