import React from 'react';
import {Button,Modal} from 'antd';
import {hashHistory} from 'react-router';
import {Confirm, Success} from '../Commons/CommonConstants';
import {Errors} from '../Commons/CommonConstants';
import '../Friend/FriendHomeInfo.less';
import service from '../../services/clusterChat';
/**
 * 群成员主页
 */
export default class ClusterMemberHomeInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userFriend: null
    }
    this.onKickClusterMember=this.onKickClusterMember.bind(this);
  }
  onKickClusterMember(){
    Confirm(()=>{
      console.log("this.props.params",this.props.params);
      service.kickClusterMember(this.props.params.cluster_sn, this.props.params.member_sn,localStorage.getItem('optr_id')).then(({jsonResult}) => {
          Success(jsonResult);
      });
    }, "确认踢人吗？")
  }
  componentDidMount() {
    service.getMemberMainPage(this.props.params).then(({jsonResult}) => {
      if(!jsonResult) return;
      this.setState({
        userFriend: jsonResult
      })
    });
  }
  render() {
    const userFriend = this.state.userFriend;
    if(userFriend == null) return null;
    const {nick_name, gender_text, province_id, city_id, create_time} = userFriend;
    return (
      <div>
        <div className="friend-head">
          <img alt="好友头像" src={userFriend.head_url}/>
          <h1>{userFriend.nick_name}</h1>
          {/* <Button type="primary" style={{marginLeft: 16}} onClick={this.onBackToClusterChat}>返回群聊</Button> */}
          <Button type="primary" style={{marginLeft: 16}} onClick={this.onKickClusterMember}>踢人</Button>
        </div>
        <div className="base-info">
          <ul>
            <li><h3>基本信息</h3></li>
            <li hidden={!nick_name}>好友号：<span className="context-value">{nick_name}</span></li>
            <li hidden={!gender_text}>性别：<span className="context-value">{gender_text}</span></li>
            <li hidden={!province_id && !city_id}>
              地区：<span className="context-value">{province_id}&nbsp;{city_id}</span>
            </li>
            <li hidden={!create_time}>添加时间：<span className="context-value">{create_time}</span></li>
          </ul>
        </div>
      </div>
    );
  }
}
