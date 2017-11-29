/**
 *主播工资已结算
 * @author 谭亮红
 */
import React, {Component} from 'react';
import {Form, Row, Col, Input, Button, Select, DatePicker, InputNumber} from 'antd';
import CustomTable from '../../commons/widgets/CustomTable';
import SettlementService from '../../service/SettlementService';
import AnchorService from '../../service/AnchorService';
import UnionService from '../../service/UnionService';
import {DateUtil, FORMAT_PATTERNS} from '../../commons/utils/DateUtil';
import commonUtils from '../../commons/utils/commonUtils';

import webUtils from '../../commons/utils/webUtils';

import FixedDateRangeCmp from '../salary/FixedDateRangeCmp'

const FormItem = Form.Item;
const Option = Select.Option
const {RangePicker} = DatePicker

//搜索表单
class AnchorAlreadySettlementForm extends FixedDateRangeCmp {
  constructor(props) {
    super(props)
    this.state = {
      beforeDay: this.fifteenDaysAgo,
      btnStyle: true,
      guildCode: [],
      anchorList: [],
			uninOperationList: [],
    }
  }

  getExtraFormValues(values) {
    return {settledStatus: 'settled', billPeriod: DateUtil.whichBillPeriod(values.billPeriod)};
  }

  handleReset = () => {
    this.props.form.resetFields()
  }
  onSearch = (e) => {
    e.preventDefault();
    const values = this.extractedFormValue()
    this.props.onSearch(values);
  }

  componentDidMount() {
    //获取公会id(不是公会代码)
    UnionService.queryAllGuild().then(guildCode => {
      this.setState({guildCode})
    })
		AnchorService.queryUserByType().then(result => {
			this.setState({uninOperationList: result})
		})
  }

