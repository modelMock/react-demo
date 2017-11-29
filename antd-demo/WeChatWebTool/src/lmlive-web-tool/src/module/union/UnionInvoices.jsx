/**
 *公会发票管理
 * @author 谭亮红
 */
import React, {Component} from 'react';
import {Form, Row, Col, Input, Button, Select, DatePicker, Modal,AutoComplete} from 'antd';
import CustomTable from '../../commons/widgets/CustomTable';
import webUtils from '../../commons/utils/webUtils';
import commonUtils from '../../commons/utils/commonUtils';
import {DateUtil, FORMAT_PATTERNS} from '../../commons/utils/DateUtil';
import FixedDateRangeCmp from '../salary/FixedDateRangeCmp'
import UnionService from '../../service/UnionService';
import AnchorService from '../../service/AnchorService';
import PrintDialog from "../print/PrintDialog"

const FormItem = Form.Item;
const {TextArea} = Input;
const {RangePicker} = DatePicker;

//公会发票搜索表单
class UnionInvoicesForm extends FixedDateRangeCmp {
  constructor(props) {
    super(props);
    this.state = {
      beforeDay: this.fifteenDaysAgo,
      allInvoiceNum: []
    };
  }

  handleSearch = (e) => {
    e && e.preventDefault();
    let value = this.extractedFormValue()
    this.props.onSearch(value);
  }
  handleReset = () => {
    this.props.form.resetFields()
  }

  getDateRangeFieldNames() {
    return ["beginTime", "endTime"];
  }

  componentDidMount() {
    //获取所有的发票号码
    UnionService.queryAllInvoiceNum().then(jsonResult => {
      this.setState({allInvoiceNum: jsonResult})
    })
  }

