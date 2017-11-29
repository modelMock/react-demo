import React from 'react';
import {Tabs,Button} from 'antd';
import GroupNav from './GroupNav';
import ChatNav from './ChatNav';
const TabPane = Tabs.TabPane;

/*左侧导航分组*/
export default class NavigateContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: '1',
      iconType: 'reload',
    };
    this.changeChatWindows = this.changeChatWindows.bind(this);
    this.onTabChange = this.onTabChange.bind(this);
  }
  // 刷新指定分组数据
  refreshGroupItem(group_id, groupList) {
    if(this.state.activeKey != '1') {
      this.refs.groupNav.refreshGroupItem(group_id, groupList);
    }
  }
  /**
   * 打开聊天框时：新好友设置is_select=true,unread_num=0, 旧好友设置is_select=false
   * 关闭聊天框时：设置好友is_select=false
   */
  onToggleSelectedFriend(operation_sn, friend_sn, isSelected, oldOperationSn, oldFriendSn, isOldSelected) {
    if(this.state.activeKey == '1') {
      this.refs.chatNav.onToggleSelectedFriend(operation_sn, friend_sn, isSelected, oldOperationSn, oldFriendSn, isOldSelected);
    } else {
      this.refs.groupNav.onToggleSelectedFriend(operation_sn, friend_sn, isSelected, oldOperationSn, oldFriendSn, isOldSelected);
    }
  }
  //收到好友消息，好友存在：激活好友，不存在：查询好友数据添加进来
  receivedMessage(recordChat) {
    if(this.state.activeKey == '1') {
      this.refs.chatNav.receivedMessage(recordChat);
    } else {
      this.refs.groupNav.receivedMessage(recordChat);
    }
  }
  //换一批聊天框
  changeChatWindows() {
    this.setState({ iconType: 'loading' });
    this.props.onFetchInitData(true);
  }
  //切换tab页
  onTabChange(activeKey) {
    if(activeKey == '1') {
      this.refs.chatNav.activedTab();
    } else if('groupNav' in this.refs) {
      //第一次groupNav还没挂载
      this.refs.groupNav.activedTab();
    }
    this.setState({ activeKey });
  }
  //初始化会话列表数据
  initData(friendList) {
    //默认激活的是会话列表
    if(this.state.activeKey != '1' || this.state.iconType != 'reload') {
      this.setState({ activeKey: '1', iconType: 'reload' });
    }
    this.refs.chatNav.initData(friendList);
  }
  render() {
    console.log('NavigateContainer => render');
    const {iconType, activeKey} = this.state;
    return (
      <Tabs className="group-nav-tabs" activeKey={activeKey} onChange={this.onTabChange}
          tabBarExtraContent={<Button type="ghost" icon={iconType} title="换一批" onClick={this.changeChatWindows} />}>
        <TabPane key="1" tab="会话">
          <ChatNav ref="chatNav" activeKey={activeKey}/>
        </TabPane>
        <TabPane key="2" tab="分组">
          <GroupNav ref="groupNav" activeKey={activeKey} />
        </TabPane>
      </Tabs>
    );
  }
}
