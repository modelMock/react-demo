import React from 'react';
import { Form, Row, Col, Input, InputNumber, Select, Button, Tag, Modal } from 'antd';
import webUtils from '../../commons/utils/webUtils';
import commonUtils from '../../commons/utils/commonUtils'
import ImageUpload from '../../commons/widgets/ImageUpload';
import ConfigService from '../../service/ConfigService';
import CustomTable from '../../commons/widgets/CustomTable';
const FormItem = Form.Item;
const Option = Select.Option;

const AnimSearchForm = Form.create()(
  (props) => {
    const {form, onSearch, onShowAnimModal} = props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    };
    return (
      <Form layout="horizontal" onSubmit={ onSearch } className="ant-advanced-search-form">
        <Row gutter={16}>
          <Col sm={8}>
            <FormItem label="动画名称" {...formItemLayout}>
              {getFieldDecorator('animName')(<Input placeholder="请输入动画名称" />)}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="动画类型" {...formItemLayout}>
              {getFieldDecorator('animType',{
                initialValue: 'GIF'
              })(
                <Select>
                  <Option value="GIF">GIF</Option>
                  <Option value="PNG">PNG</Option>
                  <Option value="SWF">SWF</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8} style={{ textAlign: 'right' }}>
            <Button type="ghost" icon="plus" size="large" onClick={()=> {onShowAnimModal()}}>添加动画</Button>
            <Button type="primary" icon="search" size="large" htmlType="submit">搜索</Button>
          </Col>
        </Row>
      </Form>
    )
  }
);

const EditAnimForm = Form.create()(
  (props) => {
    const {visible, loading, title, onOk, onCancel, form } = props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14},
    };
    return <Modal
        visible={visible}
        title={title}
        onOk={onOk}
        onCancel={onCancel}
        confirmLoading={loading}
        okText="提交"
        cancelText="取消">
        <Form>
          {getFieldDecorator('animId')(<Input type="hidden"/>)}
          <FormItem label="动画名称" {...formItemLayout}>
            {getFieldDecorator('animName', {
              rules: [{required: true, message: "请输入动画名称"}],
            })(<Input placeholder="动画名称"/>)}
          </FormItem>
          <FormItem label="动画类型" {...formItemLayout}>
            {getFieldDecorator('animType', {
              rules: [{required: true, message: "请选择动画类型"}],
              initialValue: 'GIF'
            })(
              <Select>
                <Option value="GIF">GIF</Option>
                <Option value="PNG">PNG</Option>
                <Option value="SWF">SWF</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="gif动画" {...formItemLayout}>
            {getFieldDecorator("gifUrl", {
              rules: [{required: true, message: "请上传gif动画"}],
              valuePropName: 'fileList',
              //initialValue: '/gift/2150a37cf7fd449895babe7392952986.jpg',
            })(<ImageUpload uploadFolderName={webUtils.getUploadFolderName("Animation")} uploadButtonText="上传gif"/>)}
          </FormItem>
          <FormItem label="webp动画" {...formItemLayout}>
            {getFieldDecorator("webpUrl", {
              rules: [{required: true, message: "请上传webp动画"}],
              valuePropName: 'fileList',
              //initialValue: '/gift/2150a37cf7fd449895babe7392952986.jpg',
            })(<ImageUpload uploadFolderName={webUtils.getUploadFolderName("Animation")} uploadButtonText="上传webp"/>)}
          </FormItem>
          <FormItem label="时长" {...formItemLayout}>
            {getFieldDecorator('playSeconds', {
              rules: [{required: true, message: "请输入动画播放时长"}],
            })(<InputNumber min={1} step={1} placeholder="动画播放时长" style={{ width: '90%'}}/>)}
            <span className="ant-form-text"> 秒 </span>
          </FormItem>
          <FormItem label="次数" {...formItemLayout}>
            {getFieldDecorator('playCount', {
              initialValue: 2,
              rules: [{required: true, message: "请输入动画播放次数"}],
            })(<InputNumber min={1} step={1} placeholder="动画播放次数" style={{ width: '90%'}}/>)}
            <span className="ant-form-text"> 次 </span>
          </FormItem>
          <FormItem label="宽度" {...formItemLayout}>
            {getFieldDecorator('width')(
              <InputNumber min={1} step={1} placeholder="动画显示宽度" style={{ width: '89.9%'}}/>
            )}
            <span className="ant-form-text"> px</span>
          </FormItem>
        </Form>
      </Modal>
  }
);

