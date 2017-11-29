/*运营号列表*/
import React, { Component } from 'react'
import { Tabs, Modal } from 'antd'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import OperationForm from './OperationForm'
import CommonTable from '../Commons/CommonTable'
import { queryOperationList, updateUnbind, updateOperation,getOperationBase64QrCode } from '../../services/operations'
import OperationStatusRender from './OperationStatusRender'
import { Confirm, Success } from '../Commons/CommonConstants'
import resourceManage from '../ResourceManage'
const TabPane = Tabs.TabPane

class BasePanel extends Component {
  constructor(props) {
    super(props);
    this.state={
      visible: false,
      mobile:'',
      url:''
    }
    this.activedBtnIds = resourceManage.getActivedBtnIds()
    this.onRefresh = this.onRefresh.bind(this)
    this.handleOk=this.handleOk.bind(this)
    this.handleCancel=this.handleCancel.bind(this)
  }

  baseColumns() {
    return [
      {title: '添加时间', dataIndex: 'create_time', width: 135},
      {title: '分配时间', dataIndex: 'assign_channel_time', width: 135},
      {title: '原始组号', dataIndex: 'wechat_group', width: 100},
      {title: '运营手机号', dataIndex: 'mobile', width: 100, render: (text, record) => (
        <a href="javascript:void(0)" onClick={this.onCellClick.bind(this, record)}>{text}</a>
      )},
      {title: '运营微信号', dataIndex: 'operation_wechat', width: 120},
      {title: '运营号状态', dataIndex: 'status', width: 100, render: (status, record) => OperationStatusRender(status, record['status_text'])},
      {title: '好友总数(人)', dataIndex: 'friend_cnt', width: 100},
      {title: '商业渠道', dataIndex: 'channel_name'},
      {title: '客服号', dataIndex: 'optr_name', width: 150},
      {title: '操作', dataIndex: 'operation_sn', fixed: 'right', width: 100, render: (text, record) => {
        //分配了商业渠道的才有解除绑定功能
        const showThisBtn = record['channel_id'] != -1 && this.activedBtnIds.indexOf("8-4") >= 0
        return showThisBtn ? <a href="javascript:void(0)" onClick={this.unbind.bind(this, record['operation_sn'])}>解除绑定</a> : ""
      }}
    ]
  }

  onCellClick(record){
    getOperationBase64QrCode({ operation_sn: record.operation_sn }).then(({ jsonResult }) => {
      this.setState({ mobile: record.mobile, url: jsonResult })
      this.showModal()
    })
  }

  showModal() {
    this.setState({
      visible: true
    })
  }

  handleOk() {
    this.setState({
      visible: false
    })
  }

  handleCancel(e) {
    this.setState({
      visible: false
    })
  }

  //解绑
  unbind( operation_sn ) {
    Confirm(() => {
      updateUnbind({ operation_sn }).then(({ jsonResult }) => {
        this.refs.commontable.refreshTable()
        Success("解除绑定成功")
      })
    }, "确认解除绑定吗？")
  }
  //刷新
  onRefresh() {
    updateOperation().then(({ jsonResult }) => {
      this.refs.commontable.setExtraParams({ type: this.type })
      this.refs.commontable.refreshTable();
    })
  }

  shouldComponentUpdate( ...args ) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args)
  }
}

class GroupPane extends BasePanel {
  constructor(props) {
    super(props)
    this.handleSearch = this.handleSearch.bind(this)
    this.type = "group"
  }

  getColumns() {
    let columns = this.baseColumns()
    columns.splice(8, 1) //删除客服列
    return columns
  }

  handleSearch( newSearchObj ) {
    newSearchObj['type'] = this.type
    this.refs.commontable.queryTableData( newSearchObj )
  }

  render(){
    const {mobile, url} = this.state
    return (
      <div>
        <Modal title="二维码"
               visible={this.state.visible}
               onOk={this.handleOk}
               onCancel={this.handleCancel}
               footer={[]}>
          <div style={{textAlign: 'center', marginTop: 16}}>
            <p>运营号：{mobile}</p>
            <img width="200" height="200" src={url} />
          </div>
        </Modal>
        <OperationForm type="group" onSearchOptr={this.handleSearch} onRefresh={this.onRefresh} />
        <CommonTable ref="commontable"
                     columns={this.getColumns()}
                     rowKey="operation_sn"
                     fetchTableDataMethod={queryOperationList}
        />
      </div>
    )
  }
}

