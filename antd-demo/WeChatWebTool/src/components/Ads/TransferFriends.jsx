/**转发朋友圈**/
import React, { Component, PropTypes} from 'react';
import { Form, Input, InputNumber, Button } from 'antd';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import AdPublishDetailInfo from './AdPublishDetailInfo';
import {getSnsDetail} from '../../services/ads';
import {Errors} from '../Commons/CommonConstants';
import CommonModal from '../Commons/CommonModal';
const FormItem = Form.Item;

export default class TransferFriends extends Component {
  constructor(props) {
    super(props);
    this.state={
      visible: false,
      adPublishDetailContent: {},
    }
    this.onPreview = this.onPreview.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  onPreview() {
    const values = this.props.form.getFieldsValue(['forwardUserName', 'index']);
    console.log(values['forwardUserName'], values['index']);
    if(!values['forwardUserName'] || !values['index']) {
      Errors('请输入转发微信号和序号');
      return;
    }
    this.props.setLoading(true);
    getSnsDetail(values).then(({jsonResult}) => {
      this.props.setLoading(false);
      this.setState({
        adPublishDetailContent: jsonResult,
      });
      this.refs.commonModal.show();
    }).catch(function(err){
      this.setState({
        adPublishDetailContent: {},
      });
      this.props.setLoading(false);
    }.bind(this));
  }

  getAdPublishContent() {
    return !!this.state.adPublishDetailContent ? this.state.adPublishDetailContent['adPublishContent'] : {};
  }

  onClose() {
    this.refs.commonModal.hide();
  }

  componentWillReceiveProps(nextProps) {
    if('isResetData' in nextProps && nextProps['isResetData'] === true) {
      this.setState({
        adPublishDetailContent: {},
      });
    }
  }
  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 10 }
    };
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const { visible, adPublishDetailContent } = this.state;
    return (
      <div>
        <FormItem {...formItemLayout} label="转发微信号" required
            extra="请输入需要转发朋友圈所在的微信号">
            {getFieldDecorator('forwardUserName', {
              rules: [{required: true, message: '要转发的微信号不能为空'}]
            })(
              <Input placeholder="请输入要转发的微信号"/>
            )}
        </FormItem>
        <FormItem {...formItemLayout} wrapperCol={{span:16}} label="转发文章" required
            help="请输入转发微信号最新朋友圈的前10个中的任何一个，依次为第1篇、第2篇……">
          <p className="ant-form-text">第</p>
          {getFieldDecorator('index', {
            rules: [{required: true, type:'number', message: '个数不能为空'}]
          })(
            <InputNumber min={1} max={10} step={1}/>
          )}
          <p className="ant-form-text">篇</p>
        </FormItem>
        <FormItem wrapperCol={{span: 4, offset: 4}} style={{marginTop: 8}}>
          <Button type="primary" size="large" icon="folder-open" onClick={this.onPreview}>预览朋友圈</Button>
        </FormItem>
        <CommonModal ref="commonModal" title="朋友圈详情" width={700} onCancel={this.onClose}
          footer={[
            <Button key="close" icon="poweroff" type="primary" size="large" onClick={this.onClose}>关 闭</Button>
          ]}>
          <AdPublishDetailInfo {...adPublishDetailContent}/>
        </CommonModal>
      </div>
    );
  }
}
