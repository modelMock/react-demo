/**范粉投放*/
import React, {Component, PropTypes} from 'react';
import {Form, Input, InputNumber, Radio, Button} from 'antd';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Errors} from '../Commons/CommonConstants';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

export default class NotChosenPutIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sendRadioValue: 'mobiles',  //选择投放粉丝RadionGroup
      operation_mobiles: '',  //运营号的手机字符串清单多个手机号用，分隔
      friend_min_cnt: 0,      //最小投放好友数
      friend_max_cnt: 0,	   //最大投放好友数
    }
    this.handleRadioChange = this.handleRadioChange.bind(this);
    this.onChangeConfirm = this.onChangeConfirm.bind(this);
  }

  handleRadioChange(e) {
    let sendRadioValue = e.target.value;
    if(this.state.sendRadioValue != 'sendRadioValue') {
      this.setState({ sendRadioValue });
    }
  }

  onChangeConfirm() {
    if(this.state.sendRadioValue == 'mobiles') {
      const want_operation_mobiles = this.props.form.getFieldValue('mobiles');
      if(!!want_operation_mobiles) {
        this.props.onChangeConfirm({ want_operation_mobiles });
      } else {
        Errors("请输入运营微信号!");
      }
    } else {
      const want_friend_cnt = this.props.form.getFieldValue('friend_cnt');
      if(!!want_friend_cnt) {
        this.props.onChangeConfirm({ want_friend_cnt });
      } else {
        Errors("请输入期望粉丝数量!");
      }
    }
  }

  setOperationsTotal(total) {
    this.setState(total);
  }

  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }

  componentWillReceiveProps(nextProps) {
    if('isResetData' in nextProps && nextProps['isResetData'] === true) {
      this.setState({
        sendRadioValue: 'mobiles',
        operation_mobiles: '',
        friend_min_cnt: 0,
        friend_max_cnt: 0
      });
    }
  }

  render() {
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const {sendRadioValue, wetchatInputDisabled, operation_mobiles, friend_min_cnt, friend_max_cnt} = this.state;
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    return (
      <div>
        <FormItem labelCol={{span: 4}} wrapperCol={{span: 20}} label="选择粉丝投放">
          {/*主要是区radio后面的input的值，所以radio就不绑定到form中，免得onchange会触发父子组件多次render*/}
          <RadioGroup onChange={ this.handleRadioChange } value={sendRadioValue} >
              <Radio style={radioStyle} key="1" value="mobiles">按运营微信号</Radio>
                {getFieldDecorator('mobiles', {initialValue: operation_mobiles})(
                  <Input style={{width:580}}
                      type="textarea" autosize={{ minRows: 5, maxRows: 10 }}
                      disabled={sendRadioValue != "mobiles"}/>
                )}
                <p className="ant-form-extra">请输入微信号,不同微信号之间用","隔开</p>
              <Radio style={radioStyle} key="2" value="friend_cnt">按期望粉丝数</Radio>
                {getFieldDecorator('friend_cnt')(
                  <InputNumber style={{ width: 150 }} min={friend_min_cnt} max={friend_max_cnt}
                    disabled={sendRadioValue != "friend_cnt"} placeholder="请输入投放数量"/>
                )}
                <p className="ant-form-extra">当前最多可投放{friend_max_cnt}人，最少投放{friend_min_cnt}人</p>
          </RadioGroup>
        </FormItem>
        <FormItem wrapperCol={{offset: 4}}>
          <Button type="primary" icon="check" size="large" onClick={this.onChangeConfirm}>确认数据</Button>
        </FormItem>
      </div>
    );
  }
}