  render() {
    const {form, onAddSuspensionEvent,doPrintBatch, guildCode,uninOperationList} = this.props;
    const {getFieldDecorator} = form;
    const {beforeDay, allInvoiceNum} = this.state;
    const colStyle = {height: "110px"}
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    return (
      <Form onSubmit={this.handleSearch} className="ant-advanced-search-form">
        <Row>
          <Col sm={8} style={colStyle}>
            <FormItem label="创建时间" {...formItemLayout}>
              {getFieldDecorator("data", {initialValue: [beforeDay, DateUtil.nowAsYmd()]})(
                <RangePicker format={FORMAT_PATTERNS.YMD} style={{width: '100%'}}/>
              )}
              <div>
                <span style={{color: this.firstRangeButtonType, fontSize: "14px", cursor: 'pointer'}}
                      onClick={this.queryWithFixedRange.bind(this, this.fifteenDaysAgo)}>最近15日</span>
                <span
                  style={{color: this.secondRangeButtonType, fontSize: "14px", marginLeft: "8px", cursor: 'pointer'}}
                  onClick={this.queryWithFixedRange.bind(this, this.thirtyDayAgo)}>最近30日</span>
              </div>
            </FormItem>
            <FormItem label="审核状态" {...formItemLayout}>
              {getFieldDecorator("auditSign")(
                <Select allowClear>
                  <Option key="S" value="S">待审核</Option>
                  <Option key="T" value="A">一审通过</Option>
                  <Option key="T" value="T">审核通过</Option>
                  <Option key="F" value="F">审核拒绝</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8} style={colStyle}>
            <FormItem label="公会名称" {...formItemLayout}>
              {getFieldDecorator("guildId")(
                <Select
                  optionFilterProp="children"
                  allowClear
                  showSearch>
                  {
                    guildCode.map(item => (
                      <Option key={item.guildId}>{item.guildName}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
						<FormItem label="归属运营" {...formItemLayout}>
							{getFieldDecorator("tutorUserId", {rules: [{required: true, message: '请选择归属运营'}],
							})(
								<Select allowClear>
									{uninOperationList.map(user => <Option key={user.userId} >{user.nickname}</Option>)}
								</Select>
							)}
						</FormItem>
          </Col>
          <Col sm={8} style={colStyle}>
            <FormItem label="发票号码" {...formItemLayout}>
              {getFieldDecorator("invoiceNum")(
                <Select
                  optionFilterProp="children"
                  allowClear
                  showSearch>
                  {
                    allInvoiceNum.map((item) => (
                      <Option key={item.invoiceNum}>{item.invoiceNum}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
            <FormItem style={{textAlign: 'right',marginTop:50}}>
              <Button type="primary" ghost icon="printer" size="large" onClick={doPrintBatch}>批量打印报销单</Button>
              <Button type="primary" ghost icon="plus" size="large" onClick={() => onAddSuspensionEvent()}>录入发票</Button>
              <Button type="primary" icon="search" size="large" htmlType="submit">查询</Button>
              <Button type="ghost" icon="cross" size="large" onClick={this.handleReset}>清除</Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }

}

UnionInvoicesForm = Form.create()(UnionInvoicesForm);

//修改发票弹窗
class ModifyUnionInvoicesModal extends Component {
  handleSave = (e) => {
    e.preventDefault();
    const {form, record, onClose} = this.props
    form.validateFields((err, values) => {
      if(!!err) return;
      const params = Object.assign({}, values)

      const recordId = record['recordId']

      params["faxFee"] *= 100
      params["noFaxFee"] *= 100
      params["invoiceFee"] *= 100

      //验证是否符合
			const {faxRate,noFaxFee,faxFee,invoiceFee} = params
			if ( Math.abs(noFaxFee + faxFee - invoiceFee ) >= 0.05) {
				webUtils.alertFailure( '发票金额输入有误，请确认不含税金额和税额' )
				return
			}
			let tolerantDiff = 5    //可忍受的金额误差,单位 分
			if ( Math.abs( noFaxFee * faxRate / 100 - faxFee ) > tolerantDiff ) {//误差需要再五分钱以内
				webUtils.alertFailure( `税费输入有误，请确认税率，税额,不含税金额和总额,误差需要再${tolerantDiff}分钱以内` )
				return
			}

      params["faxFee"] = (params["faxFee"]).toFixed(0)
      params["noFaxFee"] = (params["noFaxFee"]).toFixed(0)
      params["invoiceFee"] = (params["invoiceFee"]).toFixed(0)

      const title = `确定${recordId ? `修改` : '新增'}发票吗？`
      webUtils.confirm(() => {
        if(record['recordId']){
          UnionService.modifyInvoice(params).then(jsonResult => {
            webUtils.alertSuccess("修改发票成功！");
            onClose(true);
            form.resetFields();
          })
        }else{
          UnionService.addInvoice(params).then(result => {
            webUtils.alertSuccess("新增发票成功！");
            onClose(true);
            form.resetFields();
          })
        }
        //验证完毕之后，记录本次填写的发票内容
        this.refreshLocalInvoiceContents(values['invoiceContent'])
      }, title)
    })
  }
  handleCancel = () => {
    this.props.onClose()
    this.props.form.resetFields()
  }
  //获取当前用户存储在本地的，已经使用过的发票的内容 所使用的 key,拗口，配合 #loadLocalInvoiceContents 阅读效果更好.
  getInvoiceContentLocalKey = () => {
		let userId = localStorage.getItem('userId')
		let invoiceContentKey = `invoiceContent_${userId}`
  	return invoiceContentKey
  }
	//获取当前用户存储在本地的，已经使用过的发票的内容
  loadLocalInvoiceContents = ()=>{
		let storedInvoiceUsage = localStorage.getItem(this.getInvoiceContentLocalKey()) ||'';
		return storedInvoiceUsage.trim().length ==0 ? [] : storedInvoiceUsage.trim().split(',')
  }
  //把本次输入的发票内容存储到本地
  refreshLocalInvoiceContents = (newContent) =>{
    console.log(newContent,'#####################')
  	let key = this.getInvoiceContentLocalKey()
		let original = this.loadLocalInvoiceContents();
    original.push(newContent)
		localStorage.setItem(key,original)
  }

  state = {
    selectableAccount:[],//可选的账户
  }

	/**
   * 选择工会,开篇单位下拉
	 */
	onGuildChange = (guildId)=>{
		UnionService.queryAccounts(guildId).then(selectableAccount =>{
			//应该还有其他善后工作
		  this.setState({selectableAccount:selectableAccount||[]})
		})
  }
	/**
   * 选择账户,自动填写税率
	 */
	onAccountChange = (accountName)=>{
	  let rate = (this.state.selectableAccount||[]).filter(acc => accountName == acc.accountName).map(acc => acc.faxRate)
    if( rate && rate.length == 1 ){
			this.props.form.setFieldsValue({ faxRate: rate[0] })
      this.calculateTaxFee()
		}else {//数据错误
			this.props.form.setFieldsValue({ noFaxFee:0,faxFee:0,faxRate:null})
    }
  }
	/**
   * 计算税费.通过发票总额(计税)计算出来税费和无税税额.
   * @param newValue 发票金额
	 */
	calculateTaxFee = (newValue)=>{
	  let {faxRate,invoiceFee} = this.props.form.getFieldsValue(['faxRate','invoiceFee'])
		if ( !!!faxRate || (!!!invoiceFee && !newValue) ) {//没有设置税率或者没有 发票金额,直接返回
			return
		}
		let allFee = (newValue || invoiceFee );
		const noFaxFee = (allFee / (1 + faxRate / 100)).toFixed(2) //不带税额,保留两位
		const faxFee = (allFee - noFaxFee).toFixed(2)    //税额
		this.props.form.setFieldsValue({ noFaxFee,faxFee})
	}
	/**
   * 发票税额变更
	 */
	onInvoiceFeeChange = (event)=>{
		let newValue = event && event.target && event.target.value;
		if ( newValue ) {
			this.calculateTaxFee(newValue)
		}
	}

  render() {
    const {visible, form, onClose, record, guildCode} = this.props;
    const {selectableAccount} = this.state;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 14},
    };
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++")
    const invoiceContents = this.loadLocalInvoiceContents()	//当前用户之前输入过的 发票内容
    const recordId = record['recordId']
    const title = recordId ? `修改发票【${recordId}】` : '新增发票'
    return (
      <Modal title={title}
             width={860}
             visible={visible}
             okText="确定"
             cancelText="取消"
             onOk={this.handleSave}
             onCancel={this.handleCancel}>
        <Form>
          <Row>
            <Col sm={12}>
              {getFieldDecorator("recordId")(<Input type="hidden"/>)}
              <FormItem label="公会" {...formItemLayout}>
                {getFieldDecorator("guildId", {
                  rules: [{required: true, message: '请选择公会'}]
                })(
                  <Select showSearch allowClear disabled={!!record['guildId']}
                          onChange={this.onGuildChange.bind(this)}
                          filterOption={(input, option) => {
                            const ids = String(option.props.children[0])
                            const names = String(option.props.children[2])
                            return ids.indexOf(input) >= 0 || names.indexOf(input) >= 0
                          }}>
                    {
                      guildCode.map(item => (
                        <Option key={item.guildId}>{item.guildId}({item.guildName})</Option>
                      ))
                    }
                  </Select>
                )}
              </FormItem>
              <FormItem label="发票类型" {...formItemLayout}>
                {getFieldDecorator("invoiceType", {
                  rules: [{message: '请选择发票类型'}]
                })(
                  <Select>
                    <Option key="special" value="special">专用</Option>
                    <Option key="general" value="general">普通</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label="发票号码" {...formItemLayout}>
                {getFieldDecorator("invoiceNum", {
                  rules: [{required: true, message: '请输入发票号码'}]
                })(
                  <Input/>
                )}
              </FormItem>

							<FormItem label="金额(不含税)" {...formItemLayout}>
								{getFieldDecorator("noFaxFee", {
									rules: [{message: '请输入金额'}]
								})(
									<Input type="number" min={0.01} suffix="元" />
								)}
							</FormItem>
							<FormItem label="税价合计" {...formItemLayout}>
								{getFieldDecorator("invoiceFee", {
									rules: [{required: true, message: '请输入税价合计'}]
								})(
									<Input onChange={this.onInvoiceFeeChange.bind(this)} type="number" min={0.01} suffix="元" />
								)}
							</FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label="开票单位(和盖章一致)" {...formItemLayout}>
								{getFieldDecorator("accountName", {
									rules: [{required: true, message: '请输入开票单位'}]
								})(
                  <Select showSearch allowClear
                          onChange={this.onAccountChange.bind(this)} >
										{
											selectableAccount.map(item => (
                        <Option key={item.accountName}>{item.accountName}({item.accountName})</Option>
											))
										}
                  </Select>
								)}
              </FormItem>
              <FormItem label="开票内容" {...formItemLayout}>
                {getFieldDecorator("invoiceContent", {
                  rules: [{required: true, message: '请输入开票内容'}]
                })(
                  <AutoComplete style={{ width: '100%' }}
																dataSource={invoiceContents}
																placeholder="请输入开票内容"
                                getPopupContainer={(triggerNode) => triggerNode.parentNode}
																filterOption={(inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
									/>
                )}
              </FormItem>
              <FormItem label="税率" {...formItemLayout}>
                {getFieldDecorator("faxRate", {
                  rules: [{required: true, message: '请选择税率'}],
                })(
                  <Input disabled type="number" suffix="%" />
                )}
              </FormItem>
              <FormItem label="税额" {...formItemLayout}>
                {getFieldDecorator("faxFee", {
                  rules: [{ message: '请输入税额'}]
                })(
                  <Input type="number" min={0.01} suffix="元" />
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

ModifyUnionInvoicesModal = Form.create({
  mapPropsToFields(props) {
    const {visible, record} = props
    if(!visible || !record) return {}
    record['noFaxFee'] && (record['noFaxFee'] /= 100)
    record['invoiceFee'] && (record['invoiceFee'] /= 100)
    record['faxFee'] && (record['faxFee'] /= 100)
    !!!record['invoiceType'] && (record['invoiceType'] = 'special')
    return commonUtils.recordToValueJson(record)
  }
})(ModifyUnionInvoicesModal);

//审核拒绝弹出框
class AuditRejectModal extends Component {
  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if(!!err) return;
      const params = Object.assign({}, values)
      params["auditSign"] = "F";
      webUtils.confirm(() => {
				let targetFunction = (this.props.record.auditSign == 'A' ? UnionService.auditInvoiceFinance:UnionService.auditInvoice);
				targetFunction(params).then( result => {
          webUtils.alertSuccess("拒绝成功！");
          this.props.onClose(true);
        })
      }, `确认拒绝发票【${this.props.record.recordId}】吗?`);
    })
  }

  render() {
    const {visible, form, onClose, record} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 3},
      wrapperCol: {span: 12},
    };
    return (
      <Modal title={`审核拒绝【${record['recordId']}】`}
             width={660}
             visible={visible}
             okText="提交"
             cancelText="取消"
             onOk={this.handleSave}
             onCancel={onClose}>
        <Form>
          {getFieldDecorator("recordId")(<Input type="hidden"/>)}
          <FormItem label="拒绝原因" {...formItemLayout}>
            {getFieldDecorator("auditReason", {rules: [{required: true, message: '请输入拒绝原因'}]})(
              <TextArea/>
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

AuditRejectModal = Form.create({
  mapPropsToFields(props) {
    const {visible, record} = props
    if(!visible || !record) return {}
    return commonUtils.recordToValueJson(record)
  }
})(AuditRejectModal);
export default class UnionInvoices extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openModifySanVisible: false,
      openRejectVisible: false,
      recordObj: {},
      guildCode: []
    };

		//需要判断权限的btn集合
    this.btnResList = props.location.state ? props.location.state.btnResList||[] : [];
    // 是否有审核通过的权限
    this.hasAuthorityToAuditPass = this.btnResList.includes('auditPass')
    // 是否有审核拒绝的权限
    this.hasAuthorityToAuditReject = this.btnResList.includes('auditReject')
		// 是否有 财务审核(二审) 通过的权限
		this.hasAuthorityToAuditPassFinance = this.btnResList.includes( 'auditInvoicePassFinance' )
		// 是否有 财务审核(二审) 拒绝的权限
		this.hasAuthorityToAuditRejectFinance = this.btnResList.includes( 'auditRejectFinance' )

    this.columns = [
      {title: '编号', dataIndex: 'recordId', width: 70, fixed: 'left'},
      {title: '创建人', dataIndex: 'createUserName', width: 100, fixed: 'left'},
      {title: '创建时间', dataIndex: 'createTime', width: 135},
      {title: '公会', dataIndex: 'guildName', width: 85},
      {title: '发票类型', dataIndex: 'invoiceTypeName', width: 85},
      {title: '开票单位', dataIndex: 'accountName', width: 120},
      {title: '开票内容', dataIndex: 'invoiceContent', width: 120},
      {title: '发票号码', dataIndex: 'invoiceNum', width: 120},
      {title: '发票金额(不含税)', dataIndex: 'noFaxFee', width: 120, render: (text) => commonUtils.getFormatCentToYuan(text)},
      {title: '税率', dataIndex: 'faxRate', width: 65, render: (text) => commonUtils.getFormatPercentOff(text)},
      {title: '税额', dataIndex: 'faxFee', width: 85, render: (text) => commonUtils.getFormatCentToYuan(text)},
      {title: '价税合计', dataIndex: 'invoiceFee', width: 100, render: (text) => commonUtils.getFormatCentToYuan(text)},
      {title: '已使用金额', dataIndex: 'useFee', width: 100, render: (text) => commonUtils.getFormatCentToYuan(text)},
      {title: '审核状态', dataIndex: 'auditSignDesc', width: 85},
      {title: '初审审核人', dataIndex: 'auditUserName', width: 100},
      {title: '财务审核人', dataIndex: 'financeUserName', width: 100},
      {title: '审核时间', dataIndex: 'auditTime', width: 135},
      {title: '打印次数', dataIndex: 'docPrintCnt', width: 100},
      {title: '审核拒绝原因', dataIndex: 'auditReason'},
      {
        title: '操作', dataIndex: '', fixed: 'right', width: 130, render: (text, record) => {
        return (
          <div>
            {record.auditSign === "F" &&
            <span>
                <a href="javascript:void(0)" onClick={this.openModifySanModal.bind(this, record)}>修改</a>
                <i className="ant-divider"/>
                <a href="javascript:void(0)" onClick={this.invalidInvoice.bind(this, record.recordId, record.guildId)}>作废</a>
              </span>
            }
            {record.auditSign === "S" &&
            <span>
              {this.hasAuthorityToAuditPass && <a href="javascript:void(0)" onClick={this.onAuditPass.bind(this, record)}>审核通过</a>}
              <i className="ant-divider"/>
              {this.hasAuthorityToAuditReject && <a href="javascript:void(0)" onClick={this.onAuditReject.bind(this, record)}>审核拒绝</a>}
            </span>
            }
            {record.auditSign === "A" &&
            <span>
              {this.hasAuthorityToAuditPassFinance && <a href="javascript:void(0)" onClick={this.onAuditPass.bind(this, record)}>财务通过</a>}
              <i className="ant-divider"/>
              {this.hasAuthorityToAuditRejectFinance && <a href="javascript:void(0)" onClick={this.onAuditReject.bind(this, record)}>财务拒绝</a>}
            </span>
            }
          </div>
        )
      }
      }
    ]
  }

  invalidInvoice = (recordId, guildId) => {
    webUtils.confirm(() => {
      UnionService.invalidInvoice(recordId, guildId).then(() => {
        this._customTable.queryTableData();
      })
    }, `是否确认作废【${recordId}】发票`)
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

  // 表单搜索
  handleOnSearch = (value) => {
		this._customTable.queryTableData(value);
  }
  //打开修改发票弹窗
  openModifySanModal = (record) => {
    this.setState({
      openModifySanVisible: true,
      recordObj: record ? Object.assign({}, record) : {}
    })
  }

  //打开审核拒绝弹窗
  onAuditReject(record, e) {
    e.preventDefault();
    this.setState({
      openRejectVisible: true,
      recordObj: record
    })
  }

  //审核通过
  onAuditPass(record, e) {
    e.preventDefault();
    webUtils.confirm(() => {
      let value = {
        recordId: record.recordId,
        auditSign:record.auditSign == 'S' ?'A': "T"
      }
      let targetFunction = record.auditSign == 'S' ? UnionService.auditInvoice:UnionService.auditInvoiceFinance;
			targetFunction(value).then(jsonResult => {
        webUtils.alertSuccess("通过成功！");
        this._customTable.refreshTable()
      })
    }, `确认审核通过发票【${record.recordId}】吗？`);
  }

  //统一关闭弹出框
  handleClose = (refresh = false) => {
    refresh && this._customTable.refreshTable();
    this.setState({
      openModifySanVisible: false,
      openRejectVisible: false,
      recordObj: {}
    })
  }

  render() {
    const {openModifySanVisible, recordObj, openRejectVisible, guildCode, showPrintDialog ,printData,selectedRowKeys, selectedRows} = this.state;
		const uninOperationList = this.state.uninOperationList || []
		//避免翻页后仍然选中当前页面的数据,也避免显示的选中有东西,实际没有的情况
		const rowSelection = {
			selectedRowKeys, selectedRows,
			onChange: ( selectedRowKeys, selectedRows ) => {
				this.setState({selectedRowKeys, selectedRows})
			}
		};

		return (
      <div>
        <UnionInvoicesForm ref={obj => this.searchFormRef = obj} onSearch={this.handleOnSearch} doPrintBatch={this.prepareForPrint}
                           onAddSuspensionEvent={this.openModifySanModal} guildCode={guildCode} uninOperationList={uninOperationList} />
        <CustomTable ref={table => this._customTable = table}
                     rowKey="recordId"
                     rowSelection={rowSelection}
                     columns={this.columns}
                     scroll={{x: 2100}}
                     fetchTableDataMethod={this.loadTableData}/>
        <ModifyUnionInvoicesModal visible={openModifySanVisible} onClose={this.handleClose} record={recordObj}
                                  guildCode={guildCode}/>
        <AuditRejectModal visible={openRejectVisible} onClose={this.handleClose} record={recordObj}/>
        <PrintDialog visible={showPrintDialog} printType={1} onClose={this.showOrHidePrintDialog.bind(this,false)}
                     printData={printData}
        />
      </div>
    )
  }

  loadTableData = (param) =>{
		this.clearSelectedRows()
		return UnionService.queryInvoices(param)
	}

	clearSelectedRows = () =>{
		this.setState({selectedRowKeys:[],selectedRows:[]})
	}

	prepareForPrint = () => {//为打印做准备
		if ( !this.state.selectedRowKeys || this.state.selectedRowKeys.length == 0 ) {//
			webUtils.alertFailure( '请选择发票' )
			return
		}
		UnionService.queryInvoicesForPrint( this.state.selectedRowKeys ).then( datas => {
			const printData = { pages: [] }
			for(let index =0;index<datas.length;index ++){
				printData.pages.push([datas[index],{},{},{}])//要求是没一张发票都要单独打印一张单据了,因此需要给剩下三个填空值
			}
			this.setState( { showPrintDialog: true, printData } )
		} )
	}

	//批量打印报销单
	showOrHidePrintDialog = (showPrintDialog) => {
		this.setState({showPrintDialog})
	}
}