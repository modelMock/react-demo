import React, {Component} from 'react';
import { Form, Row, Col, Input, InputNumber, Button, Modal, Table } from 'antd';
import webUtils from '../../commons/utils/webUtils';
import ConfigService from '../../service/ConfigService';
const FormItem = Form.Item;

const ItemValueSearchForm = Form.create()(
  (props) => {
    const {form, onSearch, onShowEditModal} = props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    return (
      <Form layout="horizontal" onSubmit={(e)=>{e.preventDefault(); onSearch()}} className="ant-advanced-search-form">
        <Row>
          <Col sm={8}>
            <FormItem label="字典键值" {...formItemLayout}>
              {getFieldDecorator("itemKey")(<Input placeholder="请输入字典键值查询" />)}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="字典说明" {...formItemLayout}>
              {getFieldDecorator("itemName")(<Input placeholder="请输入字典说明查询" />)}
            </FormItem>
          </Col>
          <Col sm={6} offset={2}>
            <Button type="primary" icon="search" htmlType="submit">搜索</Button>
            <Button icon="plus" size="large" onClick={()=>onShowEditModal()} style={{marginLeft: 24}}>添加</Button>
          </Col>
        </Row>
      </Form>
    );
  }
);

class EditItemForm extends Component {
  state = {
    loading: false
  }
  handleSave = () => {
    this.props.form.validateFields((err, values) => {
      if(!!err) return;
      webUtils.confirm(() => {
        this.setState({ loading: true })
        if(this.props.isEdit) {
          ConfigService.updateItemValue(values).then(result => {
            webUtils.alertSuccess("修改字典成功");
            this.__close(true);
          }).catch(()=> this.setState({loading: false}))
        } else {
          ConfigService.addItemValue(values).then(result => {
            webUtils.alertSuccess("新建字典成功");
            this.__close(true);
          }).catch(()=> this.setState({loading: false}))
        }
      }, "确定提交吗？")
    })
  }
  __close(isRefresh = false) {
    this.setState({ loading: false });
    this.props.form.resetFields();
    this.props.onClose(isRefresh);
  }
  handleCancel = () => {
    this.__close()
  }
  render(){
    const {form, visible, isEdit} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14},
    }
    return (
      <Modal visible={visible}
             loading={this.state.loading}
             title={isEdit ? "修改字典" : "新建字典"}
             onOk={this.handleSave}
             onCancel={this.handleCancel}
             okText="提交"
             cancelText="取消">
        <Form>
          <FormItem label="字典键值 " {...formItemLayout}>
            {getFieldDecorator('itemKey',{
              rules:[{required: true, message: '字典键值必须输入'}]
            })(
              <Input placeholder="请输入字典键值" readOnly={isEdit} />
            )}
          </FormItem>
          <FormItem label="字典值" {...formItemLayout}>
            {getFieldDecorator('itemValue',{
              rules:[{required: true, message: '字典值必须输入'}]
            })(
              <Input placeholder="请输入字典值" readOnly={isEdit} />
            )}
          </FormItem>
          <FormItem label="值说明" {...formItemLayout}>
            {getFieldDecorator('itemName',{
              rules:[{required: true, message: '值说明必须输入'}]
            })(
              <Input placeholder="请输入值说明" />
            )}
          </FormItem>
          <FormItem label="字典值排序" {...formItemLayout}>
            {getFieldDecorator('itemIdx')(
              <InputNumber min={1} placeholder="请输入字典值排序" style={{width: '100%'}} />
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
EditItemForm = Form.create()(EditItemForm);

export default class ItemValueManage extends Component {
  constructor(props){
    super(props);
    this.state = {
      dataSource: [],
      loading: false,

      visible: false,
      isEdit: false,
    }
    this.handleSearch = this.handleSearch.bind(this);
    this.showEditModal = this.showEditModal.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }
  __getColumns() {
    return [
      {title: '字典键值',   dataIndex: 'itemKey', width: 100},
      {title: '字典值', dataIndex: 'itemValue', width: 100},
      {title: '值说明',   dataIndex: 'itemName', width: 100},
      {title: '字典的父值', dataIndex: 'itemPv', width: 100},
      {title: '字典值排序', dataIndex: 'itemIdx', width: 100},
      {title: '操作', dataIndex: '', width: 100, render: (text, record) => {
        return <span>
            <a href="javascript:void(0)" onClick={this.showEditModal.bind(this, record)}>修改</a>
            <span className="ant-divider" />
            <a href="javascript:void(0)" onClick={this.deleteItem.bind(this, record)}>删除</a>
          </span>
      }
      },
    ];
  }
  // 搜索表格数据
  handleSearch(){
    this.setState({ loading: true });
    ConfigService.queryItemList(this.searchForm.getFieldsValue()).then(dataSource => {
      this.setState({ dataSource, loading: false });
    });
  }
  // 打开编辑弹框
  showEditModal(record) {
    if(record) {
      this.editForm.setFieldsValue(record);
    }
    this.setState({
      isEdit: !!record,
      visible: true
    })
  }
  // 删除当前行字典
  deleteItem(record){
    webUtils.confirm(() => {
      ConfigService.delItemDefine(record['itemKey'], record['itemValue']).then(result => {
        webUtils.alertSuccess("删除字典成功");
        this.handleSearch();
      });
    }, "确定删除该数据字典吗？")
  }
  // 关闭编辑弹框，并刷新表格数据
  handleClose(isRefresh){
    this.setState({ visible: false });
    isRefresh && this.handleSearch();
  }
  render(){
    const {dataSource, loading, visible, isEdit} = this.state;
    return (
      <div>
        <ItemValueSearchForm ref={(form) => this.searchForm = form}
                             onSearch={this.handleSearch}
                             onShowEditModal={this.showEditModal}/>
        <Table rowKey={record => record.itemKey+"_"+record.itemValue}
               bordered loading={loading}
               columns={this.__getColumns()}
               dataSource={dataSource}
               pagination={false} />
        <EditItemForm ref={(form) => this.editForm=form}
                      visible={visible} isEdit={isEdit}
                      onClose={this.handleClose} />
      </div>
    )
  }
}