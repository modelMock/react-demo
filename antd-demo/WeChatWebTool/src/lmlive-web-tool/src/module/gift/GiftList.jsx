import React, {Component} from 'react';
import { Form, Row, Col, Input, Select, Button, Tag, Modal, InputNumber } from 'antd';
import webUtils from '../../commons/utils/webUtils';
import commonUtils from '../../commons/utils/commonUtils';
import ConfigService from '../../service/ConfigService';
import CustomTable from '../../commons/widgets/CustomTable';
import ImageUpload from '../../commons/widgets/ImageUpload';
const FormItem = Form.Item;
const Option = Select.Option;

const GiftSearchForm = Form.create()(
  (props) => {
    const {form, onSearch, onShowGiftModal, onShowBadgeModal} = props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    return (
      <Form layout="horizontal" onSubmit={ onSearch } className="ant-advanced-search-form">
        <Row gutter={16}>
          <Col sm={8}>
            <FormItem label="礼物名称" {...formItemLayout}>
              {getFieldDecorator('goodsName')(<Input placeholder="请输入礼物名称" />)}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="礼物类型" {...formItemLayout}>
              {getFieldDecorator('goodsType',{
                initialValue: 'GIFT'
              })(
                <Select allowClear placeholder="请选择礼物类型">
                  <Option value="GIFT">普通礼物</Option>
                  <Option value="BADGE">勋章</Option>
                  <Option value="GUARD">守护</Option>
                  <Option value="VIP">VIP</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="状态" {...formItemLayout}>
              {getFieldDecorator('goodsStatus',{
                initialValue: 'ACTIVE'
              })(
                <Select allowClear placeholder="请选择礼物状态">
                  <Option value='ACTIVE'>正常</Option>
                  <Option value='INACTIVE'>禁用</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={12} offset={12} style={{ textAlign: 'right' }}>
            <Button type="ghost" icon="plus" size="large" onClick={()=> {onShowBadgeModal()}}>添加勋章</Button>
            <Button type="ghost" icon="plus" size="large" onClick={()=> {onShowGiftModal()}}>添加礼物</Button>
            <Button type="primary" icon="search" size="large" htmlType="submit">搜索</Button>
          </Col>
        </Row>
      </Form>
    )
  }
);

/**
 * 添加礼物
 */
class EditGiftForm extends Component {
  state = {
    tagList: [],
    animList: [],
  }
  componentDidMount() {
    ConfigService.initAddGiftParams().then(result => {
      this.setState({
        tagList: result.tagList,
        animList: result.animList,
      })
    })
  }
  render() {
    const {tagList, animList} = this.state;
    const { visible, loading, title, onOk, onCancel, form } = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    }
    return (
      <Modal
        visible={visible}
        title={title}
        onOk={onOk}
        onCancel={onCancel}
        confirmLoading={loading}
        okText="提交"
        cancelText="取消">
        <Form >
          {getFieldDecorator('goodsId')(<Input type="hidden" />)}
          {getFieldDecorator('priceId')(<Input type="hidden" />)}
          {getFieldDecorator('busiCode',{ initialValue: '810'})(<Input type="hidden" />)}
          {getFieldDecorator('wealthUserRule',{ initialValue: '12'})(<Input type="hidden" />)}
          {getFieldDecorator('goodsType',{ initialValue: 'GIFT'})(<Input type="hidden" />)}
          <FormItem label="礼物名称" {...formItemLayout}>
            {getFieldDecorator('goodsName', {
              rules: [{required: true, message: "请输入礼物名称"}],
            })(<Input />)}
          </FormItem>
          <FormItem label="礼物图标" {...formItemLayout}>
            {getFieldDecorator("picId", {
              rules: [{required: true, message: "请上传礼物图标"}],
              valuePropName: 'fileList',
              //initialValue: '/gift/2150a37cf7fd449895babe7392952986.jpg',
            })(<ImageUpload uploadFolderName={webUtils.getUploadFolderName("Gift")} uploadButtonText="上传礼物"/>)}
          </FormItem>
          <FormItem label="数量模板" {...formItemLayout}>
            {getFieldDecorator('optionsCountKey', {
              rules: [{required: true, message: "请选择数量模板"}],
              initialValue: 'ALL',
            })(
              <Select placeholder="请选择礼物数量模板">
                <Option value="ALL">所有(ALL)</Option>
                <Option value="LESS1000">少于1000个(LESS1000)</Option>
                <Option value="LESS100">少于100个(LESS100)</Option>
                <Option value="ONLYONE">少于10个(ONLYONE)</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="礼物价格" {...formItemLayout}>
            {getFieldDecorator('rent', {
              rules: [{required: true, message: "请输入礼物价格"}],
            })(<InputNumber min={0.1} style={{ width: '90%'}} placeholder="请输入礼物价格, 最小值1毛钱" />)}
            <span className="ant-form-text"> 元 </span>
          </FormItem>
          <FormItem label="主播经验值" {...formItemLayout}>
            {getFieldDecorator('anchorExpValue', {
              initialValue: 50,
              rules: [{required: true, message: "请输入主播经验值"}],
            })(<InputNumber step={1} min={0} max={100} style={{ width: '90%'}} />)}
            <span className="ant-form-text"> % </span>
          </FormItem>
          <FormItem label="用户经验值" {...formItemLayout}>
            {getFieldDecorator('userExpValue', {
              initialValue: 100,
              rules: [{type: 'number',required: true, message: "请输入用户经验值"}],
            })(<InputNumber step={1} min={0} max={100} style={{ width: '90%'}} />)}
            <span className="ant-form-text"> % </span>
          </FormItem>
          <FormItem label="返点" {...formItemLayout}>
            {getFieldDecorator('wealthValue', {
              initialValue: 20,
              rules: [{required: true, message: "请输入礼物返点值"}],
            })(<InputNumber step={1} min={0} max={100} style={{ width: '90%'}} />)}
            <span className="ant-form-text"> % </span>
          </FormItem>
          <FormItem label="排序值" {...formItemLayout}>
            {getFieldDecorator('sortNum', {
              rules: [{required: true, message: "请输入礼物排序值"}],
            })(<InputNumber min={1} step={1} style={{ width: '100%'}} />)}
          </FormItem>
          <FormItem label="标签" {...formItemLayout}>
            {getFieldDecorator('tagId')(
              <Select allowClear showSearch optionFilterProp="children" placeholder="请选择礼物标签">
                {
                  tagList.map(tag => (
                    <Option key={tag.tagId}>{tag.tagName}</Option>
                  ))
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="动画" {...formItemLayout}>
            {getFieldDecorator('animId')(
              <Select allowClear showSearch optionFilterProp="children" placeholder="请选择礼物动画">
                {
                  animList.map(anim => (
                    <Option key={anim.animId}>{anim.animName}</Option>
                  ))
                }
              </Select>
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
EditGiftForm = Form.create()(EditGiftForm);

const EditBadge = Form.create()(
  (props) => {
    const {form, visible, loading, title, onOk,onCancel} = props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14},
    }
    return (
      <Modal
        visible={visible}
        title={title}
        onOk={onOk}
        onCancel={onCancel}
        confirmLoading={loading}
        okText="提交"
        cancelText="取消">
        <Form>
          {getFieldDecorator('goodsId')(<Input type="hidden" />)}
          {getFieldDecorator('goodsType',{ initialValue: 'BADGE'})(<Input type="hidden" />)}
          <FormItem label="勋章名称" {...formItemLayout}>
            {getFieldDecorator('goodsName', {
              rules: [{required: true, message: "请输入勋章名称"}],
            })(<Input />)}
          </FormItem>
          <FormItem label="勋章图标" {...formItemLayout}>
            {getFieldDecorator("picId", {
              rules: [{required: true, message: "请上传勋章图标"}],
              valuePropName: 'fileList',
            })(<ImageUpload uploadFolderName={webUtils.getUploadFolderName("Goods")} uploadButtonText="上传勋章"/>)}
          </FormItem>
        </Form>
      </Modal>
    )
});

export default class GiftList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // 控制 添加、修改礼物框显示、隐藏
      editGiftVisible: false,
      editGiftLoading: false,
      title: null,  // 添加、编辑礼物

      // 勋章
      editBadgeVisible: false,
      editBadgeLoading: false,
    }
    this.handleSearch = this.handleSearch.bind(this);
    this.showGiftModal = this.showGiftModal.bind(this);
    this.showBadgeModal = this.showBadgeModal.bind(this);
    this.saveGift = this.saveGift.bind(this);
    this.onCloseEditGift = this.onCloseEditGift.bind(this);
  }
  __getColumns() {
    return [
      {title: 'ID',       dataIndex: 'goodsId', width: 90},
      {title: '礼物名称',       dataIndex: 'goodsName'},
      {title: '价格',       dataIndex: 'rent', width: 80, render: (text) => this.formatSuffix(text/1000, '元')},
      {title: '礼物类型',       dataIndex: 'goodsType', width: 90, render: (text, record) => {
        if(text === 'GIFT') return <Tag color="#87d068">普通礼物</Tag>;
        else if(text === 'GUARD') return <Tag color="#2db7f5">守护</Tag>;
      }},
      {title: '状态',       dataIndex: 'status', width: 80, render: (text) => {
        if(text === 'ACTIVE') return <Tag color="#87d068">正常</Tag>;
        else if(text === 'INACTIVE') return <Tag color="#ff0000">禁用</Tag>;
      }},
      {title: '图标',       dataIndex: 'picId', width: 80, className: 'padding0', render: (text) => commonUtils.fullPictureUrl(text)},
      {title: '排序值', dataIndex: 'sortNum', width: 80},
      {title: '主播经验', dataIndex: 'anchorExpValue', width: 80, render: (text) => this.formatSuffix(text)},
      {title: '用户经验', dataIndex: 'userExpValue', width: 80, render: (text) => this.formatSuffix(text)},
      {title: '返点', dataIndex: 'wealthValue', width: 80, render: (text) => this.formatSuffix(text)},
      {title: '数量模板', dataIndex: 'optionsCountKey', width: 90, render: (text) => {
        if(!text || text === 'ALL') return '所有';
        else if(text === 'LESS1000') return '少于1000个';
        else if(text === 'LESS100') return '少于100个';
        else if(text === 'ONLYONE') return '少于10个';
      }},
      {title: '动画名称', dataIndex: 'animName', width: 150},
      {title: '动画', dataIndex: 'gifUrl', width: 80, className: 'padding0', render: (text) => commonUtils.fullPictureUrl(text)},
      {title: '动画时长', dataIndex: 'playSeconds', width: 80, render: (text) => this.formatSuffix(text, '秒')},
      {title: '动画宽度', dataIndex: 'width', width: 80, render: (text) => this.formatSuffix(text, 'px')},
      {title: '标签', dataIndex: 'tagName', width: 90},
      {title: '操作', fixed: 'right', width: 120, render: (text, record) => {
        return (
          <span>
            {record['goodsType'] === 'GIFT'
              ? <a href="javascript:void(0)" onClick={this.showGiftModal.bind(this, Object.assign({}, record))}>编辑礼物</a>
              : null}
            {record['goodsType'] === 'BADGE'
              ? <a href="javascript:void(0)" onClick={this.showBadgeModal.bind(this, Object.assign({}, record))}>编辑勋章</a>
              : null}

            <span className="ant-divider" />
            {
              record['status'] === 'ACTIVE'
                ? <a href="javascript:void(0)" onClick={this.changedGiftStatus.bind(this, record['goodsId'], 'INACTIVE')}>禁用</a>
                : <a href="javascript:void(0)" onClick={this.changedGiftStatus.bind(this, record['goodsId'], 'ACTIVE')}>启用</a>
            }
          </span>
        )
      }}
    ]
  }
  // 添加后缀
  formatSuffix(text, suffix='%') {
    if(!text) return null
    return `${text}${suffix}`;
  }
  // 修改礼物状态
  changedGiftStatus(goodsId, status){
    const msg = (status === 'ACTIVE') ? '确定启用该礼物吗？' : '确定禁用该礼物吗？';
    const confirmInfo = (status === 'ACTIVE') ? '启用礼物成功' : '禁用礼物成功';
    webUtils.confirm(()=>{
      ConfigService.updateGoodsStatus(goodsId, status).then(result => {
        webUtils.alertSuccess(confirmInfo);
        this.refs.customTable.refreshTable();
      });
    }, msg)
  }
  // 搜索
  handleSearch(e) {
    e.preventDefault();
    this.refs.customTable.queryTableData(this.searchForm.getFieldsValue());
  }
  // 显示编辑礼物框
  showGiftModal(gift) {
    const title = !!gift ? "编辑礼物" : "添加礼物";
    if(!!gift) {
      gift['optionsCountKey'] = !!gift['optionsCountKey'] ? gift['optionsCountKey'] : 'ALL';
      // Select value不允许number类型的值
      gift['tagId'] = !!gift['tagId'] ? gift['tagId'].toString() : undefined;
      gift['animId'] = !!gift['animId'] ? gift['animId'].toString() : undefined;
      // 礼物价格显示以元为单位
      gift['rent'] = gift['rent'] / 1000;
      this.editGiftForm.setFieldsValue(gift);
    }
    this.setState({ editGiftVisible: true, title });
  }
  showBadgeModal(gift) {
    const title = gift ? "编辑勋章" : "添加勋章";
    gift && this.editBadgeForm.setFieldsValue(gift);
    this.setState({ editBadgeVisible: true, title });
  }
  // 保存礼物数据
  saveGift() {
    const form = this.state.editGiftVisible ? this.editGiftForm : this.editBadgeForm;
    form.validateFields((err, values) => {
      if(!!err) return;
      webUtils.confirm(()=>{
        if(values['rent']) {
          // 礼物价格保存以分为单位
          values['rent'] = values['rent'] * 1000;
        }
        if(!values['goodsId']) {
          ConfigService.addGift(values).then(result => {
            webUtils.alertSuccess("保存成功");
            this.onCloseEditGift();
            this.refs.customTable.refreshTable();
          });
        } else {
          ConfigService.updateGift(values).then(result => {
            webUtils.alertSuccess("修改成功");
            this.onCloseEditGift();
            this.refs.customTable.refreshTable();
          });
        }
      }, "确认保存吗?")
    });
  }
  // 关闭编辑礼物框
  onCloseEditGift() {
    if(this.state.editGiftVisible) {
      this.setState({
        editGiftVisible: false,
        editGiftLoading: false,
      })
      this.editGiftForm.resetFields();
    } else if(this.state.editBadgeVisible) {
      this.setState({
        editBadgeVisible: false,
        editBadgeLoading: false,
      })
      this.editBadgeForm.resetFields();
    }
  }
  componentDidMount(){
    this.refs.customTable.queryTableData(this.searchForm.getFieldsValue());
  }
  render() {
    const {editGiftVisible, editGiftLoading, title, editBadgeVisible, editBadgeLoading} = this.state;
    return <div>
        <GiftSearchForm ref={(form)=>{this.searchForm=form}} onSearch={this.handleSearch}
                        onShowGiftModal={this.showGiftModal} onShowBadgeModal={this.showBadgeModal}/>
        <CustomTable ref="customTable" rowKey="goodsId" columns={this.__getColumns()}
          fetchTableDataMethod={ConfigService.selectGoodsConfig} scroll={{ x: 1560 }}/>
        <EditGiftForm ref={(form)=>{this.editGiftForm=form}} visible={editGiftVisible}
                      loading={editGiftLoading} title={title} onOk={this.saveGift} onCancel={this.onCloseEditGift}/>
        <EditBadge ref={(form)=>{this.editBadgeForm=form}} visible={editBadgeVisible}
                   loading={editBadgeLoading} title={title} onOk={this.saveGift} onCancel={this.onCloseEditGift} />
      </div>
  }
}
