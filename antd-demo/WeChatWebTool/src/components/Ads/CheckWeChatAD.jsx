/*发朋友圈审核*/
import React, { Component, PropTypes } from 'react';
import { Form, Row, Col, Input, Select, Button, Table, Tag,Modal } from 'antd';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import CommonSelect from '../Commons/CommonSelect';
import CommonTable from '../Commons/CommonTable.jsx';
import ChannelSelectField from '../Operations/ChannelSelectField';
import {AdsStatusRender, AuditResultRender, PublishTypeRender, PutTypeRender} from './AdsStatusRender';
import AdPublishDetailInfoModal  from './AdPublishDetailInfoModal';
import { queryAdPublishListForAudit, getPublishAdInfo, auditPublishAd } from '../../services/ads';
import CommonModal from '../Commons/CommonModal';
import {Confirm, Success, Errors} from '../Commons/CommonConstants';

const FormItem = Form.Item;
const Option = Select.Option;

class IssueVerifyModal extends Component {
  constructor(props){
    super(props);
    this.state={
      visible: props.issueVisible,
      record: props.record,
    }
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }
  handleOk(){
    this.state.record.show_sns_type && this.state.record.audit_result==='T'
    ?
    this.props.form.validateFields( (errors, values) => {
      if(!!errors) return;
      auditPublishAd({ publish_sn:this.state.record.publish_sn, audit_result:this.state.record.audit_result,show_sns_type:values.show_sns_type}).then(({jsonResult}) =>{
        Success('操作成功');
        this.handleCancel();
        this.props.refreshTable();
      });
    })
    :
    auditPublishAd({ publish_sn:this.state.record.publish_sn, audit_result:this.state.record.audit_result,show_sns_type:null}).then(({jsonResult}) =>{
      Success('操作成功');
      this.handleCancel();
      this.props.refreshTable();
    });
  }
  handleCancel(){
    this.setState({
      visible: false,
    });
    this.props.updateVisible();
  }
  render(){
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 14}
    }
    const {getFieldDecorator} = this.props.form;
    const {visible, record} = this.state;
    let content = "确定允许发布后不可撤销，是否操作?";
    if(record.audit_result === 'F') {
      content = "确定拒绝发布后不可撤销，是否操作?";
    }
    return (
      <Modal visible={visible} maskClosable={false} title={content}
        onOk={this.handleOk} onCancel={this.handleCancel}
        footer={[
          <Button icon="poweroff" size="large" onClick={this.handleCancel}>取消</Button>,
          <Button type="primary" icon="check" size="large" onClick={this.handleOk}>提交</Button>
        ]}>
        <Form horizontal>
          {
            record.show_sns_type && record.audit_result==='T'
            ?
            <FormItem {...formItemLayout} label="朋友圈类型" required>
                 {getFieldDecorator('show_sns_type',  {initialValue:'',rules:[{required:true, message:"选择朋友圈类型"}]})(
                   <Select
                     allowClear
                     placeholder="请选择朋友圈类型">
                     <Option value="notify">开播</Option>
                     <Option value="common">日常</Option>
                     <Option value="lifephoto">生活照</Option>
                   </Select>
                 )}
           </FormItem>
           : null
          }
        </Form>
      </Modal>
    );
  }
}
IssueVerifyModal =Form.create()(IssueVerifyModal);

class CheckWcForm extends Component {
  constructor(props) {
    super(props);
    this.state={};
    this.handleSearch = this.handleSearch.bind(this);
  }

