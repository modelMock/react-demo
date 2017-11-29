/**自定义朋友圈**/
import React, { Component, PropTypes} from 'react';
import { Form, Input, Icon, Radio } from 'antd';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ImgTxtForm from './ImgTxtForm.jsx';
import FwdForm from './FwdForm.jsx';
import './SendADToWeChat.less';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const txtInfolengLimit = 5000;  //文本信息可输入长度限制
export default class CustomDefineFriends extends Component {
  constructor(props) {
    super(props);
    this.state={
      contentType: '2',  //发朋友圈类型：文本、图文、转发; 默认为文本
      inputTxtLength: txtInfolengLimit,
    };
    this.handleTxtInfoChange = this.handleTxtInfoChange.bind(this);
    this.handleContentType = this.handleContentType.bind(this);
    this.onFetchImgUrl = this.onFetchImgUrl.bind(this);
  }

  handleTxtInfoChange(e) {
    let inputTxtLength = txtInfolengLimit - e.target.value.length;
    inputTxtLength = inputTxtLength > 0 ? inputTxtLength : 0;
    this.setState({inputTxtLength});
  }

  //内容类型 onChange
  handleContentType(e) {
    let contentType = e.target.value;
    if(this.state.contentType != contentType) {
      this.setState({ contentType });
    }
  }

  onFetchImgUrl(imgUrlList) {
    this.props.onFetchImgUrl(imgUrlList);
  }
  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }

  render() {
    console.log('CustomDefineFriends => render');
    const { form, isResetData } = this.props;
    const getFieldDecorator = form.getFieldDecorator;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 10 }
    };

    const { contentType, inputTxtLength, putType } = this.state;
    let imgOrFwdForm = null, chosenForm = null;
    if(contentType == '1') {  //图文
      imgOrFwdForm = <ImgTxtForm onFetchImgUrl={ this.onFetchImgUrl } isResetData={ isResetData }/>
    } else if(contentType == '3') { //转发
      imgOrFwdForm = <FwdForm form={ form } onFetchImgUrl={ this.onFetchImgUrl } isResetData={ isResetData }/>
    }


    return (
      <div>
        <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 10 }} label="内容类型" required>
          {getFieldDecorator('content_type', {
              initialValue: contentType,
              onChange: this.handleContentType
          })(
            <RadioGroup>
              <Radio key="2" value="2">文本广告</Radio>
              <Radio key="1" value="1">图文广告</Radio>
              <Radio key="3" value="3">链接广告</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label="文本信息"
            help={`请输文字内容，链接前后请用空格隔开，还可以输入${inputTxtLength}个字`} hasFeedback style={{marginBottom: 16}}>
          {getFieldDecorator('text_content', {
              rules: [{required: true, message:"请输入文本信息"}],
              onChange: this.handleTxtInfoChange
          })(
            <Input type="textarea" placeholder="请输入文本信息"
              autosize={{minRows:5, maxRows:20}} style={{width:1000}} maxLength={txtInfolengLimit} />
          )}
        </FormItem>
        {imgOrFwdForm}
      </div>
    )
  }
}
