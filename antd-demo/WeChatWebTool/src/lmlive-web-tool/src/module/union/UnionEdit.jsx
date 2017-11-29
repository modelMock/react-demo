import React, {Component} from 'react'
import {Form, Row, Col, Input, Select, Button, Modal, Table, Tag} from 'antd'
import webUtils from '../../commons/utils/webUtils';
import commonUtils from '../../commons/utils/commonUtils';
import validateUtils from '../../commons/utils/validateUtils';
import ImageUpload from '../../commons/widgets/ImageUpload';
import CustomSelect from '../../commons/widgets/CustomSelect';
import AnchorService from "../../service/AnchorService";
import UnionService from "../../service/UnionService";

const FormItem = Form.Item
const { TextArea } = Input
const Option = Select.Option

const getRecordId = (() => {
  let _recordId = 1
  return () => {
    return `rid_${_recordId++}`
  }
})()

const LINKMAN_TYPE_MASTER = "master"
const btnStyle = {marginTop: 16, marginBottom: 16}
const submitBtnStyle = {marginTop: 16, marginBottom: 16, width: '50%'}

const anchorPayoffTypeData = [
  {key: "o2g", value: "官方代发至公会"},
  {key: "o2a", value: "官方代发至主播"},
  {key: "g2a", value: "公会发放"}
]
// 官方代发至公会 对公
// 官方代发至主播 均可
// 公会发放 对私
const payoffTypeData = {
  o2g: [{key: "PRIVATE", value: "对私"}],
  o2a: [{key: "PRIVATE", value: "对私"}],
  g2a: [{key: "PUBLIC", value: "对公"}],
}

const faxRateData = {
  PUBLIC: [{key: "3", value: "3%"}, {key: "6", value: "6%"}],
  PRIVATE: [{key: "4", value: "4%"},{key: "6", value: "6%"},{key: "8", value: "8%"}]
}

