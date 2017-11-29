import React, {Component} from 'react';
import {Table} from 'antd';
import CommonTable from '../Commons/CommonTable';
import {searchFriend} from '../../services/search.js';
import { hashHistory } from 'react-router';

const screenHeight = window.screen.height;
export default class SearchFriendTable extends Component {
  constructor(props) {
    super(props);

    this.columns = [
      { title: '广告名称', dataIndex: 'markedAdNames', key: 'markedAdNames', width: 150},
      { title: '微信号', dataIndex: 'friend_wechat', width: 100,
        render: (text, record) => <a href="javascript:void(0)" onClick={this.jumpToFriendHome.bind(this, record)}>{text}</a>
      },
      { title: '昵称', dataIndex: 'nick_name', width: 150},
      { title: '运营手机号', dataIndex: 'operation_mobile', width: 120},
      { title: '备注名', dataIndex: 'remark_name'},
      { title: '性别', dataIndex: 'gender_text', width: 80},
      { title: '省份', dataIndex: 'province_id', width: 120},
      { title: '城市', dataIndex: 'city_id', width: 120},
    ];
  }

  onSearch(values) {
    this.refs.commonTable.queryTableData(values);
  }

  jumpToFriendHome(record) {
    hashHistory.push({
      pathname: "/friend",
      state: {
        friend_sn: record['friend_sn'],
        operation_sn: record['operation_sn'],
      }
    });
  }

  render() {
    return (
      <CommonTable ref="commonTable" columns={this.columns}
        scroll={{y: screenHeight - 530}}
        fetchTableDataMethod={searchFriend} rowKey="friend_wechat"/>
    )
  }
}
