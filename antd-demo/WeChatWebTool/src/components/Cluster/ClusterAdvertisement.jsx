import React from 'react';
import { Form, Row, Col, Input, Select, Button, Table, Tag,Modal,InputNumber,DatePicker } from 'antd';
import CommonTable from '../Commons/CommonTable';
import InviteFriendsModal from './InviteFriendsModal';
import {Errors} from '../Commons/CommonConstants';
import {Confirm, Success} from '../Commons/CommonConstants';
import EditClusterModal from './EditClusterModal';
import {hashHistory} from 'react-router';
import OpenIntoGroupWelcome from './OpenIntoGroupWelcome';
import CloseIntoGroupWelcome from './CloseIntoGroupWelcome';
import SendClusterNotice from './SendClusterNotice'
import BusinessOperator from './BusinessOperator';
import TransferCluster from './TransferCluster';
import {
  queryClusterAdvertisementList,
  queryClusterCustomerNumber,
  queryClusterInviteFriends,
  queryClusterType,
  updateCluster,
  closeMockAd,
  openMockAd,
  queryClusterInviteFriendCnt,
  queryClusterBusiness,
  queryClusterBusinessOperator,
  updateClusterName,
  updateClusterNotice,
  batchUpdateClusterWelcomeInfo,
  saveInviteFriendCnt,
  updateClusterInviteInfo,
  transferCluster,
  batchUpdateClusterInviteInfo,
  batchClearClusterInviteInfo,
  initAssignReferrer} from '../../services/cluster';
const FormItem = Form.Item;
const Option = Select.Option;
/**
 * 群信息
 */
class GroupInfo extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      visible: props.editVisible,
      record: props.record,
    };
    this.handleCancel = this.handleCancel.bind(this);
    this.updateClusterName=this.updateClusterName.bind(this);
    this.updateClusterNotice=this.updateClusterNotice.bind(this);
    this.updateClusterInviteInfo=this.updateClusterInviteInfo.bind(this);
    this.UpdateClusterWelcomeInfo=this.UpdateClusterWelcomeInfo.bind(this);
  }
  //修改进群欢迎语
  UpdateClusterWelcomeInfo(){
    this.props.form.validateFields((errors, values) => {
     Confirm(function(){
       let clustersn=[];
       clustersn.push(this.state.record.cluster_sn)
       batchUpdateClusterWelcomeInfo({cluster_sn_list:clustersn,invite_info:values.welcome_info}).then(({jsonResult}) => {
         Success("修改成功!");
       });
     }.bind(this), "确定修改进群欢迎用语吗?");
   });
  }

  //修改群名称
  updateClusterName(e) {
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      Confirm(function() {
        updateClusterName(this.state.record.cluster_sn, values.cluster_name).then(({
          jsonResult
        }) => {
          Success("修改成功!");
          this.props.onRefresh();
        });
      }.bind(this), "确定修改群名称吗?");
    });
  }
  //修改群公告
  updateClusterNotice(e) {
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      Confirm(function() {
        updateClusterNotice(this.state.record.cluster_sn, values.cluster_notice).then(({
          jsonResult
        }) => {
          Success("修改成功!");
          this.props.onRefresh();
        });
      }.bind(this), "确定修改群公告吗?");
    });
  }

 //  修改群信息邀请说明
 updateClusterInviteInfo(e){
   e.preventDefault();
   this.props.form.validateFields((errors, values) => {
     Confirm(function(){
       updateClusterInviteInfo(this.state.record.cluster_sn,values.invite_info).then(({jsonResult}) => {
         Success("修改成功!");
         this.props.onRefresh();
       });
     }.bind(this), "确定修改群信息邀请说明吗?");
   });
 }
 handleCancel(){
   this.setState({visible: false});
   this.props.form.resetFields();
   this.props.onUpdateVisible();
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    const {visible, record} = this.state;
    const {getFieldDecorator} = this.props.form;
    return(
      <Modal visible={visible} maskClosable={false} title={`群信息`}
        onOk={this.handleOk} onCancel={this.handleCancel}
        footer={[]}
        >
          <Form horizontal>
            {getFieldDecorator('cluster_sn', { initialValue: record.cluster_sn })(
              <Input type="hidden"/>
            )}
            <FormItem label="初创群运营手机号" {...formItemLayout}>
              <p className="ant-form-text">{record.create_master_info}</p>
            </FormItem>
            <FormItem label="当前群主" {...formItemLayout} style={{marginTop: -18}}>
              <p className="ant-form-text">{record.master_info}</p>
            </FormItem>
            <FormItem label="群ID" {...formItemLayout} style={{marginTop: -12}}>
              {getFieldDecorator('cluster_name', {initialValue: record.cluster_name,})(
                <Input placeholder="请输入群ID" style={{width:200,marginRight:'20px'}}/>
              )}
            </FormItem>
            <FormItem label="进群欢迎语" {...formItemLayout} help="最多输入16个汉字" style={{marginTop: -12}} required>
              {getFieldDecorator('welcome_info', {initialValue: record.welcome_info})(
                <Input placeholder="请输入进群欢迎语" style={{width:200,marginRight:'20px'}}/>
              )}
              <Button type="primary" icon="check" size="large" onClick={this.UpdateClusterWelcomeInfo}>提交</Button>
            </FormItem>
            <FormItem label="群名称" {...formItemLayout} help="最多输入16个汉字" style={{marginTop: -12}} required>
              {getFieldDecorator('cluster_name', {initialValue: record.cluster_name,rules:[{ max: 16, message: '群名称最多输入16个汉字'}]})(
                <Input placeholder="请输入群名称" style={{width:200,marginRight:'20px'}}/>
              )}
              <Button type="primary" icon="check" size="large" onClick={this.updateClusterName}>提交</Button>
            </FormItem>
            <FormItem label="群公告" {...formItemLayout} required>
              {getFieldDecorator('cluster_notice', {initialValue: record.cluster_notice,})(
                <Input type="textarea" rows={3} placeholder="请输入群公告" style={{width:200,marginRight:'20px'}}/>
              )}
              <Button type="primary" icon="check" size="large" onClick={this.updateClusterNotice}>提交</Button>
            </FormItem>
            <FormItem label="邀请进群说明" {...formItemLayout} required>
              {getFieldDecorator('invite_info', {initialValue: record.invite_info,})(
                <Input type="textarea" rows={5} placeholder="邀请好友进群，跟ta说句话吧~" style={{width:200,marginRight:'20px'}}/>
              )}
              <Button type="primary" icon="check" size="large" onClick={this.updateClusterInviteInfo}>提交</Button>
            </FormItem>
            <div style={{textAlign: 'center', marginTop: -16}}>
              <img width="150" height="150" src={record.cluster_pic_url} />
            </div>
          </Form>
      </Modal>
    );
  }
}
GroupInfo= Form.create()(GroupInfo);

