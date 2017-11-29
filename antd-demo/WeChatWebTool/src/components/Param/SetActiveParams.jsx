import React from 'react';
import { Form, Row, Col, Input, Select, Button, Table, Tag,Modal,InputNumber,DatePicker } from 'antd';
import CommonTable from '../Commons/CommonTable';
import {Errors,Confirm, Success} from '../Commons/CommonConstants';
import {queryCultivateList, openOrCloseCultivate,addCultivate} from '../../services/params';
import  ActiveParamsModal from './ActiveParamsModal';
const FormItem = Form.Item;
const Option = Select.Option;

class SetActiveParamsFrom extends React.Component{
  constructor(props) {
    super(props);
    this.state={
        visible:false,
        details:'',
        addCultivateVisible:false,
    };
    this.onHandleSubmit=this.onHandleSubmit.bind(this);
    this.onOpenAndClosed=this.onOpenAndClosed.bind(this);
    this.onAddCultivate=this.onAddCultivate.bind(this);
    this.updateVisible=this.updateVisible.bind(this);
  }
  //搜索
  onHandleSubmit(e){
    e.preventDefault();
    let values = this.props.form.getFieldsValue();
    this.props.onSearch(values);
  }
  //开启和关闭
  onOpenAndClosed(type,e){
    e.preventDefault();
    let details;
     switch (type) {
       case 1://开启   后台需要参数 List<WechatCultivateType> wechat_groups is_open
         if(this.props.record==null||this.props.record.length<=0){
           Errors("请选择养号!");
           return;
         }
         let wechatGroupsArr=[];
         let contentwechatGroupArr=[];
         this.props.record.map((item,idx)=>{
           wechatGroupsArr.push({wechat_group:item.wechat_group,cultivate_type:item.cultivate_type});
           contentwechatGroupArr.push(item.wechat_group+"("+item.cultivate_type_text+")");
         });
         let values={
           wechat_groups:wechatGroupsArr,
           is_open:"T"
         };
         let content="运营组号为："+contentwechatGroupArr+"，是否开启？";
         Confirm(function(){
           openOrCloseCultivate(values).then(({jsonResult})=> {
             Success("开启成功！");
             this.props.onRefresh();
          });
        }.bind(this),content);
       break;
       case 2://关闭 后台需要参数 List<WechatCultivateType> wechat_groups is_open
         if(this.props.record==null||this.props.record.length<=0){
           Errors("请选择养号!");
           return;
         }
         let wechatGroups=[];
         let contentwechatGroup=[];
         this.props.record.map((item,idx)=>{
           wechatGroups.push({wechat_group:item.wechat_group,cultivate_type:item.cultivate_type});
           contentwechatGroup.push(item.wechat_group+"("+item.cultivate_type_text+")");
         });
         let value={
           wechat_groups:wechatGroups,
           is_open:"F"
         };
         let contents="运营组号为："+contentwechatGroup+"，是否关闭？";
         Confirm(function(){
           openOrCloseCultivate(value).then(({jsonResult})=> {
             Success("关闭成功！");
             this.props.onRefresh();
           });
         }.bind(this),contents);
         break;
       }
     }
     //添加活跃
     onAddCultivate(e){
       e.preventDefault();
       this.setState({addCultivateVisible:true})
     }
    updateVisible(){
      this.setState({addCultivateVisible:false})
    }
    renderSelectModal(){
       const {addCultivateVisible} = this.state;
       if(addCultivateVisible === true){
         return <ActiveParamsModal addCultivateVisible={addCultivateVisible} updateVisible={this.updateVisible}/>
       }
       return null;
     }

  render(){
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 16},
    };
    const {getFieldDecorator} = this.props.form;
      return (
        <div>
          {this.renderSelectModal()}
        <Form horizontal  className="ant-advanced-search-form" onSubmit={this.onHandleSubmit}>
          <Row gutter={16}>
            <Col span={8}>
              <FormItem label="运营组号" {...formItemLayout}>
                {getFieldDecorator('wechat_group')(
                  <Input placeholder="请输入运营组号" />
                )}
              </FormItem>
              <FormItem label="活跃类型" {...formItemLayout}>
                {getFieldDecorator('cultivate_type')(
                  <Select allowClear placeholder="请选择活跃类型">
                    <Option value="">全部</Option>
                    <Option value="Publish">朋友圈</Option>
                    <Option value="Cluster">群聊</Option>
                    <Option value="Chat">单聊</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="状态" {...formItemLayout}>
                {getFieldDecorator('is_open')(
                  <Select allowClear placeholder="请选状态">
                    <Option value="">全部</Option>
                    <Option value="T">开启</Option>
                    <Option value="F">关闭</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <Button style={{marginBottom: 16,marginLeft:20}} type="primary" icon="search"  htmlType="submit">搜索</Button>
              <Button style={{marginBottom: 16,marginLeft:20}} type="primary"  htmlType="button" onClick={this.onOpenAndClosed.bind(this,1)}>开启</Button>
              <Button style={{marginBottom: 16,marginLeft:20}} type="primary" htmlType="button"  onClick={this.onOpenAndClosed.bind(this,2)}>关闭</Button>
              <Button style={{marginBottom: 16,marginLeft:20}} type="primary"  htmlType="button" onClick={this.onAddCultivate}>添加活跃</Button>
              <Button style={{marginBottom: 16,marginLeft:20}} type="primary"  htmlType="button" >参数设置</Button>
            </Col>
          </Row>
        </Form>
        </div>
      );
    }
  }
SetActiveParamsFrom= Form.create()(SetActiveParamsFrom);

export default class SetActiveParams extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      selectedRowKeys: [], //表格选中行
      selectedRows:[]
    }
    this.handleSearch=this.handleSearch.bind(this);
    this.handleRefresh=this.handleRefresh.bind(this);
    this.columns=[
      {title: '运营组号', dataIndex: 'wechat_group', width: 80,},
      {title: '活跃类型', dataIndex: 'cultivate_type_text', width: 130},
      {title: '状态', dataIndex: 'is_open_text',width: 80,},
      {title: '开启/关闭时间', dataIndex: 'status_date', width: 120}
    ];
  }
  //所有选中行记录集合
  handleRowChange(selectedRowKeys, selectedRows) {
        this.setState({selectedRowKeys,selectedRows});
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  }
  handleSearch(params){
     this.refs.commonTable.queryTableData(params);
     this.setState({
       selectedRowKeys: [],
       selectedRows:[]
     })
  }
  handleRefresh(){
    this.refs.commonTable.refreshTable();
    this.setState({
      selectedRowKeys: [],
      selectedRows:[]
    })
  }
  render(){
       const {selectedRowKeys,selectedRows} = this.state;
    return (
      <div>
        <SetActiveParamsFrom onSearch={this.handleSearch} record={selectedRows} onRefresh={this.handleRefresh}/>
        <CommonTable
          rowSelection = {{
            selectedRowKeys,
            onChange: this.handleRowChange.bind(this),
          }}
          fetchTableDataMethod={queryCultivateList}
          ref="commonTable"
          columns={this.columns}
          rowKey={record => record.wechat_group+"_"+record.cultivate_type}/>
      </div>
    );
  }

}
