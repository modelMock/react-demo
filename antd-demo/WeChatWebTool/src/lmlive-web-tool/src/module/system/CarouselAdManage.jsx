import React, {Component} from 'react';
import {Form, Row, Col, Input, InputNumber, Modal, Tag, Table, Button, DatePicker, Radio} from 'antd';
import moment from 'moment';
import ConfigService from '../../service/ConfigService';
import webUtils from '../../commons/utils/webUtils';
import commonUtils from '../../commons/utils/commonUtils';
import ImageUpload from '../../commons/widgets/ImageUpload';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const detailPicIdPrefix = "detailPicId=";

class EidtCarouselAdForm extends Component {
  state = {
    loading: false,
    mode: 'simple',
    needShare: "T",

    startTime: null,
    endTime: null,
  }
  componentWillReceiveProps(nextProps){
    const {visible, record} = nextProps
    // 编辑广告条，第一次打开时
    if(visible === true && !this.props.record && !!record){
      this.setState({
        needShare: record['needShare'],
        mode: record['mode'],
        startTime: moment(record['startTime'], dateFormat),
        endTime: moment(record['endTime'], dateFormat)
      })
    }
  }
  handleChangeMode = (e) => {
    const mode = e.target.value;
    if(mode !== this.state.mode){
      mode === "custom" && this.props.form.setFieldsValue({ detailPicId: null})
      this.setState({ mode })
    }
  }
  handleChangeShare = (e) => {
    const needShare = e.target.value;
    if(needShare !== this.state.needShare){
      this.setState({ needShare })
    }
  }
  disabledStartTime = (startTime) => {
    const endTime = this.state.endTime;
    if (!startTime || !endTime) {
      return false;
    }
    return startTime.valueOf() > endTime.valueOf();
  }
  disabledEndTime = (endTime) => {
    const startTime = this.state.startTime;
    if (!endTime || !startTime) {
      return false;
    }
    return endTime.valueOf() <= startTime.valueOf();
  }
  onStartChange = (value) => {
    this.setState({ startTime: value})
  }
  onEndChange = (value) => {
    this.setState({ endTime: value})
  }
  __reset(flag = false){
    this.props.onClose(flag);
    this.props.form.resetFields();
    this.setState({
      loading: false,
      mode: 'simple',
      needShare: "T",
      startTime: null,
      endTime: null
    })
  }
  handleCancel = () => {
    this.__reset(false)
  }
  handleSave = () => {
    this.props.form.validateFields((error, values) => {
      if(error) return;
      // 简单模式必须上传详情图片
      if(values['mode'] === 'simple' && !values['detailPicId']){
        webUtils.alertFailure("请上传广告详情图片");
        return;
      }
      // 自定义模式不需要详情图片
      if(values['mode'] === 'custom'){
        values['detailPicId'] = null;
      }
      webUtils.confirm(() => {
        this.setState({ loading: true })
        values['startTime'] = values['startTime'].format(dateFormat)
        values['endTime'] && (values['endTime'] = values['endTime'].format(dateFormat))
        delete values['mode']
        ConfigService.editCarouselAd(values).then(result => {
          webUtils.alertSuccess("提交成功")
          this.__reset(true)
        })
      }, "确定提交吗？")
    });
  }
  render(){
    const {loading, mode, needShare, startTime, endTime} = this.state
    const {visible, form, record} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14}
    }
    const rowFormItemLayout = {
      labelCol: {span: 3},
      wrapperCol: {span: 19},
    }
    const notNeedShare = needShare === "F"
    const title = !!record ? "编辑广告条" : "添加广告条"
    return (
      <Modal title={title}
             width={800}
             visible={visible}
             confirmLoading={loading}
             onOk={this.handleSave}
             onCancel={this.handleCancel}
             okText="提交"
             cancelText="取消">
        <Form>
          {getFieldDecorator('adId')(<Input type="hidden"/>)}
          <Row>
            <Col sm={12}>
              <FormItem label="名称" {...formItemLayout}>
                {getFieldDecorator('adName',{
                  // initialValue: '测试广告2',
                  rules: [{required: true, message: '请输入广告条名称'}]
                })(<Input placeholder="广告条名称" />)}
              </FormItem>
              <FormItem label="生效时间" {...formItemLayout}>
                {getFieldDecorator('startTime',{
                  initialValue: startTime,
                  rules: [{required: true, message: '请选择广告条生效时间'}]
                })(
                  <DatePicker showTime
                              disabledDate={this.disabledStartTime}
                              onChange={this.onStartChange}
                              format={dateFormat}
                              placeholder="生效时间" />
                )}
              </FormItem>
              <FormItem label="序号" {...formItemLayout}>
                {getFieldDecorator('orderNum',{
                  rules: [{required: true, message: '请输入广告条序号'}]
                })(<InputNumber min={1} placeholder="广告条序号" />)}
              </FormItem>
              <FormItem label="广告条" {...formItemLayout}>
                {getFieldDecorator("picId", {
                  rules: [{required: true, message: "请上传广告条图片"}],
                  valuePropName: 'fileList',
                  // initialValue: 'config/ads/banner-test.jpg'
                })(<ImageUpload uploadFolderName={webUtils.getUploadFolderName("ConfigPic")}
                                uploadButtonText="上传广告"/>)}
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label="描述" {...formItemLayout}>
                {getFieldDecorator('adDesc',{
                  // initialValue: '测试广告22',
                  rules: [{required: true, message: '请输入广告条描述'}]
                })(<Input placeholder="广告条描述" />)}
              </FormItem>
              <FormItem label="失效时间" {...formItemLayout}>
                {getFieldDecorator('endTime',{
                  initialValue: endTime,
                  // rules: [{required: true, message: '请选择广告条失效时间'}]
                })(
                  <DatePicker showTime
                              disabledDate={this.disabledEndTime}
                              onChange={this.onEndChange}
                              format="YYYY-MM-DD HH:mm:ss"
                              placeholder="失效时间" />
                )}
              </FormItem>
              <FormItem label="模式" {...formItemLayout}>
                {getFieldDecorator('mode',{
                  initialValue: 'simple'
                })(
                  <RadioGroup onChange={this.handleChangeMode}>
                    <RadioButton value="simple">简单模式</RadioButton>
                    <RadioButton value="custom">自定义模式</RadioButton>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem label="详情图片" {...formItemLayout}>
                {getFieldDecorator("detailPicId", {
                  valuePropName: 'fileList',
                  // initialValue: 'config/ads/banner-test.jpg'
                })(<ImageUpload uploadFolderName={webUtils.getUploadFolderName("ConfigPic")}
                                uploadButtonText="上传广告详情图片" disabled={mode === 'custom'}/>)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col sm={24}>
              <FormItem label="链接地址" {...rowFormItemLayout}>
                {getFieldDecorator('linkUrl',{
                  initialValue: 'http://www.51lm.tv/show/activity/IMGDetail.html',
                  rules: [{required: true, message: '请输入广告条链接地址'}]
                })(<Input placeholder="广告条链接地址" />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col sm={12}>
              <FormItem label="是否分享" {...formItemLayout}>
                {getFieldDecorator('needShare',{
                  initialValue: 'T'
                })(
                  <RadioGroup onChange={this.handleChangeShare}>
                    <RadioButton value="T">是</RadioButton>
                    <RadioButton value="F">否</RadioButton>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem label="分享链接" {...formItemLayout}>
                {getFieldDecorator('shareUrl',{
                  initialValue: 'http://www.51lm.tv/show'
                })(<Input placeholder="分享链接" disabled={notNeedShare} />)}
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label="分享标题" {...formItemLayout}>
                {getFieldDecorator('shareTitle')(<Input placeholder="分享标题" disabled={notNeedShare} />)}
              </FormItem>
              <FormItem label="分享LOGO" {...formItemLayout}>
                {getFieldDecorator('sharePic',{
                  initialValue: '/logo144.png'
                })(<Input placeholder="分享LOGO" disabled={notNeedShare} />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col sm={24}>
              <FormItem label="分享内容" {...rowFormItemLayout}>
                {getFieldDecorator('shareContent')(<Input placeholder="分享内容" disabled={notNeedShare} />)}
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label="备注" {...rowFormItemLayout}>
                {getFieldDecorator('remark')(<Input type="textarea" rows={4} placeholder="备注" />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

EidtCarouselAdForm = Form.create({
  mapPropsToFields(props){
    const {visible, record} = props;
    if(! visible || !record) return {};
    const linkUrl = record['linkUrl'];
    const index = linkUrl && linkUrl.indexOf(detailPicIdPrefix);
    if(index > 0) {
      record['detailPicId'] = linkUrl.substring(index + detailPicIdPrefix.length);
      record['linkUrl'] = linkUrl.substring(0, linkUrl.indexOf("?"));
      record['mode'] = 'simple';
    } else {
      record['mode'] = 'custom';
    }
    if(record['startTime']){
      record['startTime'] = moment(record['startTime'], dateFormat)
    } else {
      record['startTime'] = null
    }
    if(record['endTime']) {
      record['endTime'] = moment(record['endTime'], dateFormat)
    } else {
      record['endTime'] = null
    }
    return commonUtils.recordToValueJson(record)
  }
})(EidtCarouselAdForm);

export default class CarouselAdManage extends Component {
  constructor(props){
    super(props);
    this.state = {
      dataSource: [],
      loading: true,

      // 添加、修改广告条弹框控制
      visible: false,
      // 当前修改行数据
      record: null
    }
  }
  __getColumns(){
    return [
      {title: 'ID', dataIndex: 'adId', width: 80, fixed: 'left'},
      {title: '名称', dataIndex: 'adName', width: 120, fixed: 'left'},
      {title: '描述', dataIndex: 'adDesc', width: 120},
      {title: '排序', dataIndex: 'orderNum', width: 55},
      {title: '图片', dataIndex: 'picId', width: 200, className: 'padding0', render: (text) => commonUtils.fullPictureUrl(text, 200, 50)},
      {title: '链接地址', dataIndex: 'linkUrl', width: 280},
      {title: '状态', dataIndex: 'status', width: 55, render:(text) => {
        return text === 'ACTIVE' ? <Tag color='#87d068'>正常</Tag> : <Tag color='#f50'>禁用</Tag>
      }},
      {title: '生效时间', dataIndex: 'startTime', width: 135},
      {title: '失效时间', dataIndex: 'endTime', width: 135},
      {title: '是否分享', dataIndex: 'needShare', width: 65, render:(text) => {
        return text === 'T' ? <Tag color='#87d068'>是</Tag> : <Tag color='#f50'>否</Tag>
      }},
      {title: '分享标题', dataIndex: 'shareTitle', width: 120},
      {title: '分享内容', dataIndex: 'shareContent', width: 150},
      {title: '分享链接', dataIndex: 'shareUrl', width: 160},
      {title: '分享LOGO', dataIndex: 'sharePic', width: 90},
      {title: '创建时间', dataIndex: 'createTime', width: 135},
      {title: '备注', dataIndex: 'remark'},
      {key:'operation', title: '操作', dataIndex: 'adId', width: 100, fixed: 'right', render: (text, record) => {
        if (record['status'] === 'ACTIVE') {
          return (
            <span>
              <a href="javascript:void(0)" onClick={this.editCarouselAd.bind(this, record)}>修改</a>
              <span className="ant-divider"/>
              <a href="javascript:void(0)" onClick={this.disabledCarouselAd.bind(this, text)}>禁用</a>
            </span>
          )
        } else {
          return <a href="javascript:void(0)" onClick={this.enabledCarouselAd.bind(this, text)}>启用</a>
        }
        return null
      }}
    ];
  }
  handleAdd = () => {
    this.setState({ visible: true, record: null });
  }
  editCarouselAd(record){
    this.setState({ visible: true, record: {...record} });
  }
  disabledCarouselAd(adId){
    webUtils.confirm(() => {
      ConfigService.disabledCarouselAd(adId).then(result => {
        webUtils.alertSuccess("禁用广告条成功")
        this.queryTableData()
      })
    }, "确定禁用该广告条吗？")
  }
  enabledCarouselAd(adId){
    webUtils.confirm(() => {
      ConfigService.enabledCarouselAd(adId).then(result => {
        webUtils.alertSuccess("启用广告条成功")
        this.queryTableData()
      })
    }, "确定启用该广告条吗？")
  }
  handleClose = (isRefresh = false) => {
    isRefresh && this.queryTableData()
    this.setState({ visible: false, record: null })
  }
  queryTableData = () => {
    !this.state.loading && this.setState({loading: true})
    ConfigService.queryCarouselAdList().then(data => {
      this.setState({
        loading: false,
        dataSource: data
      })
    })
  }
  componentDidMount(){
    this.queryTableData()
  }
  render(){
    const {dataSource, loading, visible, record} = this.state;
    return (
      <div>
        <Row>
          <Col span={12} offset={12} style={{ textAlign: 'right', marginBottom: 12 }}>
            <Button icon="loading" size="large" onClick={this.queryTableData}>刷新</Button>
            <Button type="primary" icon="plus" size="large" onClick={this.handleAdd} style={{marginLeft: 16}}>添加</Button>
          </Col>
        </Row>
        <Table bordered rowKey="adId"
               dataSource={dataSource}
               loading={loading}
               columns={this.__getColumns()}
               scroll={{x: 2200}}
               pagination={false} />
        <EidtCarouselAdForm visible={visible} record={record} onClose={this.handleClose} />
      </div>
    )
  }
}