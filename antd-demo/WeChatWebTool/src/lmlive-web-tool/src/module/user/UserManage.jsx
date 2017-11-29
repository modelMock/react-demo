import React, {Component} from 'react';
import {Form, Row, Col, Input, Select, Tag, Table, Modal, DatePicker, Button} from 'antd';
import CustomTable from '../../commons/widgets/CustomTable';
import CustomSelect from '../../commons/widgets/CustomSelect'
import UserService from '../../service/UserService';
import ConfigService from '../../service/ConfigService';
import webUtils from '../../commons/utils/webUtils';
const FormItem = Form.Item;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;

// 萌豆转元
const transferMoneyForCoin = (count) => <Tag color="purple">{count ? count/1000 : 0}元</Tag>
// 分转元
const transferMoneyForFee = (count) => <Tag color="purple">{count ? count/100 : 0}元</Tag>

// 搜索表单
const UserSearchForm = Form.create()(
  (props) => {
    const {form, onSearch, addUnionAcct} = props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    const __handleSearch = (e) => {
      e.preventDefault();
      onSearch(form.getFieldsValue())
    }
    return (
      <Form layout="horizontal" onSubmit={ __handleSearch } className="ant-advanced-search-form">
        <Row>
          <Col sm={8}>
            <FormItem label="用户ID" {...formItemLayout}>
              {getFieldDecorator("userId")(<Input placeholder="请输入用户ID" />)}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="时间" {...formItemLayout}>
              {getFieldDecorator("queryDate")(
                <RangePicker format="YYYY-MM-DD" allowClear={false} showTime={false} />
              )}
            </FormItem>
          </Col>
          <Col sm={8} style={{ textAlign: 'right' }}>
            <Button type="primary" icon="search" size="large" htmlType="submit">搜索</Button>
            <Button type="ghost" icon="plus" size="large" onClick={addUnionAcct}>开通公会账号</Button>
          </Col>
        </Row>
      </Form>
    )
  }
)

