/*发朋友圈列表*/
import React, { Component } from 'react';
import { Form, Row, Col, Input, Select, Button, DatePicker } from 'antd';
import CommonTable from '../Commons/CommonTable';
import CommonSelect from '../Commons/CommonSelect';
import AdPublishDetailInfoModal from './AdPublishDetailInfoModal';
import { queryPublishAd, delPublishAd, delAndResendPublishAd ,queryAnchorToAd} from '../../services/ads';
import { Confirm, Success } from '../Commons/CommonConstants';
import {AdsStatusRender, AuditResultRender, PublishTypeRender, PutTypeRender} from './AdsStatusRender';
import ChannelSelectField from '../Operations/ChannelSelectField';
import resourceManage from '../ResourceManage';
const FormItem = Form.Item;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;

class WcSearchForm extends Component {
  constructor(props) {
    super(props);
    this.state={
      anchorList:[],
    };
    this.handleSearch = this.handleSearch.bind(this);
    this.filterAnchorOption=this.filterAnchorOption.bind(this);
  }

  handleSearch(e) {
    e.preventDefault();
    let values = this.props.form.getFieldsValue();
    if(!!values['channel_id']) {
      values['channel_id'] = values['channel_id']['key'];
    }
    let dateRange = values[ 'audit_time' ];
    if ( dateRange && dateRange.length > 0 ) {
      dateRange[ 0 ] && (values['audit_date_begin'] = dateRange[0].format('YYYY-MM-DD HH:mm:ss'));
      dateRange[ 1 ] && (values['audit_date_end'] = dateRange[1].format('YYYY-MM-DD HH:mm:ss'));
    }
    delete values['audit_time']
    this.props.onSearchOptr(values);
  }

  filterAnchorOption(input, option){
    if(!input) return true;
    const inputValue = input.toLowerCase();
    const {value, children} = option.props;
    return value.toLowerCase() == inputValue || children.toLowerCase().indexOf(inputValue) >= 0;
  }

  componentDidMount(){
    queryAnchorToAd().then(({jsonResult}) => {
      if(jsonResult.length > 0) {
        this.setState({
          anchorList: jsonResult
        });
      }
    });
  }