const OPERATION_SN_KEY = "@operation_sn"
const INIVTE_FRIEND_KEY = "@inivte_friend_cnt";
const WECHAT_ACCOUNT_KEY = "@wechat_account";
/**
 * 邀请好友进群
 */
class InviteFriendsGroup extends React.Component{
  constructor(props){
    super(props);
    this.state={
      visibleInviteFriendvisible:false,
      visible: props.inviteVisible,
      cluster_sn: props.cluster_sn,
      inviteFrdData: props.inviteFrdData,
      jsonResultDetails:null,
    }
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }
  handleOk(){
    this.props.form.validateFields((errors, values) => {
      console.log("errors",!!errors,"values",values)
      Confirm(function(){
        //itemOpSnList：用于标记当前item数据对象是否已经创建
        //obj：一个item对应一条数据对象
        let params = [], itemOpSnList = [], obj = null;
        for(let [key, value] of Object.entries(values)){
          var keyArr = key.split("@");
          var targetOpSn = keyArr[0];
          var targetKey = keyArr[1];
          // 当前opsn不存在
          if(itemOpSnList.indexOf(targetOpSn) == -1) {
            // 将上一个item数据加进去
            if(obj != null) {
              params.push(obj)
            }
            // 新item数据了
            obj = {operation_sn: targetOpSn}
            itemOpSnList.push(targetOpSn)
          } else {
            obj[targetKey] = value
          }
        }
        // 最后一条数据，别丢了
        params.push(obj)

        console.log("handleOk", params)
        saveInviteFriendCnt(this.state.cluster_sn, params).then(({jsonResult}) => {
          let jsonResultDetails;
          jsonResultDetails=<div className="alertDatail-div">
                <ul className="alertDatail-ul">
                  {
                    Object.keys(jsonResult).map(key =>{
                      var value = jsonResult[key]
                      return (<li style={{marginBottom:5}}><span>群{key}结果:</span>{value}</li>)
                    })
                  }
              </ul>
          </div>
          this.setState({jsonResultDetails:jsonResultDetails});
          this.showModal();
        });
      }.bind(this), "确定邀请好友进群吗?");
    });
  }
  showModal() {
    this.setState({
      visibleInviteFriendvisible: true,
    });
  }
  handleCancel(){
    this.setState({
      visibleInviteFriendvisible: false,
      visible: false,
    });
    this.props.form.resetFields();
    this.props.onUpdateVisible();
  }
  renderInviteItem(obj){
    const {getFieldDecorator} = this.props.form;
    return (
      <div>
        <Modal title="详情" visible={this.state.visibleInviteFriendvisible}
         onOk={this.handleCancel} onCancel={this.handleCancel}
         footer={[]}
       >
       {this.state.jsonResultDetails}
       </Modal>
      <FormItem labelCol={{span: 3}} wrapperCol={{span: 21}} label="运营号" key={obj.operation_sn}>
        {getFieldDecorator(obj.operation_sn + OPERATION_SN_KEY, {
          initialValue: obj.operation_sn
        })(
          <Input type="hidden" />
        )}
        <p className="ant-form-text">{obj.mobile}</p>
        {this.renderInviteTxt(obj.status)}
        {getFieldDecorator(obj.operation_sn + INIVTE_FRIEND_KEY, {
          initialValue: obj.invite_friend_cnt,
          rules:[{required: true, type: 'number', message: '请输入邀请进群人数'}]
        })(
          <InputNumber min={0}/>
        )}
        <p className="ant-form-text">人进群</p>
        {/* <p className="ant-form-text">当前可邀请进群{obj.invite_friend_cnt}人，群中好友{obj.friend_cnt}人</p> */}
        <p className="ant-form-text">邀请</p>
        {getFieldDecorator(obj.operation_sn + WECHAT_ACCOUNT_KEY)(
          <Input placeholder="微信号/手机号/QQ号" style={{width:'90'}}/>
        )}
          <p className="ant-form-text">进群</p>
      </FormItem>
    </div>
    );
  }
  renderInviteTxt(status){
    if(status === 'ACTIVE'){
      return <p className="ant-form-text" style={{marginLeft: 48}}>可邀请</p>
    }else if(status === 'UNACCOUNT'){
      return <p className="ant-form-text" style={{marginLeft: 24}}>不可用邀请</p>
    }else if(status === 'NOTACCOUNT'){
      return <p className="ant-form-text" style={{marginLeft: 24}}>冻结可邀请</p>
    }else if(status === 'PWERROR'){
      return <p className="ant-form-text" style={{marginLeft: 24}}>密错可邀请</p>
    }
  }
  render(){
    console.log('InviteFriendsModal => render')
    const {visible, cluster_sn, inviteFrdData} = this.state;
    return (
      <Modal visible={visible} maskClosable={false} width={650} title={`邀请好友进群`}
        onOk={this.handleOk} onCancel={this.handleCancel}
        footer={[
          <Button icon="poweroff" size="large" onClick={this.handleCancel}>取消</Button>,
          <Button type="primary" icon="check" size="large" onClick={this.handleOk}>提交</Button>
        ]}>
        <Form horizontal>
          <p className="ant-form-text" style={{marginBottom: 8}}>
            邀请本群中运营号的好友进群（运营号总数{inviteFrdData.all_opts}个，可用运营号{inviteFrdData.active_opts}个）：
          </p>
           {
             inviteFrdData.operationStatisticsList.map(obj => (
               this.renderInviteItem(obj)
             ))
           }
        </Form>
      </Modal>
    )
  }
}
InviteFriendsGroup= Form.create()(InviteFriendsGroup);
/**
 * 大群列表表单搜索
 */
