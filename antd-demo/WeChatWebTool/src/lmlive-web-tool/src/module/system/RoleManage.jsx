import React, {Component} from 'react';
import {Form, Row, Col, Input, InputNumber, Button, Select, Table, Modal, Transfer, Checkbox} from 'antd';
import ConfigService from '../../service/ConfigService';
import AnchorService from '../../service/AnchorService';
import commonUtils from '../../commons/utils/commonUtils';
import webUtils from '../../commons/utils/webUtils';

const FormItem = Form.Item;
const Option = Select.Option;
class EditResForm extends Component {
  state = {
    loading: false,
    resList: [],
    isRequiredResPath: false
  }
  handleSave = () => {
    this.props.form.validateFields((error, values) => {
      if(error) return;
      webUtils.confirm(()=>{
        this.setState({ loading: true })
        // 添加、修改
        const params = Object.assign({}, values)
        params["editType"] = !this.props.record ? "add" : "modify";
        params["isReport"] = values["isReport"] === true ? "T" : "F";
        ConfigService.editRes(params).then(result => {
          webUtils.alertSuccess("提交成功");
          this.setState({ loading: false })
          this.props.onClose(true)
        })
      }, "确定提交吗?")
    })
  }
  handleCancel = () => {
    this.props.onClose();
  }
  handleResType = (value) => {
    let resList = []
    if(value === 'DIR') {
      resList = this.resList.filter(res => res['resId'] === "-1")
    } else if(value === 'MENU') {
      resList = this.resList.filter(res => res['resType'] === 'DIR')
    } else if(value === 'NODE') {
      resList = this.resList.filter(res => res['resType'] === 'MENU')
    }
    this.setState({ resList, isRequiredResPath: value === 'MENU' });
    this.props.form.setFieldsValue({resParent: undefined});
  }
  componentDidMount(){
    ConfigService.queryResList().then(result => {
      result.push({resId: "-1", resName: '根目录'})
      this.resList = result
      this.setState({ resList: result })
    })
  }
  render(){
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14}
    }
    const {loading, resList, isRequiredResPath} = this.state;
    const {visible, form, record} = this.props
    const {getFieldDecorator} = form;
    const isUpdate = !!record && !!record['resId']
    const title = !isUpdate ? '添加资源' : '修改资源'
    const isRequired = !isUpdate ? isRequiredResPath : record['resType'] === 'MENU'
    return (
      <Modal title={title}
             visible={visible}
             confirmLoading={loading}
             onOk={this.handleSave}
             onCancel={this.handleCancel}
             okText="提交"
             cancelText="取消">
        <Form>
          <FormItem label="资源ID" {...formItemLayout}>
            {getFieldDecorator('resId',{
              rules: [{required: true, message: '请输入资源ID'}]
            })(<Input placeholder="资源ID" />)}
          </FormItem>
          <FormItem label="名称" {...formItemLayout}>
            {getFieldDecorator('resName',{
              rules: [{required: true, message: '请输入资源名称'}]
            })(<Input placeholder="资源名称" />)}
          </FormItem>
          <FormItem label="类型" {...formItemLayout}>
            {getFieldDecorator('resType',{
              rules: [{required: true, message: '请选择资源类型'}]
            })(
              <Select onChange={this.handleResType} placeholder="资源类型" disabled={isUpdate}>
                <Option value="DIR">目录</Option>
                <Option value="MENU">菜单</Option>
                <Option value="NODE">按钮</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="排序值" {...formItemLayout}>
            {getFieldDecorator('resIdx',{
              rules: [{required: true, message: '请输入资源排序值'}]
            })(<InputNumber min={1} placeholder="资源排序值" />)}
          </FormItem>
          <FormItem label="父资源" {...formItemLayout}>
            {getFieldDecorator("resParent", {
              rules: [{required: true, message: "请选择父资源"}],
            })(
              <Select placeholder="上级资源" disabled={isUpdate}>
                {
                  resList.map(res => (
                    <Option key={res.resId}>{res.resName}</Option>
                  ))
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="路径" {...formItemLayout}>
            {getFieldDecorator('resPath',{
              rules: [{required: isRequired, message: '请输入资源访问路径'}]
            })(<Input placeholder="资源访问路径" />)}
          </FormItem>
          <FormItem label="图标" {...formItemLayout}>
            {getFieldDecorator('resIcon')(<Input placeholder="资源图标" />)}
          </FormItem>
          <FormItem label="报表资源" {...formItemLayout}>
            {getFieldDecorator('isReport',{
              valuePropName: 'checked'
            })(<Checkbox>是</Checkbox>)}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
EditResForm = Form.create({
  mapPropsToFields(props){
    const {visible, record} = props;
    if(visible && record){
      record['isReport'] = record['isReport'] !== 'T' ? false : true
      return commonUtils.recordToValueJson(record)
    }
    return {}
  }
})(EditResForm);

class AssignResModal extends Component {
  state = {
    loading: false,
    resList: [],
    // 当前权限对应的资源集合
    roleResIdList: []
  }
  componentWillReceiveProps(nextProps){
    if(!this.props.visible && nextProps.visible && this.props.roleId !== nextProps.roleId){
      this.__queryAllResList()
      ConfigService.queryResByRoleId(nextProps.roleId).then(result => {
        let roleResIdList = result.map(res => String(res.resId))
        this.setState({ roleResIdList })
      })
    }
  }
  __queryAllResList(){
    ConfigService.queryMenuNodeRes().then(result => {
      let resList = result.map(res => ({key: String(res.resId), title: res.resName}))
      this.setState({ resList })
    })
  }
  componentDidMount(){
    this.__queryAllResList()
  }
  handleChange = (nextTargetKeys, direction, moveKeys) => {
    this.setState({ roleResIdList: nextTargetKeys });
  }
  handleSave = () => {
    webUtils.confirm(() => {
      this.setState({ loading: true })
      ConfigService.editRoleRes(this.props.roleId, this.state.roleResIdList).then(result => {
        webUtils.alertSuccess("提交成功");
        this.setState({ loading: false })
        this.props.onClose(true);
      })
    }, "确认提交吗？")
  }
  handleCancel = () => {
    this.props.onClose();
  }
  render(){
    const {loading, resList, roleResIdList} = this.state;
    const {visible, onClose} = this.props;
    return (
      <Modal visible={visible}
             title="分配资源"
             width={650}
             confirmLoading={loading}
             onOk={this.handleSave}
             onCancel={this.handleCancel}
             okText="提交"
             cancelText="取消">
        <Transfer dataSource={resList}
                  titles={['源资源','已分配资源']}
                  targetKeys={roleResIdList}
                  listStyle={{
                    width: 275,
                    height: 500,
                  }}
                  operations={['向右', '向左']}
                  notFoundContent="列表为空"
                  render={item => item.title}
                  onChange={this.handleChange}/>
      </Modal>
    )
  }
}

class AssignOptrModal extends Component {
  state = {
    loading: false,
    roleList: [],
    roleId: null
  }
  componentDidMount(){
    ConfigService.queryAllRoleList().then(result => {
      this.setState({ roleList: result })
    })
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible && this.props.optrId !== nextProps.optrId) {
      ConfigService.queryOptrRoleByOptrId(nextProps.optrId).then(result => {
        this.setState({ roleId : result ? String(result['roleId']) : undefined})
      })
    }
  }
  handleChange = (value) => {
    if(value !== this.state.roleId){
      this.setState({ roleId: value })
    }
  }
  handleSave = () => {
    webUtils.confirm(() => {
      this.setState({ loading: true })
      ConfigService.editOptrRole(this.props.optrId, this.state.roleId).then(result => {
        webUtils.alertSuccess("提交成功");
        this.setState({ loading: false })
        this.props.onClose(true);
      })
    }, "确认提交吗？")
  }
  handleCancel = () => {
    this.props.onClose();
  }
  render(){
    const {loading, roleList, roleId} = this.state;
    const {visible, onClose} = this.props;
    return (
      <Modal visible={visible}
             title="分配权限"
             confirmLoading={loading}
             onOk={this.handleSave}
             onCancel={this.handleCancel}
             okText="提交"
             cancelText="取消">
        <span className="ant-form-text">角色</span>
        <Select value={roleId} allowClear
                placeholder="请选择一种角色"
                onChange={this.handleChange}
                style={{width: '100%'}}>
          {
            roleList.map(role => (
              <Option key={String(role.roleId)}>{role.roleName}</Option>
            ))
          }
        </Select>
      </Modal>
    )
  }
}

export default class RoleManage extends Component {
  constructor(props){
    super(props);
    this.state ={
      loading: false,
      roleList: [],
      resList: [],
      optrList: [],

      resVisible: false,
      resRecord: null,

      roleId: null,
      userId: null,
      assignResVisible: false,
      assignOptrVisible: false,
    }
    this.resColumns = [
      {title: '资源名称', dataIndex: 'resName'},
      {title: '资源类型', dataIndex: 'resType'},
      {title: '排序值', dataIndex: 'resIdx'},
      {title: '父资源', dataIndex: 'resParentName'},
      {title: '访问路径', dataIndex: 'resPath'},
      {title: '图标', dataIndex: 'resIcon'},
      {title: '报表资源', dataIndex: 'isReport', render: (text) => text !== "T" ? "否" : "是"},
      {title: '操作', dataIndex: 'resId', render: (text, record) => {
        return <a href="javascript:void(0)" onClick={this.editRes.bind(this, record)}>编辑</a>
      }},
    ];
    this.roleColumns = [
      {title: '角色名称', dataIndex: 'roleName'},
      {title: '角色描述', dataIndex: 'roleDesc'},
      {title: '角色等级', dataIndex: 'dataLevel'},
      {title: '操作', dataIndex: 'roleId', render: (text, record) => {
        return <a href="javascript:void(0)" onClick={this.assignRoleRes.bind(this, text)}>分配资源</a>
      }},
    ]
    this.optrColumns = [
      {title: 'ID', dataIndex: 'userId', width: 150},
      {title: '昵称', dataIndex: 'nickname', width: 150},
      {key:'operation', title: '操作', dataIndex: 'userId', width: 150, render: (text, record) => {
        return <a href="javascript:void(0)" onClick={this.assignOptrRole.bind(this, text)}>分配角色</a>
      }}
    ]
  }
  editRes = (resRecord) => {
    this.setState({ resVisible: true, resRecord})
  }
  addRes = () => {
    this.setState({ resVisible: true, resRecord: null });
  }
  assignRoleRes = (roleId) => {
    this.setState({ assignResVisible: true, roleId})
  }
  assignOptrRole = (userId) => {
    this.setState({ assignOptrVisible: true, userId})
  }
  handleCloseResModal = (isRefresh=false) => {
    if(!isRefresh) {
      this.setState({resVisible: false, resRecord: null})
    } else {
      ConfigService.queryResList().then(result => {
        this.setState({
          resVisible: false,
          resRecord: null,
          resList: result
        })
      })
    }
  }
  closeAssignResModal = (isRefresh=false) => {
    this.setState({ assignResVisible: false, roleId: null })
    isRefresh && this._queryData()
  }
  closeAssignOptrModal = (isRefresh=false) => {
    this.setState({ assignOptrVisible: false, userId: null })
    isRefresh && this._queryData()
  }
  _queryData(){
    ConfigService.queryRoleListByOptrId().then(result => {
      this.setState({
        roleList: result["role"],
        resList: result["res"],
        optrList: result["optr"]
      })
    })
  }
  componentDidMount(){
    this._queryData()
  }
  render(){
    const {roleList, resList, optrList, resVisible, resRecord,
      assignResVisible, assignOptrVisible, roleId, userId} = this.state;
    return (
      <div>
        <Table rowKey="roleId"
               bordered
               pagination={false}
               columns={this.roleColumns}
               dataSource={roleList}/>
        <Table rowKey="userId"
               bordered
               pagination={false}
               columns={this.optrColumns}
               dataSource={optrList}
               scroll={{y: 350}}
               style={{marginTop: 16}}/>
        <Row>
          <Col span={12} offset={12} style={{ textAlign: 'right', marginTop: 16, display: 'block' }}>
            <Button type="primary" icon="plus" size="large" onClick={this.addRes} style={{marginLeft: 16}}>添加资源</Button>
          </Col>
        </Row>
        <Table rowKey="resId"
               bordered
               pagination={false}
               columns={this.resColumns}
               dataSource={resList}
               style={{ marginTop: 16, marginBottom: 16}} />
        <EditResForm visible={resVisible} record={resRecord} onClose={this.handleCloseResModal}/>
        <AssignResModal visible={assignResVisible} roleId={roleId} onClose={this.closeAssignResModal} />
        <AssignOptrModal visible={assignOptrVisible} optrId={userId} onClose={this.closeAssignOptrModal} />
      </div>
    )
  }
}