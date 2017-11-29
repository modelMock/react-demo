/**
 * 账单发放相关的的
 */
import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, Select, Upload,Modal } from 'antd';

import CustomTable from '../../commons/widgets/CustomTable';
import webUtils from '../../commons/utils/webUtils';
import commonUtils from '../../commons/utils/commonUtils'
import UnionService from '../../service/UnionService';
import BillService from '../../service/BillService';

const FormItem = Form.Item;
const {Option} = Select
const {TextArea} = Input;

//账单发放的查询表单
class BillIssuanceForm extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			exporting: false,
			auditOperationList: []
		};
	}

	onSearchSubmit = ( e ) => {
		e.preventDefault();
		this.queryDatas();
	}

	queryDatas() {//查询数据
		let value = this.props.form.getFieldsValue();
		this.props.onSearch( value );
	}

	render() {
		const { form, handleReset, guildCode, doLockAll } = this.props;
		const { getFieldDecorator } = form;
		const { exporting ,showPrintDialog} = this.state;
		const refreshAfterImport = this.queryDatas.bind( this )

		//导入文件的配置
		const uploadProperties = {
			name: 'files',
			action: `${(webUtils.getDebugMode() ? '/show-manager' : '')}/bill/importBillCashier`,
			beforeUpload: ( file ) => {
				let type = file.type;//这个是按照扩展名判断的，如果没有扩展名也会返回空字符串的，下面的操作安全
				if ( type.indexOf( 'xls' ) >= 0 || type.indexOf( 'excel' ) >= 0 ) {//只识别 xls的文件,后面 部分windows 文件类型不是 xls
					return true;
				}
				webUtils.alertFailure( '仅支持xls类型的文件.' )
				return false
			},
			showUploadList: false,
			onChange( info ) {
				if ( info.file.status !== 'uploading' ) {
					console.debug( '上传中' )
				}
				if ( info.file.status === 'done' ) {
					let response = info.file.response;
					if ( response[ 'code' ] == 200 ) {//上传成功,后台也处理成功了
						webUtils.alertSuccessCallback( '导入成功!', refreshAfterImport )
					} else {//后台处理的时候发生了错误
						webUtils.alertFailure( response[ 'message' ], -1 )
					}
				} else if ( info.file.status === 'error' ) {//服务端错误
					webUtils.alertFailure( "上传文件失败!", -1 )
				}
			},
		};

		const formItemLayout = {
			labelCol: { span: 10 },
			wrapperCol: { span: 14 },
		}
		const buttonsMargin = { marginLeft: 8 }//按钮之间有点间隔
		return (
			<Form layout="horizontal" onSubmit={this.onSearchSubmit} className="ant-advanced-search-form">
				<Row>

					<Col sm={8}>
						<FormItem label="账单编号" {...formItemLayout}>
							{getFieldDecorator( "billSn" )(
								<Input placeholder="请输入账单编号"/>
							)}
						</FormItem>
					</Col>

					<Col sm={8}>
						<FormItem label="公会" {...formItemLayout}>
							{getFieldDecorator( "guildId" )(
								<Select
									optionFilterProp="children"
									allowClear
									showSearch placeholder="请选择公会">
									{
										guildCode.map( item => (
											<Option key={item.guildId}
															value={String( item.guildId )}>{item.guildId}({item.guildName})</Option>
										) )
									}
								</Select>
							)}
						</FormItem>
					</Col>
					<Col style={{textAlign: 'right'}}>
            <Button type="primary" icon="search" size="large" htmlType="submit" style={buttonsMargin}>查询</Button>
            <Button type="ghost" icon="cross" size="large" onClick={handleReset} style={buttonsMargin}>清除</Button>
					</Col>
				</Row>

				<Row>
					<Col style={{ textAlign: 'right' }}>
						<Button type="primary" ghost icon={'lock'} style={buttonsMargin} size="large" onClick={doLockAll}>一键锁定</Button>
						<Button type="primary" ghost icon={"file-excel"} style={buttonsMargin} size="large"
										onClick={this.exportLockedBill}>
							{exporting === false ? "导出锁定文件" : "导出中,请稍后..."}</Button>
						<Upload {...uploadProperties}>
							<Button type="primary" ghost icon="upload" size="large" style={buttonsMargin}>文件导入发放</Button>
						</Upload>
					</Col>
				</Row>

			</Form>
		)
	}

	exportLockedBill = () => { //导出已经锁定的待发账单
		if ( this.state.exporting === true ) return;
		this.setState( { exporting: true } );
		BillService.exportLockedBill( {} ).then( result => {
			this.setState( { exporting: false } );
			var a = document.createElement( 'a' );
			var url = window.URL.createObjectURL( result );
			var filename = '锁定账单.xls';
			a.href = url;
			a.download = filename;
			a.click();
			window.URL.revokeObjectURL( url );
		} ).catch( err => this.setState( { exporting: false } ) )
	}
}

