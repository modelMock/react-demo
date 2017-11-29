import React from 'react';
import { Form, Row, Col, Input, Select, Button, Table ,Modal} from 'antd';
import CommonTable from '../Commons/CommonTable';
import {queryShowAnchorList,saveCustomAdBindOper,saveCustomAdCancelOper} from '../../services/showAnchor';
import {Confirm, Success,Errors} from '../Commons/CommonConstants';
const FormItem = Form.Item;
const Option = Select.Option;

/**
 * 绑定主播流量弹出层
 */
class CustomAdBindOper extends React.Component{
  constructor(props){
    super(props);
    this.state={
      visible: props.customAdBindOperVisible,
    };
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }
  handleOk(){
    this.props.form.validateFields((errors, values) => {
      if(!!errors){
        return;
      }
      values['anchor_id']=this.props.record.anchor_id;
      Confirm(function(){
        saveCustomAdBindOper(values).then(({jsonResult}) => {
          Success("绑定成功");
          this.handleCancel();
          this.props.handleRefresh();
        });
      }.bind(this), "确定绑定主播流量吗?");
    });
  }
  handleCancel(){
    this.setState({
      visible: false,
    });
    this.props.onUpdateVisible();
  }
  render(){
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 14}
    }
    const {getFieldDecorator} = this.props.form;
    const {visible} = this.state;
    return (
      <Modal visible={visible} maskClosable={false} title={`绑定流量`}
        onOk={this.handleOk} onCancel={this.handleCancel}
        footer={[
          <Button icon="poweroff" size="large" onClick={this.handleCancel}>取消</Button>,
          <Button type="primary" icon="check" size="large" onClick={this.handleOk}>提交</Button>
        ]}>
        <Form horizontal >
          <FormItem label="主播名称" {...formItemLayout} style={{marginTop: -12}}>
            <p>
              {this.props.record.anchor_name}
           </p>
          </FormItem>
          <FormItem label="绑定类型" {...formItemLayout}>
            {getFieldDecorator('fluxBindType',{rules: [{required: true, message:"请选择绑定类型"}]　})(
              <Select allowClear >
                <Select.Option value="day">白天</Select.Option>
                <Select.Option value="night">夜晚</Select.Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="绑定次数" {...formItemLayout}>
            {getFieldDecorator('bind_cnt', {rules: [{required: true, message:"请输入绑定次数"}]　})(
              <Input  placeholder="请输入绑定次数"/>
            )}
           </FormItem>
        </Form>
      </Modal>
    );
  }
}
CustomAdBindOper= Form.create()(CustomAdBindOper);
/**
 * 解绑主播流量弹出层
 */
