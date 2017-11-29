/*封号弹出框*/
import React, { Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Form, Input, Button, Select} from 'antd';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {queryOptrByChannelId, updateKefuDisabled} from '../../services/optr';
import { Confirm, Success, Errors } from '../Commons/CommonConstants';
import CommonModal from '../Commons/CommonModal';
const FormItem = Form.Item;
const Option = Select.Option;

class DisableOptrModal extends Component {
  constructor(props) {
    super(props);
    this.state={
      optrList: [],
    };
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  handleOk() {
    this.props.form.validateFields( (errors, values) => {
      if(!!errors) return;
      Confirm(function(){
        updateKefuDisabled(values).then(({jsonResult}) => {
          Success("封号成功");
          this.props.form.resetFields();
          this.props.onRefreshTable();
          this.refs.commonModal.hide();
        });
      }.bind(this), "确定封号吗？");
    });
  }
  handleCancel() {
    this.props.form.resetFields();
    this.props.onResetState();
    this.refs.commonModal.hide();
  }
  fetch() {
    queryOptrByChannelId().then( ({jsonResult}) => {
      let optrList = [];
      if(jsonResult.length > 0) {
        for(let [index, optr] of jsonResult.entries()) {
          if(optr['optr_id'] == this.props.data['optr_id']) {
            jsonResult.splice(index, 1);
            break;
          }
        }
        optrList = jsonResult;
      }
      this.setState({ optrList })
    })
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps['type'] === 'DISABLE' && !this.refs.commonModal.isShow()) {
      this.refs.commonModal.show();
      this.fetch();
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if(nextProps['type'] !== 'DISABLE') {
      return false;
    }
    return PureRenderMixin.shouldComponentUpdate.apply(this, nextProps, nextState);
  }

  render() {
    console.log('DisableOptrModal => render => ')
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const {optr_id, optr_name} = this.props.data;

    return (
      <CommonModal ref="commonModal" title="封号" onOk={this.handleOk} onCancel={this.handleCancel}>

      <Form horizontal>
        {getFieldDecorator('disabled_optr_id',{
          initialValue: optr_id,
          rules:[{required: true, type:'number'}]
        })(<Input type="hidden"/>)}
        <FormItem labelCol={{span: 6}} wrapperCol={{span: 8}} label="原客服姓名">
          <p className="ant-form-text">{optr_name}</p>
        </FormItem>
        <FormItem labelCol={{span: 6}} wrapperCol={{span: 18}} label="选择转移客服" required>
          {getFieldDecorator('to_optr_ids', {
            rules:[{type:'array', required: true, message: '请选择要转移的目标客服'}]
          })(
            <Select multiple dropdownMenuStyle={{ maxHeight: 500, overflow: 'auto' }}
                style={{ width: '100%' }} placeholder="请选择客服">
                {
                  this.state.optrList.map(optr =>(
                    <Option key={optr['optr_id']}>{optr['optr_name']}</Option>
                  ))
                }
            </Select>
          )}
        </FormItem>
      </Form>
    </CommonModal>
    );
  }
}
export default Form.create()(DisableOptrModal);