  render() {
    const {beforeDay, guildCode, anchorList} = this.state;
    const {form} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    return (
      <Form layout="horizontal" onSubmit={this.onSearch} className="ant-advanced-search-form">
        <Row>
          <Col sm={8}>
            <FormItem label="账期时间" {...formItemLayout}>
              {getFieldDecorator("billPeriod")(
                <DatePicker
                  style={{width: '100%'}}
                  format={DateUtil.YMD}
                  placeholder="请选择账期时间"/>)}
            </FormItem>
            <FormItem label="房间ID" {...formItemLayout}>
              {getFieldDecorator("roomId")(<InputNumber style={{width: '100%'}} placeholder="请输入房间ID"/>)}
            </FormItem>
            <FormItem label="创建时间" {...formItemLayout}>
              {getFieldDecorator("data", {initialValue: [beforeDay, DateUtil.nowAsYmd()]})(
                <RangePicker format={FORMAT_PATTERNS.YMD}/>
              )}
              <div style={{marginTop: 8, textAlign: 'left'}}>
                <span style={{color: this.firstRangeButtonType, fontSize: 14, cursor: 'pointer'}}
                      onClick={this.queryWithFixedRange.bind(this, this.fifteenDaysAgo)}>
                最近15日</span>
                <span
                  style={{color: this.secondRangeButtonType, fontSize: 14, marginLeft: 8, cursor: 'pointer'}}
                  onClick={this.queryWithFixedRange.bind(this, this.thirtyDayAgo)}>
                最近30日</span>
              </div>
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="公会名称" {...formItemLayout}>
              {getFieldDecorator("guildId")(
                <Select
                  optionFilterProp="children"
                  allowClear
                  showSearch>
                  {
                    guildCode.map(item => (
                      <Option key={item.guildId}>{item.guildName}({item.guildId})</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label="状态" {...formItemLayout}>
              {getFieldDecorator("status")(
                <Select>
                  <Option value="GRANT">已发放</Option>
                  <Option value="UNGRANT">待发放</Option>
                  <Option value="INACTIVE">失效</Option>
                  <Option value="ACTIVE">有效</Option>
                </Select>
              )}
            </FormItem>

            <FormItem label="运营归属" {...formItemLayout}>
              {getFieldDecorator("tutorUserId")(
                <Select placeholder="请选择运管" allowClear>
									{
										this.state.uninOperationList.map(({userId, nickname}) => (
                      <Option key={userId}>{nickname}({userId})</Option>
										))
									}
                </Select>
              )}
            </FormItem>
          </Col>

          <Col sm={8}>
            <FormItem label="主播ID" {...formItemLayout}>
              {getFieldDecorator("anchorUserId")(
                <Input/>
              )}
            </FormItem>
            <FormItem label="公会结算ID" {...formItemLayout}>
              {getFieldDecorator("settlementGuildId")(<Input placeholder="请输入公会结算ID"/>)}
            </FormItem>
            <FormItem style={{textAlign: 'right'}}>
              <Button type="primary" icon="search" size="large" htmlType="submit">查询</Button>
              <Button type="ghost" icon="cross" size="large" onClick={this.handleReset}>清除</Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
}

AnchorAlreadySettlementForm = Form.create()(AnchorAlreadySettlementForm);
export default class AnchorAlreadySettlement extends Component {
  constructor(props) {
    super(props);
    this.alreadyColumns = [
      {title: '结算ID', dataIndex: 'recrodId', width: 70, fixed: 'left'},
      {title: '账期', dataIndex: 'billPeriod', width: 70, fixed: 'left'},
      {title: '公会结算ID', dataIndex: 'settlementGuildId', width: 85, fixed: 'left'},
      {title: '主播ID', dataIndex: 'anchorUserId', width: 85},
      {title: '房间ID', dataIndex: 'roomId', width: 85},
      {title: '昵称', dataIndex: 'anchorUserName', width: 110},
      {title: '状态', dataIndex: 'statusDesc', width: 75},
      {title: '公会名称', dataIndex: 'guildName', width: 100},
      {title: '推广数量', dataIndex: 'operationCount', width: 70},
      {title: '直播时长', dataIndex: 'liveHours', width: 90, render: (text) => commonUtils.getFormatHoursFromHour(text)},
      {title: '直播有效天', dataIndex: 'liveDays', width: 90, render: (text) => commonUtils.getFormatDaysFromDay(text)},
			{title: '奖金考核天数', dataIndex: 'ruledLiveDays', width: 120, render: (text) => commonUtils.getFormatDaysFromDay(text)},
      {title: '兑换金额', dataIndex: 'exchangeFee', width: 90, render: (text) => commonUtils.getFormatCentToYuan(text)},
      {title: '奖励', dataIndex: 'awardFee', width: 85, render: (text) => commonUtils.getFormatCentToYuan(text)},
      {title: '惩罚', dataIndex: 'punishFee', width: 85, render: (text) => commonUtils.getFormatCentToYuan(text)},
      {title: '暂扣', dataIndex: 'detainFee', width: 85, render: (text) => commonUtils.getFormatCentToYuan(text)},
      {title: '暂扣解冻', dataIndex: 'thawFee', width: 85, render: (text) => commonUtils.getFormatCentToYuan(text)},
      {title: '保底补偿', dataIndex: 'compensateFee', width: 85, render: (text) => commonUtils.getFormatCentToYuan(text)},
      {title: '应发税前金额', dataIndex: 'shouldFee', width: 135, render: (text) => commonUtils.getFormatCentToYuan(text)},
      {title: '税率', dataIndex: 'taxRate', width: 85, render: (text) => commonUtils.getFormatPercentOff(text)},
      {title: '应发税后金额', dataIndex: 'realFee', width: 135, render: (text) => commonUtils.getFormatCentToYuan(text)},
      {title: '归属运营', dataIndex: 'tutorUserName', width: 100},
      {title: '创建时间', dataIndex: 'createTime', width: 80},
      {title: '创建人', dataIndex: 'createUserName', width: 100},
      {
         title: '操作', dataIndex: '_there_is_no_such_a_field_', fixed: 'right', width: 130, render: (text, record) => {
         return (
           record.status === "UNGRANT" && <span>
            <a href="javascript:void(0)" onClick={this.cancelSettlement.bind(this, record.recrodId)}>取消结算</a>
          </span>
         )
       }
     }
    ]
    this.formParams = {}
  }

  cancelSettlement = (recordId) => { //取消主播的结算
    webUtils.confirm(() => {
      SettlementService.cancelSettlement(recordId).then(() => {
        this._customAlreadyTable.queryTableData(this.formParams);
      })
    }, `是否确认 取消结算【${recordId}】`)
  }

  onSearch = (value) => {
    this.formParams = value
    this._customAlreadyTable.queryTableData(value);
  }

  render() {
    return (
      <div>
        <AnchorAlreadySettlementForm ref={form => this._queryForm_ = form} onSearch={this.onSearch}/>
        <CustomTable ref={table => this._customAlreadyTable = table}
                     rowKey="recrodId"
                     columns={this.alreadyColumns}
                     scroll={{x: 2180}}
                     fetchTableDataMethod={SettlementService.queryAnchorSettlementList}/>
      </div>
    )
  }
}