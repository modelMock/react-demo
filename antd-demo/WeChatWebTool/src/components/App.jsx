import React from 'react';
import MainLayout from '../layouts/MainLayout';
import BaseApp from './BaseApp';
import resourceManage from './ResourceManage';
import socketManage from './Socket/SocketManage';
import {hashHistory} from 'react-router';

export default class App extends BaseApp {
  constructor(props){
    super(props);
  }
  hasChatRole() {
    const isChatRole = resourceManage.hasRole("/chat");
    const isGroupChatRole = resourceManage.hasRole("/group");

    if(isChatRole === true || isGroupChatRole === true){
      socketManage.init(()=>{
        //登录进来为null，刷新不为空
        if(!this.props.children){
          hashHistory.replace(isGroupChatRole === true ? "/group" : "/chat");
        }
        this.setState({ isActive: true });
      })
    } else {
      hashHistory.replace("/admin");
    }
  }
  render() {
    return (
      <MainLayout isActive={this.state.isActive}>
        {this.props.children}
      </MainLayout>
    );
  }
}
