const allFrontResList = [{
    key: '27',
    text: '聊天',
    icon: 'user',
    url: '/chat'
  },{
    key: '28',
    text: '搜好友',
    icon: 'search',
    url: '/search'
  },{
    key: '29',
    text: '主页',
    icon: 'home',
    url: '/optr'
  },{
    key: '30',
    text: '后台',
    icon: 'desktop',
    url: '/admin'
  },{
    key: '32',
    text: '群聊',
    icon: 'team',
    url: '/group'
  },{
    key: '33',
    text: '群发',
    icon: 'message',
    url: '/massed'
  },{
    key: '34',
    text: '新增群发',
    icon: 'plus',
    url: '/massed/new'
  },{
    key: '35',
    text: '设置',
    icon: 'setting',
    url: '/setting'
  },{
    key: '39',
    text: '群聊',
    icon: 'team',
    url: '/cluster'
  }];
const allBackResList = [{
    key: '1',
    text: '运营号管理',
    icon: 'user',
    children: [{
      key: '8',
      text: '运营号列表',
      url: '/admin/operation/list'
    }, {
      key: '9',
      text: '分配商业渠道',
      url: '/admin/operation/channel'
    }, {
      key: '10',
      text: '分配客服',
      url: '/admin/operation/optr'
    }]
  }, {
    key: '2',
    text: '商业渠道管理',
    icon: 'laptop',
    children: [{
      key: '11',
      text: '渠道列表',
      url: '/admin/channel/list'
    }, {
      key: '31',
      text: '管理员列表',
      url: '/admin/optr/list'
    }]
  }, {
    key: '3',
    text: '客服管理',
    icon: 'customerservice',
    children: [{
      key: '12',
      text: '客服列表',
      url: '/admin/optr/list'
    }]
  }, {
      key: '4',
      text: '广告管理',
      icon: 'message',
      children: [{
        key: '13',
        text: '广告主题列表',
        url: '/admin/ads/list'
      }, {
        key: '14',
        text: '发朋友圈列表',
        url: '/admin/ads/wclist'
      }, {
        key: '15',
        text: '发朋友圈广告',
        url: '/admin/ads/send'
      }, {
        key: '16',
        text: '发朋友圈审核',
        url: '/admin/ads/check'
      }, {
        key: '18',
        text: '发朋友圈频率设置',
        url: '/admin/ads/freq'
      }, {
        key: '57',
        text: '电商朋友圈管理',
        url: '/admin/ads/ecommerce'
      }]
  }, {
    key: '5',
    text: '自动回复管理',
    icon: 'solution',
    children: [{
      key: '19',
      text: '自动回复设置',
      url: '/admin/reply/set'
    }, {
      key: '20',
      text: '自动回复消息列表',
      url: '/admin/reply/view'
    }, {
      key: '21',
      text: '审核朋友圈自动回复',
      url: '/admin/reply/check'
    }]
  }, {
    key: '36',
    text: '群管理',
    icon: 'team',
    children: [{
      key: '37',
      text: '创建群设置',
      url: '/admin/cluster/params'
    },{
      key: '38',
      text: '群列表',
      url: '/admin/cluster/list'
    },{
      key: '40',
      text: '广告大群列表',
      url: '/admin/cluster/advertisement'
    },{
      key: '42',
      text: '外部群接入配置',
      url: '/admin/cluster/externalGroupAccess'
    },{
      key: '43',
      text: '群成员角色列表',
      url: '/admin/cluster/groupMemberRoleList'
    },{
      key: '44',
      text: '群系统消息日志',
      url: '/admin/cluster/groupSystemMessageLog'
    },{
      key: '45',
      text: '配置发布专员',
      url: '/admin/cluster/releaseCommissioner'
    },{
      key: '46',
      text: '补中间运营号',
      url: '/admin/cluster/fillMiddleMumberOperations'
    },{
      key: '47',
      text: '303组登陆',
      url: '/admin/cluster/logonGroup'
    },{
      key: '50',
      text: '配置广告参数',
      url: '/admin/cluster/configureAdvertisingParameters'
    },{
      key: '55',
      text: '踢人设置',
      url: '/admin/cluster/clusterKickingSet'
    },{
      key: '56',
      text: '群邀请组补号',
      url: '/admin/cluster/clusterSupplement'
    },{
      key: '59',
      text: '群名称配置',
      url: '/admin/cluster/clusterNameConfiguration'
    },{
      key: '60',
      text: '运营方联盟号管理',
      url: '/admin/cluster/clusterOperatorallianceManagement'
    }]
  }, {
    key: '6',
    text: '系统参数设置',
    icon: 'tags',
    children: [{
      key: '22',
      text: '偏移量设置',
      url: '/admin/param/friend'
    }, {
      key: '23',
      text: '回复概率设置',
      url: '/admin/param/reply'
    },{
      key: '52',
      text: '解绑运营号设置',
      url: '/admin/param/setOperationsParams'
    },{
      key: '53',
      text: '养号活跃设置',
      url: '/admin/param/setActiveParams'
    },{
      key: '64',
      text: '链接消息白名单',
      url: '/admin/param/newsWhiteList'
    },{
      key: '66',
      text: 'sns图片混淆设置',
      url: '/admin/param/imageConfusionConfig'
    }]
  }, {
    key: '48',
    text: '主播秀场',
    icon: 'camera-o',
    children: [{
      key: '49',
      text: '分配主播',
      url: '/admin/show/showHostAllocation'
    },{
      key: '51',
      text: '上传朋友圈图片',
      url: '/admin/show/showUploadpicturesCircleFriends'
    },{
      key: '54',
      text: '主播列表',
      url: '/admin/show/showHostList'
    },{
      key: '58',
      text: '话术场景列表',
      url: '/admin/show/showWordsArtSceneList'
    }]
  }, {
    key: '61',
    text: '朋友圈内容库',
    icon: 'file-text',
    children: [{
      key: '62',
      text: '内容库',
      url: '/admin/content/library'
    },{
      key: '63',
      text: '微信号朋友圈采集',
      url: '/admin/content/weChatFriCirColle'
    },{
      key: '65',
      text: '小说推广配置',
      url: '/admin/content/covelConfig'
    }]
  }];

