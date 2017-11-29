import React from 'react';
import Button from 'antd/lib/button';
import {hashHistory} from 'react-router';
import '../Friend/FriendHomeInfo.less';
import service from '../../services/clusterChat';
/**
 * 群主页
 */
export default class ClusterHomeInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cluster: null
    }
  }
  componentDidMount() {
    service.getClusterMainPage(this.props.params).then(({jsonResult}) => {
      if(!jsonResult) return;
      this.setState({
        cluster: jsonResult
      })
    });
  }
  render() {
    const cluster = this.state.cluster;
    if(cluster == null) return null;
    const {cluster_notice, invite_info, referrer_operation_info, publish_operation_info} = cluster;
    return (
      <div>
        <div className="friend-head">
          <img alt="好友头像" src={cluster.cluster_head_pic}/>
          <h1>{cluster.cluster_name}</h1>
        </div>
        <div className="base-info">
          <ul>
            <li><h3>当前群主</h3></li>
            <li><span className="context-value">{cluster.master_info}</span></li>
          </ul>
        </div>
        <div className="base-info">
          <ul>
            <li><h3>基本信息</h3></li>
            <li>群ID：<span className="context-value">{cluster.cluster_id}</span></li>
            <li>群成员：<span className="context-value">{cluster.cluster_member_cnt}人</span></li>
            <li>群名称：<span className="context-value">{cluster.cluster_name}</span></li>
            <li hidden={!cluster_notice}>群公告：<span className="context-value">{cluster_notice}</span></li>
            <li hidden={!invite_info}>邀请进群说明：<span className="context-value">{invite_info}</span></li>
            <li hidden={!referrer_operation_info}>
              推荐专员运营号：<span className="context-value">{referrer_operation_info}</span>
            </li>
            <li hidden={!publish_operation_info}>
              发布专员运营号：<span className="context-value">{publish_operation_info}</span>
            </li>
            <li><img alt="群二维码" src={cluster.cluster_pic_url} width="200" height="200" /></li>
          </ul>
        </div>
      </div>
    );
  }
}
