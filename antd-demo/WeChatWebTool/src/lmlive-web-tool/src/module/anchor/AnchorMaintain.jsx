import React, {Component} from 'react';
import {Table, Form, Row, Col, Input, InputNumber, DatePicker, Select, Button, Modal} from 'antd';
import CustomTable from '../../commons/widgets/CustomTable';
import ImageListUpload from '../../commons/widgets/ImageListUpload';
import webUtils from '../../commons/utils/webUtils';
import AnchorService from '../../service/AnchorService'
import LivingRecordModal from './LivingRecordModal'
import CustomSelect from '../../commons/widgets/CustomSelect';
import moment from 'moment'

const FormItem = Form.Item;
const Option = Select.Option;
const SearchForm = Form.create()(
  (props) => {
    const {form, onSearch, onAddEvent} = props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    const _search = (e) => {
      e.preventDefault();
      onSearch(form.getFieldsValue())
    }
    return (
      <Form layout="horizontal" onSubmit={ _search } className="ant-advanced-search-form">
        <Row>
          <Col sm={8}>
            <FormItem label="主播ID" {...formItemLayout}>
              {getFieldDecorator("userId")(<Input placeholder="请输入主播ID查询" />)}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="昵称" {...formItemLayout}>
              {getFieldDecorator("nickname")(<Input placeholder="昵称支持模糊查询" />)}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="公会" {...formItemLayout}>
              {getFieldDecorator("programBelong")(
                <CustomSelect allowClear showSearch optionFilterProp="children" itemKey="ProgramBelong" placeholder="请选择公会"/>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col offset={16} span={8} style={{ textAlign: 'right' }}>
            <Button type="ghost" icon="plus" size="large" onClick={onAddEvent}>添加</Button>
            <Button type="primary" icon="search" size="large" htmlType="submit">搜索</Button>
          </Col>
        </Row>
        {/*<Row>
          <Col span={12} offset={12} style={{ textAlign: 'right' }}>
            <Button type="ghost" icon="plus" size="large" onClick={onAddEvent}>添加</Button>
            <Button type="primary" icon="search" size="large" htmlType="submit">搜索</Button>
          </Col>
        </Row>*/}
      </Form>
    )
  }
);

class AnchorEventForm extends Component{
  constructor(props){
    super(props);
  }
  handleSave = () => {
    this.props.form.validateFields((err, values) => {
      if(!!err) return
      // values["endDate"] = new Date(values["endDate"].format("YYYY-MM-DD 00:00:00")).getTime();
      values["nextEventTime"] = values["nextEventTime"].valueOf();
      console.log(values)
      webUtils.confirm(()=> {
        AnchorService.saveNewEvent(values).then( result => {
          webUtils.alertSuccess("添加成功！");
          this.props.onClose(true)
        })
      }, "确认提交吗？")
    });
  }
  handleCancel = () => {
    this.props.onClose( true );
  }
  render(){
    const {visible, record, form} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal title="添加事件"
             width={660}
             visible={visible}
             okText="提交"
             cancelText="取消"
             onOk={this.handleSave}
             onCancel={this.handleCancel}>
        <Form>
          {record && getFieldDecorator("userId")(<Input type="hidden"/>)}
          {record && getFieldDecorator("eventSn")(<Input type="hidden"/>)}
          {!record &&
            <FormItem label="主播ID" {...formItemLayout}>
              {getFieldDecorator("userId", {
                rules: [{required: true, message: '请输入主播ID'}],
              })(
                <Input type="text" rows="4" placeholder="请输入主播ID"/>
              )}
            </FormItem>
          }
          <FormItem label="事件类型" {...formItemLayout}>
            {getFieldDecorator("eventCodes", {
              rules: [{ required: true, message: '请选择事件类型'}],
              initialValue: 'qingjia'
            })(
              <Select placeholder="请选择事件类型">
                <Option value="qingjia">请假</Option>
                <Option value="richangweixi">日常维系</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="沟通内容" {...formItemLayout}>
            {getFieldDecorator("eventDesc", {
              rules: [{ required: true, message: '请输入沟通内容'}],
            })(
              <Input type="textarea" rows="4" placeholder="请输入沟通内容" />
            )}
          </FormItem>
          <FormItem label="截止日期提醒" {...formItemLayout}>
            {getFieldDecorator("nextEventTime")(
              <DatePicker format="YYYY-MM-DD" placeholder="截止日前不再提醒"/>
            )}
          </FormItem>
          <FormItem label="处理结果" {...formItemLayout}>
            {getFieldDecorator("handleResult", {
              rules: [{ required: true, message: '请选择处理结果'}],
              initialValue: 'bcl'
            })(
              <Select>
                <Option value="bcl">不处理</Option>
                <Option value="jsll">减少流量</Option>
                <Option value="jmxx">节目下线</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="截图" {...formItemLayout}>
            {getFieldDecorator("pic", {
              valuePropName: 'fileList',
            })(<ImageListUpload uploadFolderName={webUtils.getUploadFolderName("ConfigPic")}
                            uploadButtonText="上传截图"/>)}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

AnchorEventForm = Form.create({
  mapPropsToFields(props){
    if( props.visible && props.record ) {
      console.log(props.record)
      const {userId, eventDesc, eventSn, nextEventDate, eventCodes, handleResult} = props.record
      return {
        userId: {value: userId},
        eventDesc: {value: eventDesc},
        eventSn: {value: eventSn},
        nextEventTime: {value: nextEventDate ? moment(nextEventDate,"YYYY-MM-DD") : null},
        eventCodes: {value: eventCodes},
        handleResult: {value: handleResult}
      }
    }
    return {}
  }
})(AnchorEventForm)

export default class AnchorMaintain extends Component{
  constructor(props){
    super(props)
    this.state = {
      visible: false,
      isLiveRecordVisiable: false,
      // 添加事件 或 处理事件
      addAnchorEvent: true,
      //处理事件的数据
      record: {}
    };
    this.columns = [
      {title: '日期', dataIndex: 'eventTime'},
      {title: '主播', dataIndex: 'nickname'},
      {title: '公会', dataIndex: 'programBelongText'},
      // {title: '事件类型', dataIndex: 'eventCodes'},
      {title: '描述', dataIndex: 'eventDesc'},
      {title: '操作', dataIndex: 'handle', render:(text, record) => {
          return (
            <span>
              <a href="javascript:void(0)" onClick={this.handleDealEvent.bind(this, record)}>处理</a>
              <span className="ant-divider" />
              <a href="javascript:void(0)" onClick={this.handleShowLiveRecord.bind(this, record)}>开播记录</a>
            </span>
          )
      }}
    ]
  }

  handleSearch = (values) => {
    this._tableRef.queryTableData(values);
  }
  handleDealEvent(record){
    this.setState({
      visible: true,
      record
    });
  }
  handleShowLiveRecord(record){
    this.setState({
      isLiveRecordVisiable: true,
      record
    })
  }
  openAnchorEventModal = () => {
    this.setState({ visible: true });
  }
  handleClose = (isRefresh=false) => {
    this.setState({
      visible: false,
      isLiveRecordVisiable: false,
      record: {}
    });
    isRefresh && this._tableRef.refreshTable();
  }
  render(){
    const {visible, isLiveRecordVisiable, record} = this.state;
    return (
      <div>
        <SearchForm onSearch={this.handleSearch} onAddEvent={this.openAnchorEventModal} />
        <CustomTable ref={obj=>this._tableRef=obj} fetchTableDataMethod={AnchorService.queryEventByManager}
                     rowKey="eventSn"
                     columns={this.columns} />
        <AnchorEventForm visible={visible} record={record} onClose={this.handleClose} />
        <LivingRecordModal visible={isLiveRecordVisiable} record={record} onClose={this.handleClose} />
      </div>
    )
  }
}