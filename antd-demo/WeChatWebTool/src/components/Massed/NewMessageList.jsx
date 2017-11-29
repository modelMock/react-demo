import React from 'react';
import {List} from 'immutable';
import NewMessageItem from './NewMessageItem';

export default class NewMessageList extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      messageList: List([])
    }
  }
  addMessage(message){
    if(!message) return;
    this.setState(({messageList}) => ({
      messageList: messageList.push(message)
    }))
  }
  clearMessage(){
    if(this.state.messageList.size > 0){
      this.setState({
        messageList: List([])
      })
    }
  }
  getMessageList() {
    return this.state.messageList.toJS();
  }
  render(){
    console.log("NewMessageList => render", this.state.messageList.toJS());
    return (
      <div className="massed-send-messages">
        <ul>
          {
            this.state.messageList.map(message => (
              <NewMessageItem message={message} />
            ))
          }
        </ul>
      </div>
    );
  }
}
