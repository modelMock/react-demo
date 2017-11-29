import React, {Component} from 'react';
import { Form, Row, Col, Input, InputNumber, Button, Modal, Table } from 'antd';
import webUtils from '../../commons/utils/webUtils';
import ConfigService from '../../service/ConfigService';
const FormItem = Form.Item;

const ConfigSearchForm = Form.create()(
  (props) => {
    const {form, onSearch, onShowEditModal} = props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 16},
    }
    return (
      <Form layout="inline" onSubmit={(e)=>{e.preventDefault(); onSearch()}} className="ant-advanced-search-form">
        <FormItem label="系统参数" {...formItemLayout}>
          {getFieldDecorator("paramId")(<Input placeholder="请输入系统参查询" />)}
        </FormItem>
        <Button type="primary" icon="search" htmlType="submit" style={{marginLeft: 24}}>搜索</Button>
        <Button icon="plus" size="large" onClick={()=>onShowEditModal()} style={{marginLeft: 48}}>添加</Button>
      </Form>
    );
  }
);

class EditConfigForm extends Component {
  state = {
    loading: false
  }
  handleSave = () => {
    this.props.form.validateFields((err, values) => {
      if(!!err) return;
      webUtils.confirm(() => {
        this.setState({ loading: true });
        if(this.props.isEdit) {
          ConfigService.updateSysCfg(values).then(result => {
            webUtils.alertSuccess("修改系统参数成功");
            this.__close(true);
          }).catch(()=> this.setState({loading: false}))
        } else {
          ConfigService.addSysCfg(values).then(result => {
            webUtils.alertSuccess("新建系统参数成功");
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
             title={isEdit ? "修改系统参数" : "新建系统参数"}
             onOk={this.handleSave}
             onCancel={this.handleCancel}
             okText="提交"
             cancelText="取消">
        <Form>
          <FormItem label="系统参数" {...formItemLayout}>
            {getFieldDecorator('paramId',{
              rules:[{required: true, message: '系统参数必须输入'}]
            })(
              <Input placeholder="请输入系统参数" readOnly={isEdit} />
            )}
          </FormItem>
          <FormItem label="参数说明" {...formItemLayout}>
            {getFieldDecorator('paramName',{
              rules:[{required: true, message: '参数说明必须输入'}]
            })(
              <Input placeholder="请输入参数说明" />
            )}
          </FormItem>
          <FormItem label="参数值" {...formItemLayout}>
            {getFieldDecorator('paramValue')(
              <Input type="textarea" rows={10} placeholder="请输入参数值" />
            )}
          </FormItem>
          <FormItem label="值单位" {...formItemLayout}>
            {getFieldDecorator('unitType')(
              <Input placeholder="请输入值单位" />
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
EditConfigForm = Form.create()(EditConfigForm);

export default class SystemConfigManage extends Component {
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
      {title: '系统参数',   dataIndex: 'paramId'},
      {title: '参数说明', dataIndex: 'paramName'},
      {title: '参数值',   dataIndex: 'paramValue'},
      {title: '值单位', dataIndex: 'unitType', width: 80},
      {title: '操作', width: 80, render: (text, record) => {
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
    ConfigService.querySysCfg(this.searchForm.getFieldsValue()).then(dataSource => {
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
  // 删除当前行系统参数
  deleteItem(record){
    webUtils.confirm(() => {
      ConfigService.delSysCfg(record).then(result => {
        webUtils.alertSuccess("删除系统参数成功");
        this.handleSearch();
      });
    }, "确定删除该系统参数吗？")
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
        <ConfigSearchForm ref={(form) => this.searchForm = form}
                             onSearch={this.handleSearch}
                             onShowEditModal={this.showEditModal}/>
        <Table rowKey="paramId"
               bordered loading={loading}
               columns={this.__getColumns()}
               dataSource={dataSource}
               pagination={false} />
        <EditConfigForm ref={(form) => this.editForm=form}
                      visible={visible} isEdit={isEdit}
                      onClose={this.handleClose} />
      </div>
    )
  }
}