import React from 'react';
import ReactDOM from 'react-dom';
import {Button, Modal} from 'antd';
import {hashHistory} from 'react-router';
import ClusterItemList from './ClusterItemList';
import ClusterMessageList from './ClusterMessageList';
import ClusterMyMessageList from './ClusterMyMessageList';
import ClusterSendMessageBox from './ClusterSendMessageBox';
import ClusterManageList from './ClusterManageList.jsx';
import SocketComponent from '../Socket/SocketComponent';
import service from '../../services/clusterChat';
import {Errors} from '../Commons/CommonConstants';
import ClusterHomeInfo from './ClusterHomeInfo';
import {
  TXT, IMG_DATA, FROM_FRD, FROM_OPT, CMD_HEARTBEAT, CMD_FEEDBACK,
  CMD_SEND, CMD_PLAY_AUDIO, LIMIT_MESSAGE_PAGE
} from './../Chat/Utils';
import {uploadImg} from '../../services/chat.js';
import './ClusterChatContainer.less';

const INIT = "INIT";      //初始化查询类型
const SWITCH = "SWITCH";  //切换群组查询类型
const LOAD = "LOAD";      //加载更多查询类型
/**
 * 微信群聊
 */
export default class ClusterChatContainer extends SocketComponent {
  static childContextTypes = {
    sendCommandMessage: React.PropTypes.any,
    onActivedCluster: React.PropTypes.any,
    onUpdateMsgReply: React.PropTypes.any,
    addAtTipsDefaultMessage: React.PropTypes.any,
    onCopyMessage: React.PropTypes.any,
  }
  getChildContext() {
    return {
      sendCommandMessage: this.sendCommandMessage.bind(this),
      onActivedCluster: this.onActivedCluster.bind(this),
      onUpdateMsgReply: this.onUpdateMsgReply.bind(this),
      addAtTipsDefaultMessage: this.addAtTipsDefaultMessage.bind(this),
      onCopyMessage: this.onCopyMessage.bind(this),
    }
  }
  constructor(props) {
    super(props);
    this.state = {
      head_url: '',
      nick_name: '',
      cluster_chat_mode: 'ALL', //ALL: 全部按钮， NP：非广告按钮
      visible: false,
      params: null,
    }
    this.onClickClusterItem = this.onClickClusterItem.bind(this);
    this.onLoadClusterItem = this.onLoadClusterItem.bind(this);
    this.onLoadMessages = this.onLoadMessages.bind(this);
    this.onLoadMyMessages = this.onLoadMyMessages.bind(this);
    this.onLoadManageCluster = this.onLoadManageCluster.bind(this);
    this.onAddLocalMessage = this.onAddLocalMessage.bind(this);
    this.jumpToHome = this.jumpToHome.bind(this);
    this.onSyncActiveItem = this.onSyncActiveItem.bind(this);
    this.onSearchManageById = this.onSearchManageById.bind(this);
    this.onCloseCluster = this.onCloseCluster.bind(this);

    this.friend_wechat = null;
    this.msgStartChat = null;   //保存当前群消息翻页标识数据
    this.myMsgStartChat = null; //保存当前群@我的消息翻页标识数据
  }