class ChannelPane extends BasePanel {
  constructor(props) {
    super(props)
    this.state={
      visible: false,
      mobile: '',
      url: ''
    }
    this.handleSearch = this.handleSearch.bind(this)
    this.type = "channel"
  }

  getColumns() {
    let columns = this.baseColumns()
    columns.splice(8, 1) //删除客服列
    return columns
  }

  handleSearch( newSearchObj ) {
    newSearchObj['type'] = this.type
    this.refs.commontable.queryTableData( newSearchObj )
  }

  onCellClick( record ){
    getOperationBase64QrCode({ operation_sn: record.operation_sn }).then(({ jsonResult }) => {
      this.setState({ mobile: record.mobile, url: jsonResult })
      this.showModal()
    })
  }

  showModal(){
    this.setState({
      visible: true
    })
  }

  handleOk(){
    this.setState({
      visible: false
    })
  }

  handleCancel(e){
    this.setState({
      visible: false
    })
  }

  render() {
    const {mobile, url} = this.state
    return (
      <div>
        <Modal title="二维码"
               visible={this.state.visible}
               onOk={this.handleOk}
               onCancel={this.handleCancel}
               footer={[]}
        >
          <div style={{textAlign: 'center', marginTop: 16}}>
            <p>运营号：{mobile}</p>
            <img width="200" height="200" src={url} />
          </div>
        </Modal>
        <OperationForm type="channel" onSearchOptr={this.handleSearch} onRefresh={this.onRefresh} />
        <CommonTable ref="commontable"
                     columns={this.getColumns()}
                     rowKey="operation_sn"
                     fetchTableDataMethod={queryOperationList}
        />
      </div>
    )
  }
}

class OptrPane extends BasePanel {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      mobile: '',
      url: ''
    }
    this.handleSearch = this.handleSearch.bind(this)
    this.type = "optr"
  }

  getColumns() {
    let columns = this.baseColumns()
    columns.splice(0, 1) //删除添加时间列
    columns.splice(1, 1)  //删除原始组号列
    return columns
  }

  handleSearch( newSearchObj ) {
    newSearchObj['type'] = this.type
    this.refs.commontable.queryTableData( newSearchObj )
  }

  onCellClick( record ){
    getOperationBase64QrCode({ operation_sn: record.operation_sn }).then(({ jsonResult }) => {
      this.setState({ mobile: record.mobile, url: jsonResult})
      this.showModal()
    })
  }

  showModal(){
    this.setState({
      visible: true
    })
  }

  handleOk(){
    this.setState({
      visible: false
    })
  }

  handleCancel(e){
    this.setState({
      visible: false
    })
  }

  render(){
    const {mobile, url} = this.state
    return (
      <div>
        <Modal title="二维码"
               visible={this.state.visible}
               onOk={this.handleOk}
               onCancel={this.handleCancel}
               footer={[]}>
          <div style={{textAlign: 'center', marginTop: 16}}>
            <p>运营号：{mobile}</p>
            <img width="200" height="200" src={url} />
          </div>
        </Modal>
        <OperationForm type="optr" onSearchOptr={this.handleSearch} onRefresh={this.onRefresh} />
        <CommonTable ref="commontable"
                     columns={this.getColumns()}
                     rowKey="operation_sn"
                     fetchTableDataMethod={queryOperationList}
        />
      </div>
    )
  }
}

export default class OperationTab extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const activedBtnIds = resourceManage.getActivedBtnIds()
    return (
      <Tabs type="card">
        <TabPane key="1" tab="按组号查询" disabled={activedBtnIds.indexOf("8-1") === -1}>
          <GroupPane />
        </TabPane>
        <TabPane key="2" tab="按商业渠道查询" disabled={activedBtnIds.indexOf("8-2") === -1}>
          <ChannelPane />
        </TabPane>
        <TabPane key="3" tab="按客服号查询" disabled={activedBtnIds.indexOf("8-3") === -1}>
          <OptrPane />
        </TabPane>
      </Tabs>
    )
  }
}
