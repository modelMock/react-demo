/*图文form*/
import React, { Component} from 'react';
import { Form, Upload } from 'antd';
import './SendADToWeChat.less';
import UploadField from './UploadField';
const FormItem = Form.Item;

export default class ImgTxtForm extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    console.log('ImgTxtForm => render => ');
    return (
      <div>
        <FormItem labelCol={{span: 4}} wrapperCol={{span: 20}} label="上传图片" isRequired>
          <UploadField maxFileSize={9} onFetchImgUrl={this.props.onFetchImgUrl}
             isResetData={this.props.isResetData}
            extraInfo="&nbsp;&nbsp;&nbsp;&nbsp;支持图片格式 jpg、png，单个图片文件小于1M，可上传最多9张，图片顺序请自行排好后再上传!"/>
        </FormItem>
      </div>
    );
  }
}
