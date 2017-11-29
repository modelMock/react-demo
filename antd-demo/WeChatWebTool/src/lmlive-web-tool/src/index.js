import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRedirect, hashHistory } from 'react-router';
import App from './App';
import Login from './Login';
import AddAnchor from './module/anchor/AddAnchor';
import AnchorManage from './module/anchor/AnchorManage';
import AnchorSalary from './module/anchor/AnchorSalary';
import AppLivingApply from './module/anchor/AppLivingApply';
import AnchorLiving from './module/anchor/AnchorLiving';
import AnchorMaintain from './module/anchor/AnchorMaintain';
import AnchorDetailInfo from './module/anchor/AnchorDetailInfo';
import AnchorMonitor from './module/anchor/AnchorMonitor';
import AnchorLeaveList from './module/anchor/AnchorLeaveList';
import AnchorRewardPunish from './module/anchor/AnchorRewardPunish';


import GiftList from './module/gift/GiftList';
import AnimList from './module/gift/AnimList';
import ChannelList from './module/channel/ChannelList';

import UserManage from './module/user/UserManage'
import AwardManage from './module/user/AwardManage';
import BlockUserManage from './module/user/BlockUserManage';

import SystemConfigManage from './module/system/SystemConfigManage';
import ItemValueManage from './module/system/ItemValueManage';
import CarouselAdManage from './module/system/CarouselAdManage';
import RoleManage from './module/system/RoleManage';

import ReportContainer from './ReportContainer';
import UnionManage from './module/union/UnionManage';
import UnionList from './module/union/UnionList';
import UnionSanction from './module/union/UnionSanction';
import UnionInvoices from './module/union/UnionInvoices';

import SalaryAnchorWages from './module/salary/SalaryAnchorWages';
import SalaryGuildWages from './module/salary/SalaryGuildWages';
import BillAudit from './module/salary/BillAudit';
import BillIssuance from './module/salary/BillIssuance';

import AuditSanction from './module/audit/AuditSanction';
import AuditResource from './module/audit/AuditResource';
import UnionEdit from "./module/union/UnionEdit";
import TabsTest from "./module/gift/TabsTest";
import TableTest from "./module/gift/TableTest";
import NewGiftList from "./module/gift/NewGiftList";

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/">
      <IndexRedirect to="/login" />
      <Route path="/login" component={Login} />
    </Route>
    <Route path="/anchor/monitor" component={AnchorMonitor} />
    <Route path="/manage" component={App}>
      /* 礼物管理 */
      <Route path="/gift/list" component={GiftList} />
      /* 动画管理 */
      <Route path="/anim/list" component={AnimList} />
      /* 渠道管理 */
      <Route path="/channel/list" component={ChannelList} />
      <Route path="/channel/list/recharge" component={ChannelList} />

      /* 主播录入 */
      <Route path="/anchor/add" component={AddAnchor} />
      /* 主播管理 */
      <Route path="/anchor/manage" component={AnchorManage} />
      /* 主播工资(暂时弃用，后台数据有问题) */
      <Route path="/anchor/salary" component={AnchorSalary} />
      /* 手机直播申请 */
      <Route path="/anchor/apply" component={AppLivingApply} />
      /* 直播数据 */
      <Route path="/anchor/living" component={AnchorLiving} />
      /* 主播维系 */
      <Route path="/anchor/maintain" component={AnchorMaintain} />
      /* 主播详情 */
      <Route path="/anchor/info" component={AnchorDetailInfo} />
      /* 客服监播 */
      {/*<Route path="/anchor/monitor" component={AnchorMonitor} />*/}
      /* 请假列表 */
      <Route path="/anchor/leave" component={AnchorLeaveList} />
      /* 奖惩记录 */
      <Route path="/anchor/reward" component={AnchorRewardPunish} />

      /* 用户管理 */
      <Route path="/user/manage" component={UserManage} />
      /* 用户奖励 */
      <Route path="/user/award" component={AwardManage} />
      /* 小黑屋管理 */
      <Route path="/user/block" component={BlockUserManage} />

      /* 系统参数配置 */
      <Route path="/system/config" component={SystemConfigManage} />
      /* 数据字典 */
      <Route path="/system/item" component={ItemValueManage} />
      /* 广告条管理 */
      <Route path="/system/carouselad" component={CarouselAdManage} />
      /* 角色管理 */
      <Route path="/system/role" component={RoleManage} />

      <Route path="/report/:reportId" component={ReportContainer}/>
      /*
      *公会配置
      */
      /* 公会管理 */
      <Route path="/union/manage" component={UnionManage}/>
      /* 公会列表 */
      <Route path="/union/list" component={UnionList}/>
      /* 新增公会 */
      <Route path="/union/add" component={UnionEdit}/>
      /* 修改公会 */
      <Route path="/union/modify/:guildId" component={UnionEdit}/>
      /* 公会奖惩记录 */
      <Route path="/union/sanction" component={UnionSanction}/>
      /* 公会发票管理 */
      <Route path="/union/invoices" component={UnionInvoices}/>
      /*
      *薪资管理
      */
      /* 主播工资结算 */
      <Route path="/salary/anchor" component={SalaryAnchorWages}/>
      /* 公会工资结算 */
      <Route path="/salary/guild" component={SalaryGuildWages}/>
      /* 账单审核 */
      <Route path="/salary/billAudit" component={BillAudit}/>
      /* 账单待发 */
      <Route path="/salary/billIssuance" component={BillIssuance}/>

      /*
      * 审核列表
      */
      /* 奖惩记录审核 */
      <Route path="/audit/sanction" component={AuditSanction}/>
      /*资源奖励审核 */
      <Route path="/audit/resource" component={AuditResource}/>

      <Route path="/table/test" component={TableTest}/>
      <Route path="/tabs/test" component={TabsTest}/>
      <Route path="/newgift/list" component={NewGiftList}/>

    </Route>
  </Router>,
  document.getElementById('root')
);
