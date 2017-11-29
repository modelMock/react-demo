/*查看自动回复信息*/
import React, { Component, PropTypes} from 'react';
import {Button,Table,Input,Row,Col,Form} from 'antd';
import CommonTable from '../Commons/CommonTable.jsx';
import {Confirm, Success, Errors, contentSubRender} from '../Commons/CommonConstants';
import CommonModal from '../Commons/CommonModal';
import ChannelSelectField from '../Operations/ChannelSelectField';
import {queryChannelQuestionList, saveChannelQuestion, deleteChannelQuestion} from '../../services/replyMsgService';
import resourceManage from '../ResourceManage';
const FormItem = Form.Item;

class ViewReplyMsgQueryFrom extends Component{
  static propTypes = {
    form: PropTypes.object.isRequired,
    onSearchChannel: PropTypes.func.isRequired
  }
  constructor(props) {
    super(props);
    this.handleSearch = this.handleSearch.bind(this);
  }
  handleSearch(){
    let values = this.props.form.getFieldsValue();
    if(!!values['channel_id']) {
      values['channel_id'] = values['channel_id']['key'];
    }
    this.props.onSearchChannel(values);
  }

  render(){
    console.log("ViewReplyMsgQueryFrom => render");
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14　}
    };
    const btnStyle = resourceManage.getActivedBtnIds().indexOf("20-1") >= 0 ? {} : {display: 'none'};
    return (
      <Form horizontal className="ant-advanced-search-form">
        <Row gutter={16}>
          <Col sm={8}>
            <ChannelSelectField getFieldDecorator={getFieldDecorator('channel_id', {rules:[{type:'object'}]})}
              formItem={{label:'商业渠道', ...formItemLayout}} />
          </Col>
          <Col sm={8}>
            <FormItem label="问题描述" {...formItemLayout}>
              {getFieldDecorator('question_content')(<Input placeholder="请输入问题描述" />)}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="回复内容" {...formItemLayout}>
              {getFieldDecorator('reply_content')(<Input placeholder="请输入回复内容"/>)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={12} offset={12} style={{ textAlign: 'right' }}>
            <Button icon="plus" size="large" onClick={this.props.onAddReplyMsg} style={btnStyle}>新增</Button>
            <Button type="primary" htmlType="submit" icon="search" size="large" onClick={this.handleSearch}>搜索</Button>
          </Col>
        </Row>
      </Form>
    )
  }
}
ViewReplyMsgQueryFrom = Form.create()(ViewReplyMsgQueryFrom);

class ViewReplyMsg extends Component {
  constructor(props) {
    super(props);
    this.state={
      title: ''
    }
    this.handleSearch = this.handleSearch.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.onAddReplyMsg = this.onAddReplyMsg.bind(this);

    const activeBtnIds = resourceManage.getActivedBtnIds();
    const isEditShow = activeBtnIds.indexOf('20-2') == -1;
    const isDelShow = activeBtnIds.indexOf('20-3') == -1;

    this.columns = [
      { title: '渠道名称', dataIndex: 'channel_name', width: 150},
      { title: '问题描述', dataIndex: 'question_content', width: 350, render:(text) => contentSubRender(text)},
      { title: '回复内容', dataIndex: 'reply_content', render:(text) => contentSubRender(text)},
      {
        title: '操作',
        key: 'question_sn',
        dataIndex: 'question_sn',
        fixed: 'right',
        width: 100,
        render: (text, record) =>
        (
          <span>
            <span hidden={isEditShow}>
              <a href="javascript:void(0)" onClick={this.editReplyMsg.bind(this,record)}>编辑</a>
              <span className="ant-divider"></span>
            </span>
            <a href="javascript:void(0)" hidden={isDelShow} onClick={this.delReplyMsg.bind(this,record['question_sn'])}>删除</a>
        </span>
        )
      }
    ];
  }
  handleSearch(newSearchObj){
    this.refs.viewReplyMsgTable.queryTableData(newSearchObj);
  }
  delReplyMsg(question_sn){
    Confirm(function() {
      deleteChannelQuestion({question_sn}).then(({jsonResult}) => {
        Success("删除成功!");
        this.refs.viewReplyMsgTable.refreshTable();
      });
    }.bind(this), "确认要删除该问题配置吗?");
  }
  onAddReplyMsg() {
    this.setState({
      title:"添加自动回复信息"
    });
    this.refs.commonModal.show();
  }
  editReplyMsg(record, index){
    this.setState({
      title:"编辑自动回复信息"
    })
    this.props.form.setFieldsValue(record);
    this.refs.commonModal.show();
  }
  handleOk() {
    this.props.form.validateFields( (errors,values)=>{
      if (!!errors) return;
      Confirm(function(){
        saveChannelQuestion(values).then(({jsonResult}) => {
          Success(`${this.state.title}成功!`);
          this.refs.viewReplyMsgTable.refreshTable();
          this.handleCancel();
        });
      }.bind(this), `确定${this.state.title}吗?`);

    })
  }
  handleCancel(){
    this.props.form.resetFields();
    this.refs.commonModal.hide();
  }

  render() {
    const getFieldDecorator = this.props.form.getFieldDecorator;
    return (
      <div>
        <ViewReplyMsgQueryFrom onSearchChannel={this.handleSearch} onAddReplyMsg={this.onAddReplyMsg} />
        <CommonTable ref="viewReplyMsgTable" columns={this.columns}
          fetchTableDataMethod={queryChannelQuestionList} rowKey="question_sn" />
        <CommonModal ref="commonModal" title={this.state.title}
          onOk={this.handleOk} onCancel={this.handleCancel} width={700}>
          <Form horizontal>
            {getFieldDecorator('question_sn')(<Input type="hidden"/>)}
            <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} label="问题描述" hasFeedback>
              {getFieldDecorator('question_content', {
                rules: [
                  { required: true, message: '问题描述不能为空' },
                ],
              })(<Input placeholder="请输入问题描述" />)}
            </FormItem>
            <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} label="回复内容" hasFeedback>
              {getFieldDecorator('reply_content', {
                rules: [
                  { required: true, message: '回复内容不能为空' },
                ],
              })(<Input type="textarea" rows={4} placeholder="请输入回复内容" />)}
            </FormItem>
          </Form>
        </CommonModal>
      </div>
    );
  }
}

ViewReplyMsg = Form.create()(ViewReplyMsg);
export default ViewReplyMsg;
