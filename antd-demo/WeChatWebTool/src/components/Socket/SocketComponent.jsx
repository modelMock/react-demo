import React from 'react';
import socketManage from './SocketManage.js'

export default class SocketComponent extends React.Component {
  constructor(props){
    super(props);
    this.onSocketMessage = this.onSocketMessage.bind(this);
    this.sendCommandMessage = this.sendCommandMessage.bind(this);
  }
  onSocketMessage(){}
  sendCommandMessage(command, message){
    socketManage.send(command, message);
  }
  componentDidMount(){
    socketManage.registerReceiver(this, this.props.location.pathname);
  }
  componentWillUnmount(){
    socketManage.unRegisterReceiver(null);
  }
}
