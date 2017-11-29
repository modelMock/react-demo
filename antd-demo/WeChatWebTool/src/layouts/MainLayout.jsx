import React, { Component, PropTypes } from 'react';
import { Router, Route, IndexRoute, Link, hashHistory } from 'react-router';
import { Menu, Breadcrumb, Icon, Switch, Button } from 'antd';
import './MainLayout.less';
import socketManage from '../components/Socket/SocketManage';
import resourceManage from '../components/ResourceManage';
import { signOut } from './Logout';
import {Loading} from '../components/Commons/TipTools';

export default class MainLayout extends Component{

  static propTypes = {
    children: PropTypes.element.isRequired,
  }
  constructor(props){
    super(props)
    this.state = {
      isGone: false,  //是否在岗
      selectedKeys: '27'
    }
    this.onChange = this.onChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  onChange(value) {
    this.setState({
      isGone: !value
    });
    socketManage.setIsGone(value);
  }

  handleClick(e) {
    this.setState({
      selectedKeys: e.key,
    });
  }

  setSelectedKeys(pathName) {
    let selectedKeys;
    for(let menu of resourceManage.getFrontMenuJson()) {
      if(pathName === menu['url']) {
        selectedKeys = menu['key'];
        break;
      }
    }
    if(this.state.selectedKeys != selectedKeys) {
      this.setState({
        selectedKeys
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const {location} = nextProps.children.props
    if( (this.props['isActive'] === false && nextProps['isActive'] === true) || (!!location && !!location.state) ) {
      this.setSelectedKeys(nextProps.children.props.location['pathname']);
    }
  }

  render(){
    return this.props.isActive===true ? this.renderBody() : <Loading />;
  }
  renderBody() {
    const { isGone, selectedKeys } = this.state;

    return (
      <div className="ant-layout-aside ant-layout-aside-collapse">
        <aside className="ant-layout-sider">
          <div className="ant-layout-logo">
            <p className="app-logo">
              <i>客服号</i>
              <b>{localStorage.getItem('nick_name')}</b>
            </p>
            <Switch checked={!isGone} onChange={this.onChange} checkedChildren="在岗" unCheckedChildren="离岗" />
          </div>
          <Menu theme="dark" selectedKeys={[selectedKeys]} onClick={this.handleClick}>
            {
              resourceManage.getFrontMenuJson().map( menu => (
                <Menu.Item key={menu.key}>
                  <Link to={menu.url}>
                    <Icon type={menu.icon}/><span className="nav-text">{menu.text}</span>
                  </Link>
                </Menu.Item>
              ))
            }
            <Menu.Item>
              <p onClick={()=>{signOut()}}>
                <Icon type="logout"/><span className="nav-text">退出</span>
              </p>
            </Menu.Item>
          </Menu>
        </aside>
        <div className="ant-layout-main">
          <div className="ant-layout-container">
            <div className="ant-layout-content">
              {this.props.children}
            </div>
          </div>

        </div>
      </div>
    );
  }
}
