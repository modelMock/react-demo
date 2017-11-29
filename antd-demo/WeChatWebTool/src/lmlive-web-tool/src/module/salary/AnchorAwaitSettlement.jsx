/**
 *主播工资待结算
 * @author 谭亮红
 */
import React, {Component} from 'react';
import {Form, Row, Col, Input, Button, Select, DatePicker, Modal, InputNumber} from 'antd';
import CustomTable from '../../commons/widgets/CustomTable';
import SettlementService from '../../service/SettlementService';
import UnionService from '../../service/UnionService';
import {DateUtil} from '../../commons/utils/DateUtil';
import webUtils from '../../commons/utils/webUtils';
import commonUtils from '../../commons/utils/commonUtils';
import AnchorService from '../../service/AnchorService';

const FormItem = Form.Item;
const Option = Select.Option

//搜索表单
class AnchorAwaitSettlementForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      anchorList: [],
    }
  }

  onSearch = (e) => {
    e.preventDefault();
    let values = Object.assign({}, this.props.form.getFieldsValue());
    //用户选择的是时间，需要转换为帐期传给后台
    values['billPeriod'] = DateUtil.whichBillPeriod(values['billPeriod'])
    this.props.onSearch(values);
  }

  render() {
    const {form, onAnchorSettlement, guildCode} = this.props
    const {anchorList} = this.state
    const {getFieldDecorator} = form
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14}
    }
    return (
      <Form layout="horizontal" onSubmit={this.onSearch} className="ant-advanced-search-form">
        <FormItem>
          {getFieldDecorator("settledStatus", {initialValue: 'unSettled'})(
            <Input type="hidden"/>
          )}
        </FormItem>
        <Row>
          <Col sm={8}>
            <FormItem label="账期时间" {...formItemLayout}>
              {getFieldDecorator("billPeriod")(
                <DatePicker
                  style={{width: '100%'}}
                  format={DateUtil.YMD}
                  placeholder="请选择账期时间"/>
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="公会名称" {...formItemLayout}>
              {getFieldDecorator("guildId")(
                <Select
                  optionFilterProp="children"
                  placeholder="请选择公会"
                  allowClear
                  showSearch
                >
                  {
                    guildCode.map(item => (
                      <Option key={item.guildId}>{item.guildName}({item.guildId})</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="主播ID" {...formItemLayout}>
              {getFieldDecorator("anchorUserId")(
                <Input />
              )}
            </FormItem>
            <FormItem style={{textAlign: 'right'}}>
              <Button type="primary" ghost size="large" onClick={onAnchorSettlement}>主播工资结算</Button>
              <Button type="primary" icon="search" size="large" htmlType="submit">查询</Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
}

AnchorAwaitSettlementForm = Form.create()(AnchorAwaitSettlementForm);

//主播结算弹窗
class AnchorSettlementModal
  extends Component {
  constructor(props) {
    super(props);
    this.state = {
      billPeriods: [],
      guildCode: [],
      loading: false
    }
  }

  componentDidMount() {
    //获取有待结算的主播对应的所有账期
    SettlementService.getUnsettledBillPeriod().then(jsonResult => {
      this.setState({billPeriods: jsonResult})
    })
  }

  onBillPeriod = (value) => {
    //获取指定账期下未结算的主播对应的公会信息
    SettlementService.getUnsettledGuild({billPeriod: value}).then(jsonResult => {
      this.props.form.setFieldsValue({
        guildIds: []
      })
      this.setState({guildCode: jsonResult})
    })
  }
  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if(!!err) return;
      webUtils.confirm(() => {
        this.setState({
          loading: true
        })
        SettlementService.saveAnchorSettlement(values).then(jsonResult => {
          webUtils.alertSuccess("结算成功！");
          this.setState({
            loading: false
          })
          this.onClose();
        }).catch(err => {
          this.setState({
            loading: false
          })
        })
      }, "确定结算吗?")
    })
  }
  onClose = () => {
    this.props.onClose();
    this.props.form.resetFields();
  }

  render() {
    const {billPeriods, guildCode, loading} = this.state;
    const {visible, form} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 16},
    };
    return (
      <Modal title="主播工资结算"
             width={660}
             visible={visible}
             onOk={this.handleSave}
             onCancel={this.onClose}
             footer={[
               <Button key="back" size="large" onClick={this.onClose}>取消</Button>,
               <Button key="submit" type="primary" size="large" loading={loading} onClick={this.handleSave}>
                 一键结算
               </Button>,
             ]}
      >
        <Form>
          <FormItem label="选择账期" {...formItemLayout}>
            {getFieldDecorator("billPeriod", {
              rules: [{required: true, message: '请选择账期'}],
            })(
              <Select onChange={this.onBillPeriod}>
                {billPeriods.map(it => <Option key={it}>{it}</Option>)}
              </Select>
            )}
          </FormItem>
          <FormItem label="公会名称" {...formItemLayout}>
            {getFieldDecorator("guildIds", {
              rules: [{required: true, message: '请选择公会名称'}],
            })(
              <Select
                mode="multiple"
                style={{width: '100%'}}
                placeholder="请选择公会"
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
        </Form>
      </Modal>
    )
  }
}
AnchorSettlementModal = Form.create()(AnchorSettlementModal);

export default class AnchorAwaitSettlement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorSettlementVisible: false,
      guildCode: [],
    }
    this.awaitColumns = [
      {title: '账期', dataIndex: 'billPeriod', width: 80, fixed: 'left'},
      {title: '主播ID', dataIndex: 'anchorUserId', width: 80, fixed: 'left'},
      {title: '房间ID', dataIndex: 'roomId', width: 80, fixed: 'left'},
      {title: '昵称', dataIndex: 'anchorUserName', width: 160},
      {title: '公会名称', dataIndex: 'guildName', width: 160},
      {title: '推广数量', dataIndex: 'operationCount', width: 80},
      {title: '直播时长', dataIndex: 'liveHours', width: 80, render: (text) => commonUtils.getFormatHoursFromHour(text)},
      {title: '直播有效天', dataIndex: 'liveDays', width: 100, render: (text) => commonUtils.getFormatDaysFromDay(text)},
      {title: '奖金考核天数', dataIndex: 'ruledLiveDays', width: 120, render: (text) => commonUtils.getFormatDaysFromDay(text)},
      {title: '兑换金额', dataIndex: 'exchangeFee', width: 80, render: (text) => commonUtils.getFormatCentToYuan(text)},
      {title: '奖励', dataIndex: 'awardFee', width: 80, render: (text) => commonUtils.getFormatCentToYuan(text)},
      {title: '惩罚', dataIndex: 'punishFee', width: 80, render: (text) => commonUtils.getFormatCentToYuan(text)},
      {title: '暂扣', dataIndex: 'detainFee', width: 80, render: (text) => commonUtils.getFormatCentToYuan(text)},
      {title: '暂扣解冻', dataIndex: 'thawFee', width: 80, render: (text) => commonUtils.getFormatCentToYuan(text)},
      {title: '保底补偿', dataIndex: 'compensateFee', width: 80, render: (text) => commonUtils.getFormatCentToYuan(text)},
      {title: '应发税前金额', dataIndex: 'shouldFee', width: 100, render: (text) => commonUtils.getFormatCentToYuan(text)},
      {title: '归属运营', dataIndex: 'tutorUserName', width: 100},
			{title: '税率', dataIndex: 'taxRate', width: 80, render: (text) => commonUtils.getFormatPercentOff(text)},
			{title: '应发税后金额', dataIndex: 'realFee', width: 120, render: (text) => commonUtils.getFormatCentToYuan(text)},

			{title: 'PC直播时长', dataIndex: 'pcValidHours', width: 100, render: (text) => commonUtils.getFormatHoursFromHour(text)},
			{title: 'PC直播有效天', dataIndex: 'pcValidDays', width: 120, render: (text) => commonUtils.getFormatDaysFromDay(text)},
			{title: '手机直播时长', dataIndex: 'appValidHours', width: 100, render: (text) => commonUtils.getFormatHoursFromHour(text)},
			{title: '手机直播有效天', dataIndex: 'appValidDays', width: 120, render: (text) => commonUtils.getFormatDaysFromDay(text)}
    ];
  }

  componentDidMount() {
    //获取公会id(不是公会代码)
    UnionService.queryAllGuild().then(guildCode => {
      this.setState({guildCode})
    })
  }

  //搜索表单
  onSearch = (value) => {
    this._customAnhorAwaitTable.queryTableData(value);
  }
  //打开主播结算弹窗
  onAnchorSettlementModal = (e) => {
    e.preventDefault();
    this.setState({anchorSettlementVisible: true})
  }
  //统一关闭弹出框
  handleClose = () => {
    this.setState({
      anchorSettlementVisible: false,
    })
  }

  render() {
    const {anchorSettlementVisible, guildCode} = this.state;
    return (
      <div>
        <AnchorAwaitSettlementForm
          guildCode={guildCode}
          onAnchorSettlement={this.onAnchorSettlementModal}
          onSearch={this.onSearch}/>
        <CustomTable ref={table => this._customAnhorAwaitTable = table}
                     rowKey={record => record.billPeriod + "_" + record.anchorUserId}
                     columns={this.awaitColumns}
                     scroll={{x: 2140}}
                     fetchTableDataMethod={SettlementService.queryAnchorSettlementList}/>
        <AnchorSettlementModal visible={anchorSettlementVisible} onClose={this.handleClose}/>
      </div>

    )
  }
}

