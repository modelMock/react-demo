import React from 'react';
import { Form, Row, Col, Input, Select, Button, Table, Tag,Modal } from 'antd';
import CommonTable from '../Commons/CommonTable';
import {Errors} from '../Commons/CommonConstants';
import {hashHistory} from 'react-router';
import InviteFriendsModal from './InviteFriendsModal';
import TransferCluster from './TransferCluster';
import {queryOptrToAssignReferrer,assignReferrer,assignOffline,getOperationBase64QrCode} from '../../services/cluster';
const FormItem = Form.Item;
const Option = Select.Option;

class AssignFormSearch extends React.Component{
    constructor(props){
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.selectChang=this.selectChang.bind(this);
        this.handleOk=this.handleOk.bind(this);
        this.handleCancel=this.handleCancel.bind(this);
        this.state={
            cluster_optr_id:'',
            visible:false,
            details:''
        };
    }
  onlineOfflineInvitedSubmit(type,e){
      e.preventDefault();
      let details;
       switch (type) {
           case 1://线上互加提交
                 //后台需要参数 对应前台传参 clusterSns=this.props.clusterSns  operationSns=this.props.operationSns   cluster_optr_id=this.state.cluster_optr_id
                 if(this.state.cluster_optr_id==null||this.state.cluster_optr_id==''){
                    Errors("请选择为推荐专员配置客服!");
                    return;
                 }
                 if(this.props.operationSns.length<=0){
                    Errors("请选择运营号!");
                    return;
                 }
                 if(this.props.clusterSns.length>0 && this.props.operationSns.length>0){
                   assignReferrer(this.props.clusterSns,this.props.operationSns,this.state.cluster_optr_id).then(({jsonResult})=> {
                      if(!jsonResult) return;
                      details=<div className="alertDatail-div">
                            <ul className="alertDatail-ul">
                              {
                                Object.keys(jsonResult).map(key =>{
                                  var value = jsonResult[key]
                                  return (<li style={{marginBottom:5}}><span>群{key}结果:</span>{value}</li>)
                                })///
                              }
                          </ul>
                      </div>
                      this.setState({details:details});
                      this.showModal();
                   });
                 }
          break;

        case 2://线下邀请提交
               //后台需要参数 对应前台传参 clusterSns=this.props.clusterSns  operationSns=this.props.operationSns   cluster_optr_id=this.state.cluster_optr_id
               if(this.state.cluster_optr_id==null||this.state.cluster_optr_id==''){
                  Errors("请选择为推荐专员配置客服!");
                  return;
               }
               if(this.props.clusterSns.length>0){
                 assignOffline(this.props.clusterSns,this.props.operationSns,this.state.cluster_optr_id).then(({jsonResult})=> {
                    if(!jsonResult) return;
                    details=<div className="alertDatail-div">
                          <ul className="alertDatail-ul">
                            {
                              Object.keys(jsonResult).map(key =>{
                                var value = jsonResult[key]
                                return (<li style={{marginBottom:5}}><span>群{key}结果:</span>{value}</li>)
                              })
                            }
                        </ul>
                    </div>
                  this.setState({details:details});
                  this.showModal();
                 });
               }
          break;
        }
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
     //清空选择列表的数据
     this.props.handleSubmitCallback();
     //清空表单
     this.props.form.setFieldsValue({
       assign_type: '',
       sort_type: '',
       mobile: '',})
     this.props.onSearch({assign_optr_id:this.state.cluster_optr_id});
   }
   handleCancel(e) {
     this.setState({
       visible: false,
     });
     //清空选择列表的数据
     this.props.handleSubmitCallback();
     //清空表单
     this.props.form.setFieldsValue({
       assign_type: '',
       sort_type: '',
       mobile: '',})
     this.props.onSearch({assign_optr_id:this.state.cluster_optr_id});
   }

handleSubmit(e){
      e.preventDefault();
      this.props.form.validateFields((errors, values) => {
           if(values.assign_optr_id==null||values.assign_optr_id==''){
             Errors("请为推荐专员配置客服选项选择值！");
             return;
           }
          this.props.onSearch(this.props.form.getFieldsValue());
      });
    }
    selectChang(select){
        this.setState({cluster_optr_id:select});
    }
    render(){
      const getFieldDecorator = this.props.form.getFieldDecorator;
      const formItemLayout = {
          labelCol: {span: 8},
          wrapperCol: {span: 16},
      };
     return(
       <div>
         <Modal title="详情" visible={this.state.visible}
          onOk={this.handleOk} onCancel={this.handleCancel}
          footer={[]}
        >
        {this.state.details}
        </Modal>
         <Form horizontal>
         <Row>
           <Col sm={12}>
             <FormItem label='已选择' {...formItemLayout}>
                <p>{this.props.AdvertisementSelectedRows.length}个群,
                  {
                  this.props.AdvertisementSelectedRows.map((item, idx)=> <span style={{with:'60px'}}>群ID:{item.cluster_id}</span>)
                  }
              </p>

               <p className="ant-form-text" id="userName" name="userName" style={{ color:'red'}}></p>
             </FormItem>
           </Col>
           <Col sm={3}>
             <Button type="primary"  size="large" onClick={this.onlineOfflineInvitedSubmit.bind(this,1)}>线上互加提交</Button>
           </Col>
           <Col sm={3}>
             <Button type="primary" size="large" onClick={this.onlineOfflineInvitedSubmit.bind(this,2)}>线下邀请提交</Button>
           </Col>
         </Row>
         </Form>
         <Form horizontal onSubmit={this.handleSubmit}  className="ant-advanced-search-form">
             <Row style={{marginBottom:30}}>
               <Col span={10}>
                 <FormItem label="为推荐专员配置客服" {...formItemLayout}>
                   {getFieldDecorator("assign_optr_id", {initialValue:''})(
                     <Select allowClear placeholder="请选择群类型" onChange={this.selectChang}>
                       {
                         this.props.assignOptIid.map((item, idx)=> <Option key={idx}
                                                                        value={`${item.optr_id}`}>{item.optr_name}</Option>)
                       }
                     </Select>
                   )}
                 </FormItem>
               </Col>
             </Row>
             <Row gutter={16}>
                 <Col span={7}>
                     <FormItem label="分配客服" {...formItemLayout}>
                         {getFieldDecorator('assign_type')(
                           <Select allowClear placeholder="请选择分配客服">
                             <Option value="">全部</Option>
                             <Option value="T">已发</Option>
                             <Option value="F">未发</Option>
                           </Select>
                         )}
                     </FormItem>
                 </Col>
                 <Col span={7}>
                   <FormItem label="已配置群个数" {...formItemLayout}>
                     {getFieldDecorator("sort_type")(
                       <Select allowClear placeholder="请选择已配置群个数">
                         <Option value="">全部</Option>
                         <Option value="desc">多到少</Option>
                         <Option value="asc">少到多</Option>
                       </Select>
                     )}
                   </FormItem>
                 </Col>
                 <Col span={7}>
                   <FormItem label="运营手机号" {...formItemLayout}>
                     {getFieldDecorator('mobile')(
                       <Input placeholder="运营手机号" />
                     )}
                   </FormItem>
                 </Col>
                 <Col span={3}>
                    <Button type="primary" key="search" htmlType="submit">搜索</Button>
                 </Col>
           </Row>
         </Form>
       </div>
     );

    }
}

