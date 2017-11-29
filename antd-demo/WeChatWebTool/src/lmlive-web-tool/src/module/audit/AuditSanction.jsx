/**
 *奖惩记录审核
 * @author 谭亮红
 */
import React, {Component} from 'react';
import {Form, Row, Col, Input, Button, Select, DatePicker, Modal, Icon} from 'antd';
import CustomTable from '../../commons/widgets/CustomTable';
import moment from 'moment';
import webUtils from '../../commons/utils/webUtils';
import {DateUtil, FORMAT_PATTERNS} from '../../commons/utils/DateUtil';
import commonUtils from '../../commons/utils/commonUtils'
import FixedDateRangeCmp from '../salary/FixedDateRangeCmp'
import './AuditSanction.less'
import UnionService from '../../service/UnionService';
import AuditService from '../../service/AuditService';
import AnchorService from '../../service/AnchorService';

const FormItem = Form.Item;
const {TextArea} = Input;
const {RangePicker} = DatePicker;
const Option = Select.Option

//公会发票搜索表单
class AuditSanctionForm extends FixedDateRangeCmp {
  constructor(props) {
    super(props);
    this.state = {
      beforeDay: this.fifteenDaysAgo,
      btnStyle: true,
      auditOperationList: [],
      anchorList: [],
    };
  }

  getDateRangeFieldNames() {
    return ['startTime', 'endTime']
  }

  onSearchSubmit = (e) => {
    e.preventDefault();
    let value = this.extractedFormValue();
    this.props.onSearch(value);
  }
  onGuildChanges = (guildId) => {//不放缓存了,如果将来数据超级大，会有问题。
    if(guildId){
      UnionService.queryMember({
        guildId,
        limit: 99999
      }).then(data => this.setState({anchorList: data.records || []}))
    }else{
      this.setState({anchorList: []})//没有选择公会也把可选的主播给置空
    }
    this.props.form.resetFields(["anchorUserId"])  //此时时间范围已经被重置了,获取表单的参数的时候不会出问题
  }

  componentDidMount() {
    //获取运营归属
    AnchorService.queryUserByType().then(result => {
      this.setState({auditOperationList: result});
    })
  }

