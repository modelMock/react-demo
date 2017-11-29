import React from 'react';
import { Form, Col, Row, Input, Select, Button, Table, Tag, Modal } from 'antd';
import SendSearchForm from './SendSearchForm';
import {queryMassTextingRecord, updateMassAllow, updateMassRefuse, deleteMass} from '../../services/multManage';
import resourceManage from '../ResourceManage';
import {Confirm, Success, Errors} from '../Commons/CommonConstants';
import CommonModal from '../Commons/CommonModal';
import MsgDetailModal from './MsgDetailModal';
import './MassedSendContainer.less';
import '../Commons/CommonTable.less';
/**
 * 群发
 */
const MASSED_SEND_TABLE_LIMIT = 10;
class MassedSendTable extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      loading: false,
      dataSource: [],
      current: 1,   //当前分页页数
      total: 0,     //分页数据总数
      record_sn: '',  //拒绝record_sn
    }
    const activedBtnIds = resourceManage.getActivedBtnIds();
    const isPublished = activedBtnIds.indexOf("33-1") == -1;  //允许发布
    const isRejected = activedBtnIds.indexOf("33-2") == -1;   //拒绝发布
    const isDeleted = activedBtnIds.indexOf("33-3") == -1;    //删除
    this.columns = [
      { title: '群发编号', dataIndex: 'record_sn', width: 75, fixed: 'left' },
      { title: '创建时间', dataIndex: 'create_time', width: 130 },
      { title: '渠道', dataIndex: 'channel_name', width: 120 },
      { title: '客服', dataIndex: 'create_optr_name', width: 100 },
      { title: '状态', dataIndex: 'status', key:'status', width: 100, render: (text, record) => {
          if(!text) return '';
          let color;
          switch(text){
            case 'PUBSUCCESS':  //发布成功
              color="blue";
              break;
            case 'PUBFAILURE':  //发布失败
            case 'AUDITFAIL':   //审批失败
              color="red";
              break;
            case 'AUDITING':    //待审批
              color="yellow";
              break;
            case 'PUTTING':    //投放中
              color="green";
              break;
          }
          return <Tag color={color}>{record.status_text}</Tag>
        }
      },
      { title: '失败原因', dataIndex: 'audit_reason' },
      { title: '状态时间', dataIndex: 'status_date', width: 130 },
      { title: '备注', dataIndex: 'remark', width: 150 },
      { title: '待发好友数', dataIndex: 'need_friend_cnt', width: 90 },
      { title: '实发好友数', dataIndex: 'real_friend_cnt', width: 90 },
      { title: '随机延时', dataIndex: 'delay_minute', width: 90, render: (text) => `${text}分钟` },
      { title: '审核人', dataIndex: 'audit_optr_name', width: 100 },
      { title: '审核结果', dataIndex: 'audit_result', width: 100, render: (text, record) => {
          if(!text) return '';
          if(text === 'T') {
            return <Tag color="green">{record.audit_result_text}</Tag>
          } else {
            return <Tag color="red">{record.audit_result_text}</Tag>
          }
        }
      },
      { title: '审核时间', dataIndex: 'audit_time', width: 130 },
      { title: '操作', dataIndex: 'status', key:'operation', width: 200, fixed: 'right', render: (text, record) => {
        const delRender = <a href="javascript:void(0)" onClick={this.getDetailInfo.bind(this, record.record_sn)}>详情</a>;
        if(text !== 'AUDITING') { //待审批
          return delRender;
        }
        return <span>
                <span hidden={isPublished}>
                  <a href="javascript:void(0)" onClick={this.handlePublished.bind(this, record.record_sn)}>允许发布</a>
                  <span className="ant-divider"></span>
                </span>
                <span hidden={isRejected}>
                  <a href="javascript:void(0)" onClick={this.showRejectedModal.bind(this, record.record_sn)}>拒绝发布</a>
                  <span className="ant-divider"></span>
                </span>
                <span hidden={isDeleted}>
                  <a href="javascript:void(0)" onClick={this.handleDelete.bind(this, record.record_sn)}>删除</a>
                  <span className="ant-divider"></span>
                </span>
                {delRender}
            </span>
        }
      },
    ];
    this.handleTableChange = this.handleTableChange.bind(this);
    this.handleRejected = this.handleRejected.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }
  showRejectedModal(record_sn){  //显示拒绝发布弹出框
    this.setState({
      visible: true,
      record_sn,
    })
  }
  handlePublished(record_sn){  //发布
    Confirm(function(){
      updateMassAllow(record_sn).then(({jsonResult}) => {
        Success("发布成功");
        this.__realodTableData();
      });
    }.bind(this), <div>确定发布群发<span style={{color:'blue'}}>[{record_sn}]</span>吗?</div>);
  }
  handleRejected(){   //拒绝发布框确认
    const reason = this.refs.reasonInput.refs.input.value;
    if(!!reason && !!this.state.record_sn) {
      updateMassRefuse(this.state.record_sn, reason).then(({jsonResult}) => {
        Success("拒绝发布成功");
        this.handleCancel();
        this.__realodTableData();
      });
    } else {
      Errors("请输入拒绝发布原因");
    }
  }
  handleCancel(){     //关闭拒绝发布框
    this.setState({
      visible: false,
      record_sn: '',
    })
  }
  handleDelete(record_sn){     //删除
    Confirm(function(){
      deleteMass(record_sn).then(({jsonResult}) => {
        Success("删除成功");
        this.__realodTableData();
      });
    }.bind(this), <div>确定删除群发<span style={{color:'blue'}}>[{record_sn}]</span>吗?</div>);
  }
  getDetailInfo(record_sn){    //详情
    this.refs.msgDetailModal.getRecordDetailInfo(record_sn);
  }
  __realodTableData() {
    this.search(this.params, MASSED_SEND_TABLE_LIMIT*(this.state.current-1), MASSED_SEND_TABLE_LIMIT, this.state.current);
  }
  handleTableChange(pagination) {
    this.search(this.params, pagination.pageSize * (pagination.current - 1), pagination.pageSize, pagination.current)
  }
  search(params, offset=0, limit=MASSED_SEND_TABLE_LIMIT, current=1) {
    this.params = params;
    this.setState({ loading: true })
    queryMassTextingRecord(offset, limit, this.params).then(({jsonResult}) => {
      const dataSource = jsonResult['records'];
      const total = jsonResult['totalCount'];
      this.setState({
        dataSource, total, current,
        loading: false
      })
    });
  }
  render(){
    const {loading, dataSource, total, current, record_sn, visible} = this.state;
    const pagination={
      showQuickJumper: true,  //显示可以快速跳转至某页
      showSizeChanger: true,  //显示可以改变 pageSize
      total,
      current,
      showTotal: ( total => (`共 ${total} 条`))
    };
    return (
      <div>
        <Table bordered columns={this.columns} dataSource={dataSource} pagination={pagination}
          loading={loading} rowKey="record_sn" scroll={{x: 1750}} onChange={this.handleTableChange} />
        <Modal visible={visible} title={<div>拒绝群发<span style={{color:'blue'}}>[编号{record_sn}]</span></div>}
          onOk={this.handleRejected} onCancel={this.handleCancel}
          footer={[
            <Button key="cancel" icon="cross" size="large" onClick={this.handleCancel}>取消</Button>,
            <Button key="submit" type="primary" icon="check" size="large" onClick={this.handleRejected}>提交</Button>
          ]}>
          <Input ref="reasonInput" type="textarea" rows={5} placeholder="请输入拒绝原因" />
        </Modal>
        <MsgDetailModal ref="msgDetailModal" />
      </div>
    )
  }
}
export default class MassedSendContainer extends React.Component {
  constructor(props){
    super(props);
    this.handleSearch = this.handleSearch.bind(this);
  }
  handleSearch(params) {
    this.refs.massedSendTable.search(params);
  }
  render(){
    return (
      <div className="massed-send-container">
        <SendSearchForm onSearch={this.handleSearch}/>
        <MassedSendTable ref="massedSendTable"/>
      </div>
    );
  }
}
