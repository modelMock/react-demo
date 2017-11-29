/*发朋友圈详情*/
import React, { Component, PropTypes } from 'react';
import {Button} from 'antd';
import CommonModal from '../Commons/CommonModal';
import { getPublishAdInfo } from '../../services/ads';
import './WeChatADDetailInfo.less';
import AdPublishDetailInfo from './AdPublishDetailInfo';

export default class AdPublishDetailInfoModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      adPublishDetailContent: {}
    };
    this.onClose = this.onClose.bind(this);
    this.allow=this.allow.bind(this);
    this.repulse=this.repulse.bind(this);
    this.publishSn="";
    this.btn="";
  }
  show(publish_sn,status,showSnsType) {
    console.log("show",publish_sn,status,showSnsType);
    this.publishSn=publish_sn;
    this.showSnsType=showSnsType;
    if(status=="AUDITING"){
      this.btn=<span>
        <Button key="allow"   icon="check" type="primary" size="large" onClick={this.allow}>允许发布</Button>
        <Button key="repulse" icon="close" type="primary" size="large" onClick={this.repulse}>拒绝发布</Button>
        <Button key="close"   icon="poweroff" type="primary" size="large" onClick={this.onClose}>关 闭</Button>
      </span>
    }else{
      this.btn=<Button key="close"   icon="poweroff" type="primary" size="large" onClick={this.onClose}>关 闭</Button>
    }
    getPublishAdInfo({ publish_sn }).then(({jsonResult}) => {
      this.setState({
        adPublishDetailContent: jsonResult,
      });
      this.refs.commonModal.show();
    });
  }

 allow(e){
   e.preventDefault();
   console.log("this.publishSn",this.publishSn)
   this.props.encapsulationAuditPublishAd(this.publishSn,'T',this.showSnsType);
 }
 repulse(e){
   e.preventDefault();
   this.props.encapsulationAuditPublishAd(this.publishSn,'F',this.showSnsType);
 }

  onClose() {
    this.refs.commonModal.hide();
  }
  render() {
    return (
      <CommonModal ref="commonModal" title="朋友圈详情" width={700} onCancel={this.onClose}
        footer={[
         this.btn
        ]}>
        <AdPublishDetailInfo {...this.state.adPublishDetailContent}/>
      </CommonModal>
    )
  }
}
