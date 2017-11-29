/*发朋友圈广告：统计数据*/
import React, { Component, PropTypes } from 'react';
import { Form, Tag } from 'antd';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import './SendADToWeChat.less';
const FormItem = Form.Item;

export default class PublishAdTotal extends Component {
  constructor(props) {
    super(props);
  }
  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }
  render() {
    const {friend_total_cnt=0, operation_cnt=0, operation_mobiles=''} = this.props.ops_confirm;
    let mobiles = [];
    if(operation_mobiles.length > 0) {
      if(operation_mobiles.indexOf(",") >= 0) {
        mobiles = operation_mobiles.split(",");
        mobiles.pop();  //删除最后一个空字符
      } else {
        mobiles.push(operation_mobiles);
      }
    }
    return (
      <div style={{marginTop: 16, borderTop: '1px solid #e9e9e9', paddingTop: 16}}>
        <FormItem labelCol={{span: 4}} wrapperCol={{span: 10}} label="投放粉丝数">
          <p className="ant-form-text">
            <span style={{'color':'red', margin: '0 8px 0 8px'}}>{friend_total_cnt}</span>人
          </p>
        </FormItem>
        <FormItem labelCol={{span: 4}} wrapperCol={{span: 10}} label="运营微信号">
          <p className="ant-form-text">
            <span style={{ 'color':'red', margin: '0 8px 0 8px' }}>{operation_cnt}</span>个
          </p>
        </FormItem>
        <FormItem wrapperCol={{span: 20, offset: 4}}>
          {
            mobiles.map( (mobile,idx) => (
              <Tag key={idx} color="blue">{mobile}</Tag>
            ))
          }
        </FormItem>
      </div>
    )
  }
}