  saveUserInfo(cluster) {
    this.friend_wechat = cluster.friend_wechat;
    this.setState({
      head_url: cluster.head_url,
      nick_name: cluster.nick_name,
      cluster_chat_mode: cluster.cluster_chat_mode,
      bak_nick_name: cluster.bak_nick_name ,
      province_id: cluster.province_id
    })
  }
  __activeClusterItem(cluster) {
    this.friend_wechat = cluster.cluster_sn;
    this.refs.clusterItemList.setActivedCluster(this.friend_wechat);
    this.setState({
      head_url: cluster.cluster_head_pic,
      nick_name: cluster.cluster_name,
      cluster_chat_mode: cluster.cluster_chat_mode,
      bak_nick_name: cluster.master_info ,
      province_id: cluster.master_sn
    });
    this.__queryClusterItemData(SWITCH);
  }
  //激活单个群，并刷新群所有数据
  __queryClusterItemData(type) {
    this.msgStartChat = null;
    this.myMsgStartChat = null;
    this.sendCommandMessage(CMD_FEEDBACK, JSON.stringify({operation_sn: this.friend_wechat, friend_sn: this.friend_wechat}));
    this.__queryRecordChat(type);
    this.__queryRecordChatByExtra(type);
  }
  // 点击单个群会话
  onClickClusterItem(cluster) {
    console.log('onClickClusterItem', cluster)
    this.saveUserInfo(cluster);
    this.__queryClusterItemData(SWITCH);
  }
  // 群列表加载更多
  onLoadClusterItem(offset) {
    console.log('onLoadClusterItem', offset);
    if (offset <= 0) return;
    this.__queryChatInfoList(LOAD, offset);
  }
  // 群消息加载更多
  onLoadMessages() {
    if(!this.msgStartChat) {
      this.refs.clusterMessageList.noMoreMessage();
      Errors("没有更多聊天记录了");
      return;
    }
    this.__queryRecordChat(LOAD);
  }
  onLoadMyMessages() {
    if(!this.myMsgStartChat) {
      this.refs.clusterMyMessageList.noMoreMessage();
      Errors("没有更多@我消息了");
      return;
    }
    this.__queryRecordChatByExtra(LOAD);
  }
  onLoadManageCluster(offset) {
    if (offset <= 0) return;
    console.log("onLoadManageCluster =>", offset)
    this.__queryClusterByOptrManager(LOAD, offset);
  }
  //群管理调用: 切换到当前群，并查询所有数据
  onActivedCluster(cluster) {
    const clusterSn = cluster.cluster_sn;
    if(this.friend_wechat === clusterSn) return;
    const index = this.refs.clusterItemList.getClusterIndex(clusterSn);
    if(index >= 0) {
      //存在列表中
      this.__activeClusterItem(cluster);
    } else {
      //不存在列表中，查询群会话信息并添加进列表中
      this.__queryChatInfo(clusterSn, function(){
        this.__activeClusterItem(cluster);
      }.bind(this));
    }
    this.onSyncActiveItem(clusterSn)
  }
  // 点击左侧item，同步激活右侧item
  onSyncActiveItem(activedId) {
    this.refs.clusterManageList.activeItem(activedId);
  }
  // 初始化群会话列表，并激活指定的群会话
  __initAndActiveClusteItem(clusterList) {
    const state = this.props.location.state;
    if(!state || !state.cluster_sn) {
      this.__activeFirstClusterItem(clusterList);
    } else {
      //跳转过来的，有指定的群组sn
      const index = clusterList.findIndex(cluster => (cluster.friend_wechat === state.cluster_sn));
      if(index === 0) {
        //在当前群组列表第一位，不作处理
        this.__activeFirstClusterItem(clusterList);
      } else if(index > 0) {
        //不是当前群组列表第一位，移动到第一位
        const firstCluster = clusterList[index];
        clusterList.splice(index, 1);
        clusterList.splice(0, 0, firstCluster);
        this.__activeFirstClusterItem(clusterList);
      } else {
        //不存在当前群组列表中，添加到第一位
        service.queryChatInfo(state.cluster_sn).then(({jsonResult}) => {
          clusterList.splice(0, 0, jsonResult);
          this.__activeFirstClusterItem(clusterList);
        });
      }
    }
  }
  __activeFirstClusterItem(clusterList) {
    this.refs.clusterItemList.initClusters(clusterList);
    //默认加载第一个群消息
    const firstCluster = clusterList[0];
    this.saveUserInfo(firstCluster);
    this.__queryClusterItemData(INIT);
    this.__queryClusterByOptrManager(INIT);
  }
  /**
   * 查询群列表
   * @param type init: 初始化查询数据 swtich: 切换好友； load: 加载更多
   * @param offset
   * @private
   */
  __queryChatInfoList(type = INIT, offset = 0) {
    service.queryChatInfoList(offset).then(({jsonResult}) => {
      if (type === INIT && jsonResult.length === 0) {
        this.refs.clusterItemList.noData();
      } else if (type === INIT) {
        this.__initAndActiveClusteItem(jsonResult);
      } else if (type === LOAD && jsonResult.length > 0) {
        this.refs.clusterItemList.loadMoreClusters(jsonResult);
      } else if (type === LOAD && jsonResult.length == 0) {
        this.refs.clusterItemList.noLoadMore();
      }
    });
  }

