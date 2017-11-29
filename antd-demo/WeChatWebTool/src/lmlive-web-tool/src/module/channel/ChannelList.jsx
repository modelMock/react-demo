import React, {Component} from 'react';
import {Form, Row, Col, Select, Button, DatePicker, Table} from 'antd';
import moment from 'moment';
import ConfigService from '../../service/ConfigService';
import webUtils from '../../commons/utils/webUtils';
const FormItem = Form.Item;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;

const startDate = moment().add('days', -7);
const endDate = moment();
class ChannelSearchForm extends Component {
  constructor(props){
    super(props);
    this.state = {
      defaultChannelCode: null, //当前操作员对应默认渠道代码
      channelCodeList: [],
      channelIdList: []
    }
  }
  disabledDate = (current) => {
    return current && current.valueOf() >= Date.now();
  }
  // 根据渠道查询批次号
  handleChange = (value) => {
    ConfigService.queryChannelIdByCode(value).then(result => {
      const channelIdList = !!result ? result.map(channel => ( { channelId: channel.channelId} )) : [];
      this.setState({ channelIdList })
      // 渠道代码变动了，清空批次下拉框
      this.props.form.setFieldsValue({ channelId: null })
    })
  }
  componentDidMount() {
    ConfigService.queryChannelCodeByUserId().then(obj => {
      const defaultChannelCode = !!obj['defaultChannelCode'] ? obj['defaultChannelCode'] : null;
      const ucList = obj['userChannelList'];
      const cidList = obj['channelIdList'];
      let channelCodeList = [], channelIdList = [];
      if(!!cidList && cidList.length > 0){
        for(let obj of cidList){
          if(obj.channelId){
            channelIdList.push({ channelId: obj.channelId, channelTxt: obj.channelId })
          } else {
            channelIdList.push({ channelId: obj.channelId, channelTxt: '其他' })
          }
        }
      }
      if(!!ucList && ucList.length > 0){
        for(let obj of ucList){
          if(obj.channelCode){
            channelCodeList.push({ channelCode: obj.channelCode })
          }
        }
      }
      this.setState({
        defaultChannelCode,
        channelIdList,
        channelCodeList
      })
    });
  }
  render() {
    const { defaultChannelCode, channelCodeList, channelIdList } = this.state;
    const {form, onSearch} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    return (
      <Form layout="horizontal" onSubmit={ onSearch } className="ant-advanced-search-form">
        <Row>
          <Col sm={8}>
            <FormItem label="渠道代码" {...formItemLayout}>
              {getFieldDecorator("channelCode", {
                rules: [{required: true}],
                initialValue: defaultChannelCode,
                onChange: this.handleChange
              })(
                <Select placeholder="请选择渠道代码查询">
                  {
                    channelCodeList.map(c => (
                      <Option key={c.channelCode}>{c.channelCode}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="批次" {...formItemLayout}>
              {getFieldDecorator("channelId")(
                <Select placeholder="请选择批次查询" allowClear>
                  {
                    channelIdList.map(c => <Option key={c.channelId} value={c.channelId}>{c.channelTxt}</Option>)
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="日期" {...formItemLayout}>
              {getFieldDecorator("queryDate", {
                initialValue: [startDate, endDate]
              })(
                <RangePicker disabledDate={this.disabledDate}
                             format="YYYY-MM-DD" allowClear={false} showTime={false} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={12} offset={12} style={{ textAlign: 'right' }}>
            <Button type="primary" icon="search" size="large" htmlType="submit">搜索</Button>
          </Col>
        </Row>
      </Form>
    )
  }
}
ChannelSearchForm = Form.create()(ChannelSearchForm);

export default class ChannelList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dataSource: []
    }
    this.handleSearch = this.handleSearch.bind(this);
    this.isRecharge = window.location.href.indexOf("/recharge") >= 0
  }
  __getColumns() {
    const arr = [
      {title: '统计日期',   dataIndex: 'statDate'},
      {title: '点击数',   dataIndex: 'clickNumber'},
      {title: '注册数',   dataIndex: 'regNumber'},
      {title: '充值人数',      dataIndex: 'rechargeNumber'}
    ];
    this.isRecharge && arr.push({title: '充值总金额', dataIndex: 'rechargeFee', render: (text) => { return text/100}});
    return arr;
  }
  // 搜索
  handleSearch(e) {
    e.preventDefault();
    const values = this.channelSearchForm.getFieldsValue();
    values['startDate'] = values['queryDate'][0].format('YYYY-MM-DD');
    values['endDate'] = values['queryDate'][1].format('YYYY-MM-DD');
    if(!values['startDate'] || !values['endDate']) {
      webUtils.alertFailure('请选择统计日期范围')
      return;
    }
    if(!!values['channelId']) {
      values['channelId'] = values['channelCode'] + values['channelId'];
    }
    delete values['queryDate'];
    this.setState({ loading: true });
    ConfigService.queryUserDataByChannel(values).then(dataSource => {
      this.setState({ loading: false, dataSource })
    }).catch(err=>{this.setState({ loading: false })})
  }
  render() {
    const { loading, dataSource } = this.state;
    return (
      <div>
        <ChannelSearchForm ref={(form)=>{this.channelSearchForm=form}} onSearch={this.handleSearch} />
        <Table bordered loading={loading} columns={this.__getColumns()} dataSource={dataSource} pagination={false} />
      </div>
    )
  }
}
