/**
 * 账单审核部分
 */
import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, Select, DatePicker, Modal, Tabs, Icon } from 'antd';
import CustomTable from '../../commons/widgets/CustomTable';

import { DateUtil, FORMAT_PATTERNS } from '../../commons/utils/DateUtil';
import webUtils from '../../commons/utils/webUtils';
import commonUtils from '../../commons/utils/commonUtils'

import UnionService from '../../service/UnionService';
import BillService from '../../service/BillService';
import AnchorService from '../../service/AnchorService';

import FixedDateRangeCmp from './FixedDateRangeCmp'
import PrintDialog from '../print/PrintDialog'

const FormItem = Form.Item;
const {Option} = Select
const { RangePicker } = DatePicker;
const TabPane = Tabs.TabPane;

//审核确认弹出框
class BillAuditConfirmModal extends Component {
	constructor( props ) {
		super( props );
	}

	resetFields = () => {
		this.props.form.resetFields();
	}
	handleSave = ( actionFlag,e ) => {
		e.preventDefault();
		this.props.form.validateFields( ( err, values ) => {
			if ( !!err ) return;
			values[ "billSns" ] = this.props.billSns;
			switch (actionFlag){
				case 0 : values[ "auditSign" ] = "S"; break;//提交审核
				case 3 : values[ "auditSign" ] = "T"; break;//财务审核通过
				case 4 : values[ "auditSign" ] = "A"; break;//运营主管审核通过
		  }
			this.props.handleSaveProxy( values,actionFlag )
		} )
	}

	render() {
		const { visible, form, onClose, billSns, actionFlag } = this.props;
		// actionFlag => 0:运营提交审核，1:催开发票，2:打印用款单，3:财务审核通过，4:运营审核通过
		const { getFieldDecorator } = form;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 12 },
		};
		let array = (billSns || []);
		//四个一行，放置超出了弹出框的范围
		let snsList = array.length > 0 ? array.reduce((a,b) => {let shouldStartNextLine = String(a).split(',').length % 4 ==0;return `${a},${shouldStartNextLine?'\n\t':''}${b}`}) : ''

		let title = ''
		switch (actionFlag){
			case 0 : title = '提交审核';break;
			case 1 : title = '催开发票';break;
			case 3 : title = '审核通过';break;
			case 4 : title = '审核通过';break;
		}
		return (
			<Modal title={title}
						 width={500}
						 visible={visible}
						 okText="提交"
						 cancelText="取消"
						 onOk={this.handleSave.bind( this,actionFlag )}
						 onCancel={onClose}>
				<div className="ant-confirm-body">
					<Icon type="exclamation-circle" style={{ fontSize: "24px", color: "#ffbf00" }}/>
					<span className="ant-confirm-title">是否确认 {title} 所选的公会薪酬结算[{snsList}]</span>
				</div>
			</Modal>
		)
	}
}

BillAuditConfirmModal = Form.create()( BillAuditConfirmModal );

//查询的表单
class BillAuditForm extends FixedDateRangeCmp {
	constructor( props ) {
		super( props )
		this.state = {
			beforeDay: this.fifteenDaysAgo,
			exporting: false,
			anchorList: [],//可以用来过滤的主播id
			managerList: [],//归属运营
			btnStyle: true,
		}
		//需要判断权限的btn集合
		this.btnResList = props.btnResList || [];
		this.hasBillToAudit = this.btnResList.includes( 'billToAudit' )										//账单提交审核
		this.hasBillUrgeInvoice = this.btnResList.includes( 'billUrgeInvoice' )								//催开发票
		this.hasBillPrintFoundsApply = this.btnResList.includes( 'billPrintFoundsApply' )					//打印用款单(账单)
		this.hasBillAuditCaiwu = this.btnResList.includes( 'billAuditCaiwu' )								//财务审核通过(账单)
		this.hasBillFirstAudit = this.btnResList.includes( 'billFirstAudit' )								//运营审核(账单)
		this.hasBillExport = this.btnResList.includes( 'billExport' )										//到处待发文件(账单)
	}

	componentDidMount() {
		AnchorService.queryUserByType().then(managerList => {
			this.setState({ managerList })
		})
	}

	onSearchSubmit = ( e ) => {
		e.preventDefault();
		let value = this.extractedFormValue();
		this.props.onSearch( value );
	}

