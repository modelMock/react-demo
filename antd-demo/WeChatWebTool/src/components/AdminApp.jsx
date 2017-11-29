import React from 'react';
import AdminMainLayout from '../layouts/AdminMainLayout.jsx';
import BaseApp from './BaseApp';
import resourceManage from './ResourceManage';

/*后台管理首页*/
export default class AdmimApp extends BaseApp {
  constructor(props){
    super(props);
    this.state={
      isActive: false,
      isChatRole: false,
      isGroupChatRole: false,
    }
  }
  hasChatRole(){
    const isChatRole = resourceManage.hasRole("/chat");
    const isGroupChatRole = resourceManage.hasRole("/group");
    this.setState({
      isActive: true,
      isChatRole,
      isGroupChatRole,
    });
  }
  render() {
    return (
      <AdminMainLayout {...this.state}>
        {this.props.children}
      </AdminMainLayout>
    );
  }

}
