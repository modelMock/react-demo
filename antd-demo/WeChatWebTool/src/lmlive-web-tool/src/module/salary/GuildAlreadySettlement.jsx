/**
 *公会已结算工资
 * @author 谭亮红
 */
import React, {Component} from 'react';
import {Form, Row, Col, Input, Button, Select, DatePicker,Modal,Icon} from 'antd';
import CustomTable from '../../commons/widgets/CustomTable';
import SettlementService from '../../service/SettlementService';
import UnionService from '../../service/UnionService';
import webUtils from '../../commons/utils/webUtils';
import {DateUtil,FORMAT_PATTERNS} from '../../commons/utils/DateUtil';
import commonUtils from '../../commons/utils/commonUtils'
import FixedDateRangeCmp from '../salary/FixedDateRangeCmp'
const FormItem = Form.Item;
const { TextArea } = Input;
const {RangePicker} = DatePicker;
const Option = Select.Option

//搜索表单
class GuildAlreadySettlementForm extends FixedDateRangeCmp{
  constructor(props){
    super(props)
    this.state = {
      btnStyle: true,
      guildCode: [],
      beforeDay: this.fifteenDaysAgo,
      openRejectVisible: false,
      auditOperationList: []
    }
    // 权限集合
    this.btnResList = props.btnResList
    // 是否有批量审核通过权限
    this.hasAuthorityToBatchAuditPass = this.btnResList.includes('batchAuditPass')
    // 是否有批量审核拒绝权限
    this.hasAuthorityToBatchAuditReject = this.btnResList.includes('batchAuditReject')
  }
  //表单搜索
  onSearch = (e) => {
    e.preventDefault();
    let values = this.extractedFormValue()
    values["settledStatus"] = "settled";
    this.props.onSearch(values);
  }

  getExtraFormValues(values){
    return {
      settledStatus: "settled",
      billPeriod: DateUtil.whichBillPeriod( values.billPeriod )
    };
  }

  getDateRangeFieldNames(){
    return ['startDate', 'endDate']
  }
  //批量审核通过
  onAuditPass = (e) => {
    e.preventDefault();
    const selectedRowsDetails = this.props.selectedRowsDetails;
    if( typeof selectedRowsDetails == "undefined" || selectedRowsDetails.length <= 0 ){
      webUtils.alertFailure("请选择记录！");
      return;
    }
    let auditList = selectedRowsDetails.map((item, idx) => item.recordId )
    webUtils.confirm(() => {
      SettlementService.audit({recordIdList: auditList, auditSign: "T"}).then(jsonResult => {
        webUtils.alertSuccess("通过成功！");
        this.props.onClose();
      })
    }, `确认通过吗?`);
  }

  //批量审核拒绝
  onAuditReject = (e) => {
    e.preventDefault();
    const selectedRowsDetails = this.props.selectedRowsDetails;
    if( typeof selectedRowsDetails == "undefined" || selectedRowsDetails.length <= 0 ){
      webUtils.alertFailure("请选择记录！");
      return;
    }
    let recordIdList = selectedRowsDetails.map((item, idx) => item.recordId )
    this.props.openRejectModal(recordIdList)
  }

  componentDidMount() {
    //获取账期
    //获取运营归属
    SettlementService.queryUserByType().then(result => {
      this.setState({
        auditOperationList :result
      });
    })
		UnionService.queryAllGuild().then(guildCode => {
			this.setState({
        guildCode
			} )
		} )
  }

