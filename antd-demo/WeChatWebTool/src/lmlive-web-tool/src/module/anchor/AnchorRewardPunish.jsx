/**
 *主播奖惩记录
 * @author 谭亮红
 */
import React, {Component} from 'react';
import {Form, Row, Col, Input, Button, Select, DatePicker, Modal, InputNumber, Icon} from 'antd';
import CustomTable from '../../commons/widgets/CustomTable';
import moment from 'moment';
import CustomSelect from '../../commons/widgets/CustomSelect';
import AnchorService from '../../service/AnchorService';
import {DateUtil, FORMAT_PATTERNS} from '../../commons/utils/DateUtil';
import FixedDateRangeCmp from '../salary/FixedDateRangeCmp'
import webUtils from '../../commons/utils/webUtils';
import commonUtils from '../../commons/utils/commonUtils';
import UnionService from '../../service/UnionService';

const FormItem = Form.Item;
const {Option} = Select;
const {TextArea} = Input;
const {RangePicker} = DatePicker;

//搜索表单
class AnchorRewardPunishForm extends FixedDateRangeCmp {
  constructor(props) {
    super(props)
    this.state = {
      beforeDay: this.fifteenDaysAgo,
      anchorList: [],
      btnStyle: true,
      uninOperationList: []
    }
    this.btnResList = props.btnResList
    // 是否有创建暂扣的权限
    this.hasAuthorityToCreateDetain = this.btnResList.includes('createDetain');
    // 是否有创建惩罚的权限
    this.hasAuthorityToCreatePunish = this.btnResList.includes('createPunish');
    // 是否有创建奖励的权限
    this.hasAuthorityToCreateReward = this.btnResList.includes('createReward');
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    AnchorService.queryUserByType().then(result => {
      this.setState({uninOperationList: result})
    })
  }

  getExtraFormValues() {
    return {target: 'ANCHOR'};
  }

//搜索
  handleSubmit(e) {
    e.preventDefault();
    let value = this.extractedFormValue()
    this.props.onSearch(value);
  }

  getDateRangeFieldNames() {
    return ['startTime', 'endTime']
  }

  onGuildChanges = (guildId) => {//不放缓存了,如果将来数据超级大，会有问题。
    if(guildId){
      UnionService.queryMember({
        guildId,
        limit: 99999
      }).then(data => this.setState({anchorList: data.records || []}))
    }else{
      this.setState({anchorList: []})//没有选择公会也把可选的主播给置空
    }
    this.props.form.resetFields(["anchorUserId"])  //此时时间范围已经被重置了,获取表单的参数的时候不会出问题
  }

  render() {
    const {form, onAddSuspensionEvent, onAddPunishmentEvent, onAddRewardEvent, handleReset, guildCode} = this.props;
    const {getFieldDecorator} = form;
    let colStyle = {height: "58px"}
    const {beforeDay, anchorList, uninOperationList} = this.state;
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit} className="ant-advanced-search-form">
        <Row>
          <Col sm={8} style={colStyle}>
            <FormItem label="创建时间" {...formItemLayout}>
              {getFieldDecorator("data", {initialValue: [beforeDay, DateUtil.nowAsYmd()]})(
                <RangePicker format={FORMAT_PATTERNS.YMD}></RangePicker>
              )}
              <span style={{color: this.firstRangeButtonType, fontSize: "14px", cursor: 'pointer'}}
                    onClick={this.queryWithFixedRange.bind(this, this.fifteenDaysAgo)}>最近15日</span>
              <span style={{color: this.secondRangeButtonType, fontSize: "14px", marginLeft: "8px", cursor: 'pointer'}}
                    onClick={this.queryWithFixedRange.bind(this, this.thirtyDayAgo)}>最近30日</span>
            </FormItem>
          </Col>