  render() {
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const formItemLayout = {
      labelCol: {　span: 10　},
      wrapperCol: {　span: 14　}
    };
    const {anchorList} =this.state;
    return (
        <Form horizontal onSubmit={this.handleSearch} className="ant-advanced-search-form">
          <Row gutter={16}>
            <Col sm={8}>
              <FormItem label="广告名称" {...formItemLayout}>
                {getFieldDecorator('ad_name')(
                  <Input placeholder="请输入广告名称" />
                )}
              </FormItem>
            </Col>
            <Col sm={8}>
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
            <Col sm={8}>
              <ChannelSelectField
                getFieldDecorator={getFieldDecorator('channel_id', {rules:[{type:'object'}]})}
                formItem={{label:'商业渠道', ...formItemLayout}} />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col sm={8}>
                <FormItem label="选择主播" {...formItemLayout} >
                  {getFieldDecorator('show_anchor_id')(
                    <Select
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      filterOption={this.filterAnchorOption}
                      placeholder="请选择主播"
                       >
                      {
                        anchorList.map(anchor => (
                          <Option value={anchor.anchor_id}>{anchor.anchor_name}</Option>
                        ))
                      }
                    </Select>
                  )}
                </FormItem>
            </Col>
            <Col sm={8}>
              <FormItem label="发布类型" {...formItemLayout} >
                <CommonSelect placeholder="请选择发布类型" item_key="PublishType"
                  getFieldDecorator={getFieldDecorator('publish_type')}/>
              </FormItem>
            </Col>
            <Col sm={8}>
              <FormItem label="投放类型" {...formItemLayout} >
                <CommonSelect placeholder="请选择投放类型" item_key="PutType" getFieldDecorator={getFieldDecorator('put_type')}/>
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
           <Col sm={8}>
              <FormItem label="状态" {...formItemLayout}>
                <CommonSelect placeholder="请选择状态" item_key="ShowStatus" getFieldDecorator={getFieldDecorator('status')}/>
              </FormItem>
           </Col>
            <Col sm={8}>
              <FormItem label="审核结果" {...formItemLayout}>
                <CommonSelect placeholder="请选择审核结果" item_key="AuditResult"
                  getFieldDecorator={getFieldDecorator('audit_result')}/>
              </FormItem>
            </Col>
            <Col sm={8}>
              <FormItem label="发布人" {...formItemLayout}>
                {getFieldDecorator('create_optr_name')(
                  <Input placeholder="请输入发布人" />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col sm={8}>
              <FormItem label="发朋友圈类型" {...formItemLayout}>
                {getFieldDecorator('show_sns_type')(
                  <Select
                    allowClear
                    placeholder="请选择朋友圈类型">
                    <Option value="notify">开播</Option>
                    <Option value="common">日常</Option>
                    <Option value="lifephoto">生活照</Option>
                  </Select>
                  )}
              </FormItem>
            </Col>
            <Col sm={8}>
              <FormItem label="朋友圈ID" {...formItemLayout}>
                {getFieldDecorator('publish_job_id')(
                  <Input placeholder="请输入朋友圈ID" />
                )}
              </FormItem>
            </Col>
            <Col sm={8}>
              <FormItem label="文本信息" {...formItemLayout}>
                {getFieldDecorator('text_content')(
                  <Input placeholder="请输入朋友圈文本信息搜索" />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col sm={8}>
              <FormItem label="点赞量" {...formItemLayout}>
                {getFieldDecorator('digg_sort_type')(
                  <Select
                    allowClear
                    placeholder="请选择点赞数">
                    <Option value="">全部</Option>
                    <Option value="desc">多到少</Option>
                    <Option value="asc">少到多</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col sm={8}>
              <FormItem label="评论量" {...formItemLayout}>
                {getFieldDecorator('comment_sort_type')(
                  <Select
                    allowClear
                    placeholder="请选择评论数">
                    <Option value="">全部</Option>
                    <Option value="desc">多到少</Option>
                    <Option value="asc">少到多</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col sm={8}>
              <FormItem label="审核时段" {...formItemLayout}>
                {getFieldDecorator('audit_time')(
                  <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col sm={8}>
              <FormItem label="备注" {...formItemLayout}>
                {getFieldDecorator('remark')(
                  <Input placeholder="请输入备注" />
                )}
              </FormItem>
            </Col>
            <Col sm={8} offset={8}>
              <FormItem style={{ float: 'right' }}>
                <Button icon="search" type="primary" size="large" htmlType="submit">搜索</Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
    );
  }
}




WcSearchForm = Form.create()(WcSearchForm);

export default class WeChatADList extends Component {
  constructor(props) {
    super(props);
    this.handleSearch = this.handleSearch.bind(this);

    const activeBtnIds = resourceManage.getActivedBtnIds();
    const idDetailShow = activeBtnIds.indexOf("14-1") == -1;
    const idDelShow = activeBtnIds.indexOf("14-2") == -1;
    const idDelResendShow = activeBtnIds.indexOf("14-3") == -1;
    this.columns = [
      {title: '渠道名称',         dataIndex: 'channel_name', width: 120},
      {title: '提交时间',         dataIndex: 'create_time',  width: 135},
      {title: '状态',             dataIndex:'status', width: 85,
        render: (text, record) => AdsStatusRender(text, record['status_text'])
      },
      {title: '审核结果',         dataIndex:'audit_result', width: 85,
        render: (text, record) => AuditResultRender(text, record['audit_result_text'])
      },
      {title: '投放进度',         dataIndex: 'put_progress', width: 75, render: (text) => (`${text}%`)},
      {title: '广告名称',         dataIndex: 'ad_name',width: 135},
      {title: '发布类型',         dataIndex: 'publish_type', width: 75,
        render: (text, record) => PublishTypeRender(text, record['publish_type_text'])
      },
      {title: '投放类型',         dataIndex: 'put_type', width: 75,
        render: (text, record) => PutTypeRender(text, record['put_type_text'])},
      {title: '已发布/已删除', width: 95,    dataIndex: 'has_publish_cnt', render: (text, record) => (
          `${record['has_publish_cnt']}/${record['delete_publish_cnt']}个`
      )},
      {title: '累计点赞',         dataIndex: 'digg_cnt', width: 70},
      {title: '累计评论',         dataIndex: 'comment_cnt', width: 70},
      {title: '主播',         dataIndex: 'anchor_name', width: 100},
      {title: '备注',         dataIndex: 'remark'},
      {title: '自评论',         dataIndex: 'self_sns_text', width: 70},
      {title: '预定发圈时间',         dataIndex: 'plan_send_time', width: 135},
      {title: '审核时间',         dataIndex: 'audit_time', width: 135},
      {title: '审核人',         dataIndex: 'audit_optr_name', width: 100},
      {title: '发布人',         dataIndex: 'create_optr_name', width: 100},
      {title: '朋友圈Id',         dataIndex: 'publish_job_id',width:135},
      // {title: '朋友圈Id',         dataIndex: 'publish_job_id',width:135 render: (text, record) => (
      //   <span style={{display:'inline-block',width:135,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{text}</span>
      // )},
      {title: '发布SN',         dataIndex: 'publish_sn', width: 100},
      {title: '点赞/评论更新时间', dataIndex: 'last_interact_time', width: 135},
      {title: '操作', width: 200, fixed: 'right', render: (text, record) => (
        <span>
          <a href="javascript:void(0)" hidden={idDetailShow} onClick={this.openDetailInfo.bind(this, record['publish_sn'])}>朋友圈详情</a>
          {/* 当状态是全部展示和部分删除时,才能删除 */}
          <span hidden={idDelShow || (record['status'] != 'ALLSHOW' &&　record['status'] != 'PARTDELETE')}>
            <span className="ant-divider" />
            <a href="javascript:void(0)" onClick={this.delete.bind(this, record)}>删除</a>
          </span>
          <span hidden={idDelResendShow || (record['status'] != 'ALLSHOW' &&　record['status'] != 'PARTDELETE')}>
            <span className="ant-divider" />
            <a href="javascript:void(0)" onClick={this.deleteAndResend.bind(this, record)}>删除并重发</a>
          </span>
        </span>
      )}
    ];
  }

  openDetailInfo(publish_sn) {
    this.refs.adPublishDetailInfoModal.show(publish_sn);
  }
  delete(record){
    console.log('WeChatADList => delete => ', record);
    Confirm(function(){
      delPublishAd({publish_sn: record['publish_sn']}).then(({jsonResult}) => {
        Success('删除成功');
        this.refs.commonTable.refreshTable();
      });
    }.bind(this), '有可能存在微信号异常导致的无法删除全部朋友圈的情况，属于正常现象，请了解。确认执行删除吗？');
  }

  deleteAndResend(record) {
    console.log('WeChatADList => deleteAndResend => ', record);
    Confirm(function(){
      delAndResendPublishAd({publish_sn: record['publish_sn']}).then(({jsonResult}) => {
        Success('删除并重发成功');
        this.refs.commonTable.refreshTable();
      });
    }.bind(this), '有可能存在微信号异常导致的无法删除全部朋友圈的情况，属于正常现象，请了解。确认执行删除并重发吗？');
  }

  handleSearch(newSearchObj) {
    console.log('WeChatADList => handleSearch => 收到新的搜索数据', this);
    this.refs.commonTable.queryTableData(newSearchObj);
  }
  componentDidMount() {
  if(!!this.props.location.state){
    const {condition} = this.props.location.state;
    let value={
      ad_name:condition.ad_name,
      put_type:condition.put_type,
      publish_type:condition.publish_type,
      remark:condition.remark
    }
    if(!!condition) {
      this.wcSearchForm.setFieldsValue({
        ad_name:condition.ad_name,
        put_type:condition.put_type,
        publish_type:condition.publish_type,
        remark:condition.remark
      });
    }
    this.refs.commonTable.queryTableData(value);
  }
}

  render() {
    console.log('WeChatADList => render');
    return (
      <div>
        <WcSearchForm  ref={(form) => { this.wcSearchForm = form }} onSearchOptr = { this.handleSearch } />
        <CommonTable ref="commonTable" columns={ this.columns } rowKey="publish_sn" fetchTableDataMethod={ queryPublishAd } scroll={{x: 2470}}/>
        <AdPublishDetailInfoModal ref="adPublishDetailInfoModal" />
      </div>
    );
  }
}
