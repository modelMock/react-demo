/*权限管理*/
import React, { Component, PropTypes} from 'react';
import {Button} from 'antd';
import CommonTable from '../Commons/CommonTable';

/*class RoleList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <CommonTable ref="commonTable" columns={this.columns}  fetchTableDataMethod={queryUserChannelList} rowKey="channel_id"/>
  }
}*/

export default class RoleManage extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return (
      <Button type='primary'>权限管理</Button>
    );
  }
}
