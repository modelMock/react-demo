import React, {Component} from 'react';
import {Table, Row, Col, Form, Input, Radio, DatePicker, Tag, Button} from 'antd';
import moment from 'moment';
import UnionService from '../../service/UnionService';
import LivingRecordModal from '../anchor/LivingRecordModal'

import {DateUtil,FORMAT_PATTERNS} from '../../commons/utils/DateUtil';


const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { MonthPicker } = DatePicker;
const defaultMonthDate = DateUtil.nowAsYmd()

const UnionSearchForm = Form.create()(
  (props) => {
    const {form, onSearch} = props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    const _search = (e) => {
      e.preventDefault();
      onSearch(form.getFieldsValue());
    }
    return (
      <Form layout="horizontal" onSubmit={ _search } className="ant-advanced-search-form">
        <Row>
          <Col sm={8}>
            <FormItem label="查询时间" {...formItemLayout}>
              {getFieldDecorator("onlineDate", {
                initialValue: defaultMonthDate
              })(
                <MonthPicker allowClear={false} format={FORMAT_PATTERNS.YMD} />
              )}
            </FormItem>
            <FormItem label="昵称" {...formItemLayout}>
              {getFieldDecorator("nickname")(<Input placeholder="昵称支持模糊查询" />)}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="主播ID" {...formItemLayout}>
              {getFieldDecorator("userId")(<Input placeholder="请输入主播ID查询" />)}
            </FormItem>
            <FormItem label="手机号" {...formItemLayout}>
              {getFieldDecorator("mobile")(<Input placeholder="请输入主播手机号" />)}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="房间ID" {...formItemLayout}>
              {getFieldDecorator("programId")(<Input placeholder="请输入房间ID查询" />)}
            </FormItem>
            <FormItem label="直播状态" {...formItemLayout}>
              {getFieldDecorator("status",{
                initialValue: "ALL"
              })(
                <RadioGroup>
                  <RadioButton value="ALL">全部</RadioButton>
                  <RadioButton value="T">直播中</RadioButton>
                  <RadioButton value="F">暂未直播</RadioButton>
                </RadioGroup>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12} offset={12} style={{ textAlign: 'right' }}>
            <Button type="primary" icon="search" size="large" htmlType="submit">搜索</Button>
          </Col>
        </Row>
      </Form>
    )
  }
)

export default class UnionManage extends Component {
  constructor(props){
    super(props);
    this.state = {
      loading: false,
      dataSource: [],
      pagination: {
        current: 1,
        pageSize: 10,
        showQuickJumper: true,  //显示可以快速跳转至某页
        showSizeChanger: true,  //显示可以改变 pageSize
        showTotal: ( total => (`共 ${total} 条`))   //显示总共有多少条数据
      },
      totalMoney: 0,
      livingVisible: false,
      record: {}
    }
    this.columns = [
      {title: '主播ID', dataIndex: 'userId', fixed: 'left', width: 80},
      {title: '房间ID', dataIndex: 'programId', fixed: 'left', width: 80},
      {title: '昵称', dataIndex: 'nickname', fixed: 'left', width: 150},
      {title: '手机号', dataIndex: 'mobile', width: 100},
      {title: '直播时长', dataIndex: 'hours', render: (text) => `${text}小时`, width: 80},
      {title: '有效天', dataIndex: 'days', render: (text) => `${text}天`, width: 80},
      {title: '手机直播时长', dataIndex: 'appHours', width: 100, render: (text) => `${text}小时`},
      {title: '手机有效天', dataIndex: 'appDays', width: 80, render: (text) => `${text}天`},
      {title: '首次时间', dataIndex: 'firstShowBeginTime', width: 135},
      {title: '最后时间', dataIndex: 'lastShowBeginTime', width: 135},
      {title: '兑换金额（三期）', dataIndex: 'money1', render: (text, record) => `${text}/${record.money2}/${record.money3}元`},
      {title: '总兑换金额', dataIndex: 'money', width: 85, render: (text) => `${text}元`},
      {title: '直播状态', dataIndex: 'liveStatus', width: 80, render: (text) => {
        if(text === "T") return <Tag color="#87d068">直播中</Tag>;
        return <Tag color="#f50">暂未直播</Tag>;
      }},
      {title: '操作', fixed: 'right', width: 80, render: (text, record) => {
        return <a onClick={this.showLivingRecordsModal.bind(this, record)}>开播记录</a>
      }}
    ]
  }
  showLivingRecordsModal = (record, e) => {
    e.preventDefault();
    this.setState({ livingVisible: true, record });
  }
  handleTableChange = (pagination) => {
    const pager = {...this.state.pagination};
    pager.current = pagination.current;
    pager.pageSize = pagination.pageSize
    this.setState({
      loading: true,
      pagination: pager
    })
    this.__fetch(this.formParams, pager.pageSize * (pager.current - 1), pager.pageSize)
  }
  handleSearch = (params) => {
    this.formParams = params;
    this.formParams["onlineDate"] = new Date(DateUtil.formatAsStartOfDay(params['onlineDate'])).getTime()
    this.setState({ loading: true })
    this.__fetch(params)
  }
  __fetch(params = {}, offset = 0, limit = this.state.pagination.pageSize){
    const values = {...params, offset, limit};
    UnionService.queryUnionStatData(values).then(result => {
      const pagination = {...this.state.pagination}
      const pageData = result["page"], totalMoney = result["totalMoney"]
      pagination.total = pageData['totalCount']
      this.setState({
        loading: false,
        dataSource: pageData.records,
        totalMoney,
        pagination
      })
    }).catch(err => this.setState({ loading: false }));
  }
  handleClose = () => {
    this.setState({ livingVisible: false })
  }
  render(){
    const {loading, dataSource, pagination, totalMoney, livingVisible, record} = this.state
    return (
      <div>
        <UnionSearchForm ref={(form) => { this.anchorSearchForm = form }} onSearch={this.handleSearch}/>
        <p style={{ paddingBottom: 16 }}>合计兑换金额（三期总和）{totalMoney} 元</p>
        <Table bordered
               rowKey="userId"
               columns={this.columns}
               loading={loading}
               dataSource={dataSource}
               pagination={pagination}
               scroll={{x: 1430}}
               onChange={this.handleTableChange} />
        <LivingRecordModal visible={livingVisible} record={record} onClose={this.handleClose} />
      </div>
    )
  }
}