/*
主播直播数据查询
 */
import React, {Component} from 'react';
import {Form, Row, Col, Input, Button, Select, DatePicker, Tag, Radio} from 'antd';
import moment from 'moment';
import LivingRecordModal from '../anchor/LivingRecordModal'
import CustomTable from '../../commons/widgets/CustomTable';
import AnchorService from '../../service/AnchorService';
import CustomSelect from '../../commons/widgets/CustomSelect';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const {RangePicker} = DatePicker;

// 当月第一天
const date = new Date();
date.setDate(1)
const startDate = moment(date, "YYYY-MM-DD")

class SearchForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      managerList: []
    }
  }
  _getFormValues(){
    let params = this.props.form.getFieldsValue();
    params['startDate'] = params['queryDate'][0].format('YYYY-MM-DD 00:00:00');
    params['queryDate'][1] && (params['endDate'] = params['queryDate'][1].format('YYYY-MM-DD 23:59:59'));
    delete params["queryDate"];
    return params;
  }
  handleSearchTable = (e) => {
    e.preventDefault();
    this.props.onSearch(this._getFormValues());
  }
  handleExportToExcel = () => {
    if(this.state.loading === true) return;
    this.setState({ loading: true});
    AnchorService.getAnchorLivingDataExcel(this._getFormValues()).then(result => {
      this.setState({ loading: false });
      var a = document.createElement('a');
      var url = window.URL.createObjectURL(result);
      var filename = '主播直播数据.xls';
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    }).catch(err=> this.setState({ loading: false }))
  }
  componentDidMount(){
    AnchorService.queryUserByType().then(result => {
      this.setState({ managerList: result })
    })
  }
  render(){
    const {loading, managerList} = this.state;
    const {getFieldDecorator} = this.props.form;
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    return (
      <Form layout="horizontal" onSubmit={this.handleSearchTable} className="ant-advanced-search-form">
        <Row>
          <Col sm={8}>
            <FormItem label="主播ID" {...formItemLayout}>
              {getFieldDecorator("userId")(<Input placeholder="请输入主播ID查询" />)}
            </FormItem>
            <FormItem label="房间ID" {...formItemLayout}>
              {getFieldDecorator("programId")(<Input placeholder="请输入房间ID查询" />)}
            </FormItem>
            <FormItem label="归属" {...formItemLayout}>
              {getFieldDecorator("programBelong")(
                <CustomSelect showSearch allowClear
                              optionFilterProp="children"
                              itemKey="ProgramBelong"
                              placeholder="请选择归属" />
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="昵称" {...formItemLayout}>
              {getFieldDecorator("nickname")(<Input placeholder="昵称支持模糊查询" />)}
            </FormItem>
            <FormItem label="推广" {...formItemLayout}>
              {getFieldDecorator("spread")(
                <Select allowClear placeholder="请选择是否推广">
                  <Option value="T">是</Option>
                  <Option value="F">否</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="排序" {...formItemLayout}>
              {getFieldDecorator("orderField",{
                initialValue: "money"
              })(
                <RadioGroup>
                  <RadioButton value="money">兑换金额</RadioButton>
                  <RadioButton value="hours">直播时长</RadioButton>
                  <RadioButton value="last_show_begin_time">最后开播时间</RadioButton>
                </RadioGroup>
              )}
            </FormItem>

          </Col>
          <Col sm={8}>
            <FormItem label="直播日期" {...formItemLayout}>
              {getFieldDecorator("queryDate",{
                initialValue: [startDate, null]
              })(
                <RangePicker allowClear={false} format="YYYY-MM-DD" placeholder={['开始日期', '结束日期']}/>
              )}
            </FormItem>
            <FormItem label="归属运管" {...formItemLayout}>
              {getFieldDecorator("tutorUserId")(
                <Select showSearch allowClear dropdownMatchSelectWidth={false} placeholder="请选择运管">
                  {
                    managerList.map(user => (
                      <Option key={String(user.userId)}>{user.nickname}({user.userId})</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label="排序类型" {...formItemLayout}>
              {getFieldDecorator("orderType",{
                initialValue: "desc"
              })(
                <RadioGroup>
                  <RadioButton value="desc">降序</RadioButton>
                  <RadioButton value="asc">升序</RadioButton>
                </RadioGroup>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12} offset={12} style={{ textAlign: 'right' }}>
            {this.props.canExport && <Button type="primary" icon="export" size="large" loading={loading} onClick={this.handleExportToExcel}>
              {loading === false ? "导出Excel" : "导出中,请稍后..."}
            </Button>}
            <Button type="primary" icon="search" size="large" htmlType="submit">搜索</Button>
          </Col>
        </Row>
      </Form>
    )
  }
}

SearchForm = Form.create()(SearchForm)

export default class AnchorLiving extends Component{
  constructor(props){
    super(props);
    this.state = {
      canExport: false,
      totalMoney: 0,
      // 直播记录
      livingVisible:false,
      // 当前点击行数据
      record: {},
    }
    this.handleSearch = this.handleSearch.bind(this)
    this.columns = [
      {title: '主播ID', dataIndex: 'userId', width: 80},
      {title: '房间ID', dataIndex: 'programId', width: 80},
      {title: '昵称', dataIndex: 'nickname'},
      {title: '归属', dataIndex: 'programBelongText', width: 120, render: (text, record) => {
        if(record['programBelong'] == 'JULUN') return <Tag color="#87d068">{text}</Tag>
        return text
      }},
      {title: '推广数', dataIndex: 'operationCount', width: 80, render: (text) => {
        if(text > 0) return <Tag color="#87d068">{text}</Tag>
        return <Tag color="#f50">{text}</Tag>
      }},
      {title: '兑换金额', dataIndex: 'money', width: 80, render: (text) => `${text}元`},
      {title: '直播时长', dataIndex: 'hours', width: 80, render: (text) => `${text}小时`},
      {title: '有效天', dataIndex: 'days', width: 80, render: (text) => `${text}天`},
      {title: '手机直播时长', dataIndex: 'appHours', width: 100, render: (text) => `${text}小时`},
      {title: '手机有效天', dataIndex: 'appDays', width: 80, render: (text) => `${text}天`},
      {title: '奖金考核有效天',     dataIndex: 'validDays', width: 100},
      {title: '归属运管',     dataIndex: 'tutorNickname', width: 100},
      {title: '首次开播时间', dataIndex: 'firstShowBeginTime', width: 135},
      {title: '最后开播时间', dataIndex: 'lastShowBeginTime', width: 135},
      {title: '操作', width: 80, render:(text, record) => {
        return <a onClick={this.showLivingRecordsModal.bind(this, record)}>开播记录</a>
      }}
    ]
  }
  showLivingRecordsModal = (record, e) => {
    e.preventDefault();
    this.setState({ livingVisible: true, record });
  }
  handleClose = () => {
    this.setState({ livingVisible: false })
  }
  // 搜索
  handleSearch(params) {
    this.customTable.queryTableData(params);
    AnchorService.sumMoneyAnchorLiving(params).then(result => {
      this.setState({ totalMoney: result })
    })
  }
  componentDidMount(){
    const {btnResList} = this.props.location.state;
    this.btnResList = btnResList;
    if(this.btnResList.includes(26)) {
      this.setState({ canExport: true })
    }
  }
  render(){
    const {livingVisible, record} = this.state;
    return (
      <div>
        <SearchForm canExport={this.state.canExport} onSearch={this.handleSearch}/>
        <p style={{ paddingBottom: 16 }}>合计兑换金额 {this.state.totalMoney} 元</p>
        <CustomTable ref={table => this.customTable=table}
                     rowKey="userId"
                     columns={this.columns}
                     scroll={{x: 1380}}
                     fetchTableDataMethod={AnchorService.queryAnchirLivingData}/>
        <LivingRecordModal visible={livingVisible} record={record} onClose={this.handleClose} />
      </div>
    )
  }
}