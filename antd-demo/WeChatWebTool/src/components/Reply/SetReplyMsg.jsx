/*自动回复设置*/
import React, { Component} from 'react';
import {Tabs,Form} from 'antd';
import FriendSetPanel from './FriendSetPanel.jsx';
import CircleSetPanel from './CircleSetPanel.jsx';
import {querySetReplyMsgFormData} from '../../services/replyMsgService';
const TabPane = Tabs.TabPane;

export default class SetReplyMsg extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Tabs type="card">
         <TabPane tab="好友聊天自动回复" key="1">
          <FriendSetPanel />
        </TabPane>
        <TabPane tab="朋友圈自动回复" key="2">
          <CircleSetPanel />
        </TabPane>
      </Tabs>
    );
  }
}
