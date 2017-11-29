import React, { Component, PropTypes } from 'react';
import { Form, Row, Col, Input, Select, Button, Table,DatePicker } from 'antd';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ChannelSelectField from './ChannelSelectField.jsx';
import OptrSelectField from './OptrSelectField.jsx';
import GroupSelectField from './GroupSelectField.jsx';
import CommonSelect from '../Commons/CommonSelect.jsx';
import { queryOptrList } from '../../services/operations.js';
import { queryChannelByName } from '../../services/channel.js';
import { queryOptrByName } from '../../services/optr.js';
import moment from 'moment';
const FormItem = Form.Item;
const Option = Select.Option;

//最大日期为前一天17点整
const maxDate = moment().add("days").hours(23).minute(59).second(59);

class OperationForm extends Component {

  static propTypes = {
    type: PropTypes.string.isRequired,  //类型：组号、渠道、客服号
    form: PropTypes.object.isRequired,
    onSearchOptr: PropTypes.func.isRequired
  }

  static defaultProps = {
    type: 'group' //默认为组号
  }

  constructor(props) {
    super(props);
    this.state = {
      statusItem: { defaultValue: '', items: []},
      startCreateValue:null,   //好友开始创建日期
      endCreateValue: null,     //好友结束创建日期
    };

    this.handleSearch = this.handleSearch.bind(this);
    this.disabledStartDate = this.disabledStartDate.bind(this);
    this.disabledEndDate = this.disabledEndDate.bind(this);
    this.onStartChange = this.onStartChange.bind(this);
    this.onEndChange = this.onEndChange.bind(this);
  }

  //调用父组件搜索方法
  handleSearch(e) {
    e.preventDefault();
    let values = this.props.form.getFieldsValue();
    if(!!values['wechat_group']) {
      values['wechat_group'] = values['wechat_group']['key'];
    }
    if(!!values['channel_id']) {
      values['channel_id'] = values['channel_id']['key'];
    }
    if(!!values['service_optr_id']) {
      values['service_optr_id'] = values['service_optr_id']['key'];
    }
    if(!!values.start_date){
      values.start_date = values.start_date.format("YYYY-MM-DD HH:mm:ss");
    }
    if(!!values.end_date){
      values.end_date = values.end_date.format("YYYY-MM-DD HH:mm:ss");
    }
    this.props.onSearchOptr(values);
  }

  disabledStartDate(startValue){
    if(!startValue || !this.state.endCreateValue) return false;
    return startValue && (startValue.valueOf() > this.state.endCreateValue.valueOf() || startValue.valueOf() > maxDate.valueOf());
  }
  disabledEndDate(endValue){
    if(!endValue || !this.state.startCreateValue) return false;
    return endValue && (endValue.valueOf() < this.state.startCreateValue.valueOf() || endValue.valueOf() > maxDate.valueOf());
  }
  onStartChange(startCreateValue){
    this.setState({startCreateValue})
  }
  onEndChange(endCreateValue){
    this.setState({endCreateValue})
  }


  render() {
    console.log("OptrSearchForm => render");
    const {getFieldDecorator} = this.props.form;
    const statusItem = this.state.statusItem;
    const type = this.props.type;

    let searchField;
    if(type == 'group') {
      searchField = <GroupSelectField
        getFieldDecorator={getFieldDecorator('wechat_group', {rules:[{type:'object'}]})} />
    } else if(type == 'channel') {
      searchField = <ChannelSelectField
        getFieldDecorator={getFieldDecorator('channel_id', {rules:[{type:'object'}]})} />
    } else if(type == 'optr') {
      searchField = <OptrSelectField
        getFieldDecorator={getFieldDecorator('service_optr_id', {rules:[{type:'object'}]})}/>
    }

    const formItemLayout = {
      labelCol: {　span:7　},
      wrapperCol: {　span: 17　}
    };
     const {startCreateValue, endCreateValue } = this.state;
    return (
      <Form horizontal onSubmit={this.handleSearch} className="ant-advanced-search-form">
        <Row gutter={16}>
          <Col sm={7}>
            { searchField }
            <FormItem label="状态" {...formItemLayout}>
              <CommonSelect placeholder="请选择状态" item_key="OperationStatus"
                getFieldDecorator={getFieldDecorator("status")} />
            </FormItem>
          </Col>
          <Col sm={7}>
            <FormItem label="运营手机号" {...formItemLayout} >
              {getFieldDecorator('mobile')(
                <Input placeholder="请输入手机号" />
              )}
            </FormItem>
            <FormItem label="运营微信号" {...formItemLayout}>
              {getFieldDecorator('operation_wechat')(
                <Input placeholder="请输入微信号" />
              )}
            </FormItem>
          </Col>
          <Col sm={7}>
            <FormItem label="开始时间" {...formItemLayout}>
              {getFieldDecorator("start_date",{initialValue:""})(
                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss"
                 onChange={this.onStartChange}
                 style={{width:'100%'}} />
              )}
            </FormItem>
            <FormItem label="结束时间" {...formItemLayout}>
              {getFieldDecorator("end_date",{initialValue:""})(
                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss"
                   onChange={this.onEndChange}
                 style={{width:'100%'}} />
              )}
            </FormItem>
          </Col>
          <Col sm={3}>
            <FormItem>
              <Button key="reload" icon="reload" onClick={this.props.onRefresh}>刷新</Button>
            </FormItem>
            <FormItem>
              <Button key="search" icon="search" type="primary" htmlType="submit">搜索</Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}

export default Form.create()(OperationForm);
