import {queryWebSocketUrls} from '../../services/chat';
import {checkSession} from '../../services/optr';
import {Errors, Success} from '../Commons/CommonConstants';
import { hashHistory } from 'react-router';
import { CMD_HEARTBEAT, HEARTBEAT_INTERVAL_TIME, CMD_HEARTBEAT_SERVER,
  CMD_SEND, CMD_FEEDBACK, CMD_SEND_SERVER, CMD_GO_AWAY, CMD_COME_BACK, CMD_C_SEND_SERVER } from '../Chat/Utils';

class SocketManage {
  constructor(){
    this.urlList = [];    //websocket url
    this.index = 0;       //urlList当前url index
    this.failMsgList = [];
    this.isGone = true;
  }
  init(callback){
    if(!!this.socket){
      callback.call(this);
      return;
    }
    //请求WebSocket的url
    queryWebSocketUrls().then(({jsonResult}) => {
      this.urlList = jsonResult;
      if(this.urlList.length > 0){
        this.__connect(this.urlList[0]);
      }
      callback.call(this);
    });
  }
  //注册
  registerReceiver(receiver, pathname){
    if(!receiver || !receiver.onSocketMessage){
      throw new Error("Illegal arguments");
    }
    //只能注册一个，后面注册会覆盖
    this.receiver = receiver;
    this.pathname = pathname; //过来的是单聊还是群聊
  }
  //取消注册
  unRegisterReceiver(){
    this.receiver = null;
  }
  //连接：private
  __connect(url){
    try{
      // todo  打包时链接恢复上面这一条
      // 标准路径
       this.socket = new WebSocket(`${url}${AppName}/websocket.ws?wsTokenId=${localStorage.getItem("sessionId")}`);
      //测试环境debug路径
      //  this.socket = new WebSocket(`ws://192.168.96.204:9000/websocket.ws?wsTokenId=${localStorage.getItem("sessionId")}`);
       //正式环境debug路径
       // this.socket = new WebSocket(`wss://ykf.touchong.com/websocket.ws?wsTokenId=${localStorage.getItem("sessionId")}`);
      Object.assign(this.socket, {
        onopen : this.__onOpen.bind(this),
        onmessage : this.__onMessage.bind(this),
        onclose : this.__onClose.bind(this),
        onerror : this.__onError.bind(this),
      });
    }catch(e){
      console.error('初始化WebSocket出错啦：', e);
      //不考虑ws url格式出现问题情况，只考虑连接异常：onError
      throw new Error(e);
      Error("服务器崩溃了，请联系管理员");
    }
  }
  //发送心跳指令：private
  __beatHeart(){
    !!this.pingInterval && clearInterval(this.pingInterval);
    this.pingInterval = setInterval( () => {
      //在岗发空消息，离岗发'F'
      const msg = this.isGone === true ? null : 'F';
      this.send(CMD_HEARTBEAT, msg);
    }, HEARTBEAT_INTERVAL_TIME);
  }
  //重发失败消息:private
  __sendFailMsg(){
    if(this.failMsgList.length > 0 && !!this.socket && this.socket.readyState === WebSocket.OPEN) {
      // todo  暂时不要
      // Success("发送失败消息已重发, 请确认!");
      for(let msg of this.failMsgList) {
        this.socket.send(msg);
      }
      this.failMsgList = [];
    }
  }
  //连上socket回调:private
  __onOpen(){
    console.log("已经连上啦！！！！！！！！！！！！！！");
    this.__beatHeart();
    this.__sendFailMsg();
  }
  //接收到消息回调:private
  __onMessage(event){
    console.debug('接收到服务器消息: ', event);
    if(!this.receiver || !this.receiver.onSocketMessage){
      console.debug('虽然接收到新消息，但是没有注册接收器，然并卵');
      return;
    }
    const chatMessage = JSON.parse(event.data);
    const code = chatMessage['c']
    //接收到聊天消息, 只有他们的群聊才有指令8
    if(code === CMD_SEND_SERVER || (this.pathname == '/cluster' && code === CMD_C_SEND_SERVER)) {
      console.debug('收到新消息：', chatMessage);
      let msg = chatMessage['m'];
      !!msg && this.receiver.onSocketMessage(msg);
    } else if(chatMessage['c'] === CMD_HEARTBEAT_SERVER) {  //后台回复心跳
      console.debug('收到后台心跳回复');
    }
  }
  //socket关闭回调：private
  __onClose(){
    console.log("websocket 已经关闭啦！！！！");
  }
  //socket出现错误回调：private
  __onError(event){
    console.error('出错啦: ', event);
    if(event.target.readyState === WebSocket.CLOSED) {
      if(++this.index < this.urlList.length) {
        this.__connect(this.urlList[this.index]);
      }else{
        checkSession().then(({jsonResult}) => {
          if(jsonResult) {
            Errors("服务器出错了，请联系管理员");
          } else {
            Errors('登陆失效,请重新登陆!');
            hashHistory.replace("/signIn");
          }
        });
      }
    }
  }
  //打开socket就不关闭socket，不然后台会以为已经离线,所以在在登录、登出是调用
  closeSocket(){
    this.socket && this.socket.readyState === WebSocket.OPEN && (this.socket.close()||(this.socket=null));
    if(!!this.pingInterval){
      clearInterval(this.pingInterval);
      this.pingInterval = null
    }
  }
  //发送指令
  send(command, message){
    const msg = JSON.stringify({
      c: command,
      m: message
    });
    console.log('this.socket', !!this.socket, this.socket.readyState === WebSocket.OPEN);
    if(!!this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.debug('发送指令：c=[', command, '], m=[', message, ']');
      this.socket.send(msg);
    } else {
      checkSession().then(({jsonResult}) => {
        if(jsonResult) {
          //除心跳外的其他消息
          if(command == CMD_SEND || command == CMD_FEEDBACK) {
            this.failMsgList.push(msg);
          }
          this.index = 0;
          this.__connect(this.urlList[0]);
        } else {
          Errors('登陆失效,请重新登陆!');
          hashHistory.replace("/signIn");
        }
      });
    }
  }
  setIsGone(isGone) {
    this.isGone = isGone;
    const cmd = (isGone === true) ? CMD_COME_BACK : CMD_GO_AWAY;
    this.send(cmd);
  }
  getIsGone() {
    return this.isGone;
  }
}
const socketManage = new SocketManage();
export default socketManage;
