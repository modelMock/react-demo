import React from 'react';
import {Row, Button, Input, InputNumber, Modal,Select} from 'antd';
import NewMessageItem from './NewMessageItem';
import {saveMassTexting,initMassSearch} from '../../services/multManage';
import {Success,Errors} from '../Commons/CommonConstants';
const Option = Select.Option;

export default class NewMassedConfirmModal extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      visible: false,
      isRightNow: true,   //是否立即发送
      need_friend_cnt: 0, //群发好友数
      chatContents: [],
      condition: {},
      tag_ids:[],
      showTags:[],        //群发后打标签
      delay_minute: 120,  //默认延迟分钟数为120分钟
    };
    this.handleCancel = this.handleCancel.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.onChangeDelay = this.onChangeDelay.bind(this);
    this.handleChange=this.handleChange.bind(this);

  }
  componentDidMount(){
    initMassSearch().then(({jsonResult}) => {
      this.setState({
        showTags: jsonResult.showTags,
      })
    });
  }
   handleChange(value) {
  console.log(`selected ${value}`);
  this.setState({
    tag_ids:value
  });
}

  onChangeDelay(delay_minute) {
    this.setState({
      delay_minute
    })
  }
  show(isRightNow, condition, chatContents, need_friend_cnt){
    this.setState({isRightNow, need_friend_cnt, chatContents, condition, visible: true})
  }
  handleCancel(){
    this.setState({
      visible: false,
      isRightNow: true,
      need_friend_cnt: 0,
      chatContents: [],
      tag_ids:[],
      condition: {},
      delay_minute: 120,
    });
  }
  handleOk(){
    let delay_minute = this.state.delay_minute;
    if(this.state.isRightNow === true) {
      delay_minute = 0; //立即发送，延迟为
    }
    const remark = this.refs.remark.refs.input.value;
    let chatContents = [];
    this.state.chatContents.forEach(content => {
      let msg = {chatType: content.chatType, chat_content: content.chat_content};
      if(!!content.link) msg.link = content.link;
      chatContents.push(msg);
    });
    saveMassTexting(this.state.condition, chatContents, this.state.need_friend_cnt, delay_minute, remark,this.state.tag_ids).then(({jsonResult}) => {
      Success("新增群发成功!");
      this.props.onReset();
      this.handleCancel();
    });
  }
  render(){
    if(!this.state.visible) return null;
    const {chatContents, need_friend_cnt, isRightNow, visible, delay_minute,showTags} = this.state;
    return (
      <Modal visible={visible} title="发送确认" onOk={this.handleOk} onCancel={this.handleCancel}
        footer={[
          <Button key="cancel" icon="cross" size="large" onClick={this.handleCancel}>取消</Button>,
          <Button key="submit" type="primary" icon="check" size="large" onClick={this.handleOk}>提交</Button>
        ]}>
        <Row className="modal-message-list">
          <ul>
            {
              chatContents.map(message => (
                <NewMessageItem message={message} />
              ))
            }
          </ul>
        </Row>
        <Row style={{marginTop: 8}}>
          <p className="ant-form-text">群发好友数:</p>
          <p className="ant-form-text">{need_friend_cnt}</p>
        </Row>
        <Row>
          <p className="ant-form-text">随机延时:</p>
          <InputNumber ref="delayMinute" min={1} value={delay_minute} disabled={isRightNow} onChange={this.onChangeDelay}/>
          <p className="ant-form-text" style={{marginLeft: 8}}>分钟内发送</p>
        </Row>
        <Row>
          <p className="ant-form-text">备注:</p>
         <Input ref="remark" type="textarea" rows={3} />
        </Row>
        <Row style={{marginTop: 10 }}>
          <p className="ant-form-text">群发后打标签:</p>
          <Select multiple style={{ width: '80%' }} onChange={this.handleChange}>
            {
              showTags.map(tag => (
                <Option  key={tag.tag_id}>{tag.tag_name}</Option>
              ))
            }
          </Select>
        </Row>
      </Modal>
    );
  }
}
