/*客服列表*/
import React, { Component, PropTypes} from 'react';
import {Button} from 'antd';
import CommonTable from '../Commons/CommonTable.jsx';
import OptrSearchForm from './OptrSearchForm.jsx';
import EditOptrModal from './EditOptrModal.jsx';
import DisableOptrModal from './DisableOptrModal';
import TransferFrdsModal from './TransferFrdsModal.jsx';
import {queryKefuList, resetPasswd} from '../../services/optr';
import {statusRender} from '../Commons/CommonConstants.js';
import {Confirm, Success} from '../Commons/CommonConstants';
import resourceManage from '../ResourceManage';

class OptrList extends Component {
  constructor(props) {
    super(props);
    this.state={
      selectedRowKeys:[],
      selectedRows:[],
      title:'',   //添加、编辑弹出框标题
      data: {},  //添加、编辑弹出框中form数据
      type: '',  //操作类型：封号、转移
    };

    this.handleSearch = this.handleSearch.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleRefreshTable = this.handleRefreshTable.bind(this);
    this.resetPwd = this.resetPwd.bind(this);
    this.resetState = this.resetState.bind(this);
    this.onRefreshTableRecord=this.onRefreshTableRecord.bind(this);

    const activedBtnIds = resourceManage.getActivedBtnIds();
    const isEditShow = activedBtnIds.indexOf("12-2") == -1;
    const isDisabledShow = activedBtnIds.indexOf("12-3") == -1;
    const isTransferShow = activedBtnIds.indexOf("12-4") == -1;
    const isResetShow = activedBtnIds.indexOf("12-5") == -1;
    this.columns = [
      {title: '客服号',        dataIndex: 'login_account', width: 100},
      {title: '客服名称',        dataIndex: 'optr_name', width: 100},
      {title: '添加时间',       dataIndex: 'create_time', width: 135},
      {title: '手机号',        dataIndex: 'mobile', width: 100},
      {title: '渠道名称',      dataIndex: 'channel_name'},
      {title: '运营号总数/正常数',  dataIndex: 'operation_total', render:(text, record) => (
          `${text}/${record['operation_used']}个`
      ), width: 150},
      {title: '微信好友总数/正常数',  dataIndex: 'friend_total', render:(text, record) => (
          `${text}/${record['friend_used']}个`
      ), width: 150},
      {title: '客服状态',       dataIndex: 'status',　render: (text, record) => statusRender(text, record['status_text']), width: 90},
      {title: '选品方',        dataIndex: 'selected_party_text', width: 100},
      {title: '运营方',        dataIndex: 'business_operator_text', width: 100},
      {title: '备注',        dataIndex: 'remark', width: 100},
      {title: '操作',           key: 'operation',  fixed: 'right', width:260, render: (text, record) => {
        if(record['status'] !== 'ACTIVE') return '';

        return <span>
                  <span hidden={isEditShow}>
                    <a href="javascript:void(0)" onClick={this.handleEdit.bind(this, record)}>编辑客服</a>
                    <span className="ant-divider"></span>
                  </span>
                  <span hidden={isResetShow}>
                    <a href="javascript:void(0)" onClick={this.resetPwd.bind(this, record)}>密码重置</a>
                    <span className="ant-divider"></span>
                  </span>
                  <span hidden={isDisabledShow}>
                    <a href="javascript:void(0)" onClick={this.handleDisable.bind(this, record)}>封号</a>
                    <span className="ant-divider"></span>
                  </span>
                  <a href="javascript:void(0)" onClick={this.handleTransferFrd.bind(this, record)} hidden={isTransferShow}>
                    转移好友
                  </a>
              </span>
      }}
    ];
  }
  //添加
  handleAdd() {
    this.setState({ title: '添加客服', data: {}, type: '' });
  }
  //编辑
  handleEdit(record) {
    this.setState({ title: '编辑客服', data: record, type: '' });
  }
  //重置密码
  resetPwd(record) {
    Confirm(function(){
      resetPasswd(record['optr_id']).then(({jsonResult}) => {
        if(jsonResult) {
          Success(
            <div>
              <p>客服姓名：{jsonResult['optr_name']}</p>
              <p>客服账号：{jsonResult['login_account']}</p>
              <p>密码：{jsonResult['password']}</p>
            </div>);
        }
      });
    }.bind(this), <div>确认重置客服<span style={{color:'blue'}}>[{record['optr_name']}]</span>密码吗?</div>);
  }
  //封号
  handleDisable(record) {
    this.setState({type:'DISABLE', data: record, title: ''});
  }
  //转移好友
  handleTransferFrd(record) {
    this.setState({ type:'MOVE', data: record, title: '' });
  }

  handleSearch(newSearchObj) {
    this.refs.commonTable.queryTableData(newSearchObj);
  }

  resetState() {
    this.setState({ title:'', data: {}, type: '' });
  }
  onRefreshTableRecord(){
    this.refs.commonTable.refreshTable();
    this.setState({
      selectedRowKeys:[],
      selectedRows:[]
    })
  }

  handleRefreshTable() {
    // this.resetState();
    //刷新表格数据
    this.refs.commonTable.refreshTable();
  }
  //所有选中行记录集合
  handleRowChange(selectedRowKeys, selectedRows) {
        this.setState({selectedRowKeys,selectedRows});
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  }
  render() {
    const {title, data, type,selectedRowKeys} = this.state;
    return (
      <div>
        <OptrSearchForm activedBtnIds = {resourceManage.getActivedBtnIds()} optrId={this.state.selectedRowKeys} optrRowsDetails={this.state.selectedRows}
          onSearchData = { this.handleSearch } onAddModal={ this.handleAdd }  onRefreshTable={this.onRefreshTableRecord}/>
        <CommonTable
          ref="commonTable"
          rowSelection = {{
            selectedRowKeys,
            onChange: this.handleRowChange.bind(this),
          }}
          columns = { this.columns }
          rowKey = "optr_id"
          fetchTableDataMethod = { queryKefuList }
          scroll={{x: 1700}}/>
        <EditOptrModal onRefreshTable={this.handleRefreshTable} onResetState={this.resetState} title={title} data={data} />
        <TransferFrdsModal onRefreshTable={this.handleRefreshTable} onResetState={this.resetState} data={data} type={type} />
        <DisableOptrModal onRefreshTable={this.handleRefreshTable} onResetState={this.resetState} data={data} type={type} />
      </div>
    );
  }
}

export default OptrList;
