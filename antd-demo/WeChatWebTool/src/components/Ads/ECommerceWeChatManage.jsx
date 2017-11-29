import React from 'react';
import { Form, Row, Col, Input, Select, Button, Table, Tag,Modal,InputNumber,DatePicker } from 'antd';
import CommonTable from '../Commons/CommonTable';
import {queryBusinessOperatorTeamList,queryClusterBusinessOperator} from '../../services/ads';
import SendWeChatSet from './SendWeChatSet'
import {hashHistory} from 'react-router';
const FormItem = Form.Item;
const Option = Select.Option;

class ECommerceWeChatManageFrom extends React.Component{
  constructor(props){
    super(props);
    this.state={
      openSendWeChatSetWindow:false,
      clusterBusinessOperator:[],
    };
    this.handleSubmit=this.handleSubmit.bind(this);
    this.onOpenSendWeChatSetWindow=this.onOpenSendWeChatSetWindow.bind(this);
    this.onCloseSendWeChatSetWindow=this.onCloseSendWeChatSetWindow.bind(this);
  }
  handleSubmit(e){
    e.preventDefault();
    let values=this.props.form.getFieldsValue();
    this.props.onSearch(values);
  }
  onOpenSendWeChatSetWindow(e){
    e.preventDefault();
    this.setState({openSendWeChatSetWindow:true})
  }
  onCloseSendWeChatSetWindow(){
    this.setState({openSendWeChatSetWindow:false})
  }
  renderSelectModal(){
    const {openSendWeChatSetWindow} = this.state;
    if(openSendWeChatSetWindow=== true){
      return <SendWeChatSet onOpen={openSendWeChatSetWindow} onClose={this.onCloseSendWeChatSetWindow}/>
    }
    return null;
  }
  componentDidMount(){
    //查询运营方
    queryClusterBusinessOperator().then(({jsonResult})=> {
        if(!jsonResult) return;
        this.setState({
        clusterBusinessOperator: jsonResult
      });
    });
  }
  render(){
    const formItemLayout = {
        labelCol: {span: 6},
        wrapperCol: {span: 16},
    };
    const {getFieldDecorator} = this.props.form;
    console.log(this.state.clusterBusinessOperator)
    return(
      <div>
        {this.renderSelectModal()}
      <Form horizontal onSubmit={this.handleSubmit}  className="ant-advanced-search-form">
          <Row gutter={16}>
              <Col span={8}>
                  <FormItem label="电商发圈分组" {...formItemLayout}>
                      {getFieldDecorator('team_name')(
                          <Input placeholder="请输入电商发圈分组" />
                      )}
                  </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="运营方" {...formItemLayout}>
                  {getFieldDecorator("business_operator")(
                    <Select allowClear placeholder="请选择运营方">
                      <Option value="">全部</Option>
                      {
                        this.state.clusterBusinessOperator.map((item, idx)=> <Option key={idx}
                                                                       value={`${item.item_value}`}>{item.item_name}</Option>)
                      }
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                  <FormItem label="运营号总数" {...formItemLayout}>
                      {getFieldDecorator('operation_count')(
                        <Select allowClear placeholder="请选择运营号总数">
                          <Option value="">全部</Option>
                          <Option value="0">0</Option>
                          <Option value="1">非0</Option>
                        </Select>
                      )}
                  </FormItem>
              </Col>
              <Col span={8} offset={16} style={{ textAlign: 'right' }}>
                <Button key="search" icon="search" type="primary" htmlType="submit">搜索</Button>
                <Button key="set"  type="primary"  onClick={this.onOpenSendWeChatSetWindow}>自动发圈设置</Button>
              </Col>
            </Row>
      </Form>
    </div>
    );
  }
}
ECommerceWeChatManageFrom= Form.create()(ECommerceWeChatManageFrom);

export default class ECommerceWeChatManage extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      selectedRowKeys: [], //表格选中行
    };
    this.columns=[
      {title: '添加时间', dataIndex: 'create_time', width: 130},
      {title: '分组编号', dataIndex: 'team_no', width: 120},
      {title: '分组名称', dataIndex: 'team_name', width: 120},
      {title: '运营方', dataIndex: 'business_operator_name', width: 120},
      {title: '运营号总数/正常数', dataIndex: 'operation_count', render:(text, record) => (
          `${text}/${record['normal_operation_count']}个`
      ), width: 130},
      {title: '好友总数/正常数', dataIndex: 'friend_count',render:(text, record) => (
          `${text}/${record['normal_friend_count']}人`
      ), width: 120},
      {title: '操作', dataIndex: '', width: 200, render: (text, record) => {
        return <span>
            <a href="javascript:void(0)" onClick={this.onSkip.bind(this,record)}>查看发朋友圈详情</a>
          </span>
      }
      },
    ];
    this.handleSearch=this.handleSearch.bind(this);
  }
  onSkip(record,e){
    e.preventDefault();
    console.log(record,e);
    let params={
      ad_name:'电商朋友圈',
      put_type:'NotChosen',
      publish_type:'CustomDefine',
      remark:`${record.team_name},${record.business_operator_name}`
    }
    //跳转至admin权限下的“发朋友圈列表”页面
    hashHistory.replace({
                pathname: '/admin/ads/wclist',
                state: {
                  condition: params,
                }
              })
  }
  handleSearch(params){
    this.refs.commonTable.queryTableData(params);
  }
  //所有选中行记录集合
  handleRowChange(selectedRowKeys, selectedRows) {
        this.setState({selectedRowKeys,selectedRows});
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  }
  render(){
    const {selectedRowKeys}=this.state;
    return(
      <div>
        <ECommerceWeChatManageFrom onSearch={this.handleSearch}/>
        <CommonTable
          rowSelection = {{
            selectedRowKeys,
            onChange: this.handleRowChange.bind(this),
          }}
          ref="commonTable"
          columns={this.columns}
          rowKey="cluster_sn"
          fetchTableDataMethod={queryBusinessOperatorTeamList}
          scroll={{x: 1040}}
        />
      </div>
    );
  }
}
