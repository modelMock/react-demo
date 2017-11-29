import React, {Component} from 'react';
import {Form, Row, Col, Input, InputNumber, Select, Modal, Button, Tag, DatePicker, Menu, Dropdown, Icon, Radio} from 'antd';
import moment from 'moment';
import CustomSelect from '../../commons/widgets/CustomSelect';
import CustomTable from '../../commons/widgets/CustomTable';
import AnchorService from '../../service/AnchorService';
import webUtils from '../../commons/utils/webUtils';
import validateUtils from '../../commons/utils/validateUtils';
import commonUtils from '../../commons/utils/commonUtils';
import ImageUpload from '../../commons/widgets/ImageUpload';
import LivingRecordModal from './LivingRecordModal';
import {DateUtil,FORMAT_PATTERNS} from '../../commons/utils/DateUtil'

const FormItem = Form.Item;
const Option = Select.Option;
const MenuItem = Menu.Item;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

// 搜索表单
const AnchorSearchForm = Form.create()(
  (props) => {
    const {form, onSearch} = props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    return (
      <Form layout="horizontal" onSubmit={ onSearch } className="ant-advanced-search-form">
        <Row>
          <Col sm={8}>
            <FormItem label="主播ID" {...formItemLayout}>
              {getFieldDecorator("userId")(<Input placeholder="请输入主播ID查询" />)}
            </FormItem>
            <FormItem label="手机号" {...formItemLayout}>
              {getFieldDecorator("mobile")(<Input placeholder="手机号支持模糊查询" />)}
            </FormItem>
            <FormItem label="真实姓名" {...formItemLayout}>
              {getFieldDecorator("accountName")(<Input placeholder="真实姓名全文匹配" />)}
            </FormItem>
            <FormItem label="标签" {...formItemLayout}>
              {getFieldDecorator("tagName")(<Input placeholder="标签支持模糊查询" />)}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="房间ID" {...formItemLayout}>
              {getFieldDecorator("programId")(<Input placeholder="请输入房间ID查询" />)}
            </FormItem>
            <FormItem label="用户类型" {...formItemLayout}>
              {getFieldDecorator("userType")(
                <CustomSelect allowClear showSearch optionFilterProp="children" itemKey="UserType" placeholder="请选择用户类型"/>)}
            </FormItem>
            <FormItem label="归属" {...formItemLayout}>
              {getFieldDecorator("programBelong")(
                <CustomSelect allowClear showSearch optionFilterProp="children" itemKey="ProgramBelong" placeholder="请选择归属"/>
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="昵称" {...formItemLayout}>
              {getFieldDecorator("nickname")(<Input placeholder="昵称支持模糊查询" />)}
            </FormItem>
            <FormItem label="节目状态" {...formItemLayout}>
              {getFieldDecorator("programStatus")(
                <RadioGroup>
                  <RadioButton value="ONLINE">正常</RadioButton>
                  <RadioButton value="OFFLINE">节目下线</RadioButton>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="星探" {...formItemLayout}>
              {getFieldDecorator("sourceType")(
                <CustomSelect allowClear showSearch optionFilterProp="children" itemKey="Scout" placeholder="请选择星探"/>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12} offset={12} style={{ textAlign: 'right' }}>
            <Button type="primary" icon="search" size="large" htmlType="submit">搜索</Button>
          </Col>
        </Row>
      </Form>
    )
  }
)

// 审核主播申请弹框表单
class AuditApplyAnchorForm extends Component {
  state = {
    loading: false,
    disabled: false
  }
  handleAuditChange = (value) => {
    const disabled = value !== 'APPROVED';
    if(disabled !== this.state.disabled) {
      this.setState({ disabled })
    }
  }
  componentWillReceiveProps(nextProps) {
    if(this.state.disabled) {
      this.setState({ disabled : false })
    }
  }
  handleSave = () => {
    this.props.form.validateFields((errors, values) => {
      if(!!errors) return;
      const ok = values['examineResult'] === 'APPROVED';
      webUtils.confirm(()=>{
        this.setState({ loading: true });
        AnchorService.auditApplyAnchor(values).then(result => {
          webUtils.alertSuccess(ok ? "审核成功" : "拒绝申请成功");
          this.props.onClose(true)
          this.setState({ loading: false });
        }).catch(()=>{ this.setState({ loading: false }) });
      }, ok ? "确定通过审核吗?" : "确定拒绝申请吗?")

    });
  }
  render() {
    const {loading, disabled} = this.state;
    const { visible, form, onClose, record } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <Modal
        visible={visible}
        title={`审核 [${record['nickname']}] 主播申请`}
        onOk={this.handleSave}
        onCancel={() => onClose()}
        confirmLoading={loading}
        okText="提交"
        cancelText="取消">
        <Form>
          {getFieldDecorator("anchorId")(<Input type="hidden"/>)}
          {getFieldDecorator("doneCode")(<Input type="hidden"/>)}
          <FormItem label="审批结果" {...formItemLayout}>
            {getFieldDecorator("examineResult", {
              rules: [{ required: true, message: '请选择审批结果'}],
              initialValue: 'APPROVED',
              onChange: this.handleAuditChange
            })(
              <Select>
                <Option value="APPROVED">通过</Option>
                <Option value="REJECTED">不通过</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="审批意见" {...formItemLayout}>
            {getFieldDecorator("examineOpinion")(
              <Input type="textarea" autosize={{ minRows: 3, maxRows: 5 }} placeholder="审批意见" />
            )}
          </FormItem>
          <FormItem label="归属" {...formItemLayout}>
            {getFieldDecorator("programBelong")(
              <CustomSelect allowClear showSearch optionFilterProp="children" itemKey="ProgramBelong" placeholder="归属" disabled={disabled}/>
            )}
          </FormItem>
          <FormItem label="星探" {...formItemLayout}>
            {getFieldDecorator("scoutOptr")(
              <CustomSelect itemKey="Scout" placeholder="星探" disabled={disabled}/>
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
AuditApplyAnchorForm = Form.create({
  mapPropsToFields(props){
    return props.visible ? {
      anchorId:{ value: props.record['userId']},
      doneCode:{ value: props.record['doneCode']}
    } : {}
  }
})(AuditApplyAnchorForm);

// 更换主播头像、节目封面照，修改归属、星探
class ModifyAnchorForm extends Component {
  state = {
    loading: false,
    managerList: [],
    listMinSal:[]
  }
  componentDidMount(){
    AnchorService.queryUserByType().then(result => {
      this.setState({ managerList: result })
    })
    AnchorService.listMinSalary().then(result => {
      this.setState({ listMinSal: result })
    })
  }
  handleSave = () => {
    this.props.form.validateFields((errors, values) => {
      if(!!errors) return;
      if(values['isExclusive'] === 'T' && !values["exclusiveTime"]){
        webUtils.alertFailure("签约主播必须选择签约日期")
        return;
      }

      if(values['isExclusive'] === 'F'){
        values["exclusiveTime"] = null
      } else {
        values["exclusiveTime"] && (values["exclusiveTime"] = values["exclusiveTime"].valueOf())
      }
			let minSalaryDate = DateUtil.formatDate(values['minSalaryDate']);
      let minSalary = values['minSalary'];
      if(minSalary && minSalary > 0){//有保底工资
        if(!minSalaryDate || minSalaryDate.toString().trim().length ==0){
          webUtils.alertFailure("有保底工资的主播必须选择保底工资开始日期")
				  return;
				}
      }else{//如果没有保底工资，保底开始时间也给置空
				minSalaryDate = null
      }
			values["minSalaryDate"] = minSalaryDate;
      webUtils.confirm(()=>{
        this.setState({ loading: true });
        AnchorService.modifyAnchor(values).then(result => {
          webUtils.alertSuccess("修改主播信息成功");
          this.props.onClose(true);
          this.setState({ loading: false });
        }).catch(()=>{ this.setState({ loading: false }) });
      }, "确定修改主播信息吗?")

    });
  }
  handleExclusiveChange = (value) => {
    this.props.form.setFieldsValue({
      exclusiveTime:  value === 'T' ? moment(new Date(), FORMAT_PATTERNS.YMD) : undefined
    })
  }
  onMinSalaryChange=(minSalary)=>{
		// rules: [{required: true, message: "请上传主播封面"}],
		let minSalaryRequired = !!minSalary && minSalary >0;
		console.log( '新的值', minSalary ,minSalaryRequired );
    this.props.form.setFieldsValue({
      minSalaryDate:  minSalaryRequired ? moment(new Date(), FORMAT_PATTERNS.YMD) : undefined
    })
    this.setState({
			minSalaryRequired
    })
  }
  render() {
    const {loading, managerList,listMinSal,minSalaryRequired} = this.state;
    const {visible, form, onClose, record} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14},
    };
    return (
      <Modal
        visible={visible}
        width={680}
        title={`修改 [${record['nickname']}] 主播信息`}
        onOk={this.handleSave}
        onCancel={() => onClose()}
        confirmLoading={loading}
        okText="提交"
        cancelText="取消">
        <Form>
          {getFieldDecorator("userId")(<Input type="hidden"/>)}
          {getFieldDecorator("programId")(<Input type="hidden"/>)}
          {getFieldDecorator("bankId")(<Input type="hidden"/>)}
          <Row>
            <Col sm={12}>
              <FormItem label="姓名" {...formItemLayout}>
                {getFieldDecorator("accountName", {
                  rules: [{required: true, message: "请输入姓名"}]
                })(
                  <Input placeholder="姓名"/>
                )}
              </FormItem>
              <FormItem label="手机号码" {...formItemLayout}>
                {getFieldDecorator("mobile", {
                  rules:[{required: true, message: "请输入手机号码"}, {validator: validateUtils.checkMobile}]
                })(<Input placeholder="手机号码" />)}
              </FormItem>
              <FormItem label="银行名称" {...formItemLayout}>
                {getFieldDecorator("bankCode")(<CustomSelect placeholder="请选择银行" itemKey="BankCode"/>)}
              </FormItem>
              <FormItem label="支行名称" {...formItemLayout}>
                {getFieldDecorator("branchName")(<Input placeholder="支行名称"/>)}
              </FormItem>
              <FormItem label="支行省份" {...formItemLayout}>
                {getFieldDecorator("branchProvince")(<Input placeholder="支行省份"/>)}
              </FormItem>
              <FormItem label="支付宝账号" {...formItemLayout}>
                {getFieldDecorator("alipayAccount")(<Input placeholder="支付宝账号"/>)}
              </FormItem>
              <FormItem label="归属" {...formItemLayout}>
                {getFieldDecorator("programBelong")(
                  <CustomSelect itemKey="ProgramBelong" placeholder="归属"/>
                )}
              </FormItem>
              <FormItem label="归属运管" {...formItemLayout}>
                {getFieldDecorator("tutorUserId")(
                  <Select disabled dropdownMatchSelectWidth={false} placeholder="请选择运管">
                    {
                      managerList.map(user => (
                        <Option key={String(user.userId)}>{user.nickname}({user.userId})</Option>
                      ))
                    }
                  </Select>
                )}
              </FormItem>
              <FormItem label="是否独家" {...formItemLayout}>
                {getFieldDecorator("isExclusive",{
                  initialValue: 'F'
                })(
                  <Select onChange={this.handleExclusiveChange}>
                    <Option value="T">是</Option>
                    <Option value="F">否</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label="QQ" {...formItemLayout}>
                {getFieldDecorator("qq", {
                  rules:[{required: true, validator: validateUtils.checkQQ, message: '请输入正确QQ号'}]
                  // ,initialValue: '42154'
                })(<Input placeholder="QQ" />)}
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label="昵称" {...formItemLayout}>
                {getFieldDecorator("nickname", {
                  rules: [{required: true, message: "请输入昵称"}]
                })(
                  <Input placeholder="昵称"/>
                )}
              </FormItem>
              <FormItem label="身份证号" {...formItemLayout}>
                {getFieldDecorator("certNum", {
                  rules:[{required: true, message: "请输入身份证号"}, {validator: validateUtils.checkCertNum}]
                })(<Input placeholder="身份证号" />)}
              </FormItem>
              <FormItem label="银行账号" {...formItemLayout}>
                {getFieldDecorator("bankAccount", {
                  rules: [{validator: validateUtils.checkBankCardNum}]
                })(<Input placeholder="银行账号"/>)}
              </FormItem>
              <FormItem label="银行联号" {...formItemLayout}>
                {getFieldDecorator("bankLineNum")(<Input placeholder="银行联号"/>)}
              </FormItem>
              <FormItem label="支行城市" {...formItemLayout}>
                {getFieldDecorator("branchCity")(<Input placeholder="支行城市"/>)}
              </FormItem>
              <FormItem label="星探" {...formItemLayout}>
                {getFieldDecorator("scoutOptr")(
                  <CustomSelect itemKey="Scout" placeholder="星探"/>
                )}
              </FormItem>
              <FormItem label="官方评分" {...formItemLayout}>
                {getFieldDecorator("officalScore")(
                  <InputNumber min={0} max={100} formatter={value => `${value}分`}
                               parser={value => value.replace('分', '')} style={{width: '100%'}}/>
                )}
              </FormItem>
              <FormItem label="保底工资" {...formItemLayout}>
                {getFieldDecorator("minSalary")(
                  <Select allowClear onChange={this.onMinSalaryChange.bind(this)}  placeholder="请选择保底工资">
                  {
                    listMinSal.map(item => (
                      <Option key={item.salary}>{item.salary}</Option>
                    ))
                  }
                  </Select>
                )}
              </FormItem>
              <FormItem label="保底时间" {...formItemLayout}>
                {getFieldDecorator("minSalaryDate", {
									rules:[{required: minSalaryRequired,message:'请选择保底开始时间'}]
								})(
                  <DatePicker placeholder="请选择保底时间"/>
                )}
              </FormItem>
              <FormItem label="签约时间" {...formItemLayout}>
                {getFieldDecorator("exclusiveTime")(
                  <DatePicker placeholder="请选择签约时间"/>
                )}
              </FormItem>
              <FormItem label="微信号" {...formItemLayout}>
                {getFieldDecorator("weixin", {
                })(<Input placeholder="微信号" />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col sm={12}>
              <FormItem label="封面" {...formItemLayout}>
                {getFieldDecorator("coverId", {
                  rules: [{required: true, message: "请上传主播封面"}],
                  valuePropName: 'fileList',
                })(<ImageUpload uploadFolderName={webUtils.getUploadFolderName("ProgramPic")}
                                uploadButtonText="上传封面"/>)}
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label="头像" {...formItemLayout}>
                {getFieldDecorator("picId", {
                  rules: [{required: true, message: "请上传主播头像"}],
                  valuePropName: 'fileList',
                })(<ImageUpload uploadFolderName={webUtils.getUploadFolderName("HeadingPic")}
                                uploadButtonText="上传头像"/>)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}
ModifyAnchorForm = Form.create({
  mapPropsToFields(props){
    if(props.visible && props.record['userId']){
      const record = props.record;
      if(record['isExclusive'] === 'T' && record['exclusiveTime']){
        record['exclusiveTime'] = moment(record['exclusiveTime'], FORMAT_PATTERNS.YMD)
      } else {
        record['exclusiveTime'] = null;
      }
      if(record["minSalaryDate"]){
        record['minSalaryDate'] = moment(record['minSalaryDate'], FORMAT_PATTERNS.YMD)
      }
      if(record["tutorUserId"]){
        record["tutorUserId"] = String(record["tutorUserId"])
      }
      return commonUtils.recordToValueJson(record)
    }
    return {}
  }
})(ModifyAnchorForm);

// 修改主播密码
class ModifyPwdForm extends Component {
  state = {
    loading: false,
    passwordDirty: false
  }
  handlePasswordBlur = (e) => {
    const value = e.target.value;
    this.setState({ passwordDirty: this.state.passwordDirty || !!value });
  }
  checkPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('newPwd')) {
      callback('您输入的两次密码不一致！');
    } else {
      callback();
    }
  }
  checkConfirm = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.passwordDirty) {
      form.validateFields(['rePasswd'], { force: true });
    }
    callback();
  }
  componentWillReceiveProps(nextProps) {
    if(this.state.passwordDirty) {
      this.setState({ passwordDirty : false })
    }
  }
  handleSave = () => {
    this.props.form.validateFields((errors, values) => {
      if (!!errors) return;
      webUtils.confirm(()=>{
        this.setState({ loading: true });
        AnchorService.modifyAnchorPwd(values['userId'], values['newPwd']).then(result => {
          webUtils.alertSuccess("修改主播密码成功");
          this.props.onClose(true)
          this.setState({ loading: false });
        }).catch(()=>{ this.setState({ loading: false }) });
      }, "确定修改主播密码吗？")
    });
  }
  render() {
    const {loading} = this.state;
    const { visible, form, onClose, record } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <Modal
        visible={visible}
        title={`修改 [${record['nickname']}] 主播密码`}
        onOk={this.handleSave}
        onCancel={() => onClose()}
        confirmLoading={loading}
        okText="提交"
        cancelText="取消">
        <Form>
          {getFieldDecorator("userId")(<Input type="hidden"/>)}
          <FormItem label="新密码" {...formItemLayout} hasFeedback>
            {getFieldDecorator("newPwd", {
              rules: [{
                required: true, message: '请输入新密码'
              }, {
                validator: this.checkConfirm,
              }],
            })(
              <Input type="password" onBlur={this.handlePasswordBlur} />
            )}
          </FormItem>
          <FormItem label="确认新密码" {...formItemLayout} hasFeedback>
            {getFieldDecorator('rePasswd', {
              rules: [{
                required: true, message: '请确认您的密码'
              }, {
                validator: this.checkPassword,
              }]
            })(
              <Input type="password" />
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
ModifyPwdForm = Form.create({
  mapPropsToFields(props){
    return props.visible ? {
      userId: {value: props.record['userId']}
    } : {}
  }
})(ModifyPwdForm);

// 给主播打标签
class MarkAnchorTagForm extends Component {
  state = {
    tagList: [],
    loading: false,
  }
  // 给主播打标签
  handleSave = () => {
    this.props.form.validateFields((errors, values) => {
      if(!!errors) return;
      webUtils.confirm(()=>{
        this.setState({ loading: true });
        AnchorService.markAnchorTag(values).then(result => {
          webUtils.alertSuccess("给主播打标签成功");
          this.props.onClose(true);
          this.setState({ loading: false })
        });
      }, "确定给主播打标签吗？")
    });
  }
  componentDidMount() {
    AnchorService.queryTagByType().then(tagList => {
      this.setState({ tagList })
    })
  }
  render() {
    const {tagList, loading} = this.state;
    const { visible, form, onClose, record } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return <Modal
      visible={visible}
      title={`给 [${record['nickname']}] 主播打标签`}
      onOk={this.handleSave}
      onCancel={() => onClose()}
      confirmLoading={loading}
      okText="提交"
      cancelText="取消">
      <Form>
        {getFieldDecorator("programId")(<Input type="hidden"/>)}
        <FormItem label="标签" {...formItemLayout}>
          {getFieldDecorator("tagIds")(
            <Select mode="multiple" showSearch optionFilterProp="children" placeholder="请选择标签">
              {
                tagList.map(tag => (
                  <Option key={tag.tagId} value={tag.tagId.toString()}>{tag.tagName}</Option>
                ))
              }
            </Select>
          )}
        </FormItem>
      </Form>
    </Modal>
  }
}
MarkAnchorTagForm = Form.create({
  mapPropsToFields(props){
    return props.visible ? {
      programId: {value: props.record['programId']},
      tagIds: {value: props.record['tagIds'] ? props.record['tagIds'].split(",") : []}
    } : {}
  }
})(MarkAnchorTagForm);

export default class AnchorManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //审核
      auditVisible: false,
      // 修改主播信息
      anchorVisible: false,
      // 修改密码信息
      pwdVisible: false,
      // 打标签信息
      tagVisible: false,
      // 直播记录
      livingVisible:false,
      // 当前点击行数据
      record: {},
    }
    this.handleSearch = this.handleSearch.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }
  __getColumns() {
    return [
      {title: '用户ID',   dataIndex: 'userId', width: 90, fixed: 'left'},
      {title: '房间ID',   dataIndex: 'programId', width: 75, fixed: 'left'},
      {title: '姓名',   dataIndex: 'accountName', width: 80, fixed: 'left'},
      {title: '昵称',      dataIndex: 'nickname', width: 130, fixed: 'left'},
      {title: '身份证号',   dataIndex: 'certNum'},
      {title: '类型',       dataIndex: 'userTypeText', width: 70, render: (text, record) => {
        if(record['userType'] === 'VIEWER') {
          return <Tag color="#2db7f5">{text}</Tag>
        } else if(record['userType'] === 'ANCHOR') {
          return <Tag color="#87d068">{text}</Tag>
        }
        return null;
      }},
      {title: '手机号',     dataIndex: 'mobile', width: 110},
      {title: '归属',     dataIndex: 'programBelongText', width: 95},
      {title: '星探',     dataIndex: 'scoutOptrText', width: 85},
      {title: '节目状态',     dataIndex: 'programStatus', width: 75, render: (text) => {
        if(text === 'ONLINE') return <Tag color="#87d068">正常</Tag>
        else if(text === 'OFFLINE') return <Tag color="#f50">已下线</Tag>
        return null;
      }},
      {title: '标签', dataIndex: 'tagNames', width: 120, render: (text) => {
        if(!text) return null;
        return text.split(",").map((tagName,idx) => (
          <Tag key={idx} color="pink-inverse">{tagName}</Tag>
        ))
      }},
      {title: '运营号数量',     dataIndex: 'operationCount', width: 80},
      {title: '归属运管',     dataIndex: 'tutorNickname', width: 100},
      {title: '是否签约',     dataIndex: 'isExclusive', width: 70, render: (text) => {
        if(text === 'T') {
          return <Tag color="#87d068">是</Tag>
        }
        return <Tag color="#f50">否</Tag>
      }},
      {title: '签约时间',     dataIndex: 'exclusiveTime', width: 135},
      {title: '保底工资',     dataIndex: 'minSalary', width: 70},
      {title: '保底开始时间',     dataIndex: 'minSalaryDate', width: 100},
      {title: '官方评分',     dataIndex: 'officalScore', width: 70},
      {title: '创建时间',   dataIndex: 'createTime', width: 135},
      {title: '头像',      dataIndex: 'picId', width: 70, className: "padding0", render: (text) => commonUtils.fullPictureUrl(text, 55, 55)},
      {title: '背景',       dataIndex: 'coverId', width: 80, className: "padding0", render: (text) => commonUtils.fullPictureUrl(text, 73.33, 55)},
      {title: '操作', dataIndex:'goodsId', fixed: 'right', width: 100, render: (text, record) => this.__renderOperationBtns(record)}
    ]
  }
  __renderOperationBtns(record){
    if(!record['programId']) return <a href="javascript:void(0)" onClick={this.showAuditAnchor.bind(this, record)}>审核</a>
    const menu = (
      <Menu onClick={this.handleMenuClick.bind(this, record)}>
        <MenuItem key="pwd">修改密码</MenuItem>
        <MenuItem key="anchor">修改主播</MenuItem>
        {record['programStatus'] === 'ONLINE' ? <MenuItem key="offline">节目下线</MenuItem> : <MenuItem key="online">节目上线</MenuItem>}
        <MenuItem key="tag">打标签</MenuItem>
        <MenuItem key="living">开播记录</MenuItem>
      </Menu>
    );
    return <Dropdown overlay={menu}>
      <Button ghost type="primary">
        操作 <Icon type="down" />
      </Button>
    </Dropdown>
  }
  // 搜索
  handleSearch(e) {
    e.preventDefault();
    this.customTable.queryTableData(this.anchorSearchForm.getFieldsValue());
  }
  handleMenuClick(record, e){
    const key = e.key;
    switch (key){
      case "pwd":
        this.showModifyPwd(record);
        break;
      case "anchor":
        this.showModifyAnchor(record);
        break;
      case "offline":
        this.offline(record);
        break;
      case "online":
        this.online(record);
        break;
      case "tag":
        this.showAnchorTag(record);
        break;
      case "living":
        this.showLivingRecord(record);
        break;
    }
  }
  // 显示审核申请主播弹框
  showAuditAnchor(record) {
    this.setState({ auditVisible: true, record })
  }
  // 显示修改头像 和封面弹框
  showModifyAnchor(record) {
    this.setState({ anchorVisible: true, record });
  }
  // 显示 修改主播密码 弹框
  showModifyPwd(record) {
    this.setState({ pwdVisible: true, record });
  }
  // 显示 给主播打标签 弹框
  showAnchorTag(record) {
    let tagIds = record['tagIds'];
    if(!!tagIds) {
      tagIds = tagIds.split(",")
    }
    this.setState({ tagVisible: true, record });
  }
  // 显示开播记录弹框
  showLivingRecord(record){
    this.setState({ livingVisible: true, record });
  }
  // 主播上线
  online(record) {
    webUtils.confirm(function(){
      AnchorService.modifyProgramStatus(record['programId'], "ONLINE").then(result => {
        webUtils.alertSuccess("主播节目上线成功");
        this.customTable.refreshTable();
      })
    }.bind(this), `确定上线 [${record['nickname']}] 主播节目吗?`)
  }
  // 主播下线
  offline(record) {
    webUtils.confirm(function(){
      AnchorService.modifyProgramStatus(record['programId'], "OFFLINE").then(result => {
        webUtils.alertSuccess("主播节目下线成功");
        this.customTable.refreshTable();
      })
    }.bind(this), `确定下线 [${record['nickname']}] 主播节目吗?`)
  }
  handleClose(isRefresh=false){
    isRefresh && this.customTable.refreshTable();
    this.setState({
      auditVisible: false,
      anchorVisible: false,
      pwdVisible: false,
      tagVisible: false,
      livingVisible: false,
    });

  }
  componentWillUnMount() {
    this.btnResList = null;
    delete this.btnResList;
  }
  componentDidMount() {
    // 从主播录入跳转过来带 主播姓名参数，查询出这条记录
    const state = this.props.location.state
    if(!state) return
    const accountName = state.accountName;
    accountName && this.customTable.queryTableData({accountName});
  }
  render() {
    const { auditVisible, anchorVisible, pwdVisible, tagVisible, livingVisible, record } = this.state;
    return (
      <div>
        <AnchorSearchForm ref={(form) => { this.anchorSearchForm = form }} onSearch={this.handleSearch}/>
        <CustomTable ref={table => this.customTable=table} rowKey="userId" columns={this.__getColumns()}
                     fetchTableDataMethod={AnchorService.queryAnchorList} scroll={{x: 2270}}/>
        <AuditApplyAnchorForm visible={auditVisible} record={record} onClose={this.handleClose}/>
        <ModifyAnchorForm visible={anchorVisible} record={record} onClose={this.handleClose}/>
        <ModifyPwdForm visible={pwdVisible} record={record} onClose={this.handleClose}/>
        <MarkAnchorTagForm visible={tagVisible} record={record} onClose={this.handleClose} />
        <LivingRecordModal visible={livingVisible} record={record} onClose={this.handleClose} />
      </div>
    );
 }
}
