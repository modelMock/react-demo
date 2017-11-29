/*广告主题列表*/
import React, { Component, PropTypes} from 'react';
import {Form, Row, Col, Input, Button} from 'antd';
import CommonTable from '../Commons/CommonTable.jsx';
import { queryAdByName, updateAdName } from '../../services/ads';
import { Confirm, Success, Errors, contentSubRender } from '../Commons/CommonConstants';
import CommonModal from '../Commons/CommonModal';
import resourceManage from '../ResourceManage';
import ChannelSelectField from '../Operations/ChannelSelectField';
import PureRenderMixin from 'react-addons-pure-render-mixin';
const FormItem = Form.Item;

class AdNameSearchForm extends Component {
  constructor(props) {
    super(props);
    this.handleSearch = this.handleSearch.bind(this);
  }

  handleSearch(e) {
    e.preventDefault();
    let values = this.props.form.getFieldsValue();
    if(!!values['channel_id']) {
      values['channel_id'] = values['channel_id']['key'];
    }
    this.props.onSearchAd(values);
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const getFieldDecorator = this.props.form.getFieldDecorator;

    const btnStyle = resourceManage.getActivedBtnIds().indexOf("13-1") >= 0 ? {} : {display: 'none'};

    return (
      <Form horizontal className="ant-advanced-search-form" onSubmit={this.handleSearch}>
        <Row gutter={16}>
          <Col sm={8}>
            <ChannelSelectField getFieldDecorator={getFieldDecorator('channel_id', { rules: [{type:'object'}] })}
              formItem={{label:'商业渠道', ...formItemLayout}} />
          </Col>
          <Col sm={8}>
            <FormItem label="广告名称" {...formItemLayout}>
              {getFieldDecorator('ad_name')(
                <Input placeholder="请输入广告名称"/>
              )}
            </FormItem>
          </Col>
          <Col sm={7} offset={1}>
            <Button type="primary" icon="search" htmlType="submit" size="large">搜索</Button>
            <Button icon="plus" size="large"
              onClick={this.props.onAddAd} style={btnStyle}>添加广告</Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

AdNameSearchForm = Form.create()(AdNameSearchForm);

class AdvertisingList extends Component {
  constructor(props) {
    super(props);
    this.state={
      title:'',   //添加、编辑弹出框标题
    };

    this.handleAdd = this.handleAdd.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);

    const isShow = resourceManage.getActivedBtnIds().indexOf("13-2") == -1;
    this.columns = [
      {title: '渠道名称', dataIndex: 'channel_name', width: 150},
      {title: '添加时间', dataIndex: 'create_time',  width: 135},
      {title: '广告名称', dataIndex: 'ad_name', width: 150},
      {title: '已发/已删朋友圈', dataIndex: 'has_publish_cnt', render: (text, record) => (
            `${text}/${record['delete_publish_cnt']}个`
      ), width: 110},
      /*{title: '累计互动好友', render: (text, record) => (
            record['comment_cnt'] + record['digg_cnt']
      ), width: 100},
      {title: '聊天互动好友',  dataIndex: 'hand_mark_cnt', width: 100},
      {title: '朋友圈互动好友',  dataIndex: 'auto_mark_cnt', width: 110},*/
      {title: '朋友圈累计点赞', dataIndex: 'digg_cnt', width: 110},
      {title: '朋友圈累计评论', dataIndex: 'comment_cnt', width: 110},
      {title: '广告描述', dataIndex:'ad_desc', render: (text) => contentSubRender(text)},
      {title: '操作', key: 'ad_id', fixed: 'right', width: 70, render: (text, record) => {
        if(isShow) return '';
        return <span>
          <a href="javascript:void(0)" onClick={this.handleEdit.bind(this, record)}>编辑广告</a>
        </span>
      }}
    ];
  }

  handleAdd() {
    this.setState({title: '添加广告主题'});
    this.refs.commonModal.show();
  }

  handleEdit(record) {
    this.setState({title: '编辑广告主题'});
    this.props.form.setFieldsValue(record);
    this.refs.commonModal.show();
  }

  handleSearch(params) {
    this.refs.commonTable.queryTableData(params);
  }

  handleOk() {
    this.props.form.validateFields( (errors, values) => {
      if(!!errors) return;
      const content = <div>确认{this.state.title}<span style={{color:'blue'}}>[{values['ad_name']}]</span>吗?</div>;
      Confirm(function(){
        updateAdName(values).then(({jsonResult}) => {
          Success(`${this.state.title}成功!`);
          this.props.form.resetFields();
          this.refs.commonTable.refreshTable();
          this.refs.commonModal.hide();
        })
      }.bind(this), content);
    });
  }
  handleCancel() {
    this.props.form.resetFields();
    this.refs.commonModal.hide();
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 12 },
    };
    return (
      <div>
        <AdNameSearchForm onSearchAd={this.handleSearch} onAddAd={this.handleAdd}/>
        <CommonTable ref="commonTable" columns = { this.columns } rowKey = "ad_id" scroll={{x: 1250}}
          fetchTableDataMethod = { queryAdByName } />
        <CommonModal title={this.state.title} ref="commonModal" onOk={this.handleOk} onCancel={this.handleCancel}>
          <Form horizontal>
            {getFieldDecorator('ad_id')(<Input type="hidden"/>)}
            <FormItem {...formItemLayout} label="广告名称" hasFeedback >
              {getFieldDecorator('ad_name', {
                rules: [
                  { required: true, message: '广告名称不能为空' }
                ],
              })(
                <Input placeholder="请输入广告名称" />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="广告描述">
              {getFieldDecorator('ad_desc')(
                <Input type="textarea" rows={4} placeholder="请输入广告描述" />
              )}
            </FormItem>
          </Form>
        </CommonModal>
      </div>
    );
  }
}

export default Form.create()(AdvertisingList);
