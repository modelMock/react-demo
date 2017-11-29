import React, { PropTypes } from 'react';
import { Router, Route, IndexRoute, IndexRedirect, Link } from 'react-router';
import App from '../components/App';
import AdminApp from '../components/AdminApp';
import NotFound from '../components/NotFound'
import ChatContainer from '../components/Chat/ChatContainer';
import SearchContainer from '../components/Search/SearchContainer';
import OptrHomeInfo from '../components/Optr/OptrHomeInfo';
import FriendHomeInfo from '../components/Friend/FriendHomeInfo';

import OperationTab from '../components/Operations/OperationTab';
import AssignChannel from '../components/Operations/AssignChannel';
import AssignOptr from '../components/Operations/AssignOptr';

import ChannelList from '../components/Channel/ChannelList';

import OptrList from '../components/Optr/OptrList';

import AdvertisingList from '../components/Ads/AdvertisingList';
import SendADToWeChat from '../components/Ads/SendADToWeChat';
import WeChatADList from '../components/Ads/WeChatADList';
import CheckWeChatAD from '../components/Ads/CheckWeChatAD';
import SetWeChatFreq from '../components/Ads/SetWeChatFreq';
import ECommerceWeChatManage from '../components/Ads/ECommerceWeChatManage';

import SetReplyMsg from '../components/Reply/SetReplyMsg';
import ViewReplyMsg from '../components/Reply/ViewReplyMsg';
import CheckReplyMsg from '../components/Reply/CheckReplyMsg';

import SetFriendParams from '../components/Param/SetFriendParams';
import SetReplyParams from '../components/Param/SetReplyParams';
import SetOperationsParams from '../components/Param/SetOperationsParams';
import SetActiveParams from '../components/Param/SetActiveParams';
import NewsWhiteList from '../components/Param/NewsWhiteList';
import ImageConfusionConfig from '../components/Param/ImageConfusionConfig';

import RoleManage from '../components/Role/RoleManage';
import SignIn from '../components/Login/SignIn';
import GroupChatContainer from '../components/Group/GroupChatContainer';
import MassedSendContainer from '../components/Massed/MassedSendContainer';
import NewMassedSendPage from '../components/Massed/NewMassedSendPage';
import SettingPage from '../components/Setting/SettingPage';
import ClusterList from '../components/Cluster/ClusterList';
import ClusterParams from '../components/Cluster/ClusterParams';
import ClusterChatContainer from '../components/Cluster/ClusterChatContainer';
import ClusterAdvertisement from '../components/Cluster/ClusterAdvertisement';
import ClusterOptrToAssign from '../components/Cluster/ClusterOptrToAssign';
import ConfigurationToReleaseCommissioner from '../components/Cluster/ConfigurationToReleaseCommissioner';
import ExternalGroupAccessConfiguration from '../components/Cluster/ExternalGroupAccessConfiguration';
import ClusterLogonGroup from '../components/Cluster/ClusterLogonGroup';
import FillMiddleMumberOperations from '../components/Cluster/FillMiddleMumberOperations';
import GroupMemberRoleList from '../components/Cluster/GroupMemberRoleList';
import GroupSystemMessageLog from '../components/Cluster/GroupSystemMessageLog';
import ClusterHomeInfo from '../components/Cluster/ClusterHomeInfo';
import ClusterMemberHomeInfo from '../components/Cluster/ClusterMemberHomeInfo';
import ConfigureAdvertisingParameters from '../components/Cluster/ConfigureAdvertisingParameters';
import ClusterKickingSet from '../components/Cluster/ClusterKickingSet';
import ClusterSupplement from '../components/Cluster/ClusterSupplement';
import ClusterNameConfiguration from '../components/Cluster/ClusterNameConfiguration';
import ClusterOperatorallianceManagement from '../components/Cluster/ClusterOperatorallianceManagement';

import ShowHostAllocation from '../components/show/ShowHostAllocation';
import ShowUploadpicturesCircleFriends from '../components/show/ShowUploadpicturesCircleFriends';
import ShowHostList from '../components/show/ShowHostList';
import ShowWordsArtSceneList from '../components/show/ShowWordsArtSceneList';

import ContentLibrary from '../components/Content/ContentLibrary';
import ContentWeChatFriCirColle from '../components/Content/ContentWeChatFriCirColle';
import NovelConfig from '../components/Content/NovelConfig';

