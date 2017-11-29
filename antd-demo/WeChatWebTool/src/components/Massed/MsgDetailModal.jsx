import React from 'react';
import {Row, Button, Input, InputNumber, Modal} from 'antd';
import NewMessageItem from './NewMessageItem';
import CommonModal from '../Commons/CommonModal';
import {saveMassTexting,getMassTextingInfo} from '../../services/multManage';
import {Success,Errors} from '../Commons/CommonConstants';

export default class MsgDetailModal extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      record_sn: '',
      chatContents: [],
      need_friend_cnt: 0,
      real_friend_cnt: 0,
      delay_minute: 0,
      remark: '',
      condition_desc: '',
      visible: false,
    };
    this.onCancel = this.onCancel.bind(this);
  }
  onCancel(){
    this.setState({
      record_sn: '',
      chatContents: [],
      need_friend_cnt: 0,
      real_friend_cnt: 0,
      delay_minute: 0,
      remark: '',
      condition_desc: '',
      visible: false,
    });
  }
  getRecordDetailInfo(record_sn){
    getMassTextingInfo(record_sn).then(({jsonResult}) => {
      if(!jsonResult) return;
      this.setState({
        record_sn,
        chatContents: jsonResult.chatContents,
        need_friend_cnt: jsonResult.need_friend_cnt,
        real_friend_cnt: jsonResult.real_friend_cnt,
        delay_minute: jsonResult.delay_minute,
        remark: jsonResult.remark,
        condition_desc: jsonResult.condition_desc,
        visible: true,
      });
    });
  }
  render(){
    if(!this.state.visible) return null;
    const {chatContents, need_friend_cnt, real_friend_cnt, delay_minute, remark, condition_desc, visible, record_sn} = this.state;
    return (
      <Modal visible={visible} maskClosable={false}
        title={<div>群发详情<span style={{color:'blue'}}>[编号{record_sn}]</span></div>} onCancel={this.onCancel}
        footer={[
          <Button key="close" icon="poweroff" type="primary" size="large" onClick={this.onCancel}>关 闭</Button>
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
          <p className="ant-form-text">好友删选条件:</p>
          <p className="ant-form-text">{condition_desc}</p>
        </Row>
        <Row>
          <p className="ant-form-text">实发好友数:</p>
          <p className="ant-form-text">{need_friend_cnt}</p>
          <p className="ant-form-text">个</p>
        </Row>
        <Row>
          <p className="ant-form-text">需发好友数:</p>
          <p className="ant-form-text">{real_friend_cnt}</p>
          <p className="ant-form-text">个</p>
        </Row>
        <Row>
          <p className="ant-form-text">随机延时:</p>
          <p className="ant-form-text">{delay_minute}</p>
          <p className="ant-form-text">分钟内发送</p>
        </Row>
        <Row>
          <p className="ant-form-text">备注: </p>
          <p className="ant-form-text">{remark}</p>
        </Row>
      </Modal>
    );
  }
}
