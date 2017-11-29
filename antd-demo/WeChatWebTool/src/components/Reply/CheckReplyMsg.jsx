/*审核朋友圈自动回复*/
import React, { Component } from 'react';
import {Button,Select,Table,Input,Row,Col,Form, Tag} from 'antd';
import CommonTable from '../Commons/CommonTable.jsx';
import ChannelSelectField from '../Operations/ChannelSelectField';
import CommonSelect from '../Commons/CommonSelect';
import {Confirm, Success, contentSubRender} from '../Commons/CommonConstants';
import {queryChannelReplyListForAudit,auditChannelReply} from '../../services/replyMsgService';
const FormItem = Form.Item;

class CheckReplyMsgQueryFrom extends Component{
  constructor(props) {
    super(props);
    this.handleSearch = this.handleSearch.bind(this);
  }
  handleSearch(e){
    e.preventDefault();
    let values = this.props.form.getFieldsValue();
    if(!!values['channel_id']) {
      values['channel_id'] = values['channel_id']['key'];
    }
    this.props.onSearchChannel(values);
  }
  render(){
    console.log("CheckReplyMsgQueryFrom => render");
    const getFieldDecorator = this.props.form.getFieldDecorator;

    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: {　span: 17 }
    };
    return (
      <Form horizontal onSubmit={this.handleSearch} className="ant-advanced-search-form">
        <Row align="middle" type="flex">
          <Col span={10}>
            <ChannelSelectField getFieldDecorator={getFieldDecorator('channel_id', {rules:[{type:'object'}]})}/>
            <FormItem label="审核结果" {...formItemLayout}>
              <CommonSelect placeholder="请选择审核结果" item_key="AuditResult"
                getFieldDecorator={getFieldDecorator('audit_result')}/>
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem label="朋友圈类型" {...formItemLayout}>
              <CommonSelect placeholder="请选择朋友圈类型" item_key="AutoReplyType"
                getFieldDecorator={getFieldDecorator('auto_reply_type')}/>
            </FormItem>
            <FormItem label="状态" {...formItemLayout}>
              <CommonSelect placeholder="请选择状态" item_key="AuditStatus"
                getFieldDecorator={getFieldDecorator('audit_status')}/>
            </FormItem>
          </Col>
          <Col span={4} style={{textAlign: 'center', marginBottom: 8}}>
            <Button type="primary" size="large" htmlType="submit" icon="search" >搜索</Button>
          </Col>
        </Row>
      </Form>
    )
  }
}
CheckReplyMsgQueryFrom = Form.create()(CheckReplyMsgQueryFrom);

export default class CheckReplyMsg extends Component {
  constructor(props) {
    super(props);
    this.state={};
    this.handleSearch = this.handleSearch.bind(this);
    this.columns = [
      { title: '渠道名称', dataIndex: 'channel_name' },
      { title: '提交时间', dataIndex: 'create_time'},
      { title: '朋友圈类型', dataIndex: 'auto_reply_type_text'},
      { title: '回复内容', dataIndex: 'reply_content', render: (text) => contentSubRender(text)},
      { title: '状态', dataIndex: 'audit_status_text', render: (text, record) => {
        if(record['audit_status'] == 'AUDITED') {
          return <Tag color="green">{text}</Tag>;
        } else if(record['audit_status'] == 'AUDITING') {
          return <Tag color="red">{text}</Tag>;
        }
        return text;
      }},
      { title: '审核结果', dataIndex: 'audit_result_text', render: (text, record) => {
        if(record['audit_result'] == 'T') {
          return <Tag color="green">{text}</Tag>
        } else if(record['audit_result'] == 'F') {
          return <Tag color="red">{text}</Tag>
        }
        return text;
      }},
      { title: '审核时间', dataIndex: 'audit_time'},
      { title: '操作', key:'operation', dataIndex:'audit_result', width: 140, fixed: 'right', render: (text, record) => (
          <span hidden={!!text}>
            <a href="javascript:void(0)" onClick={this.auditChannelReply.bind(this,record, "T")}>允许使用</a>
            <span className="ant-divider"></span>
            <a href="javascript:void(0)" onClick={this.auditChannelReply.bind(this,record, "F")}>拒绝使用</a>
          </span>
      )}
    ];
  }
  handleSearch(newSearchObj){
    this.refs.commonTable.queryTableData(newSearchObj);
  }
  auditChannelReply(record, audit_result) {
    let content = "确认允许使用操作后不可撤销，是否操作?", successContent = "允许成功!";
    if(audit_result === 'F') {
      content = "确认拒绝使用操作后不可撤销，是否操作?";
      successContent = "拒绝成功!";
    }
    Confirm(function(){
      auditChannelReply({
        channel_id: record['channel_id'],
        auto_reply_type: record['auto_reply_type'],
        audit_result
      }).then(({jsonResult}) => {
        Success(successContent);
        this.refs.commonTable.refreshTable();
      })
    }.bind(this), content);
  }
  render() {
    return (
      <div>
        <CheckReplyMsgQueryFrom onSearchChannel={this.handleSearch} />
        <CommonTable ref="commonTable"
          columns={this.columns}
          fetchTableDataMethod={queryChannelReplyListForAudit}
          rowKey={record => (record['channel_id'] + record['auto_reply_type'])} />
      </div>
    );
  }
}