	onGuildChanges = ( guildId ) => {//不放缓存了,如果将来数据超级大，会有问题。
		if ( this.props.showAnchor ) {
			if(guildId){
				UnionService.queryMember( {
					guildId,
					limit: 99999
				} ).then( data => this.setState( { anchorList: data.records || [] } ) )
			}else {
				this.setState( { anchorList: [] } )//没有选择公会也把可选的主播给置空
			}
			this.props.form.resetFields( [ "anchorId" ] )  //此时时间范围已经被重置了,获取表单的参数的时候不会出问题
		}
	}

	exportBill = () => { //导出excel
		if ( this.state.exporting === true ) return;
		this.setState( { exporting: true } );
		let param = this.extractedFormValue();
		BillService.exportGuildBill( param ).then( result => {
			this.setState( { exporting: false } );
			var a = document.createElement( 'a' );
			var url = window.URL.createObjectURL( result );
			var filename = '账单.xls';
			a.href = url;
			a.download = filename;
			a.click();
			window.URL.revokeObjectURL( url );
		} ).catch( err => this.setState( { exporting: false } ) )
	}
	//清空表单
	handleReset = ( e ) => {
		e.preventDefault();
		this.props.form.resetFields();
	}

	render() {
		const { form, guildCode, showAnchor,doPrintFoundsApply } = this.props;

		const { getFieldDecorator } = form;
		const { exporting, beforeDay, anchorList ,managerList} = this.state;


		const formItemLayout = {
			labelCol: { span: 10 },
			wrapperCol: { span: 14 },
		}
		return (
			<Form layout="horizontal" onSubmit={this.onSearchSubmit} className="ant-advanced-search-form">
				<Row>
					<Col sm={8}>
						<FormItem label="公会" {...formItemLayout}>
							{getFieldDecorator( "guildId" )(
								<Select
									optionFilterProp="children"
									allowClear onChange={this.onGuildChanges.bind( this )}
									showSearch placeholder="请选择公会">
									{
										guildCode.map( item => (
											<Option key={item.guildId}>{item.guildName}({item.guildId})</Option>
										) )
									}
								</Select>
							)}
						</FormItem>
						{showAnchor &&
						<FormItem label="主播" {...formItemLayout}>
							{getFieldDecorator( "anchorId" )(
								<Select allowClear placeholder="请选择主播">{
									anchorList.map( item => <Option value={item.userId}>{item.nickname}</Option> )
								}
								</Select>
							)}
						</FormItem>}

						{!showAnchor && <FormItem label="审核状态" {...formItemLayout}>
							{getFieldDecorator("auditSign")(
								<Select allowClear>
									<Option key="S" value="S">待审核</Option>
									<Option key="T" value="A">一审通过</Option>
									<Option key="T" value="T">审核通过</Option>
									<Option key="F" value="F">审核拒绝</Option>
								</Select>
							)}
						</FormItem> }
						{!showAnchor && <FormItem label="排序" {...formItemLayout}>
							{getFieldDecorator("queryOrder")(
								<Select allowClear >
									<Option key="" value="">默认</Option>
									<Option key="1" value="1">发票差额</Option>
									<Option key="2" value="2">打印次数</Option>
									<Option key="3" value="3">催票次数</Option>
								</Select>
							)}
						</FormItem> }
					</Col>

          <Col sm={8}>
            <FormItem label="账单编号" {...formItemLayout}>
              {getFieldDecorator( "billSn" )( <Input placeholder="请输入账单编号"/> )}
            </FormItem>
						{<FormItem label="发放状态" {...formItemLayout}>
							{getFieldDecorator("status")(
								<Select allowClear placeholder="请选择发放状态">
									<Option value="">全部</Option>
									<Option value="GRANT">已支付</Option>
									<Option value="UNGRANT">待支付</Option>
									<Option value="INACTIVE">失效</Option>
								</Select>
							)}
						</FormItem>}
          </Col>

          <Col sm={8}>
						{!showAnchor && <FormItem label="归属运营" {...formItemLayout}>
							{getFieldDecorator("tutorUserId")(
								<Select allowClear showSearch >
									{
										managerList.map(user => (
											<Option key={String(user.userId)}>{user.nickname}({user.userId})</Option>
										))
									}
								</Select>
							)}
						</FormItem>}
						<FormItem label="创建时间" {...formItemLayout}>
							{getFieldDecorator( "data", { initialValue: [ beforeDay, DateUtil.nowAsYmd() ] } )(
								<RangePicker format={FORMAT_PATTERNS.YMD} style={{width: '100%'}} />
							)}
							<div style={{marginTop: 8, textAlign: 'right'}}>
								<Button type={this.firstRangeButtonType} size="large"
												onClick={this.queryWithFixedRange.bind( this, this.fifteenDaysAgo )}>最近15日</Button>
								<Button type={this.secondRangeButtonType} size="large"
												onClick={this.queryWithFixedRange.bind( this, this.thirtyDayAgo )}>最近30日</Button>
							</div>
						</FormItem>
          </Col>
          <Col style={{ textAlign: 'right' }}>
            {(!showAnchor && this.hasBillToAudit) ? <Button ghost type="primary" size="large" onClick={() => {
              this.props.onshowAuditModal( 0 )
            }}>提交审核</Button> : null
            }

            {(!showAnchor && this.hasBillUrgeInvoice) ? <Button ghost type="primary" size="large" onClick={() => {
              this.props.onshowAuditModal( 1 )
            }}>催开发票</Button> : null
            }
            {(!showAnchor && this.hasBillPrintFoundsApply) ? <Button ghost icon={"printer"} type="primary" size="large" onClick={() => {
							doPrintFoundsApply()
            }}>打印用款单</Button> : null
						}
            {(!showAnchor && this.hasBillAuditCaiwu) ? <Button ghost icon={"check"} type="primary" size="large" onClick={() => {
              this.props.onshowAuditModal( 3 )
            }}>财务审核通过</Button> : null
            }
            {(!showAnchor && this.hasBillFirstAudit) ? <Button ghost icon={"check"} type="primary" size="large" onClick={() => {
              this.props.onshowAuditModal( 4 )
            }}>运营初审通过</Button> : null
            }
            {(!showAnchor && this.hasBillExport) ?
              <Button icon={"file-excel"} type="primary" size="large" ghost loading={exporting} onClick={this.exportBill}>
                {exporting === false ? "导出待发文件" : "导出中,请稍后..."}
              </Button> : null
            }
            <Button type="primary" icon="search" size="large" htmlType="submit">查询</Button>
            <Button type="ghost" icon="cross" size="large" onClick={this.handleReset.bind( this )}>清除</Button>
          </Col>
				</Row>
			</Form>
		)
	}
}

