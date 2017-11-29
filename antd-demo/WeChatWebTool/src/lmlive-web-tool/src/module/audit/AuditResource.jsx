/**
 *资源奖励审核
 * @author 谭亮红
 */
import React, {Component} from 'react';
import {Form, Row, Col, Input, Button, Select, DatePicker,Modal,Icon } from 'antd';
import CustomTable from '../../commons/widgets/CustomTable';
import {DateUtil,FORMAT_PATTERNS} from '../../commons/utils/DateUtil';

import UnionService from '../../service/UnionService';
import AuditService from '../../service/AuditService';
import AnchorService from '../../service/AnchorService';
import FixedDateRangeCmp from '../salary/FixedDateRangeCmp'
const FormItem = Form.Item;
const {RangePicker} = DatePicker;

//公会发票搜索表单
class AuditResourceForm extends FixedDateRangeCmp{
  constructor(props){
    super(props);
    this.state={
      beforeDay:this.fifteenDaysAgo,
      btnStyle:true,
      auditOperationList:[]
    };
  }
  onSearchSubmit=(e)=>{
    e.preventDefault();
    let value=this.extractedFormValue()
    this.props.onSearch(value);
  }

  getDateRangeFieldNames() {
    return ['startTime','endTime']
  }

  componentDidMount(){
    //获取运营归属
    AnchorService.queryUserByType().then(result => {
      this.setState({auditOperationList:result});
    })
  }
  render(){
    const {form,handleReset,guildCode} = this.props;
    const {getFieldDecorator} = form;
    const {beforeDay,auditOperationList}=this.state;

    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    return(
      <Form layout="horizontal" onSubmit={this.onSearchSubmit} className="ant-advanced-search-form">
        <Row>
          <Col sm={8}>
            <FormItem label="创建时间" {...formItemLayout}>
              {getFieldDecorator("data",{initialValue: [beforeDay, DateUtil.nowAsYmd()]})(
                <RangePicker format={FORMAT_PATTERNS.YMD} style={{width: '100%'}}></RangePicker>
              )}
            </FormItem>
            <FormItem style={{textAlign: 'right'}}>
              <Button  type={this.firstRangeButtonType} size="large" onClick={this.queryWithFixedRange.bind(this,this.fifteenDaysAgo)}>最近15日</Button>
              <Button  type={this.secondRangeButtonType} size="large" onClick={this.queryWithFixedRange.bind(this,this.fifteenDaysAgo)}>最近30日</Button>
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="公会" {...formItemLayout}>
              {getFieldDecorator("guildId")(
                <Select
                  optionFilterProp="children"
                  allowClear
                  showSearch placeholder="请选择公会">
                  {
                    guildCode.map(item => (
                      <Option key={item.guildId} value={String(item.guildId)}>{item.guildId}({item.guildName})</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label="运营归属" {...formItemLayout}>
              {getFieldDecorator("tutorUserId")(
                <Select placeholder="请选择运管">
                  {
                    auditOperationList.map(user => (
                      <Option key={String(user.userId)} value={String(user.userId)}>{user.nickname}({user.userId})</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="羚萌ID" {...formItemLayout}>
              {getFieldDecorator("auditSign")(
                <Input placeholder="请输入羚萌ID"/>
              )}
            </FormItem>
            <FormItem style={{textAlign: 'right'}}>
              <Button type="primary" icon="search" size="large" htmlType="submit">查询</Button>
              <Button type="ghost" icon="cross" size="large" onClick={handleReset}>清除</Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
}
AuditResourceForm=Form.create()(AuditResourceForm);

class LookDetail extends  Component{
  constructor(props){
    super(props)
  }
  componentDidMount(){

  }
  render(){
    const {visible, form,onClose,record} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 14 },
    };
    return(
      <Modal title="查看"
             width={660}
             visible={visible}
             okText="确定"
             cancelText="取消"
             onOk={this.handleSave}
             onCancel={onClose}>
        <Form>
          <Row>
            <Col sm={12}>
              <FormItem label="编号" {...formItemLayout}>
                <p>{record.recordId}</p>
              </FormItem>
              <FormItem label="公会" {...formItemLayout}>
                <p>{record.guildName}</p>
              </FormItem>
              <FormItem label="奖惩项目" {...formItemLayout}>
                <p>{record.sanctionItemDesc}</p>
              </FormItem>
              <FormItem label="创建人" {...formItemLayout}>
                <p>{record.createUserName}</p>
              </FormItem>
              <FormItem label="备注" {...formItemLayout}>
                <p>{record.remark}</p>
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label="对象类型" {...formItemLayout}>
                <p>{record.sanctionObj}</p>
              </FormItem>
              <FormItem label="主播" {...formItemLayout}>
                <p>{record.anchorUserName}</p>
              </FormItem>
              <FormItem label="金额" {...formItemLayout}>
                <p>{record.fee}</p>
              </FormItem>
              <FormItem label="创建时间" {...formItemLayout}>
                <p>{record.createTime}</p>
              </FormItem>
            </Col>
          </Row>
        </Form>
        <Row>
          <Col sm={24}>
            <div>编辑历史</div>
          </Col>
        </Row>
        <Row>
          <Col sm={24}>
            <div>最近30天奖罚记录</div>
          </Col>
        </Row>
      </Modal>
    )
  }
}
LookDetail=Form.create()(LookDetail);

export default class AuditSanction extends  Component{
  constructor(props){
    super(props);
    this.state={
      recordObj:{},
      guildCode:[],
      openDetail:false,
    };
    this.columns=[
      {title: '奖励编号', dataIndex: 'recordId', width: 85, fixed: 'left'},
      {title: '公会', dataIndex: 'guildName', width: 100},
      {title: '身份', dataIndex: 'uersName', width: 100},
      {title: '用户', dataIndex: 'name', width: 100},
      {title: '物品类型', dataIndex: 'q', width: 85},
      {title: '物品', dataIndex: 'w', width: 85},
      {title: '数量', dataIndex: 'e', width: 85},
      {title: '有效期(天)', dataIndex: 'r', width: 100},
      {title: '创建时间', dataIndex: 'createTime', width: 135},
      {title: '创建人', dataIndex: 'createUserName', width: 100},
      {title: '备注', dataIndex: 'remark', width: 135},
      {title: '审核状态', dataIndex: 'auditSignDesc', width: 85},
      {title: '审核拒绝原因', dataIndex: 'auditReason'},
      {title: '审核人', dataIndex: 'auditUserName', width: 85},
      {title: '审核时间', dataIndex: 'auditTime', width: 135},
      {title: '操作', fixed:"right",width: 70 ,render:(text, record) => {
        return (
          <span>
            <a href="javascript:void(0)" onClick={this.onLookDetail.bind(this,record)}>查看</a>
          </span>
        )
      }}
    ]
  }
  onLookDetail(record,e){
    e.preventDefault();
    AuditService.querySanctionDetail({recordId:record.recordId}).then(jsonResult=>{
      console.log(jsonResult);
      this.setState({
        openDetail:true,
        recordObj:jsonResult
      })
    })
  }
  componentDidMount() {
    //获取公会id(不是公会代码)
    UnionService.queryAllGuild().then(guildCode => {
      this.setState({guildCode})
    })
  }
  // 表单搜索
  handleOnSearch=(value)=> {
    this._customTable.queryTableData(value);
  }
  //统一关闭弹出框
  handleClose=(refresh=false)=>{
    refresh && this._customTable.refreshTable();
    this.setState({
      openDetail:false,
      recordObj:{}
    })
  }
  //清空表单
  handleReset=(e)=>{
    e.preventDefault();
    this._auditResourceForm.resetFields();
  }
  render(){
    const {recordObj,guildCode,openDetail} = this.state;
    return(
      <div>
        <AuditResourceForm ref={(obj) => this._auditResourceForm=obj} onSearch={this.handleOnSearch}
                           handleReset={this.handleReset} guildCode={guildCode}/>
        <CustomTable ref={table => this._customTable=table}
                     rowKey="recordId"
                     columns={this.columns}
                     scroll={{x: 1600}}
                     fetchTableDataMethod={AuditService.queryAuditList}/>
        <LookDetail visible={openDetail} onClose={this.handleClose} record={recordObj}/>
      </div>
    )
  }
}