AssignFormSearch= Form.create()(AssignFormSearch);
export default class ClusterOptrToAssign extends React.Component{
  constructor(props){
     super(props);
     this.state={
          selectedRowKeys:[],
          assign_optr_id:[],
          visible: false,
          mobile:'',
          url:''
     }
      this.handleSearch = this.handleSearch.bind(this);
      this.handleSubmitCallback=this.handleSubmitCallback.bind(this);
      this.handleOk=this.handleOk.bind(this);
      this.handleCancel=this.handleCancel.bind(this);
     this.columns=[
       {title: '添加时间', dataIndex: 'create_time', width: 80},
       {title: '原始组号', dataIndex: 'wechat_group', width: 130},
       {title: '运营手机号', dataIndex: 'mobile',width: 80,render: (text, record) => {
         return <a href="javascript:void(0)" onClick={this.onCellClick.bind(this, record)}>{text}</a>
       }},
       {title: '运营微信号', dataIndex: 'operation_wechat', width: 120},
       {title: '运营号状态', dataIndex: 'status_text', width: 80},
       {title: '好友总数（人）', dataIndex: 'small_cluster_friend_cnt', width: 80},
       {title: '已配置群', dataIndex: 'large_cluster_join_cnt', width: 90},
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
  handleSearch(params){
    this.refs.commonTable.queryTableData(params);
  }
  //子组件中提交后台后的回调
  handleSubmitCallback() {
    this.setState({
      selectedRowKeys:[],
      selectedRows:[],
    });
  }
  componentDidMount(){
    const state = this.props.location.state;
    this.setState({assign_optr_id:state.assign_optr_id});
  }
  handleRowChange(selectedRowKeys, selectedRows){
      this.setState({selectedRowKeys,selectedRows});
  }
render(){
  const {selectedRowKeys,mobile,url} = this.state;
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
          <AssignFormSearch onSearch={this.handleSearch} assignOptIid={this.state.assign_optr_id}
            AdvertisementSelectedRows={this.props.location.state.AssignselectedRowsDetails}
              clusterSns={this.props.location.state.clusterSns} operationSns={this.state.selectedRowKeys}
              handleSubmitCallback={this.handleSubmitCallback}
          />
          <CommonTable
            rowSelection = {{
              selectedRowKeys,
              onChange: this.handleRowChange.bind(this),
            }}
            fetchTableDataMethod={queryOptrToAssignReferrer}
            ref="commonTable"
            columns={this.columns}
            rowKey="operation_sn"
            scroll={{x: 1200}} />
          </div>

     );
 }


}