  render(){
    const {beforeDay, auditOperationList, openRejectVisible, guildCode}=this.state;
    const {form, onSearch, handleReset} = this.props;
    const {getFieldDecorator} = form;
    const anchorPayTypes = [
			{key: "o2g", value: "官方代发至公会"},
			{key: "o2a", value: "官方代发至主播"},
			{key: "g2a", value: "公会发放"}
		]
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    return(
      <div>
        <Form layout="horizontal" onSubmit={this.onSearch} className="ant-advanced-search-form">
          <Row>
            <Col sm={8}>
              <FormItem label="账期时间" {...formItemLayout}>
                {getFieldDecorator("billPeriod")(
                  <DatePicker
                    style={{width:'100%'}}
                    format={DateUtil.YMD}
                    placeholder="请选择账期时间" />
                )}
              </FormItem>
              <FormItem label="创建时间" {...formItemLayout}>
                {getFieldDecorator("data",{initialValue: [beforeDay, DateUtil.nowAsYmd()]})(
                  <RangePicker format={FORMAT_PATTERNS.YMD}></RangePicker>
                )}
                <div style={{marginTop: 8, textAlign: 'left'}}>
                  <span style={{color: this.firstRangeButtonType, fontSize:14, cursor: 'pointer'}} onClick={this.queryWithFixedRange.bind(this, this.fifteenDaysAgo)}>
                    最近15日
                  </span>
                  <span style={{color: this.secondRangeButtonType, fontSize: 14, marginLeft: 8, cursor: 'pointer'}} onClick={this.queryWithFixedRange.bind(this, this.thirtyDayAgo)}>
                    最近30日
                  </span>
                </div>
              </FormItem>
              <FormItem label="工资发放方式" {...formItemLayout}>
								{getFieldDecorator("anchorPayoffType", {
									rules: [{required: true, message: '请选择工资发放方式'}],
									onChange: this.handlePayoffChange
								})(
                  <Select placeholder="请选择工资发放方式" allowClear>
										{anchorPayTypes.map(item => <Option key={item.key} value={item.key}>{item.value}</Option>)}
                  </Select>
								)}
              </FormItem>
            </Col>
            <Col sm={8}>
              <FormItem label="公会名称" {...formItemLayout}>
                {getFieldDecorator("guildId")(<Select
                  optionFilterProp="children"
                  allowClear
                  showSearch  placeholder="请选择公会">
									{
										(guildCode || []).map(item => (
                      <Option key={item.guildId} value={String(item.guildId)}>{item.guildId}({item.guildName})</Option>
										))
									}
                </Select>)}
              </FormItem>
              <FormItem label="状态" {...formItemLayout}>
                {getFieldDecorator("status")(
                  <Select placeholder="请选择状态">
                    <Option value="GRANT">已发放</Option>
                    <Option value="UNGRANT">待发放</Option>
                    <Option value="INACTIVE">失效</Option>
                    <Option value="ACTIVE">有效</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label="结算ID" {...formItemLayout}>
								{getFieldDecorator("recordId")(<Input placeholder="请输入结算ID" />)}
              </FormItem>
            </Col>
            <Col sm={8}>
              <FormItem label="账单" {...formItemLayout}>
                {getFieldDecorator("billSn")(<Input placeholder="请输入账单ID" />)}
              </FormItem>
              <FormItem label="运营归属" {...formItemLayout}>
                {getFieldDecorator("tutorUserId")(
                  <Select placeholder="请选择运管">
                    {
                      auditOperationList.map(user => (
                        <Option key={String(user.userId)} value={String(user.userId)}>{user.nickname}</Option>
                      ))
                    }
                  </Select>
                )}
              </FormItem>
              <FormItem label="审核状态" {...formItemLayout}>
                {getFieldDecorator("auditSign")(
                  <Select placeholder="请选择审核状态">
                    <Option value={null}>全部</Option>
                    <Option value="S">待审核</Option>
                    <Option value="T">已审核</Option>
                    <Option value="F">已拒绝</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col offset={12} span={12} style={{ textAlign: 'right' }}>
              {this.hasAuthorityToBatchAuditReject && <Button type="primary" icon="cross" size="large" onClick={this.onAuditReject}>批量审核拒绝</Button>}
              {this.hasAuthorityToBatchAuditPass && <Button type="primary" ghost icon="check" size="large" onClick={this.onAuditPass}>批量审核通过</Button>}
              <Button type="primary" icon="search" size="large" htmlType="submit">查询</Button>
              <Button type="ghost" icon="cross" size="large" onClick={handleReset}>清除</Button>
            </Col>
          </Row>
        </Form>
      </div>
    )
  }
}
GuildAlreadySettlementForm=Form.create()(GuildAlreadySettlementForm);

//批量审核拒绝弹出框
class AuditRejectModal extends Component{
  constructor(props){
    super(props);
  }
  handleSave = (e) => {
    e.preventDefault();
    const {recordId, negativeFlag} = this.props
    this.props.form.validateFields((err, values) => {
      if(!!err) return;
      let service;
      const params = Object.assign({}, values)
      switch (negativeFlag) {
        case 1://取消
          service = SettlementService.cancelGuildSett
          params['recordId'] = recordId
          params['remark'] = params['auditReason']
          delete params['auditReason']
          break;
        case 2://回退
          service = SettlementService.resetGuildAudit
          params['recordId'] = recordId
          params['remark'] = params['auditReason']
          delete params['auditReason']
          break;
        case 3://拒审
          service = SettlementService.audit
          params["recordIdList"] = recordId;
          params["auditSign"] = 'F'
          break;
      }
      service(params).then(jsonResult => {
        webUtils.alertSuccess("操作成功！");
        this.props.onClose();
      })
    })
  }
  render(){
    const {visible, form, onClose, recordId, negativeFlag} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 0},
      wrapperCol: {span: 24},
    };
    let actionText = negativeFlag == 1 ? '取消结算' : (negativeFlag ==2 ? '回退审核' : '拒绝审核' );

    const recordIdStr = recordId && recordId.length > 1 ? recordId.join(',') : recordId
    const actionRules = negativeFlag == 3 ? [{required: true, message: `请输入${actionText}原因`}]: null
    const title = `是否确认${actionText}【${recordIdStr}】`
    const placeHolderText = negativeFlag == 3 ? `请输入${actionText}原因，不能为空！` : `请输入${actionText}原因！`
    return(
      <Modal title={title}
             width={660}
             visible={visible}
             okText="确定"
             cancelText="取消"
             onOk={this.handleSave}
             onCancel={onClose}>
        <Form>
          <FormItem {...formItemLayout}>
            {getFieldDecorator("auditReason",{rules: actionRules})(
              <TextArea autosize={{ minRows: 12, maxRows: 26 }} placeholder={placeHolderText}/>
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
AuditRejectModal=Form.create()(AuditRejectModal);

export default class GuildAlreadySettlement extends Component{
  constructor(props){
    super(props);
    this.state = {
      selectedRows:[],//表格选中行
      selectedRowKeys: [], //表格选中行key
    }
    //需要判断权限的btn集合
    this.btnResList = props.btnResList;
    // 是否有取消结算的权限
    this.hasAnchorityToCancelAudit = this.btnResList.includes('cancelAudit')
    // 是否有回退审核的权限
    this.hasAnchorityToResetAudit = this.btnResList.includes('resetAudit')
    this.alreadyColumns=[
      {title: '结算ID', dataIndex: 'recordId', width: 80, fixed: 'left'},
      {title: '账期', dataIndex: 'billPeriod', width: 80, fixed: 'left'},
      {title: '账单ID', dataIndex: 'billSn', width: 85, fixed: 'left'},
      {title: '公会', dataIndex: 'guildName'},
      {title: '审核状态', dataIndex: 'auditSignDesc', width: 80},
      {title: '状态', dataIndex: 'statusDesc', width: 75},
      {title: '公会提成', dataIndex: 'commissionFee', width: 85, render: text =>  commonUtils.getFormatCentToYuan(text)},
      {title: '奖励', dataIndex: 'awardFee', width: 85, render: text => commonUtils.getFormatCentToYuan(text)},
      {title: '惩罚', dataIndex: 'punishFee', width: 85, render: text => commonUtils.getFormatCentToYuan(text)},
      {title: '暂扣', dataIndex: 'detainFee', width: 85, render: text => commonUtils.getFormatCentToYuan(text)},
      {title: '暂扣解冻', dataIndex: 'thawFee', width: 85, render: text => commonUtils.getFormatCentToYuan(text)},
      {title: '公会代发工资', dataIndex: 'guildPayrollFee', width: 100, render: text => commonUtils.getFormatCentToYuan(text)},
      {title: '官方代发工资', dataIndex: 'officialPayrollFee', width: 100, render: text => commonUtils.getFormatCentToYuan(text)},
      {title: '应发金额', dataIndex: 'shouldFee', width: 85, render: text => commonUtils.getFormatCentToYuan(text)},
      {title: '税率', dataIndex: 'taxRate', width: 70, render: text => commonUtils.getFormatPercentOff(text)},
      {title: '税率扣除', dataIndex: 'taxFee', width: 90, render: text => commonUtils.getFormatCentToYuan(text)},
      {title: '实发金额', dataIndex: 'realFee', width: 90, render: text => commonUtils.getFormatCentToYuan(text)},
      {title: '归属运营', dataIndex: 'tutorUserName', width: 100},
      {title: '创建时间', dataIndex: 'createTime', width: 135},
      {title: '操作', fixed:"right",dataIndex: 'handle', width: 160, render:(text, record) => {
        // 失效状态  无操作按钮
        if( record['status'] === 'INACTIVE' ) return false
        const marginSetting = {marginLeft:'2px',marginRight:'2px'}//按钮之间来点间隔
        const cancelBtn = this.hasAnchorityToCancelAudit && record.auditSign=="S" && record.status=="UNGRANT"
        const resetBtn = this.hasAnchorityToResetAudit && record.auditSign=="T" && record.status=="UNGRANT"
        // const denyBtn = record.auditSign=="S"
        return (
          <span>
            {cancelBtn && <Button size="small" type="primary" style={marginSetting} onClick={this.doCancelAudit.bind(this,record['recordId'])} >取消结算</Button>}
            {resetBtn && <Button size="small" type="primary" style={marginSetting} onClick={this.doResetAudit.bind(this,record['recordId'])} >回退审核</Button>}
            {/*{denyBtn && <Button size="small" type="primary" style={marginSetting} onClick={this.doDenyAudit.bind(this,record['recordId'])} >审核拒绝</Button>}*/}
          </span>
        )
      }
      }
    ]
  }
  doCancelAudit = (recordId) => {//取消结算
    this.setState({
        openRejectVisible: true,
        recordId,
        negativeFlag: 1
    })
  }
  doResetAudit = (recordId) => {//回退结算
    this.setState({
        openRejectVisible: true,
        recordId,
        negativeFlag: 2
    })
  }
  doDenyAudit = (recordId) => {//拒绝审核
    this.setState({
        openRejectVisible: true,
        recordId: [recordId],
        negativeFlag: 3
    })
  }
  handleOpenRejectModal = (records) => {//批量审核拒绝
    this.setState({
      openRejectVisible: true,
      recordId: records,
      negativeFlag: 3
    })
  }
  onSearch = (value) => {
    this._customGuildAlreadyTable.queryTableData(value);
  }
  //清空表单
  handleReset = (e) => {
    e.preventDefault();
    this._guildAlreadySettlementForm.resetFields();
  }
  //所有选中行记录集合
  handleRowChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows
    });
  }
  //统一关闭弹出框
  handleClose = () => {
      this.setState({
        openRejectVisible: false,
        selectedRowKeys: [],
        selectedRowKeys: [],
      })
      this._customGuildAlreadyTable.refreshTable()
  }
  render(){
    const {selectedRowKeys, selectedRows, openRejectVisible, recordId, negativeFlag} = this.state;
    return (
      <div>
        <GuildAlreadySettlementForm ref={(obj => {this._guildAlreadySettlementForm = obj})}
                                    btnResList={this.btnResList}
                                    openRejectModal={this.handleOpenRejectModal}
                                    handleReset={this.handleReset}
                                    onClose={this.handleClose}
                                    selectedRowsDetails={selectedRows}
                                    onSearch={this.onSearch}/>
        <CustomTable ref={table => this._customGuildAlreadyTable=table}
                     rowKey="recordId"
                     rowSelection = {{
                       onChange: this.handleRowChange.bind(this),
                     }}
                     columns={this.alreadyColumns}
                     scroll={{x: 2000}}
                     fetchTableDataMethod={SettlementService.queryGuildSettlementList}/>
        <AuditRejectModal visible={openRejectVisible} onClose={this.handleClose} negativeFlag={negativeFlag} recordId={recordId}/>
      </div>
    )
  }
}