          <Col sm={8} style={colStyle}>
            <FormItem label="公会ID" {...formItemLayout}>
              {getFieldDecorator("guildId")(
                <Select placeholder="请选择公会ID"
                        optionFilterProp="children"
                        allowClear onChange={this.onGuildChanges.bind(this)}
                        showSearch>
                  {
                    guildCode.map(item => (
                      <Option key={item.guildId}>{item.guildName}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8} style={colStyle}>
            <FormItem label="主播ID" {...formItemLayout}>
              {getFieldDecorator("anchorUserId")(<Input placeholder="请输入主播ID"/>)}
            </FormItem>
          </Col>
          <Col sm={8} style={colStyle}>
            <FormItem label="奖惩编号" {...formItemLayout}>
              {getFieldDecorator("recordId")(<Input placeholder="请输入奖惩编号"/>)}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="奖惩类型" {...formItemLayout}>
              {getFieldDecorator("sanctionType")(
                <Select placeholder="请选择奖惩类型">
                  <Option value={null}>全部</Option>
                  <Option value="REWARD">奖励</Option>
                  <Option value="PUNISH">惩罚</Option>
                  <Option value="VJKB">暂扣</Option>
                  <Option value="DE_VJKB">暂扣解冻</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8} style={colStyle}>
            <FormItem label="创建人" {...formItemLayout}>
              {getFieldDecorator("createUserId")(
                <Select placeholder="请选择创建人" allowClear>
                  {
                    uninOperationList.map(({userId, nickname}) => (
                      <Option key={userId}>{nickname}({userId})</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="审核状态" {...formItemLayout}>
              {getFieldDecorator("auditSign")(
                <Select placeholder="请选择审核状态">
                  <Option value={null}>全部</Option>
                  <Option value="S">待审核</Option>
                  <Option value="T">已审核</Option>
                  <Option value="F">已拒绝</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8} style={colStyle}>
            <FormItem label="发放状态" {...formItemLayout}>
              {getFieldDecorator("status")(
                <Select placeholder="请选择发放状态">
                  <Option value={null}>全部</Option>
                  <Option value="UNGRANT">待发放</Option>
                  <Option value="GRANT">已发放</Option>
                  <Option value="INACTIVE">失效</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col offset={12} span={12} style={{textAlign: 'right'}}>
            {this.hasAuthorityToCreateDetain &&
            <Button type="ghost" icon="plus" size="large" onClick={onAddSuspensionEvent}>创建暂扣</Button>}
            {this.hasAuthorityToCreatePunish &&
            <Button type="ghost" icon="plus" size="large" onClick={onAddPunishmentEvent}>创建惩罚</Button>}
            {this.hasAuthorityToCreateReward &&
            <Button type="ghost" icon="plus" size="large" onClick={onAddRewardEvent}>创建奖励</Button>}
            <Button type="primary" icon="search" size="large" htmlType="submit">查询</Button>
            <Button type="ghost" icon="cross" size="large" onClick={handleReset}>清除</Button>
          </Col>
        </Row>
      </Form>
    )
  }
}

AnchorRewardPunishForm = Form.create()(AnchorRewardPunishForm);

//创建暂扣弹窗
class SuspensionModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorObj: {},
      show: 'none'
    }
    this.handleSearchAnchor = this.handleSearchAnchor.bind(this)
  }

  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if(!!err) return;
      const params = Object.assign({}, values)
      delete params["programId"]
      params["targetId"] = this.state.anchorObj['userId'];
      params["target"] = "ANCHOR";
      params["type"] = "VJKB";
      params["fee"] = values["fee"] * 100;
      webUtils.confirm(() => {
        AnchorService.addSanction(params).then(jsonResult => {
          webUtils.alertSuccess("创建成功！");
          this.props.onClose(true);
          this.props.form.resetFields()
        })
      }, "确定创建暂扣吗?")
    })
  }
  //关闭
  onClose = () => {
    this.setState({
      show: 'none'
    })
    this.props.onClose();
    this.props.form.resetFields();
  }
  // 根据房间ID查询主播信息
  handleSearchAnchor(e){
		let programId = e.target.value;
		if ( !programId ) {
			return
		}
		AnchorService.queryByProgramId(programId).then( result => {
      if( result ){
        this.setState({
          anchorObj: result,
          show: 'normal'
        })
      } else {
				this.props.form.resetFields(['programId'])
        this.setState({
          show: 'err'
        })
      }
    })
  }

  render() {
    const {anchorObj, show}= this.state
    const {visible, form} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 16},
    };
    let billPeriods = DateUtil.getAccountData(false);
    const anchorName = show === 'normal' ? anchorObj.nickname : show === 'err' ? "请检查您输入的房间ID" : ""
    return (
      <Modal title="创建暂扣"
             width={660}
             visible={visible}
             okText="提交审核"
             cancelText="取消"
             onOk={this.handleSave}
             onCancel={this.onClose}>
        <Form>
          <FormItem label="选择主播" {...formItemLayout}>
            {getFieldDecorator("programId", {rules: [{required: true, message: '请输入主播房间ID'}]})(
              <Input suffix={anchorName} onBlur={this.handleSearchAnchor}/>
            )}
          </FormItem>
          <FormItem label="选择账期" {...formItemLayout}>
            {getFieldDecorator("billPeriod", {
              rules: [{required: true, message: '请选择账期'}],
            })(
              <Select>
                {
                  billPeriods.map(it => <Option key={it} value={it}>{it}</Option>)
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="暂扣项目" {...formItemLayout}>
            {getFieldDecorator("sanctionItem", {
              rules: [{required: true, message: '请选择暂扣项目'}],
            })(
              <CustomSelect allowClear showSearch optionFilterProp="children" itemKey="AnchorVjkb"
                            placeholder="请选择暂扣项目"/>
            )}
          </FormItem>
          <FormItem label="金额" {...formItemLayout}>
            {getFieldDecorator("fee", {
              rules: [{required: true, message: '请输入金额'}],
            })(
              <InputNumber style={{width: '90%'}}/>
            )}
            <p className="ant-form-text">元</p>
          </FormItem>
          <FormItem label="备注" {...formItemLayout}>
            {getFieldDecorator("remark", {
              rules: [{required: true, message: '请输入备注'}],
            })(
              <TextArea rows="4" placeholder="请输入备注"/>
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

SuspensionModal = Form.create()(SuspensionModal);

//创建惩罚弹窗
class PunishmentModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      anchorObj: {},
      show: 'none'
    }
    this.handleSearchAnchor = this.handleSearchAnchor.bind(this)
  }

  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if(!!err) return;
      const params = Object.assign({}, values)
      delete params["programId"]
      params["targetId"] = this.state.anchorObj['userId'];
      params["target"] = "ANCHOR";
      params["type"] = "PUNISH";
      params["fee"] = values["fee"] * 100;
      webUtils.confirm(() => {
        AnchorService.addSanction(params).then(jsonResult => {
          webUtils.alertSuccess("创建成功！");
          this.props.onClose(true);
          this.props.form.resetFields();
        })
      }, "确定创建惩罚吗?")
    })
  }
  //关闭
  onClose = () => {
    this.setState({
      show: 'none'
    })
    this.props.onClose();
    this.props.form.resetFields();
  }

  // 根据房间ID查询主播信息
  handleSearchAnchor(e){
		let programId = e.target.value;
		if ( !programId ) {
			return
		}
		AnchorService.queryByProgramId(programId).then( result => {
      if( result ){
        this.setState({
          anchorObj: result,
          show: 'normal'
        })
      } else {
        this.props.form.resetFields(['programId'])
        this.setState({
          show: 'err'
        })
      }
    })
  }

  render() {
    const {anchorObj, show}= this.state
    const {visible, form} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 16},
    };
    let billPeriods = DateUtil.getAccountData(false);
    const anchorName = show === 'normal' ? anchorObj.nickname : show === 'err' ? "请检查您输入的房间ID" : ""
    return (
      <Modal title="创建惩罚"
             width={660}
             visible={visible}
             okText="提交审核"
             cancelText="取消"
             onOk={this.handleSave}
             onCancel={this.onClose}>
        <Form>
          <FormItem label="选择主播" {...formItemLayout}>
            {getFieldDecorator("programId", {rules: [{required: true, message: '请输入主播房间ID'}]})(
              <Input suffix={anchorName} onBlur={this.handleSearchAnchor}/>
            )}
          </FormItem>
          <FormItem label="选择账期" {...formItemLayout}>
            {getFieldDecorator("billPeriod", {
              rules: [{required: true, message: '选择账期'}],
            })(
              <Select>
                {
                  billPeriods.map(it => <Option key={it} value={it}>{it}</Option>)
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="惩罚项目" {...formItemLayout}>
            {getFieldDecorator("sanctionItem", {
              rules: [{required: true, message: '请选择惩罚项目'}],
            })(
              <CustomSelect allowClear showSearch optionFilterProp="children" itemKey="AnchorPunish"
                            placeholder="请选择归属"/>
            )}
          </FormItem>
          <FormItem label="金额" {...formItemLayout}>
            {getFieldDecorator("fee", {
              rules: [{required: true, message: '请输入金额'}],
            })(
              <InputNumber min={0} style={{width: '90%'}}/>
            )}
            <p className="ant-form-text">元</p>
          </FormItem>
          <FormItem label="备注" {...formItemLayout}>
            {getFieldDecorator("remark", {
              rules: [{required: true, message: '请输入备注'}],
            })(
              <TextArea rows="4" placeholder="请输入备注"/>
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

PunishmentModal = Form.create()(PunishmentModal);

//创建奖励弹窗
class RewardModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      anchorObj: {},
      show: 'none'
    }
    this.handleSearchAnchor = this.handleSearchAnchor.bind(this)
  }

  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if(!!err) return;
      const params = Object.assign({}, values)
      delete params["programId"]
      params["targetId"] = this.state.anchorObj['userId'];
      params["target"] = "ANCHOR";
      params["type"] = "REWARD";
      params["fee"] = values["fee"] * 100;
      webUtils.confirm(() => {
        AnchorService.addSanction(params).then(jsonResult => {
          webUtils.alertSuccess("创建成功！");
          this.props.onClose(true);
          this.props.form.resetFields();
        })
      }, "确定创建奖励吗?")
    })
  }
  //关闭
  onClose = () => {
    this.setState({
      show: 'none'
    })
    this.props.onClose();
    this.props.form.resetFields();
  }

  // 根据房间ID查询主播信息
  handleSearchAnchor(e){
		let programId = e.target.value;
		if ( !programId ) {
			return
		}
		AnchorService.queryByProgramId(programId).then( result => {
      if( result ){
        this.setState({
          anchorObj: result,
          show: 'normal'
        })
      } else {
				this.props.form.resetFields(['programId'])
        this.setState({
          show: 'err'
        })
      }
    })
  }

  render() {
    const {anchorObj, show}= this.state
    const {visible, form} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 16},
    };
    let billPeriods = DateUtil.getAccountData(false);
    const anchorName = show === 'normal' ? anchorObj.nickname : show === 'err' ? "请检查您输入的房间ID" : ""
    return (
      <Modal title="创建奖励"
             width={660}
             visible={visible}
             okText="提交审核"
             cancelText="取消"
             onOk={this.handleSave}
             onCancel={this.onClose}>
        <Form>
          <FormItem label="选择主播" {...formItemLayout}>
            {getFieldDecorator("programId", {rules: [{required: true, message: '请输入主播房间ID'}]})(
              <Input suffix={anchorName} onBlur={this.handleSearchAnchor}/>
            )}
          </FormItem>
          <FormItem label="选择账期" {...formItemLayout}>
            {getFieldDecorator("billPeriod", {
              rules: [{required: true, message: '选择账期'}],
            })(
              <Select>
                {
                  billPeriods.map(it => <Option key={it} value={it}>{it}</Option>)
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="奖励项目" {...formItemLayout}>
            {getFieldDecorator("sanctionItem", {
              rules: [{required: true, message: '请选择奖励项目'}],
            })(
              <CustomSelect allowClear showSearch optionFilterProp="children" itemKey="AnchorAward"
                            placeholder="请选择归属"/>
            )}
          </FormItem>
          <FormItem label="金额" {...formItemLayout}>
            {getFieldDecorator("fee", {
              rules: [{required: true, message: '请输入金额'}],
            })(
              <InputNumber min={0} style={{width: '90%'}}/>
            )}
            <p className="ant-form-text">元</p>
          </FormItem>
          <FormItem label="备注" {...formItemLayout}>
            {getFieldDecorator("remark", {
              rules: [{required: true, message: '请输入备注'}],
            })(
              <TextArea rows="4" placeholder="请输入备注"/>
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

RewardModal = Form.create()(RewardModal);

//修改奖惩记录弹窗
class ModifySanctionModal extends Component {
  constructor(props) {
    super(props);
  }

  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if(!!err) return;
      const formData = Object.assign({}, values)
      formData["target"] = "ANCHOR";
      formData["type"] = formData["sanctionType"];
      formData["recordId"] = this.props.record.recordId;
      formData["fee"] = values["fee"] * 100;
      delete formData["sanctionType"]
      webUtils.confirm(() => {
        AnchorService.modifySanction(formData).then(jsonResult => {
          webUtils.alertSuccess("修改成功！");
          this.props.onClose(true);
          this.props.form.resetFields();
        })
      }, "确定修改奖惩记录吗?")
    })
  }
  //关闭
  onClose = () => {
    this.props.onClose();
    this.props.form.resetFields();
  }

  render() {
    const {visible, form, record} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 16},
    };
    return (
      <Modal title="修改奖惩"
             width={660}
             visible={visible}
             okText="提交审核"
             cancelText="取消"
             onOk={this.handleSave}
             onCancel={this.onClose}>
        <Form>
          {getFieldDecorator("sanctionType")(
            <Input type="hidden"/>
          )}
          <FormItem label="选择主播" {...formItemLayout}>
            {getFieldDecorator("targetId", {rules: [{required: true, message: '请输入主播ID或名称'}]})(
              <Input disabled={true}/>
            )}
          </FormItem>
          <FormItem label="选择账期" {...formItemLayout}>
            {getFieldDecorator("billPeriod", {rules: [{required: true, message: '选择账期'}]})(
              <Input disabled={true}/>
            )}
          </FormItem>
          <FormItem label="奖励项目" {...formItemLayout}>
            {getFieldDecorator("sanctionItem", {rules: [{required: true, message: '请选择奖励项目'}]})(
              <Input disabled={true}/>
            )}
          </FormItem>
          <FormItem label="金额" {...formItemLayout}>
            {getFieldDecorator("fee", {rules: [{required: true, message: '请输入金额'}]})(
              <InputNumber style={{width: '90%'}}/>
            )}
            <p className="ant-form-text">元</p>
          </FormItem>
          <FormItem label="备注" {...formItemLayout}>
            {getFieldDecorator("remark", {rules: [{required: true, message: '请输入备注'}]})(
              <TextArea rows="4" placeholder="请输入备注"/>
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

ModifySanctionModal = Form.create({
  mapPropsToFields(props) {
    const {visible, record} = props
    if(!visible || !record) return {}
    const formDefaultValues = Object.assign({}, record)
    formDefaultValues['anchorUserId'] && (formDefaultValues['targetId'] = formDefaultValues['anchorUserId'])
    formDefaultValues['sanctionItemDesc'] && (formDefaultValues['sanctionItem'] = formDefaultValues['sanctionItemDesc'])
    formDefaultValues['fee'] && (formDefaultValues['fee'] = Math.abs(formDefaultValues['fee']) / 100)
    return commonUtils.recordToValueJson(formDefaultValues)
  }
})(ModifySanctionModal);

//暂扣解冻弹窗
class ThawModal extends Component {
  constructor(props) {
    super(props);
  }

  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if(!!err) return;
      values["recordId"] = this.props.record.recordId;
      webUtils.confirm(() => {
        AnchorService.deVjkb(values).then(jsonResult => {
          webUtils.alertSuccess("解冻成功！");
          this.props.onClose(true);
          this.props.form.resetFields();
        })
      }, "确定暂扣解冻吗?");
    })
  }
  //关闭
  onClose = () => {
    this.props.onClose();
    this.props.form.resetFields();
  }

  render() {
    const {visible, form, record} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 16},
    };
    let billPeriods = DateUtil.getAccountData(false);
    return (
      <Modal title="暂扣解冻"
             width={660}
             visible={visible}
             okText="提交审核"
             cancelText="取消"
             onOk={this.handleSave}
             onCancel={this.onClose}>
        <div className="ant-confirm-body">
          <Icon type="exclamation-circle" style={{fontSize: "24px", color: "#ffbf00"}}/>
          <span className="ant-confirm-title">确认“暂扣解冻”吗？</span>
          <div className="ant-confirm-content">操作后将会进入审核，若审核拒绝后可再次提交</div>
        </div>
        <Form>
          <FormItem label="选择账期" {...formItemLayout}>
            {getFieldDecorator("billPeriod", {
              rules: [{required: true, message: '选择账期'}],
            })(
              <Select>
                {
                  billPeriods.map(it => <Option key={it} value={it}>{it}</Option>)
                }
              </Select>
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

ThawModal = Form.create()(ThawModal);
export default class AnchorRewardPunish extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openSuspensionVisible: false,
      openPunishmentVisible: false,
      openRewardVisible: false,
      openModifySanVisible: false,
      openThawVisible: false,
      recordObj: {},
      guildCode: []
    };
    //需要判断权限的btn集合
    this.btnResList = props.location.state ? props.location.state.btnResList || [] : []
    //是否有修改的权限
    this.hasModify = this.btnResList.includes('anchorRewardPunishModify')
    //是否有废除的权限
    this.hasAbolish = this.btnResList.includes('anchorRewardPunishAbolish')
    //是否有解冻的权限
    this.hasThaw = this.btnResList.includes('anchorRewardPunishThaw')
    this.allAnchorList = [];
    this.columns = [
      {title: '奖惩编号', dataIndex: 'recordId', width: 85, fixed: 'left',},
      {title: '账期', dataIndex: 'billPeriod', width: 85, fixed: 'left',},
      {title: '结算编号', dataIndex: 'settlementId', width: 85, fixed: 'left',},
      {title: '主播ID', dataIndex: 'anchorUserId', width: 100},
      {title: '主播名称', dataIndex: 'anchorUserName', width: 120},
      {title: '公会ID', dataIndex: 'guildId', width: 85},
      {title: '公会名称', dataIndex: 'guildName', width: 100},
      {title: '奖惩类型', dataIndex: 'sanctionTypeDesc', width: 85},
      {title: '奖惩项目', dataIndex: 'sanctionItemDesc', width: 100},
      {title: '金额', dataIndex: 'fee', width: 85, render: (text) => commonUtils.getFormatCentToYuan(text)},
      {title: '备注', dataIndex: 'remark', width: 200},
      {title: '创建人', dataIndex: 'createUserName', width: 85},
      {
        title: '创建时间',
        dataIndex: 'createTime',
        width: 135,
        sorter: (a, b) => moment(a.createTime) - moment(b.createTime),
      },
      {title: '审核状态', dataIndex: 'auditSignDesc', width: 85},
      {title: '拒绝原因', dataIndex: 'auditReason', width: 250},
      {title: '审核人', dataIndex: 'auditUserName', width: 150},
      {title: '审核时间', dataIndex: 'auditTime', width: 135},
      {title: '发放状态', dataIndex: 'statusDesc', width: 85},
      {
        title: '操作', dataIndex: 'handle', fixed: 'right', width: 120, render: (text, record) => {
        const modifyBtn = record.status === "UNGRANT" && (record.auditSign === 'S' || record.auditSign === 'F') && record.sanctionType !== "DE_VJKB" && this.hasModify
        const abolishBtn = record.status === "UNGRANT" && (record.auditSign === 'S' || record.auditSign === 'F') && this.hasAbolish
        const thawBtn = !record.relationRecordId && record.status === 'GRANT' && this.hasThaw
        return (
          <span>
            {modifyBtn &&
            <span>
                <a href="javascript:void(0)" onClick={this.openModifySanModal.bind(this, record)}>修改</a>
                <span className={abolishBtn&&"ant-divider"}/>
              </span>
            }
            {abolishBtn &&
            <span>
                <a href="javascript:void(0)" onClick={this.onCancelVjkb.bind(this, record)}>作废</a>
                <span className={thawBtn&&"ant-divider"}/>
              </span>
            }
            {thawBtn &&
            <a href="javascript:void(0)" onClick={this.onThaw.bind(this, record)}>暂扣解冻</a>}
          </span>
        )
      }
      }
    ]
  }

  componentDidMount() {
    //获取主播
    AnchorService.queryAllAnchor().then(result => {
      this.allAnchorList = result
    })
    //获取账期
    //获取公会id(不是公会代码)
    UnionService.queryAllGuild().then(guildCode => {
      this.setState({guildCode})
    })
  }

  // 表单搜索
  handleSearch = (params) => {
    this.customTable.queryTableData(params);
  }
  //打开创建暂扣弹窗
  onOpenSuspensionModal = (e) => {
    e.preventDefault();
    this.setState({openSuspensionVisible: true})
  }
  //打开创建惩罚弹窗
  onOpenPunishmentModal = (e) => {
    e.preventDefault();
    this.setState({openPunishmentVisible: true})
  }
  //打开创建奖励弹窗
  onOpenRewardModal = (e) => {
    e.preventDefault();
    this.setState({openRewardVisible: true})
  }

  //打开修改奖惩记录弹窗
  openModifySanModal(record, e) {
    e.preventDefault();
    this.setState({
      openModifySanVisible: true,
      recordObj: record
    })
  }

  //打开暂扣解冻弹窗
  onThaw(record, e) {
    e.preventDefault();
    this.setState({
      openThawVisible: true,
      recordObj: record
    })
  }

  //作废
  onCancelVjkb(record, e) {
    e.preventDefault();
    webUtils.confirm(() => {
      AnchorService.cancel(record.recordId).then(jsonResult => {
        webUtils.alertSuccess("成功作废！");
        this.customTable.refreshTable();
      })
    }, "确定作废吗?");
  }

  //统一关闭弹出框
  handleClose = (refresh = false) => {
    refresh && this.customTable.refreshTable({"target": "ANCHOR"});
    this.setState({
      openSuspensionVisible: false,
      openPunishmentVisible: false,
      openRewardVisible: false,
      openModifySanVisible: false,
      openThawVisible: false,
      recordObj: {}
    })
  }
  //清空表单
  handleReset = (e) => {
    e.preventDefault();
    this.rewardPunishForm.resetFields();
  }

  render() {
    const {
      openSuspensionVisible, openPunishmentVisible, openRewardVisible,
      openModifySanVisible, recordObj, openThawVisible, guildCode
    } = this.state;
    return (
      <div>
        <AnchorRewardPunishForm ref={(obj) => this.rewardPunishForm = obj}
                                btnResList={this.btnResList}
                                onSearch={this.handleSearch}
                                onAddSuspensionEvent={this.onOpenSuspensionModal}
                                handleReset={this.handleReset}
                                onAddPunishmentEvent={this.onOpenPunishmentModal}
                                onAddRewardEvent={this.onOpenRewardModal}
                                guildCode={guildCode}/>
        <CustomTable ref={table => this.customTable = table}
                     rowKey="recordId"
                     columns={this.columns}
                     scroll={{x: 2160}}
                     fetchTableDataMethod={AnchorService.querySanction}/>
        <SuspensionModal visible={openSuspensionVisible}
                         onClose={this.handleClose}
                         allAnchorList={this.allAnchorList}/>
        <PunishmentModal visible={openPunishmentVisible}
                         onClose={this.handleClose}
                         allAnchorList={this.allAnchorList}/>
        <RewardModal visible={openRewardVisible}
                     onClose={this.handleClose}
                     allAnchorList={this.allAnchorList}/>
        <ModifySanctionModal visible={openModifySanVisible}
                             onClose={this.handleClose}
                             record={recordObj}/>
        <ThawModal visible={openThawVisible} onClose={this.handleClose} record={recordObj}/>
      </div>
    )
  }
}