import React from 'react';
import { Form, Row, Col, Input, Select, Button, Table, Tag,Modal,InputNumber,DatePicker,Upload, Icon} from 'antd';
import CommonTable from '../Commons/CommonTable';
import {
  queryBusinessOperatorTeamList,
  getBusinessOperatorAdTeamParam,
  saveBusinessOperatorAdTeamParam,
  saveBusinessOperatorQRCode,
  queryClusterBusinessOperator,
  deleteQrcodeByBusinessOperator,
  updateBusinessOperatorTeam,
  getBusinessOperatorQRCodeByOperator,
  getOneBusinessOperatorAdTeamParam} from '../../services/ads';
import {Confirm, Success,Errors} from '../Commons/CommonConstants';
const FormItem = Form.Item;
const Option = Select.Option;
/*
发圈设置
 */
class SendWeChatSet extends React.Component{
  constructor(props){
    super(props);
    this.state={
      visible: props.onOpen,
      adTeamParam:{},           //初始化大数据对象
      businessOperatorSelect:[],
      businessOperator:[],      //运营方
      operatorTeamList:[],      //第二层数组对象表格数据
      initialValueOperator:'',  //初始化运营方下拉选中框
      wechatGroups:"",          //初始化参与自动发圈的运营组
      fileList: [],             //上传的图片集合
      dataUrl:null,             //后台返回的二维码图片地址
      imgUrl:[],                //展示图片
      businessOperator:""
    };
    this.onBeforeUpload = this.onBeforeUpload.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
    this.handlePreview = this.handlePreview.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleChangeOperator=this.handleChangeOperator.bind(this);
    this.onAdd=this.onAdd.bind(this);
    this.onSubmit=this.onSubmit.bind(this);
    this.onChangeOperatorw=this.onChangeOperatorw.bind(this);
    this.onDeleteQrcode=this.onDeleteQrcode.bind(this);
    this.onUpdateOperatorTeam=this.onUpdateOperatorTeam.bind(this);
  }
  onSaveUploadQRCode(prams){
    let values=this.props.form.getFieldsValue();
    if(values.business_operatorw==null||values.business_operatorw==''){
      Errors("请选择运营方！");
      return;
    }
    console.log("onUpload=>",this.state.fileList);
    // if(this.state.fileList.length>0){
      saveBusinessOperatorQRCode({business_operator:values.business_operatorw,qr_code:prams}).then(({jsonResult})=> {
        console.log("saveBusinessOperatorQRCode",jsonResult);
        if(!jsonResult) return;
        this.setState({imgUrl:jsonResult});
      });
    // }
  }
  handleOk(){
    this.setState({
      visible: false,
    });
  }
  handleCancel(){
    this.setState({
      visible: false,
    });
    this.props.onClose();
  }
  onSubmit(e){
    e.preventDefault();
    Confirm(function(){
      let list=[];
      let values=this.props.form.getFieldsValue();
      this.state.operatorTeamList.map((item, idx)=>{
        list.push({business_operator:item.business_operator,wechat_groups_text:item.wechat_groups_text});
      });
      let value={
        team_operation_count:values.team_operation_count, //基于运营方的发圈分组运营号数
        ad_time_list_text:values.ad_time_list_text,       //自动发圈时间点
        is_open:values.is_open,                           //自动发圈 T:开启 F:关闭
        operator_team_list:list                               //运营方编号business_operator 和 wechat_groups_text  List<BusinessOperatorWechatGroup>
      };
      saveBusinessOperatorAdTeamParam(value).then(({jsonResult})=> {
          if(!!jsonResult){
            this.handleRefrensh();
            Success("提交成功！");
          }
        });
      }.bind(this),"确定提交吗？");
  }
  //增加一条表格数据前   判断是否已经存在该条记录
  onAdd(e){
    e.preventDefault();
    let values=this.props.form.getFieldsValue();
    let addOperatorTeamList=this.state.operatorTeamList;
    let value={
      business_operator:values.business_operator,
      business_operator_name:null,
      wechat_groups_text:values.wechat_groups
    };
    getOneBusinessOperatorAdTeamParam(value).then(({jsonResult})=> {
      //判断是否存已经选中的数据  jsonResult为后台返回的一条表格数据
      let hadData = this.state.operatorTeamList.filter((ads,idx)=> {
        return ads.business_operator==jsonResult.business_operator;
      });
      if(hadData.length>0){
        Errors("已经存在该运营方记录，请删除该条记录在添加！");
      }else{
        addOperatorTeamList.push(jsonResult);
        this.setState({operatorTeamList:addOperatorTeamList});
        this.props.form.setFieldsValue({wechat_groups:''})
      }
    });
  }
  //运营方下拉选中框更改
  handleChangeOperator(value){
    let wechatGroups = this.state.businessOperatorSelect.filter((ads,idx)=> {
      return ads.business_operator==value;
    });
    if(wechatGroups.length>0){
      this.setState({wechatGroups:wechatGroups[0].wechat_groups_text});
    }else{
      this.setState({wechatGroups:""});
    }
  }
  //删除一条表格数据
  onTeamListRemove(value){
      let operatorTeamList= this.state.operatorTeamList.filter((ads,idx)=> {
        return idx!=value;
      });
      this.setState({operatorTeamList});
  }
  onUpdateOperatorTeam(e){
    e.preventDefault();
    Confirm(function(){
      let list=[];
      let values=this.props.form.getFieldsValue();
      this.state.operatorTeamList.map((item, idx)=>{
        list.push({business_operator:item.business_operator,wechat_groups_text:item.wechat_groups_text});
      });
      let value={
        team_operation_count:values.team_operation_count, //基于运营方的发圈分组运营号数
        ad_time_list_text:values.ad_time_list_text,       //自动发圈时间点
        is_open:values.is_open,                           //自动发圈 T:开启 F:关闭
        operator_team_list:list                               //运营方编号business_operator 和 wechat_groups_text  List<BusinessOperatorWechatGroup>
      };
      updateBusinessOperatorTeam(value).then(({jsonResult})=>{
       console.log("updateBusinessOperatorTeam",jsonResult);
       if(!!jsonResult){
         this.handleRefrensh();
         Success("提交成功！");
       }
      }).catch((err)=>{
        Errors(err);
      });
  }.bind(this),"确定提交并重建分组吗？");
  }
  handleRefrensh(){
    //查询运营方
    queryClusterBusinessOperator().then(({jsonResult})=> {
      if(!jsonResult) return;
      this.setState({
        businessOperatorSelect:jsonResult
      });

    });
    //获取运营方分组发圈参数
    getBusinessOperatorAdTeamParam().then(({jsonResult})=> {
        if(!jsonResult) return;
        this.setState({
        adTeamParam: jsonResult,
        businessOperator:jsonResult.operator_team_list,
        operatorTeamList:jsonResult.operator_team_list,
        wechatGroups:jsonResult.operator_team_list[0].wechat_groups_text,
        initialValueOperator:jsonResult.operator_team_list[0].business_operator
      });
    });
  }
  componentDidMount(){
    this.handleRefrensh();
  }
  onChangeOperatorw(value){
    this.setState({
      imgUrl:[]
    });
    getBusinessOperatorQRCodeByOperator(value).then(({jsonResult})=>{
      console.log("getBusinessOperatorQRCodeByOperator",jsonResult);
      if(!jsonResult) return;
      this.setState({
        businessOperator:value,
        imgUrl:jsonResult
      });
    });
  }
  onDeleteQrcode(e){
    e.preventDefault();
    deleteQrcodeByBusinessOperator(this.state.businessOperator).then((jsonResult)=>{
      console.log("deleteQrcodeByBusinessOperator",jsonResult);
      if(!!jsonResult){
      this.setState({imgUrl:[]});
     }
    });
  }
  onBeforeUpload(file) {
   // headers['X-Requested-With']跨域，这里设置为null
   if(file.type !== 'image/jpeg' && file.type !== 'image/png') {
     Errors('只能上传 JPG或PNG 文件哦！');
     return false;
   }

   if(file.size > 10*1024*1024) {
     Errors('只能上传 小于10M 的文件哦！');
     return false;
   }

   if(this.state.fileList.length > this.props.maxFileSize - 1) {
     Errors(`只能上传最多${this.props.maxFileSize}张图片`);
     return false;
   }
   return true;
 }

