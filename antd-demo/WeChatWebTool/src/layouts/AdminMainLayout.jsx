import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router'
import {Menu, Breadcrumb, Icon, Button} from 'antd';
import { signOut } from './Logout';
import OptrHomeInfo from '../components/Optr/OptrHomeInfo';
import {Loading} from '../components/Commons/TipTools';
import CommonModal from '../components/Commons/CommonModal';
import resourceManage from '../components/ResourceManage';
import './AdminMainLayout.less';
import '../components/Commons/SearchForm.less';

const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;


export default class AdminMainLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedKeys: '8',    //当前选中的菜单项 key 数组
      openKeys: ['1'],     //当前展开的 SubMenu 菜单项 key 数组
      subMenuText: '运营号管理',
      menuItemText: '运营号列表',
      isChatRole: false,  //是否有聊天权限
      isGroupChatRole: false,  //是否有群聊权限
    };
    this.handleClick = this.handleClick.bind(this);
    this.onClickLink = this.onClickLink.bind(this);
    this.openPwdModal = this.openPwdModal.bind(this);
    this.closePwdModal = this.closePwdModal.bind(this);
  }
  onToggle(openKeys) {
    this.setState({ openKeys });
  }
  //点击MenuItem
  handleClick(e) {
    const selectedKeys = e.key;
    if(this.state.selectedKeys !== selectedKeys) {
      this.setState({ selectedKeys });
    }
  }
  onClickLink(subMenuText, menuItemText) {
    if(this.state.menuItemText != menuItemText) {
      this.setState({
        subMenuText, menuItemText
      });
    }
  }
  openPwdModal() {
    this.refs.commonModal.show();
  }
  closePwdModal() {
    this.refs.commonModal.hide();
  }
  getActiveMenu(isChatRole, isGroupChatRole) {
    //请求URL路径部分
    let pathName = window.location.hash;
    if(pathName.startsWith("#")){
      pathName = pathName.substr(1);
    }
    // debugger;
    const menuJson = resourceManage.getBackMenuJson();
    if(menuJson.length > 0) {
      //菜单层级不深，也不多，默认展开所有菜单
      let openKeys = [], selectedKeys='', subMenuText = '', menuItemText='';
      for(let subMenu of menuJson) {
        for(let menuItem of subMenu.children) {
          if(pathName == menuItem.url) {
            //只展开打开的父菜单
            openKeys.push(subMenu.key);
            selectedKeys = menuItem.key;
            subMenuText = subMenu['text'];
            menuItemText = menuItem['text'];
            break;
          }
        }
      }

      this.setState({
        selectedKeys, openKeys, menuJson, subMenuText, menuItemText, isChatRole, isGroupChatRole
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    console.debug('AdminMainLayout => componentWillReceiveProps => ', nextProps);
    if(this.props.isActive === false && nextProps['isActive'] === true) {
      this.getActiveMenu(nextProps.isChatRole, nextProps.isGroupChatRole);
    }
  }
  render(){
    return this.props.isActive===true ? this.renderBody() : <Loading />
  }
  renderBody() {
    const { selectedKeys, openKeys, subMenuText, menuItemText, isChatRole, isGroupChatRole } = this.state;
    console.log('AdminMainLayout => render : ', this.props, this.state);
    let showChatLink = true, linkPath;
    if(isGroupChatRole === true){ //优先群聊
      linkPath="/group";
    }else if(isChatRole === true){
      linkPath="/chat";
    } else {
      showChatLink = false;
    }

    return (
      <div className="ant-layout-topaside">
          <div className="ant-layout-header">
              <div className="admin-right">
                <ul>
                  <li>欢迎你：<a href="javascript:void(0)">{localStorage.getItem('nick_name')}</a></li>
                  <li><a href="javascript:void(0)" onClick={this.openPwdModal}><Icon type="edit" /> 修改密码</a></li>
                  {
                    showChatLink ? <li><Link to={linkPath}><Icon type="message"/> 聊天</Link></li> : null
                  }
                  <li><a href="javascript:void(0)" onClick={()=>{signOut()}}><Icon type="logout"/> 退出</a></li>
                </ul>
              </div>
              <h1>云客服管理中心</h1>
          </div>
          <div className="ant-layout-wrapper">
              <div className="ant-layout-container">
                  <div className="sider-bg-layer"></div>
                  <aside className="ant-layout-sider">
                    <Menu mode="inline" selectedKeys={[selectedKeys]} openKeys={openKeys}
                        onClick={this.handleClick} onOpenChange={this.onToggle.bind(this)}>
                      {
                          //加载SubMenu
                          resourceManage.getBackMenuJson().map( (subMenu) => (
                            <SubMenu key={subMenu.key} title={<span><Icon type={subMenu.icon}/>{subMenu.text}</span>}>
                              {
                                //加载Submenu的子组件MenuItem
                                subMenu.children.map( (menuItem) => (
                                  <MenuItem key={menuItem.key}>
                                    <Link to={menuItem.url}
                                        onClick={ (e) => {this.onClickLink(subMenu['text'], menuItem['text'])}}
                                    >{menuItem.text}</Link>
                                  </MenuItem>
                                ) )

                              }
                            </SubMenu>
                          ) )
                      }
                    </Menu>
                  </aside>
                  <div className="ant-layout-content" style={{minHeight: 200}}>
                    <Breadcrumb>
                      <Breadcrumb.Item>{subMenuText}</Breadcrumb.Item>
                      <Breadcrumb.Item><a href="javascript:void(0)">{menuItemText}</a></Breadcrumb.Item>
                    </Breadcrumb>
                    {this.props.children}
                  </div>
              </div>
          </div>
          <CommonModal ref="commonModal" title="修改密码" onOk={this.closePwdModal} onCancel={this.closePwdModal}
            footer={[
              <Button key="close" icon="poweroff" type="primary" size="large" onClick={this.closePwdModal}>关 闭</Button>
            ]}
          >
            <OptrHomeInfo />
          </CommonModal>
      </div>
    )
  }
}