BillIssuanceForm = Form.create()( BillIssuanceForm );

export default class BillIssuance extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			guildCode: [],
		};
		this.columns = [
			{ title: '账单编号', dataIndex: 'billSn', width: 85, fixed: 'left' },
			{ title: '创建时间', dataIndex: 'createTime', width: 135 },
			{ title: '发放渠道', dataIndex: 'payoffChannelText', width: 85 },
			{ title: '账单描述', dataIndex: 'billDesc' },
			{ title: '公会', dataIndex: 'guildName', width: 120 },
			{ title: '数量', dataIndex: 'channelCount', width: 70 },
			{ title: '金额', dataIndex: 'fee', width: 85, render: ( text ) => commonUtils.getFormatCentToYuan(text) },
			{ title: '银行', dataIndex: 'bankName', width: 120 },
			{ title: '银行账户名', dataIndex: 'accountName', width: 120 },
			{ title: '锁定标记', dataIndex: 'cashierLockText', width: 80 },
			{title: '操作', dataIndex: '_property_which_never_exists_', width: 120, fixed: 'right',
				render: ( text, record ) => {
					let lockedFlag = record[ 'cashierLock' ];
					let locked = 'T' == lockedFlag;//当前是否已经锁定了
					if ( !lockedFlag ) {
						return null;
					}
					let icon = locked ? 'unlock' : 'lock'
					let btn = locked ? <Button size="small" type="primary" ghost icon={icon}
																		 onClick={this.handleRowAction.bind( this, locked, record[ 'billSn' ] )}>解锁</Button> :
						<Button size="small" type="danger" ghost icon={icon}
										onClick={this.handleRowAction.bind( this, locked, record[ 'billSn' ] )}>锁定</Button>
					return ( btn )
				}
			}
		]
	}

	handleRowAction = ( lockedNow, billSn ) => {//
		const tip = `是否要${lockedNow ? '解锁' : '锁定'}当前记录${billSn}`
		webUtils.confirm( () => {
			(lockedNow ? BillService.unLockBillCashier( { billSn } ) : BillService.lockBillCashier( { billSn } ))
				.then( () => {
					this._customTable.refreshTable()
				} )
		}, tip )
	}

	componentDidMount() {
		//获取公会id(不是公会代码)
		UnionService.queryAllGuild().then( guildCode => {
			this.setState( { guildCode } )
		} )
	}

	// 表单搜索
	handleOnSearch = ( value ) => {
		this._customTable.queryTableData( value );
	}
	//清空表单
	handleReset = ( e ) => {
		e.preventDefault();
		this._billIssuanceForm.resetFields();
	}

	doLockAll = () => {//一键锁定
		webUtils.confirm( () => {
			BillService.lockAllBillCashier().then( () => {
				this._customTable.refreshTable();
			} )
		}, "是否锁所有的待发记录" )
	}

	render() {

		const { guildCode } = this.state;
		return (
			<div>
				<BillIssuanceForm ref={( obj ) => this._billIssuanceForm = obj} onSearch={this.handleOnSearch}
													doLockAll={this.doLockAll.bind( this )} handleReset={this.handleReset} guildCode={guildCode}/>
				<CustomTable ref={table => this._customTable = table}
										 rowKey="billSn"
										 columns={this.columns}
										 scroll={{ x: 1260 }}
										 fetchTableDataMethod={BillService.queryBillForCashier}/>
			</div>
		)
	}
}