// 用户状态修改
class StatusForm extends Component {
  state = {
    loading: false
  }
  handleSave = ()=> {
    const {form, status} = this.props;
    const isDisabled = status === 'DISABLED'
    form.validateFields((err, values) => {
      if(err) return;
      webUtils.confirm(()=>{
        this.setState({ loading: true });
        if(isDisabled) {
          UserService.disabledUser(values).then(result => {
            this.props.onClose(true);
            this.setState({ loading: false })
          })
        } else {
          UserService.enabledUser(values).then(result => {
            this.props.onClose(true);
            this.setState({ loading: false })
          })
        }
      }, isDisabled ? "确定封禁该用户吗？" : "确定解封该用户吗？");
    });
  }
  handleCancel = ()=> {
    this.props.onClose();
  }
  render(){
    const {loading} = this.state;
    const {form, visible, status} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 18},
    }
    return (
      <Modal visible={visible}
             confirmLoading={loading}
             title={status === 'DISABLED' ? "封禁" : "解封"}
             okText="提交"
             cancelText="取消"
             onOk={this.handleSave}
             onCancel={this.handleCancel}>
        <Form>
          {getFieldDecorator("userId")(<Input type="hidden"/>)}
          <FormItem label={status === 'DISABLED' ? "封禁原因" : "解封原因"} {...formItemLayout}>
            {getFieldDecorator("remark",{
              rules: [{
                required: true, message: '请输入原因'
              }]
            })(
              <Input type="textarea" rows={5} />
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
StatusForm = Form.create({
  mapPropsToFields(props){
    return {
      userId: {
        value: props.userId
      }
    }
  }
})(StatusForm);

// 充值记录弹框
class RechargeModal extends Component {
  __getColumns = () => {
    return [
      {title: '流水号', dataIndex: 'transNo', width: 110},
      {title: '充值金额', dataIndex: 'rechargeCount', render: (text) => transferMoneyForFee(text)},
      {title: '充值前金额', dataIndex: 'oldCount', render: (text) => transferMoneyForCoin(text)},
      {title: '充值后金额', dataIndex: 'newCount', render: (text) => transferMoneyForCoin(text)},
      {title: '状态', dataIndex: 'status', render: (text) => {
        return text === 'SUCCESS' ? <Tag color="#87d068">成功</Tag> : <Tag color="#f50">未支付</Tag>
      }},
      {title: '充值时间', dataIndex: 'createTime', width: 135}
    ];
  }
  handleSubmit = (e) => {
    e.preventDefault();
    let values = this.props.form.getFieldsValue();
    const queryDate = values['queryDate'];
    if(queryDate && queryDate.length > 0) {
      values['startTime'] = queryDate[0].format('YYYY-MM-DD 00:00:00');
      queryDate[1] && (values['endTime'] = queryDate[1].format('YYYY-MM-DD 23:59:59'));
    }
    delete values['queryDate'];
    this.customTable.queryTableData(values);
  }
  componentWillReceiveProps(nextProps){
    // 不是同一个用户，清空表格数据
    if(this.props.userId && nextProps.visible && this.props.userId !== nextProps.userId){
      this.customTable.resetTable();
    }
  }
  render(){
    const {form, visible, onClose} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 18},
    }
    return (
      <Modal title="充值记录"
             visible={visible}
             onCancel={()=>onClose()}
             width={650}
             footer={null}>
        <Form layout="horizontal" onSubmit={this.handleSubmit} className="ant-advanced-search-form">
          {getFieldDecorator("userId")(<Input type="hidden" />)}
          <Row>
            <Col sm={14}>
              <FormItem label="充值时间" {...formItemLayout}>
                {getFieldDecorator('queryDate')(
                  <RangePicker format="YYYY-MM-DD" />
                )}
              </FormItem>
            </Col>
            <Col sm={10}>
              <FormItem label="状态" {...formItemLayout}>
                {getFieldDecorator('status', {
                  initialValue: "SUCCESS"
                })(
                  <Select>
                    <Option value="SUCCESS">成功</Option>
                    <Option value="UNPAY">未支付</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12} offset={12} style={{ textAlign: 'right' }}>
              <Button type="primary" icon="search" htmlType="submit">搜索</Button>
            </Col>
          </Row>
        </Form>
        <CustomTable ref={ table => this.customTable=table}
                     rowKey="transNo"
                     pageSize={8}
                     columns={this.__getColumns()}
                     fetchTableDataMethod={UserService.selectRechargeRecord}/>
      </Modal>
    )
  }
}
RechargeModal = Form.create({
  mapPropsToFields(props){
    return {
      userId: {
        value: props.userId
      }
    }
  }
})(RechargeModal);

// 送礼记录弹框
class SendGiftModal extends Component {
  state = {
    goodsList: []
  }
  __getColumns = () => {
    return [
      {title: '流水号', dataIndex: 'doneCode'},
      {title: '主播名', dataIndex: 'anchorName'},
      {title: '礼物名', dataIndex: 'goodsName'},
      {title: '数量', dataIndex: 'count', render: (text) => `${text}个`},
      {title: '金额', dataIndex: 'fee', render: (text) => transferMoneyForCoin(text)},
      {title: '分成', dataIndex: 'presentPoint', render: (text) => transferMoneyForCoin(text)},
      {title: '送礼时间', dataIndex: 'createTime'}
    ];
  }
  handleSubmit = (e) => {
    e.preventDefault();
    let values = this.props.form.getFieldsValue();
    const queryDate = values['queryDate'];
    if(queryDate && queryDate.length > 0) {
      values['startTime'] = queryDate[0].format('YYYY-MM-DD 00:00:00');
      queryDate[1] && (values['endTime'] = queryDate[1].format('YYYY-MM-DD 23:59:59'));
    }
    delete values['queryDate'];
    this.customTable.queryTableData(values);
  }
  componentWillReceiveProps(nextProps){
    // 不是同一个用户，清空表格数据
    if(this.props.userId && nextProps.visible && this.props.userId !== nextProps.userId){
      this.customTable.resetTable();
    }
  }
  componentDidMount(){
    ConfigService.queryGoodsByType("GUARD,GIFT,SERVICE").then(goodsList => {
      this.setState({ goodsList })
    })
  }
  render(){
    const {goodsList} = this.state;
    const {form, visible, onClose} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 18},
    }
    return (
      <Modal title="送礼记录"
             visible={visible}
             onCancel={()=>onClose()}
             width={700}
             footer={null}>
        <Form layout="horizontal" onSubmit={this.handleSubmit} className="ant-advanced-search-form">
          {getFieldDecorator("userId")(<Input type="hidden" />)}
          <Row>
            <Col sm={14}>
              <FormItem label="送礼时间" {...formItemLayout}>
                {getFieldDecorator('queryDate')(
                  <RangePicker format="YYYY-MM-DD" />
                )}
              </FormItem>
            </Col>
            <Col sm={10}>
              <FormItem label="礼物" {...formItemLayout}>
                {getFieldDecorator('goodsId')(
                  <Select showSearch allowClear placeholder="请选择礼物查询">
                    {
                      goodsList.map(goods => (
                        <Option key={goods.goodsId}>{goods.goodsName}</Option>
                      ))
                    }
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12} offset={12} style={{ textAlign: 'right' }}>
              <Button type="primary" icon="search" htmlType="submit">搜索</Button>
            </Col>
          </Row>
        </Form>
        <CustomTable ref={ table => this.customTable=table}
                     rowKey="doneCode"
                     pageSize={8}
                     columns={this.__getColumns()}
                     fetchTableDataMethod={UserService.selectSendGiftRecord}/>
      </Modal>
    )
  }
}
SendGiftModal = Form.create({
  mapPropsToFields(props){
    return {
      userId: {
        value: props.userId
      }
    }
  }
})(SendGiftModal);

// 开通公会账号弹框
class OpenUnionAcctModal extends Component {
  state = {
    unions: []
  }
  handleSave = () => {
    this.props.form.validateFields((err, values) => {
      if(!!err) return
      console.log(values)
      webUtils.confirm(()=> {
        UserService.openUnionAccount(values).then( result => {
          webUtils.alertSuccess("添加成功！");
          this.props.onClose(true)
        })
      }, "确认提交吗？")
    });
  }
  handleCancel = () => {
    this.props.form.resetFields();
    this.props.onClose( true );
  }
  render(){
    const {unions} = this.state;
    const {form, visible, userId} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 16},
    }
    return (
      <Modal title="开通公会账号"
             visible={visible}
             width={660}
             okText="提交"
             cancelText="取消"
             onOk={this.handleSave}
             onCancel={this.handleCancel}>
        <Form>
            <FormItem label="用户" {...formItemLayout}>
                {getFieldDecorator("userId",{
                  rules: [{ required: true, message: '请输入用户ID'}],
                })(<Input placeholder="请输入用户ID" />)}
            </FormItem>
            <FormItem label="搜索公会" {...formItemLayout}>
              {getFieldDecorator('programBelong',{
                rules: [{ required: true, message: '请选择公会'}],
              })(
                <CustomSelect allowClear showSearch optionFilterProp="children" itemKey="ProgramBelong" placeholder="请选择公会"/>
              )}
            </FormItem>
        </Form>
      </Modal>
    )
  }
}
OpenUnionAcctModal = Form.create()(OpenUnionAcctModal);

