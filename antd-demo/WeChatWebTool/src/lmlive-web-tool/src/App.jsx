import React, { Component } from 'react';
import {Link, hashHistory} from 'react-router';
import {Menu, Breadcrumb, Icon} from 'antd';
import webUtils from './commons/utils/webUtils';
import ModifyPassword from './ModifyPassword';
import AppService from './service/AppService';
import './App.less';

import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedKeys: [],    //当前选中的菜单项 key 数组
      openKeys: [],           //默认展开所有DIR菜单
      subMenuText: '',
      menuItemText: '',
      visible: false,
      loading: false,
      resList: [],
      // 是否是报表资源
      isReport: false,
      reportPath: null
    };
    this.openMenuItem = this.openMenuItem.bind(this);
    this.modifyPassword = this.modifyPassword.bind(this);
    this.openModifyPwdModal = this.openModifyPwdModal.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }
  // 点击菜单事件：高亮选中菜单、提取当前面包屑
  openMenuItem(e) {
    const id = e.key;
    const {resList} = this.state;
    for(let res of resList) {
      for(let child of res.childResList) {
        if(child.resId === id) {
          this.setState({
            subMenuText: res.resName,
            menuItemText: child.resName,
            selectedKeys: [id.toString()]
          });
          break;
        }
      }
    }
  }
  // 展开、关闭菜单
  onOpenChange = (openKeys) => {
    this.setState({ openKeys })
  }
  // 登出
  logout() {
    webUtils.confirm(()=>{
      // localStorage.clear()
      hashHistory.replace("/login")
    }, "确认退出吗？")
  }
  // 打开修改密码框
  openModifyPwdModal() {
    this.setState({ visible: true, loading: false})
  }
  // 修改密码
  modifyPassword() {
    const form = this.modifyPasswordForm;
    form.validateFields((err, values) => {
      if(!!err) return;
      webUtils.confirm(()=>{
        this.setState({ loading: true });
        AppService.modifyPassword(values['oldPwd'], values['newPwd']).then(result => {
          webUtils.alertSuccess("修改密码成功");
          this.handleCancel();
        }).catch(()=>{
          this.setState({ loading: false})
        });
      }, "确认修改密码？")
    });
  }
  // 关闭密码框
  handleCancel() {
    this.setState({ visible: false, loading: false})
  }
  componentDidMount() {
    AppService.queryRoleRes().then(resList => {
      const pathname = this.props.location.pathname;
      if(!pathname) return;
      const openKeys = [];
      resList.forEach(res => {
        if(res.resType === 'DIR') {
          openKeys.push(res.resId.toString())
        }
      });
      // 根路由，找第一个资源
      if(pathname === "/manage"){
        const res = resList[0]['childResList'][0]
        this.setState({
          resList,
          openKeys,
          subMenuText: resList[0].resName,
          menuItemText: res.resName,
          selectedKeys: [res.resId.toString()]
        });
        hashHistory.replace(res.resPath)
      } else {
        // 是否是报表资源
        const reportId = this.props.params.reportId
        for(let res of resList) {
          let locationChildRes;
          for(let child of res.childResList) {
            const resPath = child.resPath
            // 找到指定的菜单资源
            if(resPath === pathname || resPath.endsWith(`?rep_id=${reportId}`)) {
              locationChildRes = child
              break;
            }
          }
          if(locationChildRes){
            this.setState({
              resList,
              openKeys,
              subMenuText: res.resName,
              menuItemText: locationChildRes.resName,
              selectedKeys: [locationChildRes.resId.toString()]
            }, () => {
              reportId && this.__locationToReportSystem(reportId, locationChildRes.resPath)
            });
            break;
          }
        }
      }
    })
  }
  __locationToReportSystem(reportId, reportPath){
    // 报表资源重定向
    hashHistory.replace({
      pathname: `/report/${reportId}`,
      state: {
        reportPath: `${reportPath}&optr_id=${localStorage.getItem('userId')}`
      }
    })
  }
  handleClickMenuItem(res, btnResList, e){
    e.preventDefault();
    if(res.isReport !== 'T'){
      const path = res.resPath;
      if(path !== "/anchor/monitor"){
        this.setState({ isReport: false }, () => hashHistory.replace({
          pathname: res.resPath,
          state: {btnResList}
        }))
      } else {
        window.open("/#/anchor/monitor")
      }

    } else {
      const resPath = res.resPath
      const reportId = resPath.substring(resPath.indexOf("?rep_id=") + 8)
      this.__locationToReportSystem(reportId, resPath)
    }
  }
  render(){
    const { selectedKeys, subMenuText, menuItemText, visible, loading, resList, openKeys, isReport, reportPath } = this.state;
    return (
      <div className="ant-layout-topaside">
          <div className="ant-layout-header">
              <div className="admin-right">
                <ul>
                  <li>欢迎你：<a>{localStorage.getItem('nickname')}</a></li>
                  <li><a href="javascript:void(0);" onClick={this.openModifyPwdModal}><Icon type="edit" /> 修改密码</a></li>
                  <li><a href="javascript:void(0);" onClick={this.logout}><Icon type="logout"/> 退出</a></li>
                </ul>
              </div>
              <h1>羚萌直播管理系统</h1>
          </div>
          <div className="ant-layout-wrapper">
              <div className="ant-layout-container">
                  <div className="sider-bg-layer"></div>
                  <aside className="ant-layout-sider">
                    <Menu mode="inline" openKeys={openKeys} selectedKeys={selectedKeys}
                          onOpenChange={this.onOpenChange} onClick={this.openMenuItem}>
                      {
                        resList.map(res => (
                          <SubMenu key={res.resId} title={<span><Icon type={res.resIcon} /><span>{res.resName}</span></span>}>
                            {
                              res.childResList.map(child => {
                                const btnResList = child.buttonResList.map(btn => btn.resId);
                                // 保存每个资源界面按钮权限集合
                                webUtils.setButtonResMap(child.resId, btnResList);
                                return <MenuItem key={child.resId}>
                                  <a href="#" onClick={this.handleClickMenuItem.bind(this, child, btnResList)} title={child.resName}>
                                    <Icon type={child.resIcon} />{child.resName}
                                  </a>
                                </MenuItem>
                              })
                            }
                          </SubMenu>
                        ))
                      }
                    </Menu>
                  </aside>
                  <div className="ant-layout-content" style={{minHeight: 200}}>
                    <Breadcrumb>
                      <Breadcrumb.Item>{subMenuText}</Breadcrumb.Item>
                      <Breadcrumb.Item>{menuItemText}</Breadcrumb.Item>
                    </Breadcrumb>
                    {this.props.children}
                  </div>
              </div>
          </div>
          <ModifyPassword ref={(form)=>{this.modifyPasswordForm=form}} visible={visible} loading={loading}
            onOk={this.modifyPassword} onCancel={this.handleCancel} />
      </div>
    );
  }
}
