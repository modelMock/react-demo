/**
 *公会奖惩记录
 * @author 谭亮红
 */
import React, {Component} from 'react';
import {Form, Row, Col, Input, Button, Select, DatePicker, Modal, InputNumber, Icon} from 'antd';
import CustomTable from '../../commons/widgets/CustomTable';
import moment from 'moment';
import CustomSelect from '../../commons/widgets/CustomSelect';
import AnchorService from '../../service/AnchorService';
import AppService from '../../service/AppService';
import webUtils from '../../commons/utils/webUtils';
import {DateUtil, FORMAT_PATTERNS} from '../../commons/utils/DateUtil';
import UnionService from '../../service/UnionService';
import FixedDateRangeCmp from '../salary/FixedDateRangeCmp'
import commonUtils from '../../commons/utils/commonUtils'

const FormItem = Form.Item;
const {TextArea} = Input;
const {RangePicker} = DatePicker;
const Option = Select.Option

//公会搜索表单
class SanctionForm extends FixedDateRangeCmp {
  constructor(props) {
    super(props)
    this.state = {
      beforeDay: this.fifteenDaysAgo,
      btnStyle: true,
    }
  }

  componentDidMount() {
  }

  onSearchSubmit = (e) => {
    e.preventDefault();
    const value = this.extractedFormValue()
    this.props.onSearch(value)
  }

  getDateRangeFieldNames() {
    return ['startTime', 'endTime']
  }

  getExtraFormValues() {
    return {target: 'GUILD'}
  }

  handleReset = () => {
    this.props.form.resetFields()
  }

