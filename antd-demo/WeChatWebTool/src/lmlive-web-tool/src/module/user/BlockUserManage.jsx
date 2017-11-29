import React, {Component} from 'react';
import {Input, Table} from 'antd';
import webUtils from '../../commons/utils/webUtils'
import UserService from '../../service/UserService';

const Search = Input.Search;
export default class BlockUserManage extends Component{
  constructor(props){
    super(props);
    this.state = {
      loading: false,
      dataSource: []
    }
    this.columns = [
      {title: '用户ID', dataIndex: 'userId'},
      {title: '直播间名', dataIndex: 'programName'},
      {title: '封禁时间', dataIndex: 'time'},
      {title: '用户昵称', dataIndex: 'nickname'},
      {title: '操作', dataIndex: 'programId', render: (programId, record) => {
        return <a href="javascript:void(0)" onClick={this.rollbackUser.bind(this, programId, record["userId"])}>解封</a>
      }},
    ]
  }
  rollbackUser(programId, userId){
    webUtils.confirm(()=>{
      UserService.blockRollback(programId, userId).then(result => {
        webUtils.alertSuccess("解封小黑屋成功")
        this.handleSearch(programId);
      })
    }, "确认让该用户从小黑屋中解放吗？")
  }
  handleSearch = (programId) => {
    if(!programId) return;
    this.setState({ loading: true })
    UserService.queryBlockUserList(programId).then(result => {
      this.setState({
        loading: false,
        dataSource: result || []
      })
    })
  }
  render(){
    return (
      <div>
        <span className="ant-advanced-search-form ant-form-text" style={{width: '100%', paddingLeft: 32, marginBottom: 0}}>
          直播间ID:<Search onSearch={this.handleSearch} placeholder="请输入直播间ID回车查询" style={{ width: '300px', marginLeft: 16 }}/>
        </span>
        <Table rowKey="userId" columns={this.columns} {...this.state} />
      </div>
    )
  }
}