  /**
   * 查询群消息列表
   * 1、初始化，直接添加
   * 2、点击某个群组，先清空原消息，在添加
   * @param type
   * @private
   */
  __queryRecordChat(type = INIT) {
    service.queryRecordChat(this.friend_wechat, this.msgStartChat).then(({jsonResult}) => {
      this.msgStartChat = jsonResult.nextPageStart;
      const messageList = jsonResult.data;
      if (messageList.length > 0) messageList.reverse();
      console.log('messageList', messageList)
      if ((type === INIT && messageList.length > 0) || type === SWITCH) {
        this.refs.clusterMessageList && this.refs.clusterMessageList.initMessages(messageList);
      } else if (type === LOAD && messageList.length > 0) {
        this.refs.clusterMessageList.loadMoreMessages(messageList)
      }
    });
  }

  //查询@我的消息列表
  __queryRecordChatByExtra(type = INIT, limit) {
    service.queryRecordChatByExtra(this.friend_wechat, this.myMsgStartChat, limit).then(({jsonResult}) => {
      this.myMsgStartChat = jsonResult.nextPageStart;
      const messageList = jsonResult.data;
      if (messageList.length > 0) messageList.reverse();
      if ((type === INIT && messageList.length > 0) || type === SWITCH) {
        this.refs.clusterMyMessageList && this.refs.clusterMyMessageList.initMessages(messageList);
      } else if (type === LOAD && messageList.length > 0) {
        this.refs.clusterMyMessageList.loadMoreMessages(messageList)
      }
    });
  }

  // 右侧管理群列表根据输入id查询
  onSearchManageById(cluster_search) {
    this.cluster_search = cluster_search;
    this.__queryClusterByOptrManager(INIT, 0, cluster_search)
  }

  //查询群管理列表: 只需要调用一次了，切换群不需要重新查询
  __queryClusterByOptrManager(type = INIT, offset = 0, cluster_search=this.cluster_search) {
    service.queryClusterByOptrManager(offset, cluster_search).then(({jsonResult}) => {
      const clusterList = jsonResult.records;
      const totalCount=jsonResult.totalCount;
      this.refs.clusterManageList.getTotalCount(totalCount);
      if (type === INIT || type === SWITCH) {
        this.refs.clusterManageList.initClusterList(clusterList);
      } else if (type === LOAD) {
        if(clusterList.length > 0) {
          this.refs.clusterManageList.loadMoreClusters(clusterList);
        } else {
          this.refs.clusterManageList.noMoreData();
          Errors("没有更多我管理的群了")
        }
      }
    });
  }

