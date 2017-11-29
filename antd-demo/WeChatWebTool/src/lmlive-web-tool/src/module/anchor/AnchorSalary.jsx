import React, {Component} from 'react';
import {Form, Row, Col, Input, Select, Modal, Button, Tag,Table,DatePicker} from 'antd';
import AnchorService from '../../service/AnchorService';
import CustomTable from '../../commons/widgets/CustomTable';
import moment from 'moment';
import commonUtils from '../../commons/utils/commonUtils';

const FormItem = Form.Item;
const {RangePicker} = DatePicker

const startData=moment('2017/03/01', "YYYY-MM-DD");
class AnchorSalaryFrom extends Component{
  constructor(props){
    super(props);
    this.handleSubmit=this.handleSubmit.bind(this);
  }
  handleSubmit(e){
    e.preventDefault();
    const values = this.props.form.getFieldsValue();
    let params = {
      userId: values.userId,
      loginName: values.loginName,
    };
    const queryDate = values.queryDate;
    if(queryDate && queryDate.length > 0) {
      params.startDate = queryDate[0].format("YYYY-MM-DD HH:mm:ss");
      queryDate[1] && (params.endDate = queryDate[1].format("YYYY-MM-DD HH:mm:ss"));
    }
    this.props.onSearch(params);
  }
  render(){
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 16},
    }
    const {getFieldDecorator} = this.props.form;
    return(
      <Form layout="horizontal" onSubmit={this.handleSubmit}  className="ant-advanced-search-form">
        <Row>
          <Col span={8}>
            <FormItem label="主播编号 " {...formItemLayout}>
              {getFieldDecorator('userId')(
                <Input placeholder="请输入用户Id " />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="登录名 " {...formItemLayout}>
              {getFieldDecorator('loginName')(
                <Input placeholder="请输入登录名" />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="查询时间" {...formItemLayout}>
              {getFieldDecorator("queryDate",{
                initialValue: [startData, null]
              })(
                <RangePicker format="YYYY-MM-DD" placeholder={['开始时间', '结束时间']}/>
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
    );
  }
}
AnchorSalaryFrom=Form.create()(AnchorSalaryFrom);

export default class  AnchorSalary extends Component{
  constructor(props){
    super(props)
    this.handleSearch = this.handleSearch.bind(this);
  }
  __getColumns() {
    return [
      {title: '主播编号',   dataIndex: 'userId', width: 80},
      {title: '昵称', dataIndex: 'nickname', width: 120},
      {title: '开户人',   dataIndex: 'accountName', width: 80},
      {title: '身份证号', dataIndex: 'certNum', width: 135},
      {title: '登录名', dataIndex: 'loginName', width: 100},
      {title: '有效天', dataIndex: 'validDays', width: 80, render: (text) => `${text}天`},
      {title: '在线时长', dataIndex: 'seconds', width: 120, render: (text) => commonUtils.getFormatTime(text)},
      {title: '工资', dataIndex: 'chengPoints', width: 85, render: (text) => `${text/1000}元`},
      {title: '主播等级', dataIndex: 'levelValue', width: 100},
      {title: '开户银行', dataIndex: 'bankCode', width: 150},
      {title: '支行名称', dataIndex: 'branchName', width: 150},
      {title: '银行卡号', dataIndex: 'bankAccount'}
    ];
  }
  handleSearch(params) {
    this.refs.customTable.queryTableData(params);
  }
  render(){
    return(
      <div>
        <AnchorSalaryFrom onSearch={this.handleSearch} />
        <CustomTable ref="customTable" rowKey="userId" columns={this.__getColumns()}
                     fetchTableDataMethod={AnchorService.searchAnchorCollect} scroll={{x: 1300}}/>
      </div>
    );
  }
}