  render() {
    const {form, handleReset, guildCode} = this.props;
    const {getFieldDecorator} = form;
    let colStyle = {height: "58px"}
    const {beforeDay, auditOperationList, anchorList} = this.state;
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    return (
      <Form layout="horizontal" onSubmit={this.onSearchSubmit} className="ant-advanced-search-form">
        <Row>
          <Col sm={8} style={colStyle}>
            <FormItem label="创建人" {...formItemLayout}>
              {getFieldDecorator("createUserId")(
                <Select placeholder="请选择创建人">
                  {
                    auditOperationList.map(user => (
                      <Option key={String(user.userId)}>{user.nickname}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8} style={colStyle}>
            <FormItem label="公会" {...formItemLayout}>
              {getFieldDecorator("guildId")(
                <Select
                  optionFilterProp="children"
                  allowClear onChange={this.onGuildChanges.bind(this)}
                  showSearch placeholder="请选择公会">
                  {
                    guildCode.map(item => (
                      <Option key={item.guildId}>{item.guildId}({item.guildName})</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8} style={colStyle}>
            <FormItem label="主播ID" {...formItemLayout}>
              {getFieldDecorator("anchorUserId")(
                <Input placeholder="请输入主播ID"/>
              )}
            </FormItem>
          </Col>
          <Col sm={8} style={colStyle}>
            <FormItem label="创建时间" {...formItemLayout}>
              {getFieldDecorator("data", {initialValue: [beforeDay, DateUtil.nowAsYmd()]})(
                <RangePicker format={FORMAT_PATTERNS.YMD} style={{width: '100%'}}></RangePicker>
              )}
              <span style={{color: this.firstRangeButtonType, fontSize: "14px"}}
                    onClick={this.queryWithFixedRange.bind(this, this.fifteenDaysAgo)}>最近15日</span>
              <span style={{color: this.secondRangeButtonType, fontSize: "14px", marginLeft: "8px"}}
                    onClick={this.queryWithFixedRange.bind(this, this.thirtyDayAgo)}>最近30日</span>
            </FormItem>
          </Col>
          <Col sm={8} style={colStyle}>
            <FormItem label="编号" {...formItemLayout}>
              {getFieldDecorator("recordId")(
                <Input placeholder="请输入编号"/>
              )}
            </FormItem>
          </Col>
          <Col sm={8} style={colStyle}>
            <FormItem label="审核状态" {...formItemLayout}>
              {getFieldDecorator("auditSign")(
                <Select placeholder="请选择审核状态">
                  <Option key={'_'} value={null}>所有</Option>
                  <Option key={'S'} value={'S'}>待审核</Option>
                  <Option key={'T'} value={'T'}>审核通过</Option>
                  <Option key={'F'} value={'F'}>审核拒绝</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8} style={{textAlign: 'right', float: 'right'}}>
            <Button key="submit" type="primary" icon="search" size="large" htmlType="submit">查询</Button>
            <Button key="reset" type="ghost" icon="cross" size="large" onClick={handleReset}>清除</Button>
          </Col>
        </Row>
      </Form>
    )
  }
}

AuditSanctionForm = Form.create()(AuditSanctionForm);

//审核拒绝弹出框
class AuditSanctionRejectModal extends Component {
  constructor(props) {
    super(props);
  }

  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if(!!err) return;
      values["recordId"] = this.props.record.recordId;
      values["auditSign"] = "F";
      AuditService.auditSanction(values).then(jsonResult => {
        webUtils.alertSuccess("拒绝成功！");
        this.onClose();
      })
    })
  }
  //关闭
  onClose = () => {
    this.props.onClose();
    this.props.form.resetFields();
  }

  render() {
    const {visible, form, record} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 0},
      wrapperCol: {span: 24},
    };
    return (
      <Modal title={`确认拒绝奖罚记录【${record.recordId}】吗？`}
             width={400}
             visible={visible}
             okText="提交审核"
             cancelText="取消"
             onOk={this.handleSave}
             onCancel={this.onClose}>
        <Form>
          <FormItem {...formItemLayout}>
            {getFieldDecorator("auditReason", {rules: [{required: true, message: '请输入拒绝原因'}]})(
              <TextArea autosize={{minRows: 12, maxRows: 26}} placeholder="请输入拒绝原因，不能为空！"/>
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

AuditSanctionRejectModal = Form.create()(AuditSanctionRejectModal);

class LookDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {
      AuditSanctionRejectVisble: false
    }
  }

  //审核通过
  handlePass = (e) => {
    e.preventDefault();
    const {recordId} = this.props.record;
    webUtils.confirm(() => {
      AuditService.auditSanction({recordId: recordId, auditSign: "T"}).then(jsonResult => {
        webUtils.alertSuccess("审核通过成功！");
        this.props.onClose(true);
        this.props.form.resetFields();
      })
    }, `确认审核通过奖罚记录[${recordId}]吗？`);
  }
  //审核拒绝
  handleReject = (e) => {
    e.preventDefault();
    this.setState({AuditSanctionRejectVisble: true})
  }
  //关闭拒绝弹出框
  handleClose = () => {
    this.setState({AuditSanctionRejectVisble: false})
    this.props.onClose(true);
    //处理审核弹窗关闭
  }

  render() {
    const {visible, form, onClose, record} = this.props;
    const {AuditSanctionRejectVisble} = this.state;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 16},
      style: {marginBottom: 0}
    };
    const disableFlag = record['auditSign'] != 'S'//是否禁用审核和　拒绝审核的按钮
    return (
      <Modal title="查看"
             width={660}
             visible={visible}
             onCancel={onClose}
             footer={[
               <Button disabled={disableFlag} key="reject" size="large" onClick={this.handleReject}>审核拒绝</Button>,
               <Button disabled={disableFlag} key="pass" type="primary" icon="check" size="large"
                       onClick={this.handlePass}>审核通过</Button>,
               <Button key="cancel" icon="cross" size="large" onClick={onClose}>关闭</Button>
             ]}>
        <Form>
          <Row>
            <Col sm={12}>
              <FormItem label="编号" {...formItemLayout} >
                <p>{record.recordId}</p>
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label="奖惩类型" {...formItemLayout} >
                <p>{record.sanctionTypeDesc}</p>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col sm={12}>
              <FormItem label="奖惩项目" {...formItemLayout}>
                <p>{record.sanctionItemDesc}</p>
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label="金额" {...formItemLayout}>
                <p>{commonUtils.getFormatCentToYuan(Math.abs(record.fee))}</p>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col sm={12}>
              <FormItem label="创建人" {...formItemLayout}>
                <p>{record.createUserName}</p>
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label="创建时间" {...formItemLayout}>
                <p>{record.createTime}</p>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col sm={12}>
              <FormItem label="对象类型" {...formItemLayout} >
                <p>{record.sanctionObjDesc}</p>
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label="主播昵称" {...formItemLayout}>
                <p>{record.anchorUserName}</p>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col sm={12}>
              <FormItem label="公会" {...formItemLayout}>
                <p>{record.guildName}</p>
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label="备注" {...formItemLayout}>
                <p>{record.remark}</p>
              </FormItem>
            </Col>
          </Row>
          <Row className="editor-gutter-row">
            <Col sm={24}>
              <h3>编辑历史</h3>
              <div className="edit-history-area">
                {
                  record.changeLog && record.changeLog.map(item => {
                    const lis = item.split(',')
                    return (
                      <ul className="editorHis" key={item}>
                        {lis.map((li, index) => (
                          <li key={index}>{li}</li>
                        ))}
                      </ul>
                    )
                  })
                }
              </div>
            </Col>
          </Row>
          <Row className="editor-gutter-row">
            <Col sm={24}>
              <h3>最近30天奖罚记录</h3>
              <ul className="editor">
                {
                  record.lastedSanction && Object.keys(record.lastedSanction).map(key => {
                    var value = record.lastedSanction[key]
                    return (<li style={{marginBottom: 5}} key={key}>{value}</li>)
                  })
                }
              </ul>
            </Col>
          </Row>
        </Form>
        <AuditSanctionRejectModal visible={AuditSanctionRejectVisble} onClose={this.handleClose}
                                  record={this.props.record}/>
      </Modal>
    )
  }
}

LookDetail = Form.create()(LookDetail);
export default class AuditSanction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recordObj: {},
      guildCode: [],
      openDetail: false,
    };
    this.columns = [
      {title: '编号', dataIndex: 'recordId', width: 85},
      {title: '账期', dataIndex: 'billPeriod', width: 85},
      {title: '审核状态', dataIndex: 'auditSignDesc', width: 85},
      {title: '奖惩类型', dataIndex: 'sanctionTypeDesc', width: 85},
      {title: '公会', dataIndex: 'guildName', width: 85},
      {title: '主播ID', dataIndex: 'anchorUserId', width: 85},
      {title: '主播', dataIndex: 'anchorUserName', width: 140},
      {title: '奖惩项目', dataIndex: 'sanctionItemDesc', width: 85},
      {title: '金额', dataIndex: 'fee', width: 85, render: (text) => commonUtils.getFormatCentToYuan(text)},
      {title: '创建人', dataIndex: 'createUserName', width: 100},
      {title: '备注', dataIndex: 'remark', width: 135},
      {
        title: '创建时间',
        dataIndex: 'createTime',
        width: 145,
        sorter: (a, b) => moment(a.createTime) - moment(b.createTime)
      },
      {title: '对象类型', dataIndex: 'sanctionObjDesc', width: 85},
      {title: '审核人', dataIndex: 'auditUserName', width: 85},
      {title: '审核时间', dataIndex: 'auditTime', width: 85},
      {title: '审核拒绝原因', dataIndex: 'auditReason', width: 155},
      {
        title: '操作', dataIndex: "", fixed: 'right', width: 100, render: (text, record) => (
        <a href="javascript:void(0)" onClick={this.onLookDetail.bind(this, record)}>查看</a>
      )
      }
    ]
  }

  onLookDetail(record, e) {
    e.preventDefault();
    AuditService.querySanctionDetail({recordId: record.recordId}).then(jsonResult => {
      this.setState({
        openDetail: true,
        recordObj: jsonResult
      })
    })
  }

  componentDidMount() {
    //获取公会id(不是公会代码)
    UnionService.queryAllGuild().then(guildCode => {
      this.setState({guildCode})
    })
  }

  // 表单搜索
  handleOnSearch = (value) => {
    this._customTable.queryTableData(value);
  }
  //统一关闭弹出框
  handleClose = (refresh = false) => {
    refresh && this._customTable.refreshTable();
    this.setState({
      openDetail: false,
      recordObj: {}
    })
  }
  //清空表单
  handleReset = (e) => {
    e.preventDefault();
    this._auditSanctionForm.resetFields();
  }

  render() {
    const {recordObj, guildCode, openDetail} = this.state;
    return (
      <div>
        <AuditSanctionForm ref={obj => this._auditSanctionForm = obj} onSearch={this.handleOnSearch}
                           handleReset={this.handleReset} guildCode={guildCode}/>
        <CustomTable ref={table => this._customTable = table}
                     rowKey="recordId"
                     columns={this.columns}
                     scroll={{x: 1710}}
                     fetchTableDataMethod={AuditService.queryAuditList}/>
        <LookDetail visible={openDetail} onClose={this.handleClose} record={recordObj}/>
      </div>
    )
  }
}