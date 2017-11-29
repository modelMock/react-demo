/**
 *公会列表
 * @author 谭亮红
 */
import React, {Component} from 'react';
import {hashHistory} from 'react-router'
import {Form, Row, Col, Input, Button, Select, Tag, Modal,Dropdown,Icon,Menu} from 'antd';
import moment from 'moment';
import webUtils from '../../commons/utils/webUtils';
import commonUtils from '../../commons/utils/commonUtils';
import CustomTable from '../../commons/widgets/CustomTable';
import AnchorService from '../../service/AnchorService';
import UnionService from '../../service/UnionService'

const MenuItem = Menu.Item;
const FormItem = Form.Item;
const Option = Select.Option;
const INVOICE_AHEAD_TIPS = {'T':'先出票后付款','F':'先付款后出票'}

class SearhForm extends Component {
  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.resetForm = this.resetForm.bind(this)
  }

  handleSubmit(e) {
    e.preventDefault()
    const value = this.props.form.getFieldsValue()
    this.props.onSearch(value)
  }

  //重置表单内容
  resetForm() {
    this.props.form.resetFields()
  }

  render() {
    const {form, uninOperationList} = this.props
    const {getFieldDecorator} = form
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit} className="ant-advanced-search-form">
        <Row>
          <Col sm={8}>
            <FormItem label="公会ID" {...formItemLayout}>
              {getFieldDecorator("guildId")(<Input style={{width: '100%'}} placeholder="请输入公会ID"/>)}
            </FormItem>
            <FormItem label="状态" {...formItemLayout}>
              {getFieldDecorator("status", {initialValue: 'ACTIVE'})(
                <Select allowClear placeholder="请选择公会状态">
                  <Option value="ACTIVE">正常</Option>
                  <Option value="INACTIVE">失效</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="公会名称" {...formItemLayout}>
              {getFieldDecorator("guildName")(<Input placeholder="请输入公会名称"/>)}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="运营归属" {...formItemLayout}>
              {getFieldDecorator("tutorUserId")(
                <Select placeholder="请选择运管" allowClear>
                  {
                    uninOperationList.map(({userId, nickname}) => (
                      <Option key={userId}>{nickname}({userId})</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
            <FormItem style={{textAlign: 'right'}}>
              <Button type="primary" icon="search" size="large" htmlType="submit">查询</Button>
              <Button type="ghost" icon="cross" size="large" onClick={this.resetForm}>清除</Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
}

const UnionListForm = Form.create()(SearhForm)
export default class UnionList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uninOperationList: [],
      showModifyTuTorUserModal: false,
      guildChosen : {}
    }
    //需要判断权限的btn集合
    this.btnResList = props.location.state ? props.location.state.btnResList||[] : [];
    // 是否有作废公会的权限
    this.hasAuthorityToDelGuild = this.btnResList.includes('delGuild')
    // 是否有修改公会的权限
    this.hasAuthorityToModifyGuild = this.btnResList.includes('modifyGuild')
    // 是否有修改公会归属运营的权限
    this.hasAuthorityToModifyGuildTutorUser = this.btnResList.includes('modifyGuildTutorUser')
    //修改公会 先发票 还是 先付款的模式
    this.hasAuthorityTomodifyInvoiceAhead = this.btnResList.includes('modifyInvoiceAhead')

    this.handleCloseModal = this.handleCloseModal.bind(this)

    this.columns = [
      {title: '公会ID', dataIndex: 'guildId', fixed: 'left', width: 70},
      {title: '公会代码', dataIndex: 'guildCode', fixed: 'left', width: 90},
      {title: '公会名称', dataIndex: 'guildName'},
      {title: '工资发放方式', dataIndex: 'anchorPayoffTypeDesc'},
      {title: '发放渠道', dataIndex: 'payoffChannel'},
      {title: '归属运营', dataIndex: 'tutorUserName', width: 100},
      {title: '创建人', dataIndex: 'createUserName', width: 100},
      {title: '出票/付款', dataIndex: 'invoiceAhead', width: 100,render: (text) => INVOICE_AHEAD_TIPS[text]},
      {
        title: '创建时间',
        dataIndex: 'createTime',
        width: 150,
        sorter: (a, b) => moment(a.createTime) - moment(b.createTime)
      },
      {
        title: '状态', dataIndex: 'statusDesc', width: 80, render: (text, record) => {
        if(record['status'] === 'ACTIVE'){
          return <Tag color="#2db7f5">{text}</Tag>
        }else if(record['status'] === 'INACTIVE'){
          return <Tag color="#f50">{text}</Tag>
        }else{
          return null
        }
      }
      },
      {
        title: '失效时间', dataIndex: 'statusDate', width: 150, render: (text, record) => {
        return record['status'] === 'INACTIVE' && (<span>{text}</span>)
      }
      },
      {title: '操作', fixed: 'right', width: 150, render: (text, record) => {
        const delGuildBtn = this.hasAuthorityToDelGuild && record.status === "ACTIVE"
        const modifyBtn = this.hasAuthorityToModifyGuild //&& record.tutorUserId === parseInt(localStorage.getItem('userId'))//去除归属运营的限制
        const tutorBtn = this.hasAuthorityToModifyGuildTutorUser
				const nowInvoiceAhead = record['invoiceAhead'] == 'T';//现在是否是 先票后款
				const modInvoiceAheadText = nowInvoiceAhead ? '先付款后开票':'先开票后付款'

				const menu = (
          <Menu onClick={this.handleMenuClick.bind(this, record)}>
						{delGuildBtn && <MenuItem key="invalid">作废</MenuItem>}
						{modifyBtn && <MenuItem key="modify">修改公会</MenuItem>}
						{tutorBtn && <MenuItem key="tutor">修改归属运营</MenuItem>}
						{this.hasAuthorityTomodifyInvoiceAhead && <MenuItem key="invoiceAhead">{modInvoiceAheadText}</MenuItem>}
          </Menu>
				);
				return <Dropdown overlay={menu}>
          <Button ghost type="primary">
            操作 <Icon type="down" />
          </Button>
        </Dropdown>
      }},
    ]
  }

	handleMenuClick(record, e){
		const key = e.key;

		switch (key){
			case "invalid"://作废
				this.delGuilds(record.guildId,e)
				break;
			case "modify"://修改
				this.toModify(record.guildId,e);
				break;
			case "tutor"://修改归属运营
				this.handleModifyGuildTutorUser(record);
				break;
			case "invoiceAhead":
				this.handleModifyGuildInvoiceAhead(record);
				break;
		}
	}


//跳转到修改公会
  toModify(guildId, e) {
		e && e.preventDefault && e.preventDefault();
    hashHistory.push(`/union/modify/${guildId}`)
  }

  //作废公会
  delGuilds(guildId, e) {
    e && e.preventDefault && e.preventDefault();
    webUtils.confirm(() => {
      UnionService.delGuilds(guildId).then(result => {
        webUtils.alertSuccess("作废公会成功");
        this._customTable.refreshTable();
      })
    }, `确认将公会【${guildId}】名称状态更改为失效吗？失效后无法重新启用，请谨慎操作！`);
  }

  // 修改公会归属运营
  handleModifyGuildTutorUser({guildId, guildName, tutorUserId}){
    // 公会名称用于显示 公会id是传给后台的必须字段
    const guildChosen = {
      guildId,
      guildName,
      tutorUserId
    }
    this.setState({
      showModifyTuTorUserModal: true,
      guildChosen
    })
  }
  // 修改公会归属运营
  handleModifyGuildInvoiceAhead({guildId,guildName, invoiceAhead}){
    // 公会名称用于显示 公会id是传给后台的必须字段
		const target = invoiceAhead == 'T' ? 'F' : 'T'  //现在是否是 先票后款
		webUtils.confirm(() => {
			UnionService.modifyInvoiceAhead(guildId,target).then(result => {
				webUtils.alertSuccess("操作成功!");
				this._customTable.refreshTable();
			})
		}, `公会【${guildName}(${guildId})】现在是 "${INVOICE_AHEAD_TIPS[invoiceAhead]}",是否要修改为 " ${INVOICE_AHEAD_TIPS[target]} "`);
  }

  componentDidMount() {
    AnchorService.queryUserByType().then(result => {
      this.setState({uninOperationList: result})
    })
  }

  handleCloseModal(){
    this.setState({
      showModifyTuTorUserModal: false,
      guildChosen: {}
    })
  }

  // 表单搜索
  handleOnSearch = (value) => {
    this._customTable.queryTableData(value)
  }

  render() {
    const {uninOperationList, guildChosen, showModifyTuTorUserModal} = this.state;
    return (
      <div>
        <UnionListForm onSearch={this.handleOnSearch}
                       uninOperationList={uninOperationList}/>
        <CustomTable ref={table => this._customTable = table}
                     rowKey="guildId"
                     columns={this.columns}
                     scroll={{x: 1250}}
                     fetchTableDataMethod={UnionService.queryGuilds}/>
        <ModifyTuTorUserModal visible={showModifyTuTorUserModal}
                              onClose={this.handleCloseModal}
                              uninOperationList={uninOperationList}
                              guildInfo={guildChosen}/>
      </div>
    )
  }
}

//
class ModifyTuTorUserModal extends Component{
  constructor(props){
    super(props)
    this.state = {
      managerList: []
    }
  }
  handleSave = () => {
    const {form, guildInfo} = this.props
    form.validateFields((err, values) => {
      if(!!err) return
      UnionService.modifyTutor(guildInfo['guildId'], values['tutorUserId']).then(result => {
        webUtils.alertSuccess("修改公会归属运营成功！")
        this.handleClose()
      })
    })

  }
  //关闭
  handleClose = () => {
    this.props.onClose();
    this.props.form.resetFields();
  }
  render(){
    const {visible, form, guildInfo, uninOperationList} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const modalTitle = `修改公会【${guildInfo['guildName']}】归属运营`
    return(
      <Modal title={modalTitle}
             visible={visible}
             okText="提交"
             cancelText="取消"
             onOk={this.handleSave}
             onCancel={this.handleClose}>
        <Form>
          <FormItem label="归属运营" {...formItemLayout}>
            {getFieldDecorator("tutorUserId", {rules: [{required: true, message: '请选择归属运营'}],
            })(
              <Select>
                {uninOperationList.map(user => <Option key={user.userId} >{user.nickname}</Option>)}
              </Select>
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
ModifyTuTorUserModal=Form.create({
  mapPropsToFields(props){
    const {visible, guildInfo} = props
    if(!visible || !guildInfo) return {}
    console.log(commonUtils.recordToValueJson(guildInfo), '-------------------')
    return commonUtils.recordToValueJson(guildInfo)
  }
})(ModifyTuTorUserModal);