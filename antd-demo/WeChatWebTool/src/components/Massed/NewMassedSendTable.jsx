import React from 'react';
import { Table, Button,Tooltip } from 'antd';
import { massSearch } from '../../services/multManage';
import { hashHistory } from 'react-router';

const LIMIT = 20;
const screenHeight = window.screen.height;
export default class NewMassedSendTable extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      loading: false,
      dataSource: [],
      current: 1,   //当前分页页数
      total: 0,     //分页数据总数
    };
    this.handleTableChange = this.handleTableChange.bind(this);
    this.columns = [
      { title: '好友号', dataIndex: 'friend_wechat', width: 80, fixed: 'left', render: (text, record) => {
        return <a href="javascript:void(0)"
          onClick={() => {this.jumpToGroupChat(record.operation_sn, record.friend_sn)}}>{text}</a>
      } },
      { title: '好友昵称', dataIndex: 'nick_name', width: 100 },
      { title: '头像', dataIndex: 'head_url', width: 100, render: (text, record)=>{
        return <Tooltip placement="right" title={<img src={text} style={{width: 120, height: 120}}/>}>
                  <img src={text} style={{width: 42, height: 42}}/>
              </Tooltip>
      } },
      { title: '综合标记信息', dataIndex: 'integratedTagInfo', width: 400 },
      { title: '运营手机号', dataIndex: 'operation_mobile', width: 140 },
      { title: '备注', dataIndex: 'remark'},
      { title: '创建时间', dataIndex: 'create_time', width: 130},
    ];
  }
  jumpToGroupChat(operation_sn, friend_sn){
    hashHistory.replace({
      pathname: "/group",
      state: { operation_sn, friend_sn }
    });
  }
  getTotalCount(){
    return this.state.total;
  }
  clearTableData(){
    this.setState({
      loading: false,
      dataSource: [],
      current: 1,
      total: 0,
    });
  }
  __realodTableData() {
    this.search(this.params, LIMIT*(this.state.current-1), LIMIT, this.state.current);
  }
  handleTableChange(pagination) {
    this.search(this.params, pagination.pageSize * (pagination.current - 1), pagination.pageSize, pagination.current)
  }
  search(params, offset=0, limit=LIMIT, current=1) {
    this.params = params;
    this.setState({ loading: true })
    massSearch(offset, limit, this.params).then(({jsonResult}) => {
      const dataSource = jsonResult['records'];
      const total = jsonResult['totalCount'];
      this.setState({
        dataSource, total, current,
        loading: false
      })
    });
  }
  render(){
    const {loading, dataSource, total, current} = this.state;
    const pagination={
      showQuickJumper: true,  //显示可以快速跳转至某页
      showSizeChanger: true,  //显示可以改变 pageSize
      total,
      current,
      showTotal: ( total => (`共 ${total} 条`)),
    };
    return (
      <Table bordered columns={this.columns} dataSource={dataSource} pagination={pagination}
        loading={loading} rowKey="record_sn" scroll={{x: 1200, y: screenHeight-450}}
        onChange={this.handleTableChange} />
      )
  }
}