export default class AnimList extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      visible: false,
      loading: false,
      title: null,
    }
    this.handleSearch = this.handleSearch.bind(this);
    this.showAnimModal = this.showAnimModal.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }
  __getColumns() {
    return [
      {title: 'ID',       dataIndex: 'animId'},
      {title: '动画名称',       dataIndex: 'animName'},
      {title: '动画类型',       dataIndex: 'animType', render: (text, record) => {
        if(text === 'GIF') return <Tag color="#87d068">GIF</Tag>;
        else return <Tag color="#2db7f5">{text}</Tag>;
      }},
      {title: 'gif动画',       dataIndex: 'gifUrl', className: 'padding0', render: (text) => commonUtils.fullPictureUrl(text)},
      {title: 'webp动画',       dataIndex: 'webpUrl', className: 'padding0', render: (text) => commonUtils.fullPictureUrl(text)},
      {title: '时长',       dataIndex: 'playSeconds', render: (text) => {
        if(!text) return null;
        return `${text}秒`;
      }},
      {title: '次数',       dataIndex: 'playCount', render: (text) => {
        if(!text) return null;
        return `${text}次`;
      }},
      {title: '宽度',       dataIndex: 'width', render: (text) => {
        if(!text) return null;
        return `${text}px`;
      }},
      {title: '操作', render: (text, record) => {
        return <span>
          <a href="javascript:void(0)" onClick={this.showAnimModal.bind(this, Object.assign({}, record))}>编辑动画</a>
        </span>
      }}
    ]
  }
  handleSearch(e) {
    e.preventDefault();
    this.refs.customTable.queryTableData(this.searchForm.getFieldsValue());
  }

  /**
   * 显示编辑框
   * @param anim
   */
  showAnimModal(anim) {
    const title = !!anim ? '修改动画配置' : '添加动画配置';
    if(!!anim) {
      console.log('anim', anim)
      this.editForm.setFieldsValue(anim);
    }
    this.setState({
      title,
      visible: true,
    })
  }

  /**
   * 保存动画配置
   */
  handleUpdate() {
    const form = this.editForm;
    form.validateFields((err, values) => {
      if(!!err) return;
      if(!values["gifUrl"].endsWith(".gif")){
        webUtils.alertFailure("请上传gif动画")
        return
      }
      if(!values["webpUrl"].endsWith(".webp")){
        webUtils.alertFailure("请上传webp动画")
        return
      }
      webUtils.confirm(() => {
        ConfigService.updateAnimConfig(values).then(result => {
          webUtils.alertSuccess("编辑动画配置成功");
          this.handleCancel();
          this.refs.customTable.refreshTable();
        })
      }, "确认保存吗？")
    })
  }
  /**
   * 关闭编辑框
   */
  handleCancel() {
    this.setState({
      visible: false,
      loading: false,
      title: null,
    });
    this.editForm.resetFields();
  }
  componentDidMount(){
    this.refs.customTable.queryTableData({animType: 'GIF'});
  }
  render() {
    const {visible, loading, title} = this.state;
    return <div>
      <AnimSearchForm ref={(form)=>{this.searchForm=form}} onSearch={this.handleSearch}
                      onShowAnimModal={this.showAnimModal}/>
      <CustomTable ref="customTable" rowKey="animId" columns={this.__getColumns()}
                   fetchTableDataMethod={ConfigService.selectAnimConfig}/>
      <EditAnimForm ref={(form)=>{this.editForm=form}} title={title} visible={visible} loading={loading}
                    onOk={this.handleUpdate} onCancel={this.handleCancel}/>
    </div>
  }
}