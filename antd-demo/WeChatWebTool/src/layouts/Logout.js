import {hashHistory} from 'react-router';
import {logout} from '../services/optr.js';
import {Confirm} from '../components/Commons/CommonConstants';
import socketManage from '../components/Socket/SocketManage';

export function signOut() {
  Confirm(function(){
    logout().then(({jsonResult}) => {
      //清空本地存储
      socketManage.closeSocket();
      localStorage.clear();
      hashHistory.replace('/signIn');
    });
  }, "确定退出吗?");
}
