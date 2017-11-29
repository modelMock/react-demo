import React from 'react';
import {Form, Row, Col, Input, Select, Button, Table, Tag,Modal,InputNumber,DatePicker} from 'antd';
import {Success, Confirm,Errors} from '../Commons/CommonConstants';
import CommonTable from '../Commons/CommonTable';
import clusterService from '../../services/clusterService';
import OperatorallianceManagementModal from './OperatorallianceManagementModal';
const FormItem = Form.Item;
const Option = Select.Option;

class ClusterOperatorallianceManagementFrom extends React.Component{
  constructor(props){
    super(props);
    this.state={
      allianceVisible:false,
    };
    this.onSubmit=this.onSubmit.bind(this);
    this.onUpdateVisible=this.onUpdateVisible.bind(this);
    this.onAddAlliance=this.onAddAlliance.bind(this);
    this.onOpenTaopwd=this.onOpenTaopwd.bind(this);
    this.onCloseTaopwd=this.onCloseTaopwd.bind(this);
  }
  onSubmit(e){
    e.preventDefault();
    let values=this.props.form.getFieldsValue();
    this.props.onSearch(values);
  }
  onOpenTaopwd(e){
    e.preventDefault();
    const {selectedRowKeys}=this.props;
    if(selectedRowKeys.length<=0){
      Errors("请选择联盟号！");
      return;
    }
    Confirm(function(){
      clusterService.openTaopwd({record_ids:selectedRowKeys}).then(({jsonResult})=>{
       Success("开启成功！");
       this.props.onRefresh();
      });
    }.bind(this),"确定开启？");
  }

  onCloseTaopwd(e){
    e.preventDefault();
    const {selectedRowKeys}=this.props;
    if(selectedRowKeys.length<=0){
      Errors("请选择联盟号！");
      return;
    }
    Confirm(function(){
      clusterService.closeTaopwd({record_ids:selectedRowKeys}).then(({jsonResult})=>{
        Success("关闭成功！");
        this.props.onRefresh();
      });
    }.bind(this),"确定关闭？");
  }
  onAddAlliance(e){
    e.preventDefault();
    this.setState({ allianceVisible: true});
  }
  onUpdateVisible(){
    this.setState({allianceVisible: false});
  }
  showModal(){
    const {allianceVisible} = this.state;
   if(allianceVisible === true){
      return <OperatorallianceManagementModal allianceVisible={allianceVisible} onUpdateVisible={this.onUpdateVisible} onRefresh={this.props.onRefresh}/>
    }
    return null;
  }
  render(){
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 14}
    }
    const {getFieldDecorator} = this.props.form;
    return(
      <div>
        {this.showModal()}
      <Form horizontal className="ant-advanced-search-form" onSubmit={this.onSubmit}>
        <Row gutter={16}>
            <Col span={8}>
                <FormItem label="淘宝账号" {...formItemLayout}>
                    {getFieldDecorator('tao_pwd')(
                        <Input placeholder="请输入淘宝账号" />
                    )}
                </FormItem>
                <FormItem label="联盟号" {...formItemLayout}>
                    {getFieldDecorator('pid')(
                        <Input placeholder="请输联盟号" />
                    )}
                </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="验证位置" {...formItemLayout}>
                {getFieldDecorator('check_kind')(
                  <Select allowClear placeholder="请选择验证位置">
                    <Option value="">全部</Option>
                    <Option value="CLUSTER_MESSAGE ">群消息</Option>
                    <Option value="PUBLISH">朋友圈</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label="验证状态" {...formItemLayout}>
                {getFieldDecorator('check_status')(
                  <Select allowClear placeholder="请选择验证状态">
                    <Option value="">全部</Option>
                    <Option value="T ">开启</Option>
                    <Option value="F">关闭</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <Button style={{marginBottom: 16,marginLeft:20}} key="search" icon="search" type="primary" htmlType="submit">搜索</Button>
              <Button style={{marginBottom: 16,marginLeft:20}} type="primary"  htmlType="button"  onClick={this.onOpenTaopwd}>开启验证</Button>
              <Button style={{marginBottom: 16,marginLeft:20}} type="primary"  htmlType="button" onClick={this.onCloseTaopwd}>关闭验证</Button>
              <Button style={{marginBottom: 16,marginLeft:20}} type="primary"  htmlType="button" onClick={this.onAddAlliance}>添加联盟号</Button>
            </Col>
        </Row>
    </Form>
    </div>
  );
  }
}
ClusterOperatorallianceManagementFrom= Form.create()(ClusterOperatorallianceManagementFrom);

class ClusterOperatorallianceManagement extends React.Component{
  constructor(props) {
    super(props);
    this.state={
      selectedRowKeys:[],
      selectedRows:[],
    }
    this.columns=[
      {title: '添加时间', dataIndex: 'create_time', width: 120},
      {title: '运营方', dataIndex: 'business_operator_text', width: 120},
      {title: '联盟号', dataIndex: 'pid',width: 120},
      {title: '所属淘宝账号', dataIndex: 'tao_pwd', width: 120},
      {title: '验证位置', dataIndex: 'check_kind_text', width: 120},
      {title: '验证状态', dataIndex: 'check_status_text', width: 120},
    ];
    this.handleSearch=this.handleSearch.bind(this);
    this.handleRefresh=this.handleRefresh.bind(this);
  }
  handleSearch(params){
    this.refs.commonTable.queryTableData(params);
  }
  handleRefresh(){
    this.refs.commonTable.refreshTable();
    this.setState({
      selectedRowKeys:[],
      selectedRows:[]
    });
  }
  //所有选中行记录集合
  handleRowChange(selectedRowKeys, selectedRows) {
        this.setState({selectedRowKeys,selectedRows});
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  }
  render(){
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 14}
    }
    const {getFieldDecorator} = this.props.form;
    const {selectedRowKeys,selectedRows}=this.state;
    return(
      <div>
        <ClusterOperatorallianceManagementFrom onSearch={this.handleSearch} onRefresh={this.handleRefresh} selectedRowKeys={selectedRowKeys}/>
        <CommonTable
          ref="commonTable"
          rowSelection = {{
            selectedRowKeys,
            onChange: this.handleRowChange.bind(this),
          }}
          columns={this.columns}
          rowKey="record_id"
          fetchTableDataMethod={clusterService.queryTaopwdList}
          scroll={{x: 500}} />
      </div>
    );
  }
}
export default Form.create()(ClusterOperatorallianceManagement);
