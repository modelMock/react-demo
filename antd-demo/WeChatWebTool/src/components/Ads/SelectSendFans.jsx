/*选择投放粉丝*/
import React, { Component, PropTypes } from 'react';
import { Form, Input, Radio, InputNumber, Tag } from 'antd';
import PureRenderMixin from 'react-addons-pure-render-mixin';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

export default class SelectSendFans extends Component {

  constructor(props){
    super(props);
    this.state = {
      sendRadioValue: 'wechat',  //选择投放粉丝RadionGroup
      wetchatInputDisabled: false,//按微信投放数据输入框
      fansInput: {disabled: true, min: 1, max: Number.MAX_SAFE_INTEGER},  //按粉丝投放数据输入框
      isDisplay: 'none',   //是否显示详细运营微信号
    };

    this.handleRadioChange = this.handleRadioChange.bind(this);
    this.handleWatchClick = this.handleWatchClick.bind(this);
  }

  //选择按粉丝投放RadionGroup.change事件
  handleRadioChange(e) {
    const sendRadioValue = e.target.value;
    if(sendRadioValue != this.state.sendRadioValue) {
      this.setState({
        sendRadioValue,
        wetchatInputDisabled: (sendRadioValue == 'fans'),
        fansInput: {
          disabled: (sendRadioValue == 'wechat') ,
          min: 1000,
          max: 5000
        }
      });
    }
  }

  handleWatchClick() {
    if( this.state.isDisplay == 'block' ) {
      this.setState({ isDisplay: 'none' });
    } else {
      this.setState({ isDisplay: 'block' });
    }
  }

  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }

  render() {
    console.log('SelectSendFans => render');
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const { sendRadioValue, wetchatInputDisabled, fansInput, isDisplay } = this.state;

    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };

    return (
      <div>
        <FormItem labelCol={{span: 2}} wrapperCol={{span: 14}} label="选择粉丝投放">
          <RadioGroup defaultValue={sendRadioValue} onChange={ this.handleRadioChange }>
            <Radio style={radioStyle} key="1" value="wechat">按指定运营微信号投放</Radio>
            {getFieldDecorator('wechat_nos')(
              <Input style={{ width: 920 }} type="textarea" autosize={{ minRows: 5, maxRows: 10 }}
                disabled={wetchatInputDisabled} placeholder='请输入微信号,不同微信号之间用","隔开' />
            )}
            <Radio style={radioStyle} key="2" value="fans">按期望粉丝数投放</Radio>
            {getFieldDecorator('fans_num')(
              <InputNumber style={{ width: 150 }} {...fansInput} step={10} placeholder="请输入投放数量" />
            )}
          </RadioGroup>
        </FormItem>
        <FormItem labelCol={{span: 2}} wrapperCol={{span: 10}} label="投放粉丝数">
          <p className="ant-form-text"><span style={{'color':'red', margin: '0 8px 0 8px'}}>50000</span>人</p>
        </FormItem>
        <FormItem labelCol={{span: 2}} wrapperCol={{span: 10}} label="运营微信号">
          <p className="ant-form-text"><span style={{ 'color':'red', margin: '0 8px 0 8px' }}>120</span>个</p>
          <a href="javascrip:void(0)" className="ant-form-text" style={{ margin: '0 8px 0 8px' }}
            onClick={ this.handleWatchClick }>查看</a>
        </FormItem>
        <FormItem wrapperCol={{span: 20, offset: 2}} style={{ display: isDisplay }}>
          <Tag>标签1</Tag>
          <Tag>标签2</Tag>
          <Tag>标签3</Tag>
          <Tag>标签4</Tag>
          <Tag>标签5</Tag>
        </FormItem>
      </div>
    )
  }
}