export default class UserManage extends Component {
  constructor(props){
    super(props)
    this.state = {
      dataSource: [],
      loading: false,

      // 操作用户id
      userId: null,
      // 封禁、解封显示控制
      statusVisible: false,
      // 状态：封禁、解封
      status: null,
      // 充值记录弹框
      rechargeVisible: false,
      // 送礼记录弹框
      sendGiftVisible: false,
      // 开通公会账号
      isAddUnionAcctShow: false
    }
    this.handleSearch = this.handleSearch.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleAddUnionAcct = this.handleAddUnionAcct.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.columns = [
      {title: 'ID', dataIndex: 'userId', width: 85},
      {title: '昵称', dataIndex: 'nickname', width: 120},
      {title: '状态', dataIndex: 'status', width: 75, render: (text) => {
        return text === 'ACTIVE' ? <Tag color="#87d068">正常</Tag> : <Tag color="#f50">禁用</Tag>
      }},
      {title: '封禁时间', dataIndex: 'forbiddenTime', width: 135},
      {title: '封禁原因', dataIndex: 'forbidenReason'},
      {title: '封禁人', dataIndex: 'optrName', width: 120},
      {title: '解封时间', dataIndex: 'cancelTime', width: 135},
      {title: '解封原因', dataIndex: 'cancelReason', width: 180},
      {title: '解封人', dataIndex: 'cancelOptrName', width: 120}
    ];
  }
  __getColumns(){
    return [
      {title: 'ID', dataIndex: 'userId', width: 85},
      {title: '昵称', dataIndex: 'nickname', width: 120},
      {title: '归属', dataIndex: 'programBelongText', width: 100},
      {title: '状态', dataIndex: 'status', width: 85, render: (text) => {
        return text === 'ACTIVE' ? <Tag color="#87d068">正常</Tag> : <Tag color="#f50">禁用</Tag>
      }},
      {title: '注册时间', dataIndex: 'createTime', width: 135},
      {title: '最后登录', dataIndex: 'lastLoginTime', width: 135},
      {title: '最后充值', dataIndex: 'lastRechargeTime', width: 135},
      {title: '余额', dataIndex: 'coinCount', width: 60, render: (text) => transferMoneyForCoin(text)},
      {title: '消费总金额', dataIndex: 'historyCoinCount', width: 80, render: (text) => transferMoneyForCoin(text)},
      {title: '用户等级', dataIndex: 'userLevel', width: 65, render: (text) => <Tag color="green">{text}级</Tag>},
      {title: '用户经验', dataIndex: 'userExp', width: 100},
      {title: '用户升级经验', dataIndex: 'sjUserExp', width: 100, render: (text) => {
        if(text === 0) return "已升至顶级";
        return text;
      }},
      {title: '贵族等级', dataIndex: 'royalLevel', width: 70, render: (text) => <Tag color="green">{text}级</Tag>},
      {title: '贵族消费金额', dataIndex: 'royalExp', width: 100, render: (text) => <Tag color="orange-inverse">{text}元</Tag>},
      {title: '贵族升级需金额', dataIndex: 'sjRoyalExp', width: 110, render: (text) => {
        if(text === 0) return "已升至顶级"
        return <Tag color="orange-inverse">{text}元</Tag>
      }},
      {title: '封禁原因', dataIndex: 'reason'},
      {title: '操作', fixed: 'right', width: 180, render:(text, record) => {
        const userId = record['userId'];
        return (
          <span>
            {record['status'] === 'ACTIVE'
              ? <a href="javascript:void(0)" onClick={this.disabledUser.bind(this, userId)}>封禁</a>
              : <a href="javascript:void(0)" onClick={this.enabledUser.bind(this, userId)}>解封</a>}
            <span className="ant-divider" />
            <a href="javascript:void(0)" onClick={this.showRechargeModal.bind(this, userId)}>充值记录</a>
            <span className="ant-divider" />
            <a href="javascript:void(0)" onClick={this.showSendGiftModal.bind(this, userId)}>送礼记录</a>
          </span>
        )
      }},
    ];
  }
  // 解封
  enabledUser(userId){
    this.setState({
      userId,
      statusVisible: true,
      status: 'ACTIVE'
    })
  }
  // 封禁
  disabledUser(userId){
    this.setState({
      userId,
      statusVisible: true,
      status: 'DISABLED'
    })
  }
  // 显示 充值记录 弹框
  showRechargeModal(userId){
    this.setState({ userId, rechargeVisible: true })
  }
  // 显示 送礼记录 弹框
  showSendGiftModal(userId){
    this.setState({ userId, sendGiftVisible: true })
  }
  __searchTableData(userId) {
    this.setState({ loading: true });
    UserService.queryUserByUserId(userId).then(user => {
      this.setState({
        dataSource: !!user ? [user] : [],
        loading: false
      })
    })
  }
  __searchFobiddenRecord(values){
    const queryDate = values['queryDate'];
    if(queryDate && queryDate.length > 0) {
      values['startTime'] = queryDate[0].format('YYYY-MM-DD 00:00:00');
      queryDate[1] && (values['endTime'] = queryDate[1].format('YYYY-MM-DD 23:59:59'));
    }
    delete values['queryDate'];
    this.customTable.queryTableData(values);
  }
  handleSearch(values){
    this.params = values;
    if(values["userId"]){
      this.__searchTableData(values["userId"]);
    } else {
      this.setState({ dataSource: [] })
    }

    this.__searchFobiddenRecord(values)
  }
  handleClose(isRefresh=false){
    if(isRefresh){
      this.__searchTableData(this.params["userId"]);
      this.__searchFobiddenRecord(this.params)
    }
    this.setState({
      statusVisible: false,
      status: null,
      rechargeVisible: false,
      sendGiftVisible: false,
      loading: false,
      isAddUnionAcctShow: false
    })
  }
  handleCancel(){
    this.setState({
      isAddUnionAcctShow: false
    })
  }
  handleAddUnionAcct(){
    this.setState({
      isAddUnionAcctShow: true
    })
  }
  render(){
    const {dataSource, loading, statusVisible, status, userId, rechargeVisible, sendGiftVisible, isAddUnionAcctShow} = this.state;
    return (
      <div>
        <UserSearchForm  onSearch={this.handleSearch} addUnionAcct={this.handleAddUnionAcct}/>
        <Table rowKey="userId" bordered
               columns={this.__getColumns()}
               loading={loading}
               dataSource={dataSource}
               scroll={{x: 1865}} style={{marginTop: 16}} />
        <CustomTable ref={ table => this.customTable=table}
                     rowKey="doneCode"
                     columns={this.columns}
                     scroll={{x: 1200}}
                     fetchTableDataMethod={UserService.selectForbidenRecord}/>
        <StatusForm visible={statusVisible} status={status} userId={userId} onClose={this.handleClose}/>
        <RechargeModal visible={rechargeVisible} userId={userId} onClose={this.handleClose} />
        <SendGiftModal visible={sendGiftVisible} userId={userId} onClose={this.handleClose} />
        <OpenUnionAcctModal visible={isAddUnionAcctShow} userId={userId} onClose={this.handleCancel}/>
      </div>
    )
  }
}