class CustomAdCancelOper extends React.Component{
  constructor(props){
    super(props);
    this.state={
      visible: props.customAdCancelOperVisible,
    };
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }
  handleOk(){
    this.props.form.validateFields((errors, values) => {
      if(!!errors){
        return;
      }
      values['anchor_id']=this.props.record.anchor_id;
      Confirm(function(){
        saveCustomAdCancelOper(values).then(({jsonResult}) => {
          Success("解绑成功");
          this.handleCancel();
          this.props.handleRefresh();
        });
      }.bind(this), "确定解绑主播流量吗?");
    });
  }
  handleCancel(){
    this.setState({
      visible: false,
    });
    this.props.onUpdateVisible();
  }
  render(){
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 14}
    }
    const {getFieldDecorator} = this.props.form;
    const {visible} = this.state;
    return (
      <Modal visible={visible} maskClosable={false} title={`解绑流量`}
        onOk={this.handleOk} onCancel={this.handleCancel}
        footer={[
          <Button icon="poweroff" size="large" onClick={this.handleCancel}>取消</Button>,
          <Button type="primary" icon="check" size="large" onClick={this.handleOk}>提交</Button>
        ]}>
        <Form horizontal >
          <FormItem label="主播名称" {...formItemLayout} style={{marginTop: -12}}>
            <p>
              {this.props.record.anchor_name}
           </p>
          </FormItem>
          <FormItem label="绑定类型" {...formItemLayout}>
            {getFieldDecorator('fluxBindType',{rules: [{required: true, message:"请选择绑定类型"}]　})(
              <Select allowClear >
                <Select.Option value="day">白天</Select.Option>
                <Select.Option value="night">夜晚</Select.Option>
              </Select>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
CustomAdCancelOper= Form.create()(CustomAdCancelOper);

/**
 * 主播列表搜索表单
 */
class HostListFrom extends React.Component{
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
handleSubmit(e){
  e.preventDefault();
  this.props.onSearch(this.props.form.getFieldsValue());
}
  render(){
      const formItemLayout = {
          labelCol: {span: 8},
          wrapperCol: {span: 16},
      };
      const {getFieldDecorator} = this.props.form;
      return (
          <Form horizontal onSubmit={this.handleSubmit} className="ant-advanced-search-form">
              <Row gutter={16}>
                  <Col span={8}>
                      <FormItem label="主播名字" {...formItemLayout}>
                          {getFieldDecorator('anchor_name')(
                              <Input placeholder="请输入主播名字" />
                          )}
                      </FormItem>
                    <FormItem label="状态" {...formItemLayout}>
                      {getFieldDecorator('status')(
                        <Select allowClear placeholder="请选择状态">
                          <Option value="">全部</Option>
                          <Option value="T">有效</Option>
                          <Option value="F">无效</Option>
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem label="客服名" {...formItemLayout}>
                      {getFieldDecorator('service_optr_name')(
                          <Input placeholder="请输入客服名" />
                      )}
                    </FormItem>
                    </Col>
                  <Col span={8}>
                    <Button style={{marginBottom: 16,marginLeft:20}} type="primary" icon="search"  htmlType="submit">搜索</Button>
                  </Col>
              </Row>
          </Form>
      );

     }
}
HostListFrom= Form.create()(HostListFrom);

export default class HostList extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      selectedRowKeys: [], //表格选中行
      selectedRows:[],
      record:'',
      customAdBindOperVisible:false,
      customAdCancelOperVisible:false,
    }
    this.columns=[
      {title: '主播名称', dataIndex: 'anchor_name', width: 80},
      {title: '主播ID', dataIndex: 'anchor_id', width: 130},
      {title: '主播状态', dataIndex: 'status_text',width: 80},
      {title: '创建时间', dataIndex: 'create_time', width: 130},
      {title: '性别', dataIndex: 'sex_text',width: 80},
      {title: '城市', dataIndex: 'city_id',width: 80},
      {title: '客服名称', dataIndex: 'optr_name',width: 80},
      {title: '所属客服', dataIndex: 'service_optr_id',width: 80},
      {title: '运营号数', dataIndex: 'operationCnt',width: 80},
      {title: '3天每日加粉数', dataIndex: 'friendDay3Cnt',width: 120},
      {title: '主播播出时间', dataIndex: 'play_time', width: 130},
      {title: '主播地址', dataIndex: 'room_url'},
      {title: '好友数', dataIndex: 'friendCnt',width: 80},
      {title: '白天流量绑定次数', dataIndex: 'day_ad_init_cnt',width: 80},
      {title: '白天流量剩余次数', dataIndex: 'day_ad_remain_cnt',width: 80},
      {title: '白天流量使用总次数', dataIndex: 'day_ad_total_cnt',width: 80},
      {title: '午夜流量绑定次数', dataIndex: 'night_ad_init_cnt',width: 80},
      {title: '午夜流量剩余次数', dataIndex: 'night_ad_remain_cnt',width: 80},
      {title: '午夜流量使用总次数', dataIndex: 'night_ad_total_cnt',width: 80},
      {title: '头像', dataIndex: 'head_url',width: 130,render: (text) => {
        return <img src={text} with="80" height="80"/>
      }},
      {title: '操作',  fixed: 'right',width: 200,render: (text, record) => {
          return  <span>
                    <a href="javascript:void(0)" onClick={this.onCustomAdBindOper.bind(this, record)}>绑定流量</a>
                    <span className="ant-divider" />
                    <a href="javascript:void(0)" onClick={this.onCustomAdCancelOper.bind(this, record)}>解绑流量</a>
                  </span>
      }},
    ];
    this.handleSearch=this.handleSearch.bind(this);
    this.onUpdateVisible=this.onUpdateVisible.bind(this);
    this.handleRefresh=this.handleRefresh.bind(this);
  }
  //绑定流量
  onCustomAdBindOper(record){
    this.setState({
      record:record,
      customAdBindOperVisible:true
    });
  }
  //解绑流量
  onCustomAdCancelOper(record){
    this.setState({
      record:record,
      customAdCancelOperVisible:true
    });
  }
  //更新弹出框Visible
  onUpdateVisible(){
    this.setState({customAdBindOperVisible: false, record: '',customAdCancelOperVisible:false});
  }
  //搜索数据
  handleSearch(params) {
    this.refs.commonTable.queryTableData(params);
  }
  renderSelectModal(){
    const {customAdBindOperVisible, customAdCancelOperVisible,record} = this.state;
    if(customAdBindOperVisible === true){
      return <CustomAdBindOper record={record} customAdBindOperVisible={customAdBindOperVisible} onUpdateVisible={this.onUpdateVisible} handleRefresh={this.handleRefresh}/>
    }else if(customAdCancelOperVisible === true){
      return <CustomAdCancelOper record={record} customAdCancelOperVisible={customAdCancelOperVisible} onUpdateVisible={this.onUpdateVisible} handleRefresh={this.handleRefresh}/>
    }
    return null;
  }
  //所有选中行记录集合
  handleRowChange(selectedRowKeys, selectedRows) {
    this.setState({selectedRowKeys,selectedRows});
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  }
  //刷新数据
  handleRefresh(){
    this.refs.commonTable.refreshTable();
    this.setState({
      selectedRowKeys:[],
      selectedRows:[]
    })
  }
  render(){
    const {selectedRowKeys,selectedRows} = this.state;
    return (
      <div>
        {this.renderSelectModal()}
        <HostListFrom  onSearch={this.handleSearch}/>
        <CommonTable
          rowSelection = {{
            selectedRowKeys,
            onChange: this.handleRowChange.bind(this),
          }}
          ref="commonTable"
          fetchTableDataMethod={queryShowAnchorList}
          columns={this.columns}
          rowKey="cluster_sn"
          scroll={{x: 2200}}
        />
      </div>
    );
  }

}
