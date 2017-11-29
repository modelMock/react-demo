import React, {Component} from 'react';
import {Form, Input, Select, Row, Col, Modal, Table, Tag} from 'antd';
import CustomTable from '../../commons/widgets/CustomTable';
import webUtils from '../../commons/utils/webUtils'
import AnchorService from '../../service/AnchorService'

const FormItem = Form.Item
const Option = Select.Option
class ApplyModal extends Component {
  state = {
    loading: false
  }
  handleSave = () => {
    this.props.form.validateFields((errors, values) => {
      if(!!errors) return
      webUtils.confirm(()=>{
        this.setState({ loading: true })
        AnchorService.processsAppLivingApply(values).then(result => {
          webUtils.alertSuccess("审核成功")
          this.setState({ loading: false })
          this.props.onClose(true)
        })
      }, "确定提交吗？")
    })
  }
  handleCancel = () => {
    this.setState({ loading: false })
    this.props.onClose()
  }
  render(){
    const {visible, form} = this.props
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    return (
      <Modal title="申请手机直播"
             visible={visible}
             confirmLoading={this.state.loading}
             onOk={this.handleSave}
             onCancel={this.handleCancel}
             okText="提交"
             cancelText="取消">
        <Form>
          {getFieldDecorator('applyId')(<Input type='hidden' />)}
          <FormItem label="是否通过">
            {getFieldDecorator('status',{
              rules: [{required: true, message: '请选择是否通过审核'}],
              initialValue: 'SUCCESS'
            })(
              <Select>
                <Option value="SUCCESS">通过</Option>
                <Option value="REJECT">拒绝</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="备注">
            {getFieldDecorator('remark')(
              <Input type="textarea" rows="5" />
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

ApplyModal = Form.create({
  mapPropsToFields(props){
    return props.visible ? {
      applyId:{ value: props.applyId},
    } : {}
  }
})(ApplyModal)

export default class AppLivingApply extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      // 审核ID
      applyId: null
    }
    this.handleClose = this.handleClose.bind(this)
  }
  __getColumns(){
    return [
      {title: '申请编号', dataIndex: 'applyId', width: 85},
      {title: '申请用户ID', dataIndex: 'userId', width: 100},
      {title: '申请用户昵称', dataIndex: 'nickname', width: 150},
      {title: '主播ID', dataIndex: 'bindUserId', width: 85},
      {title: '主播昵称', dataIndex: 'bindNickname', width: 100},
      {title: '状态', dataIndex: 'status', width: 85, render: (text) => {
        if(text === 'WAITING'){
          return <Tag color="#2db7f5">等待审核</Tag>
        } else if(text === 'SUCCESS'){
          return <Tag color="#87d068">审核通过</Tag>
        } else if(text === 'REJECT'){
          return <Tag color="#f50">审核失败</Tag>
        }
        return null
      }},
      {title: '申请时间', dataIndex: 'createTime', width: 135},
      {title: '备注', dataIndex: 'remark'},
      {title: '操作', fixed: 'right', width: 100, render: (text, record) => {
        if(record['status'] === 'WAITING'){
          return <a href="javascript:void(0)" onClick={this.apply.bind(this, record['applyId'])}>审核</a>
        }
        return null
      }}
    ]
  }
  apply(applyId) {
    this.setState({ applyId, visible: true })
  }
  handleClose(isRefresh = false){
    isRefresh && this._customTable.refreshTable();
    this.setState({ visible: false, applyId: null})
  }
  componentDidMount(){
    this._customTable.queryTableData()
  }
  render(){
    const {visible, applyId} = this.state
    return (
      <div>
        <CustomTable ref={obj => this._customTable=obj}
                     rowKey="applyId"
                     columns={this.__getColumns()}
                     fetchTableDataMethod={AnchorService.queryAppLivingList} />
        <ApplyModal visible={visible} applyId={applyId} onClose={this.handleClose} />
      </div>
    )
  }
}