class AdvertisementFrom extends React.Component{
    constructor(props) {
      super(props);
      this.state = {
        clusterdata: [],
        clusterType:[],
        clusterBusiness:[],
        Invite:[],
        clusterBusinessOperator:[],
        startCreateValue:null,   //大群列表开始创建日期
        endCreateValue: null,     //大群列表结束创建日期
        updateVisible:false,
        clearVisible:false,
        RowsDetails:[],
        openWelcomeVisible:false,
        closeWelcomeVisible:false,
        businessOperator:false,
        clusterNoticeVisible:false,
      };
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleInitAssign = this.handleInitAssign.bind(this);
      this.closeMockAd=this.closeMockAd.bind(this);
      this.openMockAd=this.openMockAd.bind(this);
      this.onStartChange = this.onStartChange.bind(this);//开始创建日期
      this.onEndChange = this.onEndChange.bind(this);//结束创建日期
      this.updateClusterInviteInfo=this.updateClusterInviteInfo.bind(this);
      this.clearClusterInviteInfo=this.clearClusterInviteInfo.bind(this);
      this.handleOk=this.handleOk.bind(this);
      this.handleCancel=this.handleCancel.bind(this);
      this.ClearClusterInviteInfoBtn=this.ClearClusterInviteInfoBtn.bind(this);
      this.UpdateClusterInviteInfoBtn=this.UpdateClusterInviteInfoBtn.bind(this);
      this.CloseIntoGroupWelcomeBtn=this.CloseIntoGroupWelcomeBtn.bind(this);
      this.OpenIntoGroupWelcomeBtn=this.OpenIntoGroupWelcomeBtn.bind(this);
      this.onUpdateVisible=this.onUpdateVisible.bind(this);
      this.onBusinessOperator=this.onBusinessOperator.bind(this);
      this.onClusterNotice=this.onClusterNotice.bind(this);

  }
  //搜索
  handleSubmit(e){
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if(!!values.start_date){
        values.start_date = values.start_date.format("YYYY-MM-DD HH:mm:ss");
      }
      if(!!values.end_date){
        values.end_date = values.end_date.format("YYYY-MM-DD HH:mm:ss");
      }
      let value={
        cluster_business:values.cluster_business,
        cluster_full_status:values.cluster_full_status,
        cluster_group_id:values.cluster_group_id,
        cluster_optr_id:values.cluster_optr_id,
        cluster_type:values.cluster_type,
        end_date:values.end_date,
        has_day_mock:values.has_day_mock,
        has_publish:values.has_publish,
        has_refferrer:values.has_refferrer,
        is_create_master:values.is_create_master,
        start_date:values.start_date,
        cluster_id:values.cluster_id,
        cluster_name:values.cluster_name,
        master_info:values.master_info,
        create_master_info:values.create_master_info,
        sort_type:values.sort_type,
        invite_sort_type:values.invite_sort_type,
        cluster_invite_info:values.cluster_invite_info,
        cluster_welcome_info:values.cluster_welcome_info,
        business_operator:values.business_operator,
        invite_friend_cnt:values.invite_friend_cnt,
      }
        this.props.onSearch(value);
        this.props.form.resetFields();
        this.props.handleSubmitCallback();
    });
  }
  componentDidMount(){
    //组件刷新前获取客服号下拉值填充
    queryClusterCustomerNumber().then(({jsonResult})=> {
      if(!jsonResult) return;
      this.setState({
        clusterdata: jsonResult
      });
    });
  //查询  群类型下拉值填充
    queryClusterType().then(({jsonResult})=> {
      if(!jsonResult) return;
      this.setState({
        clusterType: jsonResult
      });
    });
    //查询邀请进度
    queryClusterInviteFriendCnt().then(({jsonResult})=> {
        if(!jsonResult) return;
        this.setState({
        Invite: jsonResult
      });
    });

    //查询 商业属性下拉值填充
    queryClusterBusiness().then(({jsonResult})=> {
        if(!jsonResult) return;
        this.setState({
        clusterBusiness: jsonResult
      });
    });
    //查询运营方
    queryClusterBusinessOperator().then(({jsonResult})=> {
        if(!jsonResult) return;
        this.setState({
        clusterBusinessOperator: jsonResult
      });
    });
  }
  //配置推荐专员
  handleInitAssign(e){
    e.preventDefault();
    if(this.props.clusterSns.length<=0) {
      Errors("请选择群!");
      return;
    }
    initAssignReferrer(this.props.clusterSns).then(({jsonResult})=> {
      hashHistory.push({
        pathname: "/admin/cluster/optrToAssign",
        state: {
          assign_optr_id:jsonResult,
          clusterSns:this.props.clusterSns,
          AssignselectedRowsDetails:this.props.AssignselectedRowsDetails
        }
      });
      this.props.handleSubmitCallback();
    });
}
    //群关闭发广告
  closeMockAd(e){
    e.preventDefault();
    if(this.props.clusterSns.length<=0) {
      Errors("请选择群!");
      return;
    }
    Confirm(function(){
      closeMockAd(this.props.clusterSns).then(({jsonResult}) => {
        Success("关闭成功");
        this.props.onRefresh();
        this.props.handleSubmitCallback();
      });
    }.bind(this), "确定关闭发广告吗?")
  }
  //群开启发广告
  openMockAd(e){
    e.preventDefault();
    if(this.props.clusterSns.length<=0) {
      Errors("请选择群!");
      return;
    }
    Confirm(function(){
      openMockAd(this.props.clusterSns).then(({jsonResult}) => {
        Success("开启成功");
        this.props.onRefresh();
        this.props.handleSubmitCallback();
      });
    }.bind(this), "确定开启发广告吗?")
  }
//开始时间和结束时间
  disabledStartDate(startValue){
    if(!startValue || !this.state.endCreateValue) return false;
    return startValue && (startValue.valueOf() > this.state.endCreateValue.valueOf() || startValue.valueOf() > maxDate.valueOf());
  }
  disabledEndDate(endValue){
    if(!endValue || !this.state.startCreateValue) return false;
    return endValue && (endValue.valueOf() < this.state.startCreateValue.valueOf() || endValue.valueOf() > maxDate.valueOf());
  }
  onStartChange(startCreateValue){
    this.setState({startCreateValue})
  }
  onEndChange(endCreateValue){
    this.setState({endCreateValue})
  }
  handleOk() {
    this.setState({
      updateVisible: false,
      clearVisible:false,
      RowsDetails:[]
    });
    this.props.handleSubmitCallback();
  }
  handleCancel(e) {
    this.setState({
      updateVisible: false,
      clearVisible:false,
      RowsDetails:[]
    });
    this.props.handleSubmitCallback();
   }
  //确认提交开启进群邀请说明
  UpdateClusterInviteInfoBtn(e){
    e.preventDefault();
    if(this.props.clusterSns!=null){
      this.props.form.validateFields((errors, values) => {
        if(values.invite_info==null||values.invite_info==''){
          Errors("请输入进群邀请说明!");
          return;
        }
        let value={
            cluster_sn_list:this.props.clusterSns,
            invite_info:values.invite_info,
            all_flag:values.all_flag,
            default_flag:values.default_flag
          }
          batchUpdateClusterInviteInfo(value).then(({jsonResult})=> {
            if(jsonResult.message=="success"){
              Success("开启成功！");
              this.handleCancel();
              this.props.onRefresh();
            }
          });
        });
     }
  }
  //确认提交关闭进群邀请说明
  ClearClusterInviteInfoBtn(e){
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if(this.props.clusterSns!=null){
        batchClearClusterInviteInfo({cluster_sn_list:this.props.clusterSns,all_flag:values.all_flags}).then(({jsonResult})=> {
          if(jsonResult.message=="success"){
            Success("关闭成功！");
            this.handleCancel();
            this.props.onRefresh();
          }
        });
      }
    });
  }
 //开启进群邀请说明
  updateClusterInviteInfo(e){
    e.preventDefault();
    let AssignselectedRowsDetails=[];
    console.log("this.props.AssignselectedRowsDetails",this.props.AssignselectedRowsDetails);
    if(typeof(this.props.AssignselectedRowsDetails)=="undefined"||this.props.AssignselectedRowsDetails.length<=0){
      Errors("请选择群!");
      return;
    }
    else {
      AssignselectedRowsDetails=this.props.AssignselectedRowsDetails
    }
    this.setState({
        updateVisible:true,
        RowsDetails:AssignselectedRowsDetails
      });
  }
  //关闭进群邀请说明
  clearClusterInviteInfo(e){
      e.preventDefault();
      let AssignselectedRowsDetails=[];
      if(typeof(this.props.AssignselectedRowsDetails)=="undefined"||this.props.AssignselectedRowsDetails.length<=0){
        Errors("请选择群!");
        return;
      }
      else {
        AssignselectedRowsDetails=this.props.AssignselectedRowsDetails
      }
      this.setState({
        clearVisible:true,
        RowsDetails:AssignselectedRowsDetails
      });
  }
  //设置运营方
  onBusinessOperator(e){
    e.preventDefault();
    if(typeof(this.props.AssignselectedRowsDetails)=="undefined"||this.props.AssignselectedRowsDetails.length<=0){
      Errors("请选择群!");
      return;
    }
    this.setState({businessOperator:true});
  }
  //发群公告
  onClusterNotice(e){
    e.preventDefault();
    if(typeof(this.props.AssignselectedRowsDetails)=="undefined"||this.props.AssignselectedRowsDetails.length<=0){
      Errors("请选择群!");
      return;
    }
    this.setState({clusterNoticeVisible:true});
  }

  onUpdateVisible(){
    this.setState({openWelcomeVisible: false, closeWelcomeVisible: false,businessOperator:false,clusterNoticeVisible:false});
  }
  //开启进群欢迎用语
  OpenIntoGroupWelcomeBtn(e){
    e.preventDefault();
    if(typeof(this.props.AssignselectedRowsDetails)=="undefined"||this.props.AssignselectedRowsDetails.length<=0){
      Errors("请选择群!");
      return;
    }
    this.setState({openWelcomeVisible:true});
  }
  //关闭进群欢迎用语
  CloseIntoGroupWelcomeBtn(e){
    e.preventDefault();
    if(typeof(this.props.AssignselectedRowsDetails)=="undefined"||this.props.AssignselectedRowsDetails.length<=0){
      Errors("请选择群!");
      return;
    }
    this.setState({closeWelcomeVisible:true});
  }
  //开启进群欢迎用语   关闭进群欢迎用语 设置运营方
  renderSelectModal(){
    const {openWelcomeVisible, closeWelcomeVisible,businessOperator,clusterNoticeVisible} = this.state;
    if(openWelcomeVisible === true){
      return <OpenIntoGroupWelcome openWelcomeVisible={openWelcomeVisible} onUpdateVisible={this.onUpdateVisible}
                       openIntoGroupWelcomeDetails={this.props.AssignselectedRowsDetails} onRefresh={this.props.onRefresh} handleSubmitCallback={this.props.handleSubmitCallback} clusterSns={this.props.clusterSns}/>
    }else if(closeWelcomeVisible === true){
      return <CloseIntoGroupWelcome closeWelcomeVisible={closeWelcomeVisible} onUpdateVisible={this.onUpdateVisible}
                       closeIntoGroupWelcomeDetails={this.props.AssignselectedRowsDetails} onRefresh={this.props.onRefresh} handleSubmitCallback={this.props.handleSubmitCallback} clusterSns={this.props.clusterSns}/>
    }else if(businessOperator === true){
      return <BusinessOperator businessOperator={businessOperator} onUpdateVisible={this.onUpdateVisible} clusterSns={this.props.clusterSns} businessOperatorDetails={this.props.AssignselectedRowsDetails}
                          onRefresh={this.props.onRefresh} handleSubmitCallback={this.props.handleSubmitCallback}/>
    }else if(clusterNoticeVisible === true){
      return <SendClusterNotice clusterNoticeVisible={clusterNoticeVisible} onUpdateVisible={this.onUpdateVisible} clusterSns={this.props.clusterSns} clusterNoticeDetails={this.props.AssignselectedRowsDetails}
                          onRefresh={this.props.onRefresh} handleSubmitCallback={this.props.handleSubmitCallback}/>
    }
    return null;
  }
  render(){
      const formItemLayout = {
          labelCol: {span: 6},
          wrapperCol: {span: 16},
      };
      const {getFieldDecorator} = this.props.form;
      const {RowsDetails}=this.state
      return (
        <div>
          {this.renderSelectModal()}
          <Modal title="详情" visible={this.state.updateVisible}
           onOk={this.handleOk} onCancel={this.handleCancel}
           footer={[]}
         >
           <Form horizontal onSubmit={this.UpdateClusterInviteInfoBtn} >
             <FormItem label="群ID" {...formItemLayout} style={{marginTop: -12}}>
               <p>
                 {
                  RowsDetails.map((item, idx)=> <span style={{with:'60px'}}>{item.cluster_id},</span>)
                 }
              </p>
             </FormItem>
             <FormItem label="是否默认" {...formItemLayout}>
               {getFieldDecorator('default_flag', {initialValue:'F'})(
                 <Select allowClear >
                   <Select.Option value="T">是</Select.Option>
                   <Select.Option value="F">不是</Select.Option>
                 </Select>
               )}
             </FormItem>
             <FormItem label="是否全部群" {...formItemLayout}>
               {getFieldDecorator('all_flag', {initialValue:''})(
                 <Select allowClear >
                   <Select value="T">是</Select>
                   <Select value="">不是</Select>
                 </Select>
               )}
             </FormItem>
             <FormItem label="邀请进群说明" {...formItemLayout} required>
               {getFieldDecorator('invite_info', {
                 initialValue:"",
                 }
               )(
                 <Input type="textarea" rows={5} placeholder="邀请好友进群，跟ta说句话吧~"/>
               )}
               <Button style={{marginTop:16}} htmlType="submit" type="primary" icon="check" size="large" >提交</Button>
             </FormItem>
           </Form>
         </Modal>
         <Modal title="详情" visible={this.state.clearVisible}
          onOk={this.handleOk} onCancel={this.handleCancel}
          footer={[]}
        >
          <Form horizontal onSubmit={this.ClearClusterInviteInfoBtn}>
            <FormItem label="群ID" {...formItemLayout} style={{marginTop: -12}}>
              <p>
                {
                 RowsDetails.map((item, idx)=> <span style={{with:'60px'}}>{item.cluster_id},</span>)
                }
            </p>
            </FormItem>
            <FormItem label="是否全部群" {...formItemLayout}>
              {getFieldDecorator('all_flags', {initialValue:''})(
                <Select allowClear >
                  <Select value="T">是</Select>
                  <Select value="">不是</Select>
                </Select>
              )}
            </FormItem>
            <FormItem label="邀请进群说明" {...formItemLayout} required>
              {getFieldDecorator('invite_info', {
                initialValue: "",
                }
              )(
                <Input type="textarea" rows={5}  disabled />
              )}
              <Button type="primary" htmlType="submit" style={{marginTop:16}} icon="check" size="large" >提交</Button>
            </FormItem>
          </Form>
        </Modal>
          <Form horizontal onSubmit={this.handleSubmit}  className="ant-advanced-search-form">
              <Row gutter={16}>
                  <Col span={8}>
                      <FormItem label="群ID" {...formItemLayout}>
                          {getFieldDecorator('cluster_id')(
                              <Input placeholder="请输入群ID" />
                          )}
                      </FormItem>
                    <FormItem label="群主" {...formItemLayout}>
                      {getFieldDecorator('is_create_master', {initialValue:''})(
                        <Select allowClear placeholder="请选择群主">
                          <Option value="">全部</Option>
                          <Option value="T">原始群主</Option>
                          <Option value="F">非原始群主</Option>

                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem label="群名称" {...formItemLayout}>
                      {getFieldDecorator('cluster_name')(
                        <Input placeholder="群名称" />
                      )}
                    </FormItem>
                    <FormItem label="推荐专员" {...formItemLayout}>
                      {getFieldDecorator('has_refferrer', {initialValue:''})(
                        <Select allowClear placeholder="请选择推荐专员">
                          <Option value="">全部</Option>
                          <Option value="T">已配置</Option>
                          <Option value="F">未配置</Option>
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem label="当前群主" {...formItemLayout}>
                      {getFieldDecorator('master_info')(
                        <Input placeholder="群名称" />
                      )}
                    </FormItem>
                    <FormItem label="发布专员" {...formItemLayout}>
                      {getFieldDecorator('has_publish', {initialValue:''})(
                        <Select allowClear placeholder="请选择发布专员">
                          <Option value="">全部</Option>
                          <Option value="T">已配置</Option>
                          <Option value="F">未配置</Option>
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                <Col span={8}>
                  <FormItem label="原始群主" {...formItemLayout}>
                    {getFieldDecorator('create_master_info')(
                      <Input placeholder="原始群主" />
                    )}
                  </FormItem>
                  <FormItem label="客服号" {...formItemLayout}>
                    {getFieldDecorator('cluster_optr_id', {initialValue:''})(
                      <Select  allowClear placeholder="请选择客服号">
                        <Option value="">全部</Option>
                        <Option value="-1">无客服</Option>
                        {
                          this.state.clusterdata.map((item, idx)=> <Option key={idx}
                                                                         value={`${item.optr_id}`}>{item.optr_name}</Option>)
                        }
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="群成员数" {...formItemLayout}>
                    {getFieldDecorator("sort_type")(
                      <Select allowClear placeholder="请选择群成员数">
                        <Option value="">全部</Option>
                        <Option value="desc">多到少</Option>
                        <Option value="asc">少到多</Option>
                      </Select>
                    )}
                  </FormItem>
                  <FormItem label="发广告状态" {...formItemLayout}>
                    {getFieldDecorator('has_day_mock', {initialValue:''})(
                      <Select allowClear placeholder="请选择今日广告">
                        <Option value="">全部</Option>
                        <Option value="T">已发</Option>
                        <Option value="F">未发</Option>
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
                    <FormItem label="邀请组" {...formItemLayout}>
                      {getFieldDecorator("cluster_group_id", {initialValue:''})(
                          <InputNumber  placeholder="邀请组号（数字）" style={{width:'100%'}}/>
                      )}
                    </FormItem>
                    <FormItem label="群满状态" {...formItemLayout}>
                      {getFieldDecorator('cluster_full_status', {initialValue:''})(
                        <Select allowClear placeholder="请选择群满状态">
                          <Option value="">全部</Option>
                          <Option value="T">已满</Option>
                          <Option value="F">未满</Option>
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                <Col sm={8}>
                  <FormItem label="开始时间" {...formItemLayout}>
                    {getFieldDecorator("start_date",{initialValue:""})(
                      <DatePicker showTime format="YYYY-MM-DD HH:mm:ss"
                       onChange={this.onStartChange}
                       style={{width:'100%'}} />
                    )}
                  </FormItem>
                  <FormItem label="结束时间" {...formItemLayout}>
                    {getFieldDecorator("end_date",{initialValue:""})(
                      <DatePicker showTime format="YYYY-MM-DD HH:mm:ss"
                         onChange={this.onEndChange}
                       style={{width:'100%'}} />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="邀请进度排序" {...formItemLayout}>
                    {getFieldDecorator("invite_sort_type")(
                      <Select allowClear placeholder="请选择邀请进度排序">
                        <Option value="">全部</Option>
                        <Option value="desc">多到少</Option>
                        <Option value="asc">少到多</Option>
                      </Select>
                    )}
                  </FormItem>
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
                  <FormItem label="邀请说明" {...formItemLayout}>
                    {getFieldDecorator("cluster_invite_info")(
                      <Select allowClear placeholder="请选择邀请说明">
                        <Option value="">全部</Option>
                        <Option value="T">已开启</Option>
                        <Option value="F">已关闭</Option>
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="邀请进度" {...formItemLayout}>
                    {getFieldDecorator("invite_friend_cnt")(
                      <Select allowClear placeholder="请选择邀请进度">
                        <Option value="">全部</Option>
                        {
                          this.state.Invite.map((item, idx)=> <Option key={idx}
                                                                         value={`${item.item_value}`}>{item.item_name}</Option>)
                        }
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="欢迎用语" {...formItemLayout}>
                    {getFieldDecorator("cluster_welcome_info")(
                      <Select allowClear placeholder="请选择欢迎用语">
                        <Option value="">全部</Option>
                        <Option value="T">已开启</Option>
                        <Option value="F">已关闭</Option>
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={16}>
                  <Col  offset={1}>
                    <Button style={{marginBottom: 16,marginLeft:20}} key="search" icon="search" type="primary" htmlType="submit">搜索</Button>
                    <Button style={{marginBottom: 16,marginLeft:20}} type="primary"  htmlType="button" onClick={this.handleInitAssign}>配置推荐专员</Button>
                    <Button style={{marginBottom:16,marginLeft:20}} type="primary"  htmlType="button" onClick={this.openMockAd}>开启发广告</Button>
                    <Button style={{marginBottom:16,marginLeft:20}} type="primary" htmlType="button" onClick={this.closeMockAd}>关闭发广告</Button>
                    <Button style={{marginBottom:16,marginLeft:20}} type="primary" htmlType="button" onClick={this.updateClusterInviteInfo}>开启进群邀请说明</Button>
                    <Button style={{marginBottom:16,marginLeft:20}} type="primary" htmlType="button" onClick={this.clearClusterInviteInfo}>关闭进群邀请说明</Button>
                    <Button style={{marginBottom:16,marginLeft:20}} type="primary" htmlType="button" onClick={this.OpenIntoGroupWelcomeBtn}>开启进群欢迎用语</Button>
                    <Button style={{marginBottom:16,marginLeft:20}} type="primary" htmlType="button" onClick={this.CloseIntoGroupWelcomeBtn}>关闭进群欢迎用语</Button>
                    <Button style={{marginBottom:16,marginLeft:20}} type="primary" htmlType="button" onClick={this.onBusinessOperator}>设置运营方</Button>
                    <Button style={{marginBottom:16,marginLeft:20}} type="primary" htmlType="button" onClick={this.onClusterNotice}>发群公告</Button>
                  </Col>
                </Row>
          </Form>
        </div>
      );

     }
}
AdvertisementFrom= Form.create()(AdvertisementFrom);
/**
 * 大群列表组件
 */
export default class ClusterAdvertisement extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      selectedRowKeys: [], //表格选中行
      editVisible: false,       //群信息
      inviteVisible: false,     //邀请好友
      transferVisible: false,   //转让群主
    }
    this.columns=[
      {title: '群ID', dataIndex: 'cluster_id', width: 80, fixed: 'left'},
      {title: '创建时间', dataIndex: 'create_time', width: 120},
      {title: '群名称', dataIndex: 'cluster_name'},
      {title: '当前群主', dataIndex: 'master_info', width: 120},
      {title: '群成员数', dataIndex: 'cluster_member_cnt', width: 80},
      {title: '推荐专员', dataIndex: 'referrer_operation_info', width: 80},
      {title: '发布专员', dataIndex: 'publish_operation_info', width: 80},
      {title: '分配客服时间', dataIndex: 'referrer_operation_date', width: 120},
      {title: '客服号', dataIndex: 'cluster_optr_name', width: 80},
      {title: '群类型', dataIndex: 'cluster_type_text', width: 120},
      {title: '满群状态', dataIndex: 'cluster_full_status_text', width: 80},
      {title: '邀请进度', dataIndex: 'invite_friend_cnt', width: 100},
      {title: '群组', dataIndex: 'cluster_group_id', width: 80},
      { title: '备注', dataIndex: 'remark', width: 120 },
      {title: '上次广告时间', dataIndex: 'last_publish_date', width: 120},
      {title: '商业属性', dataIndex: 'cluster_business_text', width: 80},
      {title: '发广告状态', dataIndex: 'cluster_ad_info', width: 90},
      {title: '运营方', dataIndex: 'business_operator_text', width: 130},
      {title: '欢迎用语', dataIndex: 'welcome_info_text', width: 130},
      {title: '邀请说明', dataIndex: 'invite_info_text', width: 130},
      {title: '操作', dataIndex: '', fixed: 'right', width: 200, render: (text, record) => {
        return <span>
            <a href="javascript:void(0)" onClick={this.editGroup.bind(this, record)}>群信息</a>
            <span className="ant-divider"></span>
            <a href="javascript:void(0)" onClick={this.inviteFriends.bind(this, record)}>邀请好友</a>
            <span className="ant-divider"></span>
            <a href="javascript:void(0)" onClick={this.transferGroup.bind(this, record)}>转让群主</a>
            <span className="ant-divider"></span>
          </span>
      }
      },
    ];
    this.handleSearch = this.handleSearch.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.handleUpdateVisible = this.handleUpdateVisible.bind(this);
    this.handleSubmitCallback=this.handleSubmitCallback.bind(this);
  }
  editGroup(record){
    this.setState({ record, editVisible: true, inviteVisible: false, transferVisible: false });
  }
  inviteFriends(record){
    //查询邀请好友初始化数据，是否有可用运营号
    queryClusterInviteFriends(record.cluster_sn).then(({jsonResult}) => {
      if(jsonResult.active_opts > 0){
        this.setState({
          record,
          inviteFrdData: jsonResult,
          editVisible: false,
          inviteVisible: true,
          transferVisible: false,
        })
      }else{
        Errors("没有可用运营号");
      }
    });
  }
  transferGroup(record){
    this.setState({ record, editVisible: false, inviteVisible: false, transferVisible: true });
  }
  handleUpdateVisible(){
    console.log("重置所有显示弹出框变量为false");
    this.setState({editVisible: false, inviteVisible: false, transferVisible: false, record: null, inviteVisible: null});
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
      selectedRowKeys: [],
      selectedRows:[]
    });
  }
  //所有选中行记录集合
  handleRowChange(selectedRowKeys, selectedRows) {
        this.setState({selectedRowKeys,selectedRows});
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  }
  render(){
    console.log("editVisible => editVisible");
   const {selectedRowKeys,selectedRows} = this.state;
    return (
      <div>
        <AdvertisementFrom onSearch={this.handleSearch} handleSubmitCallback={this.handleSubmitCallback} onRefresh={this.handleRefresh} clusterSns={this.state.selectedRowKeys} AssignselectedRowsDetails={this.state.selectedRows}/>
        <CommonTable
          rowSelection = {{
            selectedRowKeys,
            onChange: this.handleRowChange.bind(this),
          }}
          ref="commonTable"
          columns={this.columns}
          rowKey="cluster_sn"
          fetchTableDataMethod={queryClusterAdvertisementList}
          scroll={{x: 2320}} />
        {this.renderModal()}
      </div>
    );
  }
  //群信息 邀请好友 转让群主 弹出框
  renderModal(){
    console.log(this.state.editVisible+"editVisible => editVisible+1");
    const {editVisible, inviteVisible, transferVisible, record} = this.state;
    if(editVisible === true){
      return <GroupInfo editVisible={editVisible} record={record}
                        onRefresh={this.handleRefresh} onUpdateVisible={this.handleUpdateVisible}/>
    } else if(inviteVisible === true){
      return <InviteFriendsGroup inviteVisible={inviteVisible} cluster_sn={record.cluster_sn}
                                 inviteFrdData={this.state.inviteFrdData}
                                 onRefresh={this.handleRefresh} onUpdateVisible={this.handleUpdateVisible} />
    } else if(transferVisible === true){
      return <TransferCluster transferVisible={transferVisible} record={record}
                              onRefresh={this.handleRefresh} onUpdateVisible={this.handleUpdateVisible} />
    }
    return null;
  }
}
