import React from 'react';
import {Form, Row, Col, Input, Select, Button, Table, Tag,Modal,InputNumber,DatePicker} from 'antd';
import {Success, Confirm,Errors} from '../Commons/CommonConstants';
import CommonTable from '../Commons/CommonTable';
import clusterService from '../../services/clusterService';
import GroupNumberConfigurationModal from './GroupNumberConfigurationModal';
import AddClusterNameListModal from './AddClusterNameListModal';
const FormItem = Form.Item;
const Option = Select.Option;

class ClusterNameConfigurationFrom extends React.Component{
  constructor(props){
    super(props);
    this.state={
      numberVisible:false,
      clusterNameVisible:false,
    };
    this.onSubmit=this.onSubmit.bind(this);
    this.onNumberSet=this.onNumberSet.bind(this);
    this.onUpdateVisible=this.onUpdateVisible.bind(this);
    this.addClusterName=this.addClusterName.bind(this);

  }
  onSubmit(e){
    e.preventDefault();
    let values=this.props.form.getFieldsValue();
    this.props.onSearch(values);
  }
  onNumberSet(e){
    e.preventDefault();
    this.setState({ numberVisible: true});
  }
  addClusterName(e){
    e.preventDefault();
    this.setState({ clusterNameVisible: true});
  }
  onUpdateVisible(){
    this.setState({ numberVisible: false,clusterNameVisible: false});
  }
  showModal(){
    const {numberVisible,clusterNameVisible} = this.state;
    if(numberVisible === true){
      return <GroupNumberConfigurationModal numberVisible={numberVisible} onUpdateVisible={this.onUpdateVisible} onRefresh={this.props.onRefresh}/>
    }else if(clusterNameVisible === true){
      return <AddClusterNameListModal clusterNameVisible={clusterNameVisible} onUpdateVisible={this.onUpdateVisible} onRefresh={this.props.onRefresh}/>
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
                <FormItem label="群名称" {...formItemLayout}>
                    {getFieldDecorator('cluster_name')(
                        <Input placeholder="请输入群名称" />
                    )}
                </FormItem>
                <FormItem label="备注" {...formItemLayout}>
                    {getFieldDecorator('remark')(
                        <Input placeholder="请输入备注" />
                    )}
                </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="群个数" {...formItemLayout}>
                {getFieldDecorator('sort_type', {initialValue:''})(
                  <Select allowClear placeholder="请选择群主">
                    <Option value="">全部</Option>
                    <Option value="desc ">多到少</Option>
                    <Option value="asc">少到多</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <Button style={{marginBottom: 16,marginLeft:20}} key="search" icon="search" type="primary" htmlType="submit">搜索</Button>
              <Button style={{marginBottom: 16,marginLeft:20}} type="primary"  htmlType="button" onClick={this.onNumberSet} >群个数配置</Button>
              <Button style={{marginBottom: 16,marginLeft:20}} type="primary"  htmlType="button" onClick={this.addClusterName}>添加群名称</Button>
            </Col>
        </Row>
    </Form>
    </div>
  );
  }
}
ClusterNameConfigurationFrom= Form.create()(ClusterNameConfigurationFrom);

class ClusterNameConfiguration extends React.Component{
  constructor(props) {
    super(props);
    this.columns=[
      {title: '添加时间', dataIndex: 'create_time', width: 120},
      {title: '群名称', dataIndex: 'cluster_name', width: 120},
      {title: '群个数', dataIndex: 'use_cnt',width: 120},
      {title: '备注', dataIndex: 'remark', width: 120},
    ];
    this.handleSearch=this.handleSearch.bind(this);
    this.handleRefresh=this.handleRefresh.bind(this);
  }
  handleSearch(params){
    this.refs.commonTable.queryTableData(params);
  }
  handleRefresh(){
    this.refs.commonTable.refreshTable();
  }
  render(){
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 14}
    }
    const {getFieldDecorator} = this.props.form;
    return(
      <div>
        <ClusterNameConfigurationFrom onSearch={this.handleSearch} onRefresh={this.handleRefresh}/>
        <CommonTable
          ref="commonTable"
          columns={this.columns}
          rowKey="record_id"
          fetchTableDataMethod={clusterService.queryClusterNameList}
          scroll={{x: 500}} />
      </div>
    );
  }
}
export default Form.create()(ClusterNameConfiguration);