class ResourceManage {
  constructor() {
    this.frontMenuJson = [];    //当前操作员前台资源集合
    this.backMenuJson = [];     //当前操作员后台资源集合
    this.activedBtnIds = [];    //操作按钮资源集合
  }

  handleRoleRes(resList) {
    if(!resList || resList.length == 0) return;

    if(this.frontMenuJson.length == 0) {
      for(let subMenu of allFrontResList) {
        if(resList.indexOf(subMenu['key']) >= 0) {
          this.frontMenuJson.push(subMenu);
        }
      }
    }

    if(this.backMenuJson.length == 0) {
      for(let subMenu of allBackResList) {
        if(resList.indexOf(subMenu['key']) == -1) continue;
        let menu = {key: subMenu['key'], text: subMenu['text'], icon: subMenu['icon'], children: []};
        this.backMenuJson.push(menu);
        for(let menuItem of subMenu.children) {
          if(resList.indexOf(menuItem['key']) == -1) continue;
          menu['children'].push({key: menuItem['key'], text: menuItem['text'], url: menuItem['url']});
        }
      }
      //取按钮权限集合
      for(let key of resList) {
        if(key.indexOf("-") > 0) {
          this.activedBtnIds.push(key);
        }
      }
    }
  }
  hasRole(pathname){
    for(let menu of this.frontMenuJson) {
      if(menu['url'] == pathname) {
        return true;
      }
    }
    return false;
  }

  getFrontMenuJson() {
    return this.frontMenuJson;
  }
  getBackMenuJson() {
    return this.backMenuJson;
  }
  getActivedBtnIds() {
    return this.activedBtnIds;
  }
  clearMenu() {
    this.frontMenuJson = [];
    this.backMenuJson = [];
    this.activedBtnIds = [];
  }

}

const resourceManage = new ResourceManage();
export default resourceManage;