  render() {
    const {form, onAddSuspensionEvent, guildCode} = this.props;
    const {getFieldDecorator} = form;
    let colStyle = {height: "58px"}
    const {beforeDay} = this.state;
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    return (
      <Form layout="horizontal" onSubmit={this.onSearchSubmit} className="ant-advanced-search-form">
        <Row>
          <Col sm={8} style={colStyle}>
            <FormItem label="公会ID" {...formItemLayout}>
              {getFieldDecorator("guildId")(
                <Input style={{width: '100%'}} placeholder="请输入公会ID"/>
              )}
            </FormItem>
          </Col>
          <Col sm={8} style={colStyle}>
            <FormItem label="奖惩类型" {...formItemLayout}>
              {getFieldDecorator("sanctionType")(
                <Select placeholder="请选择奖惩类型">
                  <Option value="REWARD">奖励</Option>
                  <Option value="PUNISH">惩罚</Option>
                  <Option value="VJKB">暂扣</Option>
                  <Option value="DE_VJKB">暂扣解冻</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8} style={colStyle}>
            <FormItem label="创建时间" {...formItemLayout}>
              {getFieldDecorator("data", {initialValue: [beforeDay, DateUtil.nowAsYmd()]})(
                <RangePicker format={FORMAT_PATTERNS.YMD} style={{width: '100%'}}/>
              )}
              <span style={{color: this.firstRangeButtonType, fontSize: "14px", cursor: 'pointer'}}
                    onClick={this.queryWithFixedRange.bind(this, this.fifteenDaysAgo)}>
                最近15日</span>
              <span style={{color: this.secondRangeButtonType, fontSize: "14px", marginLeft: "8px", cursor: 'pointer'}}
                    onClick={this.queryWithFixedRange.bind(this, this.thirtyDayAgo)}>
                最近30日</span>
            </FormItem>
          </Col>
          <Col sm={8} style={colStyle}>
            <FormItem label="创建人" {...formItemLayout}>
              {getFieldDecorator("createUserId")(
                <Select placeholder="请选择创建人" allowClear>
                  {guildCode.map((item) => {
                    return <Option key={item.userId}> {item.nickname}({item.userId})</Option>
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8} style={colStyle}>
            <FormItem label="审核状态" {...formItemLayout}>
              {getFieldDecorator("auditSign")(
                <Select placeholder="请选择审核状态">
                  <Option value="S">待审核</Option>
                  <Option value="T">已审核</Option>
                  <Option value="F">已拒绝</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8} style={colStyle}>
            <FormItem label="发放状态" {...formItemLayout}>
              {getFieldDecorator("status")(
                <Select placeholder="请选择发放状态">
                  <Option value="UNGRANT">待发放</Option>
                  <Option value="GRANT">已发放</Option>
                  <Option value="INACTIVE">失效</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col offset={12} span={12} style={{textAlign: 'right'}}>
            <Button type="ghost" icon="plus" size="large" onClick={() => onAddSuspensionEvent()}>创建奖惩</Button>
            <Button type="primary" icon="search" size="large" htmlType="submit">查询</Button>
            <Button type="ghost" icon="cross" size="large" onClick={this.handleReset}>清除</Button>
          </Col>
        </Row>
      </Form>
    )
  }
}

const UnionSanctionForm = Form.create()(SanctionForm);

//创建公会奖惩弹窗
class UnionRewarPunishModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sanctionItems: []
    }
  }

  handleService(values) {
    if(!values.recordId){
      AnchorService.addSanction(values).then(jsonResult => {
        webUtils.alertSuccess("创建成功！");
        this.props.onClose(true);
        this.props.form.resetFields();
      })
    }else{
      AnchorService.modifySanction(values).then(jsonResult => {
        webUtils.alertSuccess("修改成功！");
        this.props.onClose(true);
        this.props.form.resetFields();
      })
    }
  }

  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, oriValues) => {
      if(!!err) return
      const values = Object.assign({}, oriValues)
      const title = values.recordId ? `确认修改【${values.recordId}】记录吗？` : "确定创建奖惩吗?"
      //后台精确到分 要求提交的数据 扩大一百倍
      values["fee"] *= 100
      values['type'] = values['sanctionType']
      delete values['sanctionType']
      webUtils.confirm(() => {
        this.handleService(values)
      }, title)
    })
  }

  querySanctionItems(itemKey) {
    AppService.getItemValueList(itemKey).then(sanctionItems => {
      this.setState({sanctionItems});
    })
  }

  componentWillReceiveProps(nextProps) {
    if(!nextProps.visible) return
    const newSctionType = nextProps.record['sanctionType']
    if(!newSctionType) return
    if(this.props.record['sanctionType'] !== newSctionType){
      this.querySanctionItems(this._getSanctionItemKey(newSctionType))
    }
  }

  _getSanctionItemKey(value) {
    let itemKey
    if(value === "REWARD"){
      itemKey = "GuildAward"
    }else if(value === "PUNISH"){
      itemKey = "GuildPunish"
    }else{
      itemKey = "GuildVjkb"
    }
    return itemKey
  }

  handleChange = (value) => {
    this.props.form.setFieldsValue({sanctionItem: ''})
    this.querySanctionItems(this._getSanctionItemKey(value))
  }
  handleClose = () => {
    this.props.onClose()
    this.props.form.resetFields()
  }

  render() {
    const {visible, form, guildCode, record} = this.props;
    const needDisabled = !!record.recordId
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 16},
    }
    let billPeriods = DateUtil.getAccountData(true, false)
    const title = needDisabled ? `修改【${record.recordId}】记录` : `创建奖惩`
    return (
      <Modal title={title}
             width={660}
             visible={visible}
             okText="提交审核"
             cancelText="取消"
             onOk={this.handleSave}
             onCancel={this.handleClose}>
        <Form>
          {needDisabled && <FormItem>
            {getFieldDecorator("recordId")(
              <Input type="hidden"/>
            )}
          </FormItem>}
          <FormItem>
            {getFieldDecorator("target", {initialValue: "GUILD"})(
              <Input type="hidden"/>
            )}
          </FormItem>
          <FormItem label="选择公会" {...formItemLayout}>
            {getFieldDecorator("targetId", {rules: [{required: true, message: '请选择公会'}]})(
              <Select
                disabled={needDisabled}
                allowClear
                showSearch
                filterOption={(input, option) => {
                  const ids = String(option.props.children[0])
                  const names = String(option.props.children[2])
                  return ids.indexOf(input) >= 0 || names.indexOf(input) >= 0
                }}
              >
                {
                  guildCode.map(item => (
                    <Option key={item.guildId}>{item.guildId}({item.guildName})</Option>
                  ))
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="选择账期" {...formItemLayout}>
            {getFieldDecorator("billPeriod", {
              rules: [{required: true, message: '请选择账期'}],
            })(
              <Select disabled={needDisabled}>
                {
                  billPeriods.map(it => <Option key={it}>{it}</Option>)
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="奖惩类型" {...formItemLayout}>
            {getFieldDecorator("sanctionType", {rules: [{required: true, message: '请选择奖惩类型'}]})(
              <Select
                disabled={needDisabled}
                onChange={this.handleChange}>
                <Option value="REWARD">奖励</Option>
                <Option value="PUNISH">惩罚</Option>
                <Option value="VJKB">暂扣</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="奖惩项目" {...formItemLayout}>
            {getFieldDecorator("sanctionItem", {
              rules: [{required: true, message: '请选择暂扣项目'}]
            })(
              <Select disabled={needDisabled}>
                {this.state.sanctionItems.map(item => <Option key={item.itemValue}>{item.itemName}</Option>)}
              </Select>
            )}
          </FormItem>
          <FormItem label="金额" {...formItemLayout}>
            {getFieldDecorator("fee", {
              rules: [{required: true, message: '请输入金额(只精确到小数点后两位)'}],
            })(
              <Input type="number" min={0} suffix="元"/>
            )}
          </FormItem>
          <FormItem label="备注" {...formItemLayout}>
            {getFieldDecorator("remark", {
              rules: [{required: true, message: '请输入备注'}],
            })(
              <TextArea rows="4" placeholder="请输入备注"/>
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

const UnionModifySanctionModal = Form.create({
  mapPropsToFields(props) {
    const {visible, record} = props
    if(!visible || !record) return {}
    record['fee'] && (record['fee'] = Math.abs(record['fee'] / 100))
    record['guildId'] && (record['targetId'] = record['guildId'])
    return commonUtils.recordToValueJson(record)
  }
})(UnionRewarPunishModal);

//暂扣解冻弹窗
class UnionThawModal extends Component {
  constructor(props) {
    super(props)
  }

  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, oriValues) => {
      if(!err){
        const values = Object.assign({}, oriValues)
        webUtils.confirm(() => {
          AnchorService.deVjkb(values).then(jsonResult => {
            webUtils.alertSuccess("解冻成功！");
            this.props.onClose(true);
          })
        }, "确定暂扣解冻吗?");
      }
    })
  }

  render() {
    const {visible, form, onClose, record} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 16},
    };
    let billPeriods = DateUtil.getAccountData(true, true);
    return (
      <Modal title={`【${record.recordId}】暂扣解冻`}
             width={660}
             visible={visible}
             okText="提交审核"
             cancelText="取消"
             onOk={this.handleSave}
             onCancel={onClose}>
        <div className="ant-confirm-body">
          <Icon type="exclamation-circle" style={{fontSize: "24px", color: "#ffbf00"}}/>
          <span className="ant-confirm-title">确认“暂扣解冻”吗？</span>
          <div className="ant-confirm-content">操作后将会进入审核，若审核拒绝后可再次提交</div>
        </div>
        <Form>
          <FormItem>
            {getFieldDecorator("recordId", {initialValue: record.recordId})(
              <Input type="hidden"/>
            )}
          </FormItem>
          <FormItem label="选择账期" {...formItemLayout}>
            {getFieldDecorator("billPeriod", {
              rules: [{required: true, message: '选择账期'}],
            })(
              <Select>
                {
                  billPeriods.map(it => <Option key={it}>{it}</Option>)
                }
              </Select>
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

UnionThawModal = Form.create()(UnionThawModal);
export default class UnionSanction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // openRewarPunishVisible: false,
      openModifySanVisible: false,
      openThawVisible: false,
      recordObj: {},
      guildCode: [],
      uninOperationList: []
    };
    this.columns = [
      {title: '奖惩ID', dataIndex: 'recordId', width: 70, fixed: 'left'},
      {title: '账期', dataIndex: 'billPeriod', width: 85, fixed: 'left'},
      {title: '结算ID', dataIndex: 'settlementId', width: 70, fixed: 'left'},
      {title: '公会ID', dataIndex: 'guildId', width: 70, fixed: 'left'},
      {title: '公会名称', dataIndex: 'guildName', width: 100},
      {title: '奖惩类型', dataIndex: 'sanctionTypeDesc', width: 85},
      {title: '奖惩项目', dataIndex: 'sanctionItemDesc', width: 100},
      {title: '金额', dataIndex: 'fee', width: 95, render: (text) => commonUtils.getFormatCentToYuan(text)},
      {title: '备注', dataIndex: 'remark', width: 200},
      {title: '创建人', dataIndex: 'createUserName', width: 100},
      {
        title: '创建时间',
        dataIndex: 'createTime',
        width: 135,
        sorter: (a, b) => moment(a.createTime) - moment(b.createTime)
      },
      {title: '审核状态', dataIndex: 'auditSignDesc', width: 85},
      {title: '拒绝原因', dataIndex: 'auditReason', width: 250},
      {title: '审核人', dataIndex: 'auditUserName', width: 150},
      {title: '审核时间', dataIndex: 'auditTime', width: 135},
      {title: '发放状态', dataIndex: 'statusDesc', width: 85},
      {
        title: '操作', fixed: 'right', width: 120, render: (text, record) => {
        return this._renderOptions(record)
      }
      }
    ]
  }

  _renderOptions(record) {
    return (
      <div>
        {(record.status === "UNGRANT" && (record.auditSign === 'S' || record.auditSign === 'F') && record.sanctionType !== "DE_VJKB") &&
        (<span>
            <a href="javascript:void(0)" onClick={this.openModifySanModal.bind(this, record)}>修改</a>
            <i className="ant-divider"/>
        </span>)
        }
        {(record.status === "UNGRANT" && (record.auditSign === 'S' || record.auditSign === 'F')) &&
        (<span>
            <a href="javascript:void(0)" onClick={this.onCancelVjkb.bind(this, record.recordId)}>作废</a>
            <i className={!record.relationRecordId && record.status === 'GRANT' ? "ant-divider" : ""}/>
        </span>)
        }
        {(!!record.relationRecordId === false && record.status === 'GRANT') &&
        <a href="javascript:void(0)" onClick={this.onThaw.bind(this, record)}>暂扣解冻</a>
        }
      </div>
    )
  }

  componentDidMount() {
    this._getAllGuildsAndCreators()
  }

  _getAllGuildsAndCreators() {
    //第一个获取公会id(不是公会代码)  第二个获取创建人
    Promise.all([UnionService.queryAllGuild(), AnchorService.queryUserByType()])
      .then(result => {
        this.setState({
          guildCode: result[0] || [],
          uninOperationList: result[1] || []
        })
      })
  }

  // 表单搜索
  handleOnSearch = (value) => {
    this._customTable.queryTableData(value);
  }
  //打开修改奖惩记录弹窗
  openModifySanModal = (record) => {
    this.setState({
      recordObj: record ? Object.assign({}, record) : {},
      openModifySanVisible: true,
    })
  }

  //打开暂扣解冻弹窗
  onThaw(record, e) {
    e.preventDefault();
    this.setState({
      openThawVisible: true,
      recordObj: record
    })
  }

  //作废
  onCancelVjkb(recordId, e) {
    e.preventDefault();
    webUtils.confirm(() => {
      AnchorService.cancel(recordId).then(jsonResult => {
        webUtils.alertSuccess("成功作废！");
        this._customTable.refreshTable()
      })
    }, `确定作废【${recordId}】吗?`);
  }

  //统一关闭弹出框
  handleClose = (needRefresh = false) => {
    needRefresh && this._customTable.refreshTable({target: 'GUILD'});
    this.setState({
      openRewarPunishVisible: false,
      openModifySanVisible: false,
      openThawVisible: false,
      recordObj: {}
    })
  }

  render() {
    const {openModifySanVisible, recordObj, openThawVisible, guildCode, uninOperationList} = this.state;
    return (
      <div>
        <UnionSanctionForm onSearch={this.handleOnSearch}
                           guildCode={uninOperationList}
                           onAddSuspensionEvent={this.openModifySanModal}/>
        <CustomTable ref={table => this._customTable = table}
                     rowKey="recordId"
                     columns={this.columns}
                     scroll={{x: 1935}}
                     fetchTableDataMethod={AnchorService.querySanction}/>
        <UnionModifySanctionModal visible={openModifySanVisible} guildCode={guildCode} onClose={this.handleClose}
                                  record={recordObj}/>
        <UnionThawModal visible={openThawVisible} onClose={this.handleClose} record={recordObj}/>
      </div>
    )
  }
}