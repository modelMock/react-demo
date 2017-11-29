import React from 'react';
import ReactDOM from 'react-dom';
import {Checkbox, InputNumber, Icon, Spin,Button} from 'antd';
import classNames from 'classnames';
import QueueAnim from 'rc-queue-anim';
import {LIMIT_CLUSTER_MANAGE_ITEM} from './CulsterChatConstants';
import SearchInput from '../Search/SearchInput';
/**
 * 我的管理群列表
 */
 class ClusterManageItem extends React.Component {
   static contextTypes = {
     onActivedCluster: React.PropTypes.any,
   }
   constructor(props) {
     super(props);
     this.handleActivedItem = this.handleActivedItem.bind(this);
   }
   handleActivedItem() {
     this.context.onActivedCluster(this.props.cluster);
   }
   shouldComponentUpdate(nextProps, nextState) {
     return nextProps.cluster !== this.props.cluster || nextProps.isActived !== this.props.isActived;
   }
   render() {
     const {cluster, isActived} = this.props;
     let clusterName = cluster.cluster_name;
     clusterName = clusterName.length <= 9
      ? clusterName : clusterName.substring(0, 3) +'...'+clusterName.substring(clusterName.length-5)
     const activeCls = classNames({"actived": isActived === true})
     return (
       <li className="cluster-manage-item" onClick={this.handleActivedItem}>
         <a href="javascript:void(0)" className={activeCls}>
           <div className="cluster-item-left">
             <img className="cluster-photo" alt="好友头像" src={cluster.cluster_head_pic}/>
           </div>
           <div className="cluster-item-right">
             <div className="cluster-item-title">
               <h3>{cluster.cluster_id}</h3>
             </div>
             <span className="cluster-item-message">
               <p>{clusterName}</p>
              </span>
              <span className="item_num">
                群成员: {cluster.cluster_member_cnt}人
              </span>
           </div>
         </a>
       </li>
    );
   }
 }
 export default class ClusterManageList extends React.Component {
   constructor(props) {
     super(props);
     this.state = {
       loading: true,
       clusterList: [],
       activedId: '',      //当前激活的群里id
       totalCount:'0',
     }
     this.handleScroll = this.handleScroll.bind(this);
     this.onMoreBtn=this.onMoreBtn.bind(this);
   }
   //初始化群管理数据
   initClusterList(clusterList){
     this.setState({ clusterList, loading: false });
   }
   //没有更多数据了
   noMoreData() {
     this.setState({ loading: false });
   }
   //获取群管理列表总数
   getTotalCount(count){
     this.setState({ totalCount: count });
   }
   //加载更多群管理列表 回调
   loadMoreClusters(clusterList) {
     this.setState({
       loading: false,
       clusterList: this.state.clusterList.concat(clusterList)
     });
   }
   // 激活指定item
   activeItem(activedId) {
     if(this.state.activedId !== activedId) {
       this.setState({ activedId });
     }
   }
   onMoreBtn(e){
     e.preventDefault();
       this.setState({ loading: true });
       this.props.onLoadManageCluster(this.state.clusterList.length);
   }
   handleScroll() {
     let node = ReactDOM.findDOMNode(this.refs.manageBody);
     // 到达底部
     if(node.scrollTop + 1 >= node.scrollHeight - node.offsetHeight) {
       this.setState({ loading: true });
       this.props.onLoadManageCluster(this.state.clusterList.length);
     }
   }
   shouldComponentUpdate(nextProps, nextState) {
     return this.state.loading != nextState.loading
        || this.state.activedId != nextState.activedId
        ||　this.state.clusterList !== nextState.clusterList;
   }
   render(){
     const {clusterList, loading, activedId,totalCount} = this.state;
     console.log("ClusterManageList => render", loading, clusterList);
     if(clusterList.length>totalCount){
       console.log("clusterList.length",clusterList.length);
       clusterList.length=totalCount;
     }
     const loadCls = classNames("load-more", {"hidden": clusterList.size == 0 || clusterList.length < LIMIT_CLUSTER_MANAGE_ITEM })
     return (
       <div className="cluster-manager-container">
         <div className="search-ads-input">
           <SearchInput placeholder="请输入群ID搜索" onSearch={(value)=>{this.props.onSearch(value)}}/>
           <div style={{display:'inline-block'}}>
             <span style={{padding:2}}>{clusterList.length}/{totalCount}</span>
             <Button onClick={this.onMoreBtn} style={{width:40,paddingLeft:4}}>更多</Button>
           </div>
         </div>
         <div ref="manageBody" className="cluster-manager-body" onScroll={this.handleScroll}>
           <Spin tip="加载中..." spinning={loading}>
             <QueueAnim component="ul" type={['right', 'left']}>
               {
                 clusterList.map(cluster => (
                   <ClusterManageItem key={cluster.cluster_sn} cluster={cluster}
                     onActivedItem={this.handleActivedItem} isActived={activedId === cluster.cluster_sn}/>
                 ))
               }
             </QueueAnim>
           </Spin>
        </div>
      </div>
     )
   }
 }
