import React from 'react';
import ReactDOM from 'react-dom';
import {Icon, Spin} from 'antd';
import QueueAnim from 'rc-queue-anim';
import classNames from 'classnames';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Loading, EmptyDataTip} from '../Commons/TipTools';
import {is, Map, List, fromJS} from 'immutable';
import {imgPaddedPrefix, renderFormatHTML, LIMIT_MESSAGE_PAGE} from '../Chat/Utils';
import {LIMIT_CLUSTER_ITEM} from './CulsterChatConstants';
import {Errors} from '../Commons/CommonConstants';
/**
 * 群列表
 */
class ClusterItem extends React.Component {
  constructor(props) {
    super(props);
    this.handleActivedItem = this.handleActivedItem.bind(this);
  }
  //激活当前item，取消其他item
  handleActivedItem() {
    if (this.props.isActived === true) return;
    this.props.onActivedItem(this.props.cluster.toJS());
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !is(nextProps.cluster, this.props.cluster) || nextProps.isActived != this.props.isActived;
  }
  render() {
    const {cluster, isActived} = this.props;
    const activeCls = classNames({"actived": isActived === true}), unreadNum = cluster.get('unread_num');
    let nickname = cluster.get('nick_name');
    // 大于9位的截取
    nickname = nickname.length <= 9 ? nickname : nickname.substring(0, 3) +'...'+nickname.substring(nickname.length-5)
    return (
      <li className="cluster-item" onClick={this.handleActivedItem}>
        <a href="javascript:void(0)" className={activeCls}>
          <div className="cluster-item-left">
            <img className="cluster-photo" alt="好友头像" src={cluster.get('head_url')}/>
            {
              unreadNum > 0 ? <span className="cluster-msgcount">{unreadNum}</span> : null
            }
          </div>
          <div className="cluster-item-right">
            <div className="cluster-item-title">
              <h3>{nickname}</h3>
            </div>
            <span className="cluster-item-message">
              {renderFormatHTML(cluster.get('chat_content'))}
             </span>
          </div>
        </a>
      </li>
    );
  }
}

