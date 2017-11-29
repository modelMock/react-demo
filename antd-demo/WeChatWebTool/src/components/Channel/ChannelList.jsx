/*渠道列表*/
import React, { Component, PropTypes} from 'react';
import { Table, Form, Row, Col, Button, Select, Input } from 'antd';
import CommonTable from '../Commons/CommonTable';
import CommonModal from '../Commons/CommonModal';
import { queryUserChannelList, updateChannelName } from '../../services/channel';
import { Confirm, Success, Errors, mobileValidate } from '../Commons/CommonConstants';
import resourceManage from '../ResourceManage';
const FormItem = Form.Item;
const Option = Select.Option;

class ChannelQueryForm extends Component{
  static propTypes = {
    form: PropTypes.object.isRequired,
    activedBtnIds: PropTypes.array,
    onSearchChannel: PropTypes.func.isRequired
  }
  constructor(props) {
    super(props);
    this.handleSearch = this.handleSearch.bind(this);
  }
  handleSearch(e){
    e.preventDefault();
    this.props.onSearchChannel(this.props.form.getFieldsValue());
  }
  render(){
    console.log("ClannelQueryFrom => render ");
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14 }
    };
    const getFieldDecorator = this.props.form.getFieldDecorator;

    //新增渠道按钮是否显示
    const btnHideStyle = this.props.activedBtnIds.indexOf("11-1") >= 0 ? {} : {display: 'none'};
    return (
      <Form horizontal className="ant-advanced-search-form" onSubmit={this.handleSearch}>
        <Row gutter={16}>
          <Col sm={8}>
            <FormItem label="渠道代码" {...formItemLayout}>
              {getFieldDecorator('channel_code')(
                <Input placeholder="请输入渠道代码"></Input>
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="渠道名称" {...formItemLayout}>
              {getFieldDecorator('channel_name')(
                <Input placeholder="请输入渠道名称"></Input>
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="好友总数" {...formItemLayout}>
              {getFieldDecorator('sort_type')(
                <Select placeholder="请选择好友总数" allowClear>
                  <Option value='desc'>多到少</Option>
                  <Option value='asc'>少到多</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12} offset={12} style={{ textAlign: 'right' }}>
            <Button icon="plus" size="large" onClick={this.props.addChannel} style={btnHideStyle}>添加渠道</Button>
            <Button type="primary" icon="search" size="large" htmlType="submit">搜索</Button>
          </Col>
        </Row>
      </Form>
    )
  }
}

ChannelQueryForm = Form.create()(ChannelQueryForm);

class ChannelList extends Component {
  constructor(props) {
    super(props);
    this.state={
      title: '',
      disabled: false
    };

    this.handleSearchChannel = this.handleSearchChannel.bind(this);
    this.addChannel = this.addChannel.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);

    //编辑渠道按钮是否显示
    const isShow = resourceManage.getActivedBtnIds().indexOf("11-2") >= 0;
    this.columns = [
      { title: '添加时间', dataIndex: 'create_time',key:'create_time', width: 135},
      { title: '渠道代码', dataIndex: 'channel_code', width: 100},
      { title: '渠道名称', dataIndex: 'channel_name'},
      { title: '运营号总数/正常数', dataIndex: 'operation_total', render:(text, record) => (
          `${text}/${record['operation_used']}个`
      ), width: 150},
      { title: '微信好友总数/正常数', dataIndex: 'friend_total', render:(text, record) => (
          `${text}/${record['friend_used']}个`
      ), width: 150},
      { title: '渠道管理员账号', dataIndex: 'login_account', width: 120},
      {
        title: '操作',
        key: 'channel',
        fixed: 'right',
        width: 80,
        render: (text, record) => {
          if(isShow)
            return <a href="javascript:void(0)" onClick={this.editChannel.bind(this, record)}>编辑渠道</a>;
          return '';
        }
      }
    ];
  }

  handleSearchChannel(newSearchObj){
    this.refs.commonTable.queryTableData(newSearchObj);
  }
  addChannel(){
    this.setState({
      title:"新增渠道", disabled: false
    });
    this.refs.commonModal.show();
  }
  editChannel(record){
    this.setState({
      title:"编辑渠道", disabled: true
    })
    this.props.form.setFieldsValue(record);
    this.refs.commonModal.show();
  }
  handleOk() {
    this.props.form.validateFields( (errors,values)=>{
      if (!!errors) return;
      const content = <div>确认{this.state.title}<span style={{color:'blue'}}>[{values['channel_name']}]</span>吗?</div>;
      Confirm(function(){
        updateChannelName(values).then( ({jsonResult}) => {
          let info = `${this.state.title}成功`;
          if(!!jsonResult['account']) {
            info = <div>
              <p>{this.state.title}成功</p>
              <p>管理员姓名：{jsonResult['optr_name']}</p>
              <p>新建账号名：{jsonResult['account']}</p>
              <p>密&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;码：{jsonResult['password']}</p>
            </div>;
          }
          Success(info);
          this.refs.commonTable.refreshTable();
          this.handleCancel();
        })
      }.bind(this), content);
    });
  }

  handleCancel(){
    this.refs.commonModal.hide();
    this.props.form.resetFields();
  }

  render() {
    console.log('ChannelList => render ', this.state);
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const { title, disabled } = this.state;

    const isShowOptrNameItem = disabled ? {display:'none'} : {};

    return (
      <div>
        <ChannelQueryForm activedBtnIds = {resourceManage.getActivedBtnIds()}
          onSearchChannel={this.handleSearchChannel} addChannel={this.addChannel} />
        <CommonTable ref="commonTable" columns={this.columns}
          fetchTableDataMethod={queryUserChannelList} scroll={{x: 900}} rowKey="channel_id"/>
        <CommonModal ref="commonModal" title={title} onOk={this.handleOk} onCancel={this.handleCancel}>
          <Form horizontal>
            {getFieldDecorator('channel_id')(<Input type="hidden"/>)}
            <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 12 }} label="渠道名称" hasFeedback>
              {getFieldDecorator('channel_name', {
                rules: [
                  { required: true, message: '请输入渠道名称' },
                ]
              })(
                <Input placeholder="请输入渠道名称" />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 12 }} label="管理员姓名" hasFeedback style={isShowOptrNameItem}>
              {getFieldDecorator('optr_name', {
                rules:[{ required: !disabled, message: '请输入管理员姓名' }]
              })(
                <Input disabled={disabled} placeholder="请输入管理员姓名" />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 12 }} label="管理员手机号" hasFeedback>
              {getFieldDecorator('login_account', {
                rules:[
                  { required: !disabled, message: '请输入管理员手机号' },
                  { validator: mobileValidate}
                ]
              })(
                <Input disabled={disabled} placeholder="请输入管理员手机号" />
              )}
            </FormItem>
          </Form>
        </CommonModal>
      </div>
    );
  }
}

export default Form.create()(ChannelList);
