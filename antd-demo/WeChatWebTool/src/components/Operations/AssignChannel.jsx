/*分配商业渠道*/
import React, { Component, PropTypes} from 'react'
import { Tabs } from 'antd';
import AssignChannelByFriend from './AssignChannelByFriend';
import AssignChannelByOperation from './AssignChannelByOperation';
const TabPane = Tabs.TabPane;

export default class AssignChannel extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isActivatedFriendPane: false
    }
  }

  handleChange(activeKey) {
      this.setState({ isActivatedFriendPane: activeKey == '2' });
  }
  render() {
    return (
      <Tabs type="card" onChange={this.handleChange.bind(this)}>
        <TabPane key="1" tab="按运营号分配">
          <AssignChannelByOperation />
        </TabPane>
        <TabPane key="2" tab="按好友数分配">
          <AssignChannelByFriend  isActivated={this.state.isActivatedFriendPane}/>
        </TabPane>
      </Tabs>
    );
  }
}