BillAuditForm = Form.create()( BillAuditForm );

export default class BillAudit extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			activeKey: '1',
			btnStyle: true,
			showConfirmModal: false,//打开 确认框 的标记
			auditBillSn: false,//要审核的账单编号
			actionFlag: -1,//各种不同的操作的标记 , 0:运营提交审核，1:催开发票，2:打印用款单，3:财务审核通过，4:运营审核通过
			guildCode: [],	//公会列表
      selectedRowKeys: [],     //表格中被选中项key的集合
      selectedRows: []          //表格中被选中项的集合
		}
		this.queryGuildBills = this.queryGuildBills.bind( this )
		this.queryAnchorBills = this.queryAnchorBills.bind( this )

		//需要判断权限的btn集合
		this.btnResList = props.location.state ? props.location.state.btnResList||[] : [];
		this.hasBillRollback = this.btnResList.includes( 'billRollback' )									//审核回退(账单)
		this.hasBillRollbackCaiwu = this.btnResList.includes( 'billRollbackCaiwu' )							//财务审核回退(账单)

		this.publicColumns = [
			{ title: '账单ID', dataIndex: 'billSn', width: 80, fixed: 'left' },
			{ title: '创建时间', dataIndex: 'createTime', width: 135 },
			{ title: '发放渠道', dataIndex: 'payoffChannelText', width: 85 },
			{ title: '账单描述', dataIndex: 'billDesc' },
			{ title: '公会', dataIndex: 'guildName', width: 120 },
			{ title: '金额', dataIndex: 'fee', width: 85, render: ( text ) => commonUtils.getFormatCentToYuan(text) },
			{ title: '状态', dataIndex: 'statusText', width: 85 },
			{ title: '审核', dataIndex: 'auditText', width: 85 },
			{ title: '发票差额', dataIndex: 'invoiceDifferenceFee', width: 100,render: ( text ) => (<span style={{color:'#F00'}}>{commonUtils.getFormatCentToYuan(text)}</span>) },
			{ title: '发票号码', dataIndex: 'invoiceNumList', width: 120 },
			{ title: '银行', dataIndex: 'bankName', width: 120 },
			{ title: '银行账户名', dataIndex: 'bankAccount', width: 100 },
			{ title: '银行账号', dataIndex: 'accountName', width: 120 },
			{ title: '支行名称', dataIndex: 'branchName', width: 100 },
			{ title: '归属运营', dataIndex: 'tutorUserNickname', width: 120 },
			{ title: '回执单号', dataIndex: 'cashierNo', width: 100 },
			{ title: '备注', dataIndex: 'remark', width: 120 },
			{ title: '审核拒绝原因', dataIndex: 'auditReason', width: 120 },
			{ title: '核准', dataIndex: 'auditUserName', width: 120 },
			{ title: '出纳', dataIndex: 'cashierName', width: 120 },
			{ title: '催票次数', dataIndex: 'callInvoiceCnt', width: 100 },
			{ title: '打印次数', dataIndex: 'docPrintCnt', width: 100 },
			{title: '操作', width: 120, fixed: 'right', render: ( text, record ) => {
				let auditSign = record[ 'auditSign' ];
				const marginSetting = { marginLeft: '2px', marginRight: '2px' }//按钮之间来点间隔
				let canRevoke = ('T' == auditSign || 'A' == auditSign) && record['status'] == 'UNGRANT' //没有锁定并且已经审核通过的可以回退

				return (
					<span>
						{('A' == auditSign && this.hasBillRollback) ?
							<Button size="small" type="danger" ghost style={marginSetting}
											onClick={this.doRevoke.bind( this, record )}>回退审核</Button> : null}
						{('T' == auditSign && this.hasBillRollbackCaiwu) ?
							<Button size="small" type="danger" ghost style={marginSetting}
											onClick={this.doRevoke.bind( this, record )}>回退审核</Button> : null}
					</span>
				)
				}
			}
		];
		this.privateColumns = [
			{ title: '账单编号', dataIndex: 'billSn', width: 80, fixed: 'left' }
			, { title: '创建时间', dataIndex: 'createTime', width: 135 }
			, { title: '发放渠道', dataIndex: 'payoffChannelText', width: 85 }
			, { title: '账单描述', dataIndex: 'billDesc' }
			, { title: '公会', dataIndex: 'guildName', width: 120 }
			, { title: '主播', dataIndex: 'anchorNickname', width: 100 }
			, { title: '金额', dataIndex: 'fee', width: 85, render: ( text ) => commonUtils.getFormatCentToYuan(text) }
			, { title: '归属运营', dataIndex: 'tutorUserNickname', width: 100 }
			, { title: '银行', dataIndex: 'bankName', width: 120 }
			, { title: '银行账户名', dataIndex: 'accountName', width: 100 }
			, { title: '银行账号', dataIndex: 'bankAccount', width: 100 }
			, { title: '支行省', dataIndex: 'branchProvince', width: 100 }
			, { title: '支行市', dataIndex: 'branchCity', width: 100 }
			, { title: '支行名称', dataIndex: 'branchName', width: 100 }
			, { title: '支付宝', dataIndex: 'alipayAccount', width: 85 }
			, { title: '银行联号', dataIndex: 'bankLineNum', width: 85 }
			, { title: '身份证', dataIndex: 'accountIdentityNo', width: 120 }
		]
	}

	//切换Tabs
	onChange = ( activeKey ) => {
		this.setState( { activeKey } );
	}
	doRevoke = ( record ) => {//账单回退
		let billSn = record.billSn
		let targetFunction = record.auditSign == 'T' ? BillService.rollbackBillsCashier : BillService.rollbackBills
		webUtils.confirm( () => {
			targetFunction( { billSn } ).then( () => {
				this.billAuditcustomTable.refreshTable()
			} )
		}, `确认回退账单编号[${billSn}]吗？` )
	}

	_doModalSaveAction = ( values ,actionFlag ) => {//审核账单
		let targetFunction = null
		switch ( actionFlag ) {
			case 0 :
				targetFunction = BillService.commitBillsToAduit;
				break;
			case 1 :
				targetFunction = BillService.urgeTheInvoice;
				break;
			case 3 :
				targetFunction = BillService.auditBillsCashier;
				break;
			case 4 :
				targetFunction = BillService.auditBills;
				break;
		}
		targetFunction( values ).then( () => {
			webUtils.alertSuccessCallback( '操作成功', () => {
				this.onCloseAuditModal( true )
			} )
		} )
	}

	onCloseAuditModal = ( reloadData ) => {//关闭审核的确认窗口
		if ( reloadData == true ) {
			this.billAuditcustomTable.refreshTable()
		}
		this.refs.confirmModal.resetFields();
		this.setState( { showConfirmModal: false } )
	}

	showAuditModal = ( actionFlag, billSns ) => {//拒绝审核的时候打开弹出窗口，需要填写remark
    const selectedRowKeys = this.state.selectedRowKeys
		let billSnsNotEmpty = billSns && billSns.length && billSns.length > 0;
		if ( !billSnsNotEmpty && (!selectedRowKeys || selectedRowKeys.length == 0) ) {
			Modal.info( { title: '提示', content: '尚未选择任何一条记录.请选择后再做操作.' } )
			return
		}
		this.setState( {
			auditBillSn: billSns || selectedRowKeys,//目标审核的账单
			showConfirmModal: true,
			actionFlag
		} )
	}

	componentDidMount() {
		//获取公会id(不是公会代码)
		UnionService.queryAllGuild().then( guildCode => {
			this.setState( { guildCode } )
		} )
	}

	clearSelectedRows = () => {
	  this.setState({
      selectedRows: [],
      selectedRowKeys: []
    })
  }

	queryGuildBills = ( fieldsValue ) => {//刷新公会的账单列表
    // 清空选中项
    this.clearSelectedRows()
		this.billAuditcustomTable.queryTableData( fieldsValue )
	}

	queryAnchorBills = ( parm ) => {//刷新主播的账单列表
		this._customTable.queryTableData( parm )
	}

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRows,
      selectedRowKeys
    });
  }


	render() {
		const { activeKey, guildCode, showConfirmModal, actionFlag, auditBillSn ,showPrintDialog, selectedRowKeys, selectedRows} = this.state;
		let showAnchor = activeKey != '1';
		const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange
		};

		return (
			<Tabs activeKey={activeKey} type="card" onChange={this.onChange}>
				<TabPane tab="对公" key="1">
					<BillAuditForm onSearch={this.queryGuildBills}
                         guildCode={guildCode}
                         showAnchor={showAnchor}
												 btnResList={this.btnResList}
												 onshowAuditModal={this.showAuditModal}
												 doPrintFoundsApply={this.doPrintFoundsApply.bind(this)}
												 activeKey={activeKey}/>
					<CustomTable ref={table => this.billAuditcustomTable = table}
											 rowKey="billSn"
											 rowSelection={rowSelection}
											 columns={this.publicColumns}
											 scroll={{ x: 2600 }}
                       showSelectedRow={true}
                       clearSelectedRows={this.clearSelectedRows}
											 fetchTableDataMethod={BillService.queryGuildBills}/>
					<BillAuditConfirmModal ref={"confirmModal"}
                                 billSns={auditBillSn}
                                 visible={showConfirmModal}
																 actionFlag={actionFlag}
																 handleSaveProxy={this._doModalSaveAction}
																 onClose={this.onCloseAuditModal}/>
					<PrintDialog visible={showPrintDialog} printType={2} onClose={this.hidePrintDialog}
											 printData={selectedRows}
					/>
				</TabPane>
				<TabPane tab="对私" key="2">
					<BillAuditForm onSearch={this.queryAnchorBills}
												 guildCode={guildCode}
												 showAnchor={showAnchor}
												 activeKey={activeKey}/>
					<CustomTable ref={table => this._customTable = table}
											 rowKey="_recordId_"
											 columns={this.privateColumns}
											 scroll={{ x: 1800 }}
											 fetchTableDataMethod={BillService.queryAnchorBills}/>
				</TabPane>
			</Tabs>
		)
	}

	//关闭打印窗口
	hidePrintDialog = () => {
		this.setState({showPrintDialog:false})
	}

	doPrintFoundsApply = ()=>{//打印用款单
		if ( !this.state.selectedRows || this.state.selectedRows.length <1 ) {
			webUtils.alertFailure('请先选择账单.')
			return
		}
		let filter = this.state.selectedRows.filter( row => 'S' != row.auditSign && 'T' != row.auditSign && 'A' != row.auditSign);
		if(filter.length>0){
			webUtils.alertFailure(`编号为：[ ${filter.map(bill => bill.billSn).join(",")} ]的账单尚未审核过，不能打印!`)
			return
		}
		this.setState({showPrintDialog:true})
	}
}