 onFileChange(info) {
   const file = info.file;
   const res = file.response;
   if(file.status === 'done' && res && res.code === 200 && res.data.length > 0){
     this.onSaveUploadQRCode(JSON.stringify(res.data[0]));
   }
   if(res.code != 200){
     Errors("上传失败,请重新上传!调用对端上传失败，请联系管理员或者重试");
   }
 }

 handlePreview(file) {
   window.open('javascript:window.name;', '<script>location.replace("'+file['url']+'")<\/script>')
 }

 handleRemove(file) {
   let fileList = [];
   this.state.fileList.forEach( f => {
       if(f.uid !== file.uid) {
         fileList.push(f);
       }
   });
   console.log(fileList);
   this.setState({ fileList });
 }

 componentWillReceiveProps(nextProps) {
   if('isResetData' in nextProps && nextProps['isResetData'] === true) {
     this.setState({
       fileList: [],
     });
   }
 }
  render(){
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14}
    }
    const {getFieldDecorator} = this.props.form;
    const action = AppName + "/ad/uploadAd";
    const {visible,adTeamParam,imgUrl,operatorTeamList,wechatGroups,initialValueOperator,businessOperatorSelect} = this.state;
    return(
      <Modal visible={visible} maskClosable={false} title={`发圈设置`} width={1000}
        onOk={this.handleOk} onCancel={this.handleCancel}
        footer={[]}>
        <Form horizontal onSubmit={this.onSubmit}>
          <FormItem  {...formItemLayout} style={{marginTop: -12}}>
            <p>
              电商朋友圈范粉投放，自动发圈设置：
           </p>
          </FormItem>
          <Row gutter={16}>
            <Col span={8}>
              <FormItem label="运营方" {...formItemLayout}>
                {getFieldDecorator("business_operator",{initialValue:initialValueOperator})(
                  <Select allowClear
                    onChange={this.handleChangeOperator}
                    optionFilterProp="children">
                    {
                      businessOperatorSelect.map((item, idx)=> <Option key={idx}
                                                                     value={`${item.item_value}`}>{item.item_name}</Option>)
                    }
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="参与自动发圈的运营组" {...formItemLayout} >
                {getFieldDecorator("wechat_groups",{initialValue:wechatGroups})(
                  <Input/>
                )}
              </FormItem>
          </Col>
          <Col span={4}>
            <Button  type="primary" icon="plus" htmlType="button" onClick={this.onAdd}>增加</Button>
          </Col>
        </Row>
        <FormItem style={{marginLeft:80}}>
          <table style={{width:800,border:"1px solid #ccc", borderCollapse:"collapse",textAlign:"center"}}>
            {
              operatorTeamList.map((item, idx)=>{
                return <tr style={{border:"1px solid #ccc"}}>
                  <td style={{border:"1px solid #ccc"}}>{item.business_operator_name}</td>
                  <td style={{border:"1px solid #ccc"}}>{item.wechat_groups_text}</td>
                  <td style={{border:"1px solid #ccc"}}>参与组当前可用状态运营号总数{item.operation_count}个，粉丝总数{item.friend_count}个， 平均粉丝数：{item.friend_count_avg}个</td>
                  <td style={{border:"1px solid #ccc"}}><a href="javascript:void(0)" onClick={this.onTeamListRemove.bind(this, idx)}>删除</a></td>
                  </tr>
              })
            }
            </table>
        </FormItem>
        <FormItem label="基于运营方的发圈分组运营号数" {...formItemLayout} labelCol={{span:6}} help="修改参数后，参与组新增运营号按新参数划分组">
          {getFieldDecorator("team_operation_count",{initialValue:adTeamParam.team_operation_count})(
            <InputNumber />
          )}
          <p className="ant-form-text">个</p>
        </FormItem>
        <FormItem label="自动发圈时间点设置" {...formItemLayout} labelCol={{span:6}} help="注：支持多个时间点设置，不同时间点间用,分隔">
          {getFieldDecorator("ad_time_list_text",{initialValue:adTeamParam.ad_time_list_text})(
            <Input/>
          )}
        </FormItem>
        <FormItem label="自动发圈设置"  labelCol={{span:6}} wrapperCol={{span:6}}>
          {getFieldDecorator("is_open",{initialValue:adTeamParam.is_open})(
            <Select allowClear placeholder="请选择自动发圈设置">
              <Option value="T">开启</Option>
              <Option value="F">关闭</Option>
            </Select>
          )}
        </FormItem>
        <FormItem  {...formItemLayout} style={{marginTop: -12}}>
          <p>
            上传二维码图片（选填） 发圈时会基于运营方 随机选择一张二维码图片与商品信息一同发出
         </p>
        </FormItem>
        <FormItem label="选择运营方" labelCol={{span:3}} wrapperCol={{span:6}}>
          {getFieldDecorator("business_operatorw")(
            <Select
              onChange={this.onChangeOperatorw}
              placeholder="请选择运营方">
              {
                businessOperatorSelect.map((item, idx)=> <Option key={idx}
                                                               value={`${item.item_value}`}>{item.item_name}</Option>)
              }
            </Select>
          )}
        </FormItem>
        <FormItem labelCol={{span: 4}} wrapperCol={{span: 16}} label="上传图片" isRequired>
          <Upload
            action={action}
            data={{
              sessionId: localStorage.getItem('sessionId'),
              upload_type:"QrCode"
            }}
            className="upload-list-inline"
            listType="picture"
            showUploadList={false}
            beforeUpload={this.onBeforeUpload}
            onChange={this.onFileChange}
            onPreview={this.handlePreview}
            onRemove={this.handleRemove}>
            <Button type="ghost" >
              <Icon type="upload" /> 上传
            </Button>
          </Upload>
          <Button type="primary" size="large" onClick={this.onDeleteQrcode} style={{marginLeft:5}}>删除全部</Button>
        </FormItem>
        <FormItem labelCol={{span: 4}} wrapperCol={{span: 20}} >
          {
            imgUrl.map((item, idx)=>
            <span style={{backgroundColor:"#ccc",height:"80px",display:"inline-block",marginRight:15}}>
              <img src={item.qr_code} width="80" height="80" />
            </span>)
          }
        </FormItem>
        <FormItem wrapperCol={{offset: 4, span: 10}}>
          <Button type="primary" icon="check" size="large" htmlType="submit">提交</Button>
          <Button style={{marginLeft:10}} type="primary" size="large" onClick={this.onUpdateOperatorTeam}>提交并重建分组</Button>
        </FormItem>
      </Form>
    </Modal>
  );
}
}
export default Form.create()(SendWeChatSet);