const Routes = ({ history }) =>

  <Router history={ history }>
    {/*前台管理路由*/}
    <Route path="/signIn" component={SignIn} />
    <Route path="/" component={App}>
       <IndexRedirect to="chat" />
      <Route path="chat" component={ChatContainer} />
      <Route path="search" component={SearchContainer} />
      <Route path="friend" component={FriendHomeInfo} />
      <Route path="optr" component={OptrHomeInfo} />
      <Route path="group" component={GroupChatContainer} />
      <Route path="massed" component={MassedSendContainer} />
      <Route path="massed/new" component={NewMassedSendPage} />
      <Route path="setting" component={SettingPage} />
      <Route path="cluster" component={ClusterChatContainer} />
      <Route path="cluster/home" component={ClusterHomeInfo} />
      <Route path="cluster/member" component={ClusterMemberHomeInfo} />
    </Route>

    {/*后台管理路由*/}
    <Route path="/admin" component={AdminApp}>
      {/*运营号管理*/}
      {/*运营号列表*/}
      <IndexRedirect to="operation/list" />
      <Route path="operation/list" component={OperationTab} />
      {/*分配商业渠道*/}
      <Route path="operation/channel" component={AssignChannel} />
      {/*分配客服*/}
      <Route path="operation/optr" component={AssignOptr} />

      {/*商业渠道管理*/}
      {/*渠道列表*/}
      <Route path="channel/list" component={ChannelList} />

      {/*客服管理*/}
      {/*客服列表*/}
      <Route path="optr/list" component={OptrList} />

      {/*广告管理*/}
      {/*广告主题列表*/}
      <Route path="ads/list" component={AdvertisingList} />
      {/*发朋友圈广告*/}
      <Route path="ads/send" component={SendADToWeChat} />
      {/*发朋友圈列表*/}
      <Route path="ads/wclist" component={WeChatADList} />
      {/*发朋友圈审核*/}
      <Route path="ads/check" component={CheckWeChatAD} />
      {/*发朋友圈频率设置*/}
      <Route path="ads/freq" component={SetWeChatFreq} />
      {/*电商发朋友圈管理*/}
      <Route path="ads/ecommerce" component={ECommerceWeChatManage} />


      {/*自动回复管理*/}
      {/*自动回复设置*/}
      <Route path="reply/set" component={SetReplyMsg} />
      {/*查看自动回复信息*/}
      <Route path="reply/view" component={ViewReplyMsg} />
      {/*审核朋友圈自动回复*/}
      <Route path="reply/check" component={CheckReplyMsg} />

      {/*群管理*/}
      {/*群列表*/}
      <Route path="cluster/list" component={ClusterList} />
      {/*创建群设置*/}
      <Route path="cluster/params" component={ClusterParams} />
      {/*广告大群列表*/}
      <Route path="cluster/advertisement" component={ClusterAdvertisement} />
        {/*配置推荐专专员*/}
      <Route path="cluster/optrToAssign" component={ClusterOptrToAssign} />
        {/*配置发布专员*/}
      <Route path="cluster/releaseCommissioner" component={ConfigurationToReleaseCommissioner} />
        {/*外部群接入配置*/}
      <Route path="cluster/externalGroupAccess" component={ExternalGroupAccessConfiguration} />
        {/*群成员角色列表*/}
      <Route path="cluster/groupMemberRoleList" component={GroupMemberRoleList} />
        {/*群系统消息日志*/}
      <Route path="cluster/groupSystemMessageLog" component={GroupSystemMessageLog} />
        {/*补中间运营号*/}
      <Route path="cluster/fillMiddleMumberOperations" component={FillMiddleMumberOperations} />
        {/*303组登陆*/}
      <Route path="cluster/logonGroup" component={ClusterLogonGroup} />
        {/*配置广告参数*/}
      <Route path="cluster/configureAdvertisingParameters" component={ConfigureAdvertisingParameters} />
       {/*踢人设置*/}
      <Route path="cluster/clusterKickingSet" component={ClusterKickingSet} />
       {/*群邀请组补号*/}
      <Route path="cluster/clusterSupplement" component={ClusterSupplement} />
      {/*群名称配置*/}
     <Route path="cluster/clusterNameConfiguration" component={ClusterNameConfiguration} />
     {/*运营方联盟号管理*/}
    <Route path="cluster/clusterOperatorallianceManagement" component={ClusterOperatorallianceManagement} />

      {/*系统参数*/}
      {/*好友偏移设置*/}
      <Route path="param/friend" component={SetFriendParams} />
      {/*数据同步设置*/}
      <Route path="param/reply" component={SetReplyParams} />
      {/*解绑运营号设置*/}
      <Route path="param/setOperationsParams" component={SetOperationsParams} />
      {/*养号活跃设置*/}
      <Route path="param/setActiveParams" component={SetActiveParams} />
      {/*链接消息白名单*/}
      <Route path="param/newsWhiteList" component={NewsWhiteList} />
      {/* sns图片混淆设置*/}
      <Route path="param/imageConfusionConfig" component={ImageConfusionConfig} />

      {/*权限管理*/}
      <Route path="role/list" component={RoleManage} />

      {/*主播秀场*/}
      {/*主播分配*/}
      <Route path="show/showHostAllocation" component={ShowHostAllocation} />
      {/*上传朋友圈图片*/}
      <Route path="show/showUploadpicturesCircleFriends" component={ShowUploadpicturesCircleFriends} />
      {/*主播列表*/}
      <Route path="show/showHostList" component={ShowHostList} />
      {/*话术场景列表*/}
      <Route path="show/showWordsArtSceneList" component={ShowWordsArtSceneList} />

      {/*内容库*/}
      <Router path="content/library" component={ContentLibrary} />
      {/*微信号朋友圈采集*/}
      <Router path="content/weChatFriCirColle" component={ContentWeChatFriCirColle} />
      {/*小说推广配置*/}
      <Router path="content/covelConfig" component={NovelConfig} />

    </Route>

    <Route path="*" component={NotFound}/>
  </Router>

Routes.propTypes = {
  history: PropTypes.any,
};

export default Routes;