export default class ClusterItemList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: 'loading',
      clusterList: fromJS([]),
      activedId: '',      //当前激活的群里id
      loading: true,
    }
    this.handleActivedItem = this.handleActivedItem.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }
  // 群组是否存在
  getClusterIndex(friend_wechat) {
    return this.state.clusterList.findIndex(cluster => (cluster.get('friend_wechat') == friend_wechat));
  }
  setActivedCluster(clusterSn) {
    if(this.state.activedId != clusterSn) {
      this.setState({
        activedId: clusterSn
      })
    }
  }
  //设置群组为激活选中状态
  handleActivedItem(cluster) {
    const activedId = cluster.friend_wechat
    if(this.state.activedId != activedId) {
      let index = this.getClusterIndex(cluster.friend_wechat);
      if(index == -1) return;

      this.props.onClickItem(cluster);

      this.setState(({clusterList}) => ({
        activedId,
        clusterList: clusterList.update(index, cluster => cluster.set('unread_num', 0))
      }));
      this.props.onSyncActiveItem(activedId);
    }
  }
  noData(){
    console.log("ClusterItemList => noData");
    this.setState({
      activedId: '',
      culsterList: fromJS([]),
      show: 'empty',
    })
  }
  // 初始化添加消息
  initClusters(clusterList) {
    console.log("ClusterItemList => initClusters", clusterList);
    clusterList[0]['unread_num'] = 0;
    const activedId = clusterList[0]['friend_wechat'];
    this.setState({
      activedId,
      clusterList: fromJS(clusterList),
      show: 'normal',
      loading: false,
    });
    this.props.onSyncActiveItem(activedId);
  }
  //指定特定的群会话
  initByClusteItem(clusterList, cluster_sn) {
    clusterList[0]['unread_num'] = 0;
    this.setState({
      activedId: cluster_sn,
      clusterList: fromJS(clusterList),
      show: 'normal'
    })
  }
  //新增一个新的群
  insertIntoFirst(cluster){
    this.setState(({clusterList}) => ({
      clusterList: clusterList.insert(0, Map(cluster))
    }));
  }
  //群的聊天模式
  updateChatMode(friend_wechat, cluster_chat_mode) {
    let index = this.getClusterIndex(friend_wechat);
    if(index == -1) return;
    this.setState(({clusterList}) => ({
      clusterList: clusterList.update(index, cluster => cluster.set('cluster_chat_mode', cluster_chat_mode))
    }));
  }
  //正在聊天中的群，更新最新消息
  updateChatMessage(friend_wechat, chat_content){
    let index = this.getClusterIndex(friend_wechat);
    if(index == -1) return;
    this.setState(({clusterList}) => ({
      clusterList: clusterList.update(index, cluster => cluster.set('chat_content', chat_content))
    }));
  }
  //群移到第一位
  moveToTop(friend_wechat, chat_content) {
    let index = this.getClusterIndex(friend_wechat);
    if(index == -1) return;
    if(index == 0) {  //已经是第一位了
      this.setState(({clusterList}) => ({
        clusterList: clusterList.update(index,
          cluster => cluster.set('chat_content', chat_content).set('unread_num', cluster.get('unread_num')+1))
      }));
    } else {
      const cluster = this.state.clusterList.get(index);
      this.setState(({clusterList}) => ({
        clusterList: clusterList.delete(index)
          .insert(0, cluster.set('chat_content', chat_content).set('unread_num', cluster.get('unread_num')+1))
      }));
    }
  }
  noLoadMore() {
    this.setState({
      loading: false
    });
    Errors("没有更多群会话了");
  }
  // 加载更多消息回调
  loadMoreClusters(data) {
    this.setState(({clusterList}) => ({
      loading: false,
      clusterList: clusterList.concat(fromJS(data))
    }));
  }
  handleScroll(e) {
    let node = ReactDOM.findDOMNode(this.refs.leftBody);
    // 到达底部
    if(node.scrollTop >= node.scrollHeight - node.offsetHeight) {
      this.setState({
        loading: true
      })
      this.props.onLoadMoreItem(this.state.clusterList.size)
    }
  }
  /*shouldComponentUpdate(nextProps, nextState) {
    console.log('ClusterItemList => shouldComponentUpdate',
      is(nextState.clusterList, this.state.clusterList),
      nextState.clusterList === this.state.clusterList,
      nextState.clusterList,
      this.state.clusterList
      );
    return  nextState.activedId !== this.state.activedId
      || nextState.loadIcon !== this.state.loadIcon
      || !is(nextState.clusterList, this.state.clusterList)
      || nextState.show !== this.state.show
  }*/
  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }
  componentDidMount() {
    let node = ReactDOM.findDOMNode(this.refs.leftBody);
    console.log('ClusterItemList => componentDidMount', node, this.refs);
  }
  renderBody() {
    const {clusterList, activedId, loading} = this.state;
    console.log("ClusterItemList => render", clusterList);
    return (
      <div className="cluster-manager-container">
        <div ref="leftBody" className="cluster-items-body" onScroll={this.handleScroll}>
          <Spin tip="加载中..." spinning={loading}>
            <QueueAnim component="ul" type={['right', 'left']}>
              {
                clusterList.map(cluster => (
                  <ClusterItem key={cluster.get('friend_wechat')}
                    cluster={cluster} isActived={activedId === cluster.get('friend_wechat')}
                    onActivedItem={this.handleActivedItem}/>
                ))
              }
            </QueueAnim>
          </Spin>
        </div>
      </div>
    )
  }
  render() {
    if(this.state.show === 'loading'){
      return <Loading />
    }else if(this.state.show === "empty"){
      return <EmptyDataTip />
    }else if(this.state.show === "normal"){
      return this.renderBody();
    }
  }
}
