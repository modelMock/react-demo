/*转发form*/
import React, { Component, PropTypes} from 'react';
import { Form, Input } from 'antd';
import UploadField from './UploadField';

const FormItem = Form.Item;

export default class FwdForm extends Component {

  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    if('isResetData' in nextProps && nextProps['isResetData'] === true) {
      this.setState({
        fileList: [],
      });
    }
  }

  render() {
    console.log('FwdForm => render');
    const { getFieldDecorator } = this.props.form;

    return (
      <div>
        <FormItem labelCol={{span: 4}} wrapperCol={{span: 12}} label="转发链接" required>
          {getFieldDecorator('transpond_link', {　rules: [{required: true, message:"请输入转发链接"}]　})(
            <Input placeholder="请输入转发链接"  />
          )}
        </FormItem>
        <FormItem labelCol={{span: 4}} wrapperCol={{span: 12}} label="链接标题" required>
          {getFieldDecorator('title', {　rules: [{required: true, message:"请输入链接标题"}]　})(
            <Input placeholder="请输入链接标题"  />
          )}
        </FormItem>
        <FormItem labelCol={{span: 4}} wrapperCol={{span: 20}} label="链接封面" isRequired>
        <UploadField maxFileSize={1} onFetchImgUrl={this.props.onFetchImgUrl} isResetData={this.props.isResetData} extraInfo=""/>
        </FormItem>
      </div>
    );
  }
}