// 联系人编辑弹框form
class LinkmanForm extends Component{
  constructor(props){
    super(props)
  }
  handleSave = () => {
    const form = this.props.form
    form.validateFields((errors, values) => {
      if (!!errors) return;
      this.props.onClose(Object.assign({}, values))
      form.resetFields()
    })
  }
  handleClose = () => {
    this.props.onClose()
    this.props.form.resetFields()
  }
  render(){
    const {visible, form, record} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
    };
    return(
      <Modal title={record ? '修改联系人' : '新增联系人'}
             width={660}
             visible={visible}
             okText="确定"
             cancelText="取消"
             onOk={this.handleSave}
             onCancel={this.handleClose}>
        <Form>
          {getFieldDecorator("recordId")(<Input type="hidden" />)}
          {getFieldDecorator("linkmanType")(<Input type="hidden" />)}
          <FormItem label="姓名" {...formItemLayout}>
            {getFieldDecorator("linkmanName", {
              rules: [{required: true, message: '请输入姓名'}]
            })(<Input />)}
          </FormItem>
          <FormItem label="手机号" {...formItemLayout}>
            {getFieldDecorator("mobile", {
              rules: [
                {required: true, message: '请输入手机号'},
                {validator: validateUtils.checkMobile}
              ]
            })(<Input/>)}
          </FormItem>
          <FormItem label="QQ" {...formItemLayout}>
            {getFieldDecorator("qq")(<Input />)}
          </FormItem>
          <FormItem label="Email" {...formItemLayout}>
            {getFieldDecorator("email")(<Input />)}
          </FormItem>
          <FormItem label="羚萌ID" {...formItemLayout}>
            {getFieldDecorator("userId")(<Input />)}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

LinkmanForm = Form.create({
  mapPropsToFields(props){
    const {visible, record} = props
    // 隐藏状态直接返回空对象
    if(!visible) return {}
    // 新增联系人，自动分配一个recordId用来标识
    if(!record) {
      return {
        recordId: {value: getRecordId()}
      }
    }
    // 修改联系人
    return commonUtils.recordToValueJson(record)
  }
})(LinkmanForm)

// 银行编辑弹框Form
class BankForm extends Component {
  constructor(props){
    super(props)
    this.state = {
      faxRateData: []
    }
  }
  handleBankTypeChange = (value) => {
    if(!value)return
    const data = faxRateData[value]
    // 默认选中第一个：不然没法清除当前选中文本
    this.setState({
      faxRateData: data
    }, () => {
      this.props.form.setFieldsValue({ faxRate:data[value=='PRIVATE'?2:0]['key'] })//对私默认取 8%
    })
  }
  componentWillReceiveProps(nextProps){
    if(!nextProps.visible || !nextProps.record) return
    if((nextProps.record && !this.props.record) || nextProps.record['bankType'] !== this.props.record['bankType']){
      const data = faxRateData[nextProps.record['bankType']]
      this.setState({
        faxRateData: data
      })
    }
  }
  handleSave = () => {
    const from = this.props.form;
    from.validateFields((err, values) => {
      if(!!err) return
      // 拆分银行名称
      const bank = Object.assign({}, values)
      bank['bankCodeText'] = values['bankCode']['label']
      bank['bankCode'] = values['bankCode']['key']
      this.props.onClose(bank)
      from.resetFields()
    })
  }
  handleCancel = () => {
    this.props.onClose()
    this.props.form.resetFields()
  }
  render(){
    const {visible, form, record} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    return(
      <Modal title={record ? '修改公会账户' : '新增公会账户'}
             width={800}
             visible={visible}
             okText="确定"
             cancelText="取消"
             onOk={this.handleSave}
             onCancel={this.handleCancel}>
        <Form>
          {getFieldDecorator("recordId")(<Input type="hidden" />)}
          {getFieldDecorator("isDefault")(<Input type="hidden" />)}
          <Row>
            <Col sm={12}>
              <FormItem label="账户类型" {...formItemLayout}>
                {getFieldDecorator("bankType", {
                  rules: [{required: true, message: '请输入账户类型'}],
                  onChange: this.handleBankTypeChange
                })(
                  <Select>
                    <Option value="PUBLIC">对公</Option>
                    <Option value="PRIVATE">对私</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label="开户行省" {...formItemLayout}>
                {getFieldDecorator("branchProvince",{rules: [{required: true, message: '请输入开户行省'}]})(
                  <Input />
                )}
              </FormItem>
              <FormItem label="开户行" {...formItemLayout}>
                {getFieldDecorator("branchName",{rules: [{required: true, message: '请输入开户行'}]})(
                  <Input />
                )}
              </FormItem>
              <FormItem label="账号" {...formItemLayout}>
                {getFieldDecorator("bankAccount", {rules: [{required: true, message: '请输入账号'}]})(
                  <Input />
                )}
              </FormItem>
              <FormItem label="身份证号" {...formItemLayout}>
                {getFieldDecorator("accountIdentityNo", {rules: [{required: true, message: '请输入身份证号'},{validator: validateUtils.checkCertNum}]})(
                  <Input />
                )}
              </FormItem>
              <FormItem label="支付宝" {...formItemLayout}>
                {getFieldDecorator("alipayAccount")(
                  <Input />
                )}
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label="账户名称" {...formItemLayout}>
                {getFieldDecorator("accountName", {rules: [{required: true, message: '请输入账户名称'}]})(
                  <Input />
                )}
              </FormItem>
              <FormItem label="开户行市" {...formItemLayout}>
                {getFieldDecorator("branchCity", {rules: [{required: true, message: '请输入开户行市'}]})(
                  <Input />
                )}
              </FormItem>
              <FormItem label="银行" {...formItemLayout}>
                {getFieldDecorator("bankCode", {rules: [{required: true, message: '请选择银行'}]})(
                  <CustomSelect labelInValue placeholder="请选择银行" itemKey="BankCode"/>
                )}
              </FormItem>
              <FormItem label="银行联号" {...formItemLayout}>
                {getFieldDecorator("bankLineNum")(
                  <Input />
                )}
              </FormItem>
              <FormItem label="税率" {...formItemLayout}>
                {getFieldDecorator("faxRate", {rules: [{required: true, message: '请选择税率'}]})(
                  <Select>
                    {this.state.faxRateData.map(obj => <Option key={obj.key}>{obj.value}</Option>)}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

BankForm = Form.create({
  mapPropsToFields(props){
    const {visible, record} = props
    // 隐藏状态直接返回空对象
    if(!visible) return {}
    // 新增银行账号，自动分配一个recordId用来标识
    if(!record) {
      return {
        recordId: {value: getRecordId()}
      }
    }
    // 修改银行账号
    const data = commonUtils.recordToValueJson(record)
    // 组装银行下拉框当前值
    data['bankCode']['value'] = {key: record['bankCode'], label: record['bankCodeText']}
    return data
  }
})(BankForm)

// 基本信息
class UnionForm extends Component{
  constructor(props){
    super(props)
    this.state = {
      payoffTypeData: []
    }
  }
  handlePayoffChange = (value) => {
    if(!value)return
    const data = payoffTypeData[value]
    // 默认选中第一个
    this.setState({
      payoffTypeData: data
    }, () => {
      this.props.form.setFieldsValue({ guildPayoffType: data[0]['key'] })
    })
  }
  componentWillReceiveProps(nextProps){
    const newPayOffType = nextProps.record['anchorPayoffType']
    if(!newPayOffType)return

    const newPayOffTypeValue = newPayOffType['value']
    if(!newPayOffTypeValue)return

    const data = payoffTypeData[newPayOffTypeValue]
    this.setState({
      payoffTypeData: data
    })
  }
  render(){
    const {isModify, managerList, form} = this.props
    const {getFieldDecorator} = form
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    return (
      <Form layout="horizontal" onSubmit={this.onUnionSave} className="ant-advanced-search-form">
        {getFieldDecorator("guildId")(<Input type="hidden"/>)}
        {isModify && <Row>
          <Col sm={12}>
            <FormItem label="公会ID" {...formItemLayout}>
              {getFieldDecorator("guildId")(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>}
        <Row>
          <Col sm={12}>
            <FormItem label="公会名称" {...formItemLayout}>
              {getFieldDecorator("guildName", {rules: [{required: true, message: '请输入公会名称'}],
              })(<Input placeholder="请输入公会名称" />)}
            </FormItem>
            <FormItem label="公司名称" {...formItemLayout}>
              {getFieldDecorator("companyName", {rules: [{required: true, message: '请输入公司名称'}],
              })(<Input placeholder="请输入公司名称" />)}
            </FormItem>
            <FormItem label="城市" {...formItemLayout}>
              {getFieldDecorator("city", {rules: [{required: true, message: '请输入城市'}],
              })(<Input placeholder="请输入城市" />)}
            </FormItem>
            <FormItem label="工资发放方式" {...formItemLayout}>
              {getFieldDecorator("anchorPayoffType", {
                rules: [{required: true, message: '请选择工资发放方式'}],
                onChange: this.handlePayoffChange
              })(
                <Select placeholder="请选择工资发放方式">
                  {anchorPayoffTypeData.map(item => <Option key={item.key} value={item.key}>{item.value}</Option>)}
                </Select>
              )}
            </FormItem>
            <FormItem label="提成发放方式" {...formItemLayout}>
              {getFieldDecorator("guildPayoffType", {
                rules: [{required: true, message: '请选择提成发放方式'}],
              })(
                <Select placeholder="请选择提成发放方式">
                  {this.state.payoffTypeData.map(item => <Option key={item.key} value={item.key}>{item.value}</Option>)}
                </Select>
              )}
            </FormItem>
            <FormItem label="归属运营" {...formItemLayout}>
              {getFieldDecorator("tutorUserId", {rules: [{required: true, message: '请选择归属运营'}],
              })(
                <Select placeholder="请选择运管" disabled={isModify}>
                  {
                    managerList.map(user => (
                      <Option key={String(user.userId)}>{user.nickname}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label="发放渠道" {...formItemLayout}>
              {getFieldDecorator("payoffChannel", {rules: [{required: true, message: '请选择发放渠道'}],
              })(
                <Select placeholder="请选择发放渠道">
                  <Option value="official">官方直发</Option>
                  <Option value="gongmall">工猫</Option>
                  <Option value="aiyuangong">爱员工</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="合同编号" {...formItemLayout}>
              {getFieldDecorator("contractSn")(<Input placeholder="请输合同编号" />)}
            </FormItem>
          </Col>
          <Col sm={12}>
            <FormItem label="公会代码" {...formItemLayout}>
              {getFieldDecorator("guildCode", {rules: [{required: true, message: '请输公会代码'}],
              })(<Input placeholder="请输入公会代码" disabled={isModify}/>)}
            </FormItem>
            <FormItem label="营业执照扫描件" {...formItemLayout}>
              {getFieldDecorator("businessLicenseUrl", {
                valuePropName: 'fileList',
              })(
                <ImageUpload uploadFolderName={webUtils.getUploadFolderName("GuildPic")} uploadButtonText="上传营业执照"/>
              )}
            </FormItem>
            <FormItem label="合同照（最后一张）" {...formItemLayout}>
              {getFieldDecorator("contractUrl", {
                valuePropName: 'fileList',
              })(
                <ImageUpload uploadFolderName={webUtils.getUploadFolderName("GuildPic")} uploadButtonText="上传合同照"/>
              )}
            </FormItem>
            <FormItem label="类型" {...formItemLayout}>
              {getFieldDecorator("guildType", {rules: [{required: true, message: '请选择类型'}],
              })(
                <Select placeholder="请选择类型">
                  <Option key="ONLINE">线上</Option>
                  <Option key="OFF_LINE">线下</Option>
                  <Option key="OFFICIAL">官方</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="个税税率" {...formItemLayout}>
              {getFieldDecorator("personalTaxRate", {rules: [{required: true, message: '请选择个税税率'}],
              })(
                <Select placeholder="请选择个税税率">
                  <Option value="4">4%</Option>
                  <Option value="6">6%</Option>
                  <Option value="8">8%</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={24}>
            <FormItem label="备注" labelCol={{span: 5}} wrapperCol={{span: 19}}>
              {getFieldDecorator("remark")(
                <TextArea autosize={{ minRows: 3, maxRows: 5 }}/>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
}
UnionForm = Form.create({
  onFieldsChange(props, changedFields) {
    props.onChange(changedFields);
  },
  mapPropsToFields(props){
    return props.record
  }
})(UnionForm)

export default class UnionEdit extends Component{
  constructor(props){
    super(props)
    // 有公会ID代表修改，不然就是新增公会
    this.guildId = props.params.guildId
    this.state = {
      managerList: [],
      // 公会基础信息(修改用)
      guild: {},
      // 联系人信息(修改用)
      linkmans: [],
      // 银行信息(修改用)
      banks: [],
      linkmanVisible: false,
      // 联系人编辑行数据
      editLinkman: null,
      bankVisible: false,
      // 银行编辑航数据
      editBank: null
    }
    this.linkmanColumns = [
      {title: '联系人类型', dataIndex: 'linkmanType',render:(text) => text === LINKMAN_TYPE_MASTER ? '公会长' : '运营'
      },
      {title: '姓名', dataIndex: 'linkmanName'},
      {title: '手机号', dataIndex: 'mobile'},
      {title: 'QQ', dataIndex: 'qq'},
      {title: 'Email', dataIndex: 'email'},
      {title: '羚萌ID', dataIndex: 'userId'},
      {title: '后台账号', dataIndex: 'managerAccount'},
      {title: '操作',render:(text,record)=>{
        return (
          <span>
            <a href="javascript:void(0)" onClick={this.doEditLinkman.bind(this, record)}>修改</a>
            {record['linkmanType'] !== LINKMAN_TYPE_MASTER && <span className="ant-divider"/>}
            {record['linkmanType'] !== LINKMAN_TYPE_MASTER && <a href="javascript:void(0)" onClick={this.doDelLinkman.bind(this, record)}>删除</a>}
          </span>
        )
      }}
    ]
    this.bankColumns = [
      {
        title: '账户类型', dataIndex: 'bankType', width: 70, fixed: 'left', render: (text) => text == 'PUBLIC' ? '对公' : '对私'
      },
      {title: '账户名称', dataIndex: 'accountName'},
      {title: '身份证号', dataIndex: 'accountIdentityNo', width: 150},
      {title: '税率', dataIndex: 'faxRate', width: 60, render: (text) => `${text}%`},
      {title: '银行', dataIndex: 'bankCodeText', width: 120},
      {title: '账号', dataIndex: 'bankAccount', width: 150},
      {title: '开户行', dataIndex: 'branchName', width: 100},
      {title: '开户行省', dataIndex: 'branchProvince', width: 100},
      {title: '开户行市', dataIndex: 'branchCity', width: 100},
      {title: '支付宝', dataIndex: 'alipayAccount', width: 85},
      {title: '银行联号', dataIndex: 'bankLineNum', width: 150},
      {
        title: '操作', dataIndex: 'recordId', width: 150, fixed: 'right', render: (text, record) => {
        return (
          <span>
            <a href="javascript:void(0)" onClick={this.doEditBank.bind(this, record)}>修改</a>
            <span className="ant-divider"/>
            {/*{record['isDefault']!=='T' && <a href="javascript:void(0)" onClick={this.doSetDefaultBank.bind(this, record)}>设为默认</a>}*/}
            {record['isDefault']!=='T' && <span className="ant-divider"/>}
            <a href="javascript:void(0)" onClick={this.doDelBank.bind(this, record)}>删除</a>
          </span>
        )
      }
      }
    ]
  }
  componentDidMount(){
    if(this.guildId) {
      this._queryGuidDetail()
    } else {
      AnchorService.queryUserByType().then(managerList => {
        this.setState({ managerList })
      })
    }
  }
  _queryGuidDetail(){
    Promise.all([Promise.resolve(AnchorService.queryUserByType()), Promise.resolve(UnionService.queryGuildDetail(this.guildId))]).then(result => {
      const guildDetail = result[1]
      const {guild, linkmans, banks} = guildDetail
      // 备份原始联系人、银行数据，删除时需要告知后台哪些数据被删除了
      this.origLinkmans = [].concat(linkmans)
      this.origBanks = [].concat(banks)
      this.setState({
        linkmans,
        banks,
        managerList: result[0],
        guild: commonUtils.recordToValueJson(guild)
      })
    })
  }
  handleFormChange = (changedFields) => {
    this.setState({
      guild: { ...this.state.guild, ...changedFields },
    });
  }
  // 编辑联系人
  doEditLinkman(editLinkman){
    this.setState({
      editLinkman,
      linkmanVisible: true,
    })
  }
  // 删除联系人
  doDelLinkman(record){
    webUtils.confirm(() => {
      const linkmans = this.state.linkmans.concat([]), editRecordId = record['recordId']
      const index = linkmans.findIndex(obj => obj['recordId'] == editRecordId)
      linkmans.splice(index, 1)
      this.setState({ linkmans })
    }, `确定删除联系人【${record['linkmanName']}】吗？`)
  }
  // 设为默认银行
  doSetDefaultBank(record){
    webUtils.confirm(() => {
      const banks = this.state.banks.concat([]), editRecordId = record['recordId']
      let idx = 0
      banks.forEach((bank, index) => {
        if(bank['recordId'] === editRecordId) {
          bank['isDefault'] = 'T'
          idx = index
        } else {
          bank['isDefault'] = 'F'
        }
      })
      // 设为默认的账号移到第一位
      banks.unshift(banks.splice(idx, 1)[0])
      this.setState({ banks })
    }, `确定把账户名称【${record['accountName']}】设为默认账户吗？`)
  }
  // 编辑银行
  doEditBank(editBank){
    this.setState({
      editBank,
      bankVisible: true,
    })
  }
  // 删除银行
  doDelBank(record){
    webUtils.confirm(() => {
      const banks = this.state.banks.concat([]), editRecordId = record['recordId']
      const index = banks.findIndex(obj => obj['recordId'] == editRecordId)
      banks.splice(index, 1)
      this.setState({ banks })
    }, `确定删除账户名称【${record['accountName']}】吗？`)
  }
  // 关闭编辑联系人弹框：若保存，则替换表格中当前行
  doCloseLinkman = (editLinkman) => {
    this.setState({
      linkmanVisible: false,
      linkman: null
    })
    if(editLinkman){
      const linkmans = this.state.linkmans.concat([]), editRecordId = editLinkman['recordId']
      const index = linkmans.findIndex(obj => obj['recordId'] == editRecordId)
      // 当前编辑联系人存在，则替换；不存在则为新增联系人
      if(index >= 0) {
        linkmans[index] = editLinkman
      } else {
        // 新增第一条数据为公会长
        editLinkman['linkmanType'] =  linkmans.length === 0  ? LINKMAN_TYPE_MASTER : ""
        linkmans.push(editLinkman)
      }
      this.setState({ linkmans })
    }
  }
  // 关闭编辑银行弹框：若保存，则替换表格中当前行
  doCloseBank = (editBank) => {
    this.setState({
      bankVisible: false,
      bank: null
    })
    if(editBank){
      const banks = this.state.banks.concat([]), editRecordId = editBank['recordId']
      const index = banks.findIndex(obj => obj['recordId'] == editRecordId)
      // 当前编辑银行账号存在，则替换；不存在则为新增银行账号
      if(index >= 0) {
        banks[index] = editBank
      } else {
        // 新增都不是默认账户
        editBank['isDefault'] = 'F'
        banks.push(editBank)
      }
      this.setState({ banks })
    }
  }
  _delRecordId(arr){
    const newDatas = []
    arr.forEach(obj => {
      if(String(obj['recordId']).startsWith("rid_")){
        // 数组中子对象修改要拷贝一份
        const o = Object.assign({}, obj)
        o['recordId'] = null
        newDatas.push(o)
      }
    })
    return newDatas
  }
  _doDealData(origDatas, currentDatas){
    // 从当前数据中提取新增的数据行
    const newDatas = this._delRecordId(currentDatas)
    // 修改过的 和 已删除的
    const oldDatas = origDatas.map(obj => {
      const recordId = obj['recordId']
      const lineData = currentDatas.find(obj => obj['recordId'] == recordId)
      // 没找到当前行数据，证明被删除了，按后台要求状态改为禁用
      return lineData ? lineData : {recordId, status: 'INACTIVE'}
    })
    return [...newDatas, ...oldDatas]
  }
  _modifyGuild(guild){
    guild['linkmen'] = this._doDealData(this.origLinkmans, this.state.linkmans)
    guild['banks'] = this._doDealData(this.origBanks, this.state.banks)
    UnionService.modifyGuilds(guild).then(result => {
      webUtils.alertSuccess("修改公会成功")
      this._queryGuidDetail()
    })
  }
  _addGuild(guild){
    guild['linkmen'] = this._delRecordId(this.state.linkmans)
    guild['banks'] = this._delRecordId(this.state.banks)
    UnionService.addGuilds(guild).then(result => {
      webUtils.alertSuccess("新增公会成功")
      this.unionFormRef.resetFields()
      this.setState({
        linkmans: [],
        banks: []
      })
    })
  }
  // 所有数据提交
  doSubmit = () => {
    this.unionFormRef.validateFields((err, values) => {
      if(err) return
      if(this.state.linkmans.length === 0) {
        webUtils.alertFailure("必须新增公会长联系人")
        return
      }
      const title = `确定${this.guildId ? '修改' : '新增'}公会吗？`
      webUtils.confirm(() => {
        const guild = Object.assign({}, values)
        // 修改公会数据
        if(this.guildId){
          this._modifyGuild(guild)
        } else {
          // 新增公会数据
          this._addGuild(guild)
        }

      }, title)
    })
  }
  render(){
    const { managerList, guild, linkmans, banks, linkmanVisible, editLinkman, bankVisible, editBank } = this.state
    return (
      <div>
        <UnionForm ref={obj => this.unionFormRef=obj}
                   managerList={managerList}
                   record={guild}
                   isModify={!!this.guildId}
                   onChange={this.handleFormChange}/>
        <Table rowKey="recordId"
               bordered
               columns={this.linkmanColumns}
               dataSource={linkmans}
               pagination={false}/>
        <Col style={{textAlign: 'center'}}>
          <Button type="primary" size="large" ghost icon="plus" onClick={()=>this.doEditLinkman()} style={btnStyle}>
            {linkmans.length === 0 ? '新增公会长' : '新增运营'}
          </Button>
        </Col>
        <Table rowKey="recordId"
               bordered
               dataSource={banks}
               columns={this.bankColumns}
               pagination={false}
               scroll={{x: 1500}}/>
        <Col style={{textAlign: 'center'}}>
          <Button type="primary" ghost size="large" icon="plus" onClick={()=>this.doEditBank()} style={btnStyle}>新增账户</Button>
        </Col>
        <Col style={{textAlign: 'center'}}>
          <Button type="primary" icon="check" size="large" style={submitBtnStyle} onClick={this.doSubmit}>提   交</Button>
        </Col>
        <LinkmanForm visible={linkmanVisible} record={editLinkman} onClose={this.doCloseLinkman} />
        <BankForm visible={bankVisible} record={editBank} onClose={this.doCloseBank} />
      </div>
    )
  }
}