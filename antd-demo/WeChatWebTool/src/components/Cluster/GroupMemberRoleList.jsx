import React from 'react';
import { Form, Row, Col, Input, Select, Button, Table, Tag,Modal } from 'antd';
import CommonTable from '../Commons/CommonTable';
import {Confirm, Success} from '../Commons/CommonConstants';
import {hashHistory} from 'react-router';
import {Errors} from '../Commons/CommonConstants';
import InviteFriendsModal from './InviteFriendsModal';
import TransferCluster from './TransferCluster';
import {queryOperIdentity,
  queryItemValueByKey,
  queryClusterType,
  queryClusterBusiness,
  queryClusterCustomerNumber,
  getOperationBase64QrCode,
  operUnbindClusterRef} from '../../services/cluster';
const FormItem = Form.Item;
const Option = Select.Option;

class GroupMemberRoleListFormSearch extends React.Component{
    constructor(props){
        super(props);
        this.state={
          status:[],
          clusterType:[],
          clusterBusiness:[],
          clusterdata:[]
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.unbindCluster=this.unbindCluster.bind(this);
    }

componentDidMount(){
      //运营号状态( 根据common/queryItemValueByKey) 填充
          queryItemValueByKey().then(({jsonResult})=> {
            if(!jsonResult) return;
            this.setState({
              status: jsonResult
            });
        });
    //查询  群类型下拉值填充
        queryClusterType().then(({jsonResult})=> {
            if(!jsonResult) return;
          this.setState({
            clusterType: jsonResult
          });
        });
        //查询 商业属性下拉值填充
        queryClusterBusiness().then(({jsonResult})=> {
            if(!jsonResult) return;
          this.setState({
            clusterBusiness: jsonResult
          });
        });
        queryClusterCustomerNumber().then(({jsonResult})=> {
          if(!jsonResult) return;
          this.setState({
            clusterdata: jsonResult
          });
        });
}

    handleSubmit(e){
      e.preventDefault();
      this.props.onSearch(this.props.form.getFieldsValue());
      this.props.form.resetFields();
    }
    //解绑推荐专员
  unbindCluster(e){
    e.preventDefault();
    if(this.props.roleListselectedRowsIdetity_sn.length<=0){
      Errors("请选择角色!");
      return;
    }
      Confirm(function(){
          operUnbindClusterRef(this.props.roleListselectedRowsIdetity_sn).then(({jsonResult})=> {
               Success("解绑成功！");
               this.props.onRefresh();
               this.props.form.resetFields();
               this.props.handleSubmitCallback();
            });
        }.bind(this), "确定解绑吗?");
  }

    render(){
      const getFieldDecorator = this.props.form.getFieldDecorator;
      const formItemLayout = {
          labelCol: {span: 8},
          wrapperCol: {span: 16},
      };
     return(
         <Form horizontal onSubmit={this.handleSubmit}  className="ant-advanced-search-form">
             <Row gutter={16}>
                 <Col span={8}>
                     <FormItem label="群ID" {...formItemLayout}>
                         {getFieldDecorator('cluster_id')(
                            <Input placeholder="群ID" />
                         )}
                     </FormItem>
                     <FormItem label="运营手机号" {...formItemLayout}>
                         {getFieldDecorator('mobile')(
                             <Input placeholder="运营手机号" />
                         )}
                     </FormItem>
                 </Col>
                 <Col span={8}>
                   <FormItem label="群成员角色" {...formItemLayout}>
                     {getFieldDecorator("member_type")(
                       <Select allowClear placeholder="请选择群成员角色">
                         <Option value="">全部</Option>
                         <Option value="1">推荐专员</Option>
                         <Option value="2">发布专员</Option>
                       </Select>
                     )}
                   </FormItem>
                   <FormItem label="运营号状态" {...formItemLayout}>
                       {getFieldDecorator('status', {initialValue:''})(
                         <Select allowClear placeholder="请选择运营号状态">
                           {
                             this.state.status.map((item, idx)=> <Option key={idx}
                                                                            value={`${item.item_value}`}>{item.item_name}</Option>)
                           }
                         </Select>
                       )}
                   </FormItem>
                 </Col>
                 <Col span={8}>
                   <FormItem label="群类型" {...formItemLayout}>
                     {getFieldDecorator("cluster_type", {initialValue:''})(
                       <Select allowClear placeholder="请选择群类型">
                         <Option value="">全部</Option>
                         {
                           this.state.clusterType.map((item, idx)=> <Option key={idx}
                                                                          value={`${item.item_value}`}>{item.item_name}</Option>)
                         }
                       </Select>
                     )}
                   </FormItem>
                   <FormItem label="商业属性" {...formItemLayout}>
                     {getFieldDecorator('cluster_business', {initialValue:''})(
                       <Select allowClear placeholder="请选择商业属性">
                         <Option value="">全部</Option>
                         {
                           this.state.clusterBusiness.map((item, idx)=> <Option key={idx}
                                                                          value={`${item.item_value}`}>{item.item_name}</Option>)
                         }
                       </Select>
                     )}
                   </FormItem>
                 </Col>
                 <Col span={8}>
                   <FormItem label="客服号" {...formItemLayout}>
                     {getFieldDecorator('cluster_optr_id', {initialValue:''})(
                       <Select  allowClear placeholder="请选择客服号">
                         <Option value="">全部</Option>
                         {
                           this.state.clusterdata.map((item, idx)=> <Option key={idx}
                                                                          value={`${item.optr_id}`}>{item.optr_name}</Option>)
                         }
                       </Select>
                     )}
                   </FormItem>
                 </Col>
                 <Col span={7} offset={1}>
                    <Button type="primary" key="search" htmlType="submit">搜索</Button>
                    <Button type="primary" style={{marginLeft:16}} htmlType="button" onClick={this.unbindCluster}>解绑</Button>
                 </Col>

           </Row>
         </Form>
     );
    }
}

GroupMemberRoleListFormSearch= Form.create()(GroupMemberRoleListFormSearch);
export default class GroupMemberRoleList extends React.Component{
  constructor(props){
     super(props);
     this.state={
          selectedRowKeys:[],
          selectedRows:[],
          assign_optr_id:[],
          visible: false,
          mobile:'',
          url:''
     }
    this.handleSearch = this.handleSearch.bind(this);
    this.handleRefresh=this.handleRefresh.bind(this);
    this.handleSubmitCallback=this.handleSubmitCallback.bind(this);
    this.handleOk=this.handleOk.bind(this);
    this.handleCancel=this.handleCancel.bind(this);
     this.columns=[
       {title: '添加时间', dataIndex: 'create_time', width: 130},
       {title: '原始组号', dataIndex: 'wechat_group', width: 130},
       {title: '运营手机号',key:'mobile', dataIndex: 'mobile',width: 130,render: (text, record) => {
         return <a href="javascript:void(0)" onClick={this.onCellClick.bind(this, record)}>{text}</a>
       }},
        {title: '当前号/备用号', dataIndex: 'current',width: 130},
       {title: '运营微信号', dataIndex: 'operation_wechat', width: 130},
       {title: '运营号状态', dataIndex: 'status_text', width: 130},
       {title: '好友总数（人）', dataIndex: 'friend_cnt', width: 130},
       {title: '所属群ID', dataIndex: 'cluster_id', width: 130},
       {title: '群类型', dataIndex: 'cluster_type_text', width: 130},
       {title: '商业属性', dataIndex: 'cluster_business_text', width: 130},
       {title: '群成员角色', dataIndex: 'member_type_text', width: 130},
       {title: '角色状态', dataIndex: 'join_status_text', width: 130},
       {title: '客服号', dataIndex: 'cluster_optr_name', width: 130},
     ];
  }

  onCellClick(record){
      getOperationBase64QrCode({operation_sn:record.operation_sn}).then(({jsonResult}) => {
            this.setState({mobile:record.mobile,url:jsonResult});
            this.showModal();
      });

  }
  showModal() {
      this.setState({
        visible: true,
      });
    }
  handleOk() {
    this.setState({
      visible: false,
    });
  }
  handleCancel(e) {
    this.setState({
      visible: false,
    });
  }
  handleRefresh(){
    this.refs.commonTable.refreshTable();
  }
  handleSearch(params){
    this.refs.commonTable.queryTableData(params);
    this.setState({selectedRowKeys:[]});
  }
  //子组件中提交后台后的回调
  handleSubmitCallback() {
    this.setState({
      selectedRowKeys:[],
      selectedRows:[],
    });
    this.refs.commontable.refreshTable();
  }
  //所有选中行记录集合
  handleRowChange(selectedRowKeys, selectedRows) {
        this.setState({selectedRowKeys,selectedRows});
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  }
render(){
  const {selectedRowKeys,selectedRows,mobile,url} = this.state;
     return(
          <div>
            <Modal title="二维码" visible={this.state.visible}
             onOk={this.handleOk} onCancel={this.handleCancel}
             footer={[]}
           >
             <div style={{textAlign: 'center', marginTop: 16}}>
               <p>运营号：{mobile}</p>
               <img width="200" height="200" src={url} />
             </div>
           </Modal>
          <GroupMemberRoleListFormSearch onRefresh={this.handleRefresh} onSearch={this.handleSearch} handleSubmitCallback={this.handleSubmitCallback} roleListselectedRowsIdetity_sn={selectedRowKeys}/>
          <CommonTable
            rowSelection = {{
              selectedRowKeys,
              onChange: this.handleRowChange.bind(this),
            }}
            fetchTableDataMethod={queryOperIdentity}
            ref="commonTable"
            columns={this.columns}
            rowKey="idetity_sn"
            scroll={{x: 1200}} />
          </div>

     );
 }


}
