import React from 'react';
import {Form, Input, InputNumber,Select, Button,Modal} from 'antd';
import {Confirm, Success} from '../Commons/CommonConstants';
import {unbindChannelCount, unbindChannel} from '../../services/params';
const FormItem = Form.Item;
const Option = Select.Option;

class SetOperationsParams extends React.Component{
  constructor(props){
     super(props);
     this.state={
       visible:false,
       details:''
     }
     this.unbindChannelCountBtn = this.unbindChannelCountBtn.bind(this);
     this.handleOk=this.handleOk.bind(this);
     this.handleCancel=this.handleCancel.bind(this);
  }

  unbindChannelCountBtn(e){
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if(errors) return;
       unbindChannelCount(values).then(({jsonResult}) => {
         console.log("jsonResult.data",jsonResult)
            let details;
            details=<div className="alertDatail-div">
                  <ul className="alertDatail-ul">
                    <li style={{marginBottom:5}}><span>可用状态的数量:</span>{jsonResult.activeCount}</li>
                    <li style={{marginBottom:5}}><span>冻结状态的数量:</span>{jsonResult.notAccountCount}</li>
                    <li style={{marginBottom:5}}><span>密错状态的数量:</span>{jsonResult.pwdErrorCount}</li>
                    <li style={{marginBottom:5}}><span>不可用状态的数量:</span>{jsonResult.unaccountCount}</li>
                </ul>
            </div>
            this.setState({details:details});
            this.showModal()
       });
     });
  }
  showModal() {
      this.setState({
        visible: true,
      });
    }
  handleOk() {
    Confirm(function(){
      this.props.form.validateFields((errors, values) => {
        if(errors) return;
        unbindChannel(values).then(({jsonResult}) => {
          console.log(jsonResult);
          if(jsonResult.message=="success"){
              Success("解绑成功！");
            this.setState({
              visible: false,
            });
            this.props.form.resetFields();
          }
        });
      });
      }.bind(this), "确定解绑吗?")
  }
  handleCancel(e) {
    this.setState({
      visible: false,
    });
  }
  render(){
    const formItemLayout = {
      labelCol: {span: 3},
      wrapperCol: {span: 4},
    };
    const {getFieldDecorator} = this.props.form;
    return (
      <div>
        <Modal title="详情" visible={this.state.visible}
         onOk={this.handleOk} onCancel={this.handleCancel}
         footer={[<Button type="primary" icon="check" size="large" onClick={this.handleOk}>提交</Button>]}
       >
       {this.state.details}
       </Modal>
      <Form horizontal onSubmit={this.unbindChannelCountBtn}>
        <FormItem label="当前功能" labelCol={{span:3}} wrappCol={{span:22}}>
          <p className="ant-form-text">
            用于解绑某一组运营号和某个渠道的关系
          </p>
        </FormItem>
        <FormItem label="运营组号" {...formItemLayout} >
          {getFieldDecorator('wechat_group', {
            rules: [{ required: true, message: '运营号不能为空' }],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem label="渠道代码" {...formItemLayout} >
          {getFieldDecorator('channel_id', {
            rules: [{ required: true, message: '渠道代码不能为空' }],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem wrapperCol={{offset: 3, span: 6}}>
          <Button type="primary" icon="check" size="large" htmlType="submit">提交</Button>
        </FormItem>
      </Form>
    </div>
    );
  }
}
export default Form.create()(SetOperationsParams);