  handleSearch(e) {
    e.preventDefault();
    let values = this.props.form.getFieldsValue();
    if(!!values['channel_id']) {
      values['channel_id'] = values['channel_id']['key'];
    }
    this.props.onSearchCheck(values);
  }

  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }

  render() {
    console.log('CheckWcForm => render');
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const formItemLayout = {
      labelCol: {　span: 10　},
      wrapperCol: {　span: 14　}
    };
    return (
      <Form horizontal onSubmit={this.handleSearch} className="ant-advanced-search-form">
        <Row gutter={16}>
          <Col span={8}>
            <FormItem label="广告名称" {...formItemLayout}>
              {getFieldDecorator('ad_name')(
                <Input placeholder="请输入广告名称" />
              )}
            </FormItem>
            <ChannelSelectField getFieldDecorator={getFieldDecorator('channel_id', {rules:[{type:'object'}]})}
              formItem={{label:'商业渠道', ...formItemLayout}} />
          </Col>
         <Col span={8}>
            <FormItem label="发布类型" {...formItemLayout}>
              <CommonSelect placeholder="请选择发布类型" item_key="PublishType"
                getFieldDecorator={getFieldDecorator('publish_type')} />
            </FormItem>
            <FormItem label="投放进度" {...formItemLayout}>
              {getFieldDecorator('put_progress', {initialValue:''})(
                <Select>
                  <Option value="">全部</Option>
                  <Option value="0">0%</Option>
                  <Option value="100">100%</Option>
                  <Option value="0-100">大于0%小于100%</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="状态" {...formItemLayout}>
              <CommonSelect placeholder="请选择状态" item_key="ShowStatus" getFieldDecorator={getFieldDecorator('status')}/>
            </FormItem>
            <FormItem label="审核结果" {...formItemLayout}>
              <CommonSelect placeholder="请选择审核结果" item_key="AuditResult"
                getFieldDecorator={getFieldDecorator('audit_result')}/>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <FormItem label="发布人" {...formItemLayout}>
              {getFieldDecorator('create_optr_name')(
                <Input placeholder="请输入发布人" />
              )}
            </FormItem>
          </Col>
        <Col span={8} offset={8} style={{ textAlign: 'right' }}>
          <Button icon="search" type="primary" size="large" htmlType="submit">搜索</Button>
        </Col>
        </Row>
      </Form>
    );
  }
}

CheckWcForm = Form.create()(CheckWcForm);

export default class CheckWeChatAD extends Component {
  constructor(props) {
    super(props);
    this.state={
      issueVisible:false,
      record:{},
    }
    this.handleSearch = this.handleSearch.bind(this);
    this.updateVisible=this.updateVisible.bind(this);
    this.onRefreshTable=this.onRefreshTable.bind(this);
    this.encapsulationAuditPublishAd=this.encapsulationAuditPublishAd.bind(this);
    this.columns = [
      {title: '渠道名称',         dataIndex: 'channel_name', width: 120},
      {title: '提交时间',         dataIndex: 'create_time', width: 135},
      {title: '广告名称',         dataIndex: 'ad_name'},
      {title: '自评论',         dataIndex: 'self_sns_text', width: 75},
      {title: '发布类型',         dataIndex: 'publish_type', width: 75,
        render: (text, record) => PublishTypeRender(text, record['publish_type_text'])
      },
      {title: '投放类型',         dataIndex: 'put_type', width: 75,
        render: (text, record) => PutTypeRender(text, record['put_type_text'])
      },
      {title: '状态',         dataIndex: 'status', width: 85,
        render: (text, record) => AdsStatusRender(text, record['status_text'])
      },
      {title: '审核人',         dataIndex: 'audit_optr_name', width: 100},
      {title: '发布人',         dataIndex: 'create_optr_name', width: 100},
      {title: '审核结果',         dataIndex:'audit_result', width: 85,
        render: (text, record) => AuditResultRender(text, record['audit_result_text'])
      },
      {title: '投放进度',         dataIndex: 'put_progress', width: 75, render: (text) => (`${text}%`)},
      {title: '预定发圈时间',         dataIndex: 'plan_send_time', width: 135},
      {title: '审核时间',         dataIndex: 'audit_time', width: 135},
      {title: '备注',         dataIndex: 'remark', width: 100},
      {title: '操作', width: 200, fixed: 'right', render: (text, record) => (
        <span>
          <a href="javascript:void(0)" onClick={this.openDetailInfo.bind(this, record['publish_sn'],record['status'],record['show_sns_type'])}>朋友圈详情</a>
          {/*待审批状态才显示*/}
          <span hidden={record['status'] != 'AUDITING'}>
            <span className="ant-divider" />
            <a href="javascript:void(0)" onClick={this.auditPublishAd.bind(this, record['publish_sn'], 'T',record['show_sns_type'])}>允许发布</a>
            <span className="ant-divider" />
            <a href="javascript:void(0)" onClick={this.auditPublishAd.bind(this, record['publish_sn'], 'F',record['show_sns_type'])}>拒绝发布</a>
          </span>
        </span>
      )}
    ];
  }
  openDetailInfo(publish_sn,status,showSnsType) {
    console.log("openDetailInfo",publish_sn,status,showSnsType)
    this.refs.adPublishDetailInfoModal.show(publish_sn,status,showSnsType);
  }
  //允许和拒绝发布按钮   传递数据到modal
  auditPublishAd(publish_sn, audit_result,showSnsType) {
    let record={
      publish_sn:publish_sn,
      audit_result:audit_result,
      show_sns_type:showSnsType
    }
    this.setState({
      record,
      issueVisible:true,
    });
  }
  //封装auditPublishAd方法 绑定this
  encapsulationAuditPublishAd(publish_sn,audit_result,showSnsType){
    this.auditPublishAd(publish_sn, audit_result,showSnsType);
  }
  //更新modal状态
  updateVisible(){
    this.setState({ issueVisible:false });
  }
  //显示modal弹出层
  showModal(){
    const {issueVisible,record} = this.state;
    if(issueVisible === true){
      return <IssueVerifyModal updateVisible={this.updateVisible} issueVisible={issueVisible} record={record} refreshTable={this.onRefreshTable}/>
    }
    return null;
  }
  //搜索数据
  handleSearch(searchObj) {
    this.refs.commontable.queryTableData(searchObj);
  }
  //操作成功之后更新table列表
  onRefreshTable(){
    this.refs.adPublishDetailInfoModal.onClose();
    this.refs.commontable.refreshTable()
  }
  componentDidMount() {
    this.handleSearch();
  }
  render() {
    console.log('CheckWeChatAD => render');
    return (
      <div>
        {this.showModal()}
        <CheckWcForm onSearchCheck={this.handleSearch}/>
        <CommonTable ref="commontable" columns={ this.columns } rowKey="publish_sn"
          fetchTableDataMethod={ queryAdPublishListForAudit } scroll={{x: 1635}} />
        <AdPublishDetailInfoModal ref="adPublishDetailInfoModal" encapsulationAuditPublishAd={this.encapsulationAuditPublishAd}/>
      </div>
    );
  }
}