  //查询新群，并添加到第一位
  __queryChatInfo(friend_wechat, callback) {
    service.queryChatInfo(friend_wechat).then(({jsonResult}) => {
      if (!jsonResult) return;
      this.refs.clusterItemList.insertIntoFirst(jsonResult);
      if(!!callback) {
        callback.call(this);
      }
    });
  }
  // 修改创建群设置参数
  updateChatMode(cluster_chat_mode) {
    console.log("updateChatMode => ", this.friend_wechat)
    if(cluster_chat_mode !== this.state.cluster_chat_mode) {
      service.updateChatMode(this.friend_wechat, cluster_chat_mode).then(({jsonResult}) => {
        this.setState({cluster_chat_mode})
        this.msgStartChat = null
        this.__queryRecordChat(SWITCH)
        this.refs.clusterItemList.updateChatMode(this.friend_wechat, cluster_chat_mode)
      });
    }
  }
  /**
   * 设置群聊消息为已回复 或未回复
   * @param is_cluster_read T 修改消息为已回复；F 修改消息为未回复
   */
  onUpdateMsgReply(messageItem) {
    const {chat_sn, cluster_sn, cluster_member_sn, chat_time_long, chat_content_md5, is_cluster_read} = messageItem;
    const replay = (is_cluster_read === "T") ? "F" : "T";
    service.updateChatReply(cluster_sn, cluster_member_sn, chat_time_long, chat_content_md5, replay).then(({jsonResult}) => {
      this.refs.clusterMessageList.updateReplyMode(chat_sn, replay);
      this.refs.clusterMyMessageList.updateReplyMode(chat_sn, replay);
    });
  }
  //收到后台消息
  onSocketMessage(recordChatMsg) {
    let recordChat = JSON.parse(recordChatMsg);
    console.log('收到后台消息', recordChat);
    const friend_wechat = recordChat.friend_sn, chat_content = recordChat.chat_content;
    if (friend_wechat === this.friend_wechat) {
      console.log('当前好友正在聊天中...', recordChat);
      //新消息添加到消息框最后
      this.refs.clusterMessageList.addServerMessage(recordChat);
      //更新群列表中显示最新消息
      this.refs.clusterItemList.updateChatMessage(friend_wechat, chat_content);
      //会后后台哪个群正在聊天中
      this.sendCommandMessage(CMD_FEEDBACK, JSON.stringify({operation_sn: friend_wechat, friend_sn: friend_wechat}));
      //@我的消息
      if(recordChat.cluster_is_extra === true) {
        this.refs.clusterMyMessageList.addMessage(recordChat);
      }
    } else if (this.refs.clusterItemList.getClusterIndex(friend_wechat) == -1) {
      console.log('当前好友不在列表中');
      this.__queryChatInfo(friend_wechat);
    } else {
      console.log('当前好友在列表中,置顶到第一位 ', recordChat);
      this.refs.clusterItemList.moveToTop(friend_wechat, chat_content)
    }
  }
  onAddLocalMessage(msgHTML, chat_type=TXT) {
    //添加到聊天框中
    console.log("onAddLocalMessage",msgHTML);
    this.refs.clusterMessageList.addLocalMessageHtml(msgHTML, chat_type);
  }
  jumpToHome() {
    this.setState({
      visible: true,
      params: {
        cluster_sn: this.friend_wechat
      }
    })
  }
  componentDidMount() {
    super.componentDidMount();
    this.__queryChatInfoList();
  }
  addAtTipsDefaultMessage(targetSn, nickname){
    this.refs.messageBoxInputRef.insertAtMessage(targetSn, nickname)
  }
  onCopyMessage(message) {
    this.refs.messageBoxInputRef.insertCopyMessage(message)
  }
  onCloseCluster(){
    this.setState({ visible: false, params: null })
  }
  render() {
    const {head_url, nick_name, cluster_chat_mode, bak_nick_name, province_id, visible, params} = this.state;
    let allBtnType="primary", npBtnType="ghost";
    if(cluster_chat_mode == "NP") {
      allBtnType = "ghost";
      npBtnType="primary"
    }
    return (
      <div className="cluster-group">
        <div className="cluster-items-left">
          <ClusterItemList ref="clusterItemList" onClickItem={this.onClickClusterItem}
            onLoadMoreItem={this.onLoadClusterItem} onSyncActiveItem={this.onSyncActiveItem}/>
        </div>
        <div className="cluster-group-content">
          <div className="cluster-message-head">
            {!!head_url ? <img alt="群头像" src={head_url} onClick={this.jumpToHome}/> : null}
            {!!nick_name ? <h1>{nick_name} {bak_nick_name?(<span onClick={this.addAtTipsDefaultMessage.bind(this, province_id,bak_nick_name)}>@{bak_nick_name}</span>): null}</h1> : null}
            <div className="operation-type">
              <Button type={allBtnType} size="large" onClick={() => this.updateChatMode('ALL')}>全部</Button>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Button type={npBtnType} size="large" onClick={() => this.updateChatMode('NP')}>非广告</Button>
            </div>
          </div>
          <div className="cluster-right">
            <div className="cluster-mymsgs">
              <ClusterMyMessageList ref="clusterMyMessageList" onLoadMyMessages={this.onLoadMyMessages}/>
            </div>
            <div className="cluster-manage">
              <ClusterManageList ref="clusterManageList" onLoadManageCluster={this.onLoadManageCluster}
                onSearch={this.onSearchManageById}/>
            </div>
          </div>
          <div className="cluster-message">
            <ClusterMessageList ref="clusterMessageList" onLoadMessages={this.onLoadMessages}/>
            <ClusterSendMessageBox ref="messageBoxInputRef" friend_wechat={this.friend_wechat}
              onSendMessage={this.onSendMessage} onAddLocalMessage={this.onAddLocalMessage}/>
          </div>
        </div>
        {
          visible ? <Modal visible={visible} title="群主页" onCancel={this.onCloseCluster}
            footer={[<Button icon="cross" size="large" onClick={this.onCloseCluster}>关闭</Button>]}>
            <ClusterHomeInfo params={params} />
          </Modal> : null
        }
      </div>
    )
  }
}
