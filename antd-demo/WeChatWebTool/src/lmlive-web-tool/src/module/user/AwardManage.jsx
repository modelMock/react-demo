import React, {Component} from 'react';
import { Form, Row, Col, Input, InputNumber, Select, Button, Modal, DatePicker, Tag } from 'antd';
import CustomTable from '../../commons/widgets/CustomTable';
import UserService from '../../service/UserService';
import ConfigService from '../../service/ConfigService';
import webUtils from '../../commons/utils/webUtils';
const FormItem = Form.Item;
const Option = Select.Option;
const {RangePicker} = DatePicker

const COIN = "COIN";
const GOODS = "GOODS";
const EXP = "EXP";

// 条件搜索
const AwardSearchForm = Form.create()(
  (props) => {
    const {form, onSearch, awardType} = props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 16},
    }
    return (
      <Form layout="horizontal" onSubmit={ onSearch } className="ant-advanced-search-form">
        <Row>
          <Col sm={8}>
            <FormItem label="用户ID" {...formItemLayout}>
              {getFieldDecorator("userId")(<Input placeholder="请输入用户ID查询" />)}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="奖励类型" {...formItemLayout}>
              {getFieldDecorator("type", { initialValue: awardType })(
                <Select>
                  <Option value={COIN}>萌豆</Option>
                  <Option value={GOODS}>勋章</Option>
                  <Option value={EXP}>经验</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="查询时间段" {...formItemLayout}>
              {getFieldDecorator("queryDate")(
                <RangePicker format="YYYY-MM-DD" placeholder={['开始日期', '截止日期']} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12} offset={12} style={{ textAlign: 'right' }}>
            <Button type="danger" icon="minus" size="large" onClick={()=>props.onShowCoinModal("minus")}>扣除萌豆</Button>
            <Button type="danger" icon="minus" size="large" onClick={()=>props.onShowGoodsModal("minus")}>回收勋章</Button>
            <Button type="ghost" icon="plus" size="large" onClick={()=>props.onShowCoinModal("add")}>奖励萌豆</Button>
            <Button type="ghost" icon="plus" size="large" onClick={()=>props.onShowGoodsModal("add")}>奖励勋章</Button>
            <Button type="ghost" icon="plus" size="large" onClick={()=>props.onShowExpModal()}>奖励经验</Button>
            <Button type="primary" icon="search" size="large" htmlType="submit">搜索</Button>
          </Col>
        </Row>
      </Form>
    )
  }
);

const checkUserId = (rule, value, callback) => {
  if (value.nickname) {
    callback();
    return;
  }
  callback('该用户不存在');
}
class UserInput extends Component {
  constructor(props){
    super(props)
    this.state = {
      userId: this.props.value.userId,
      nickname: null,
    }
  }
  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const value = nextProps.value;
      this.setState(value);
    }
  }
  handleChange = (userId) => {
    this.triggerChange({userId})
  }
  triggerChange = (changedValue) => {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  }
  handleBlur = (e) => {
    const userId = e.target.value;
    if(userId){
      UserService.queryUserByUserId(userId).then(result => {
        this.setState({ nickname: result ? result.nickname : null })
        this.triggerChange({userId})
      })
    }
  }
  render(){
    const {userId, nickname} = this.state;
    return (
      <span>
        <InputNumber min={1} placeholder="请输入用户ID"
                     value={userId}
                     onChange={this.handleChange}
                     onBlur={this.handleBlur}
                     style={{ width: '40%', marginRight: '3%'}} />
        {nickname && <span className="ant-form-text">{nickname}</span>}
      </span>
    )
  }
}

// 萌豆奖励
class CoinAwardForm extends Component {
  state = {
    loading: false
  }
  handleSave = () => {
    const {form, type} = this.props;
    form.validateFields((err, values) => {
      if(!!err) return;
      webUtils.confirm(() => {
        this.setState({ loading: true });
        values['remark'] = !!values['remark'] ? values['remark'] : '';
        values['userId'] = values['userId']['userId']
        if(type === 'add') {
          UserService.presentUserWealth(values).then(result => {
            webUtils.alertSuccess("奖励萌豆成功");
            this.__close(true)
          }).catch(() => {
            this.setState({loading: false});
          })
        } else {
          UserService.deductUserWealth(values).then(result => {
            webUtils.alertSuccess("扣除萌豆成功");
            this.__close(true)
          }).catch(() => {
            this.setState({loading: false});
          })
        }
      }, type === 'add' ? "确定奖励萌豆吗？" : "确定扣除萌豆吗？")
    });
  }
  __close(isRefresh = false){
    this.props.onClose(COIN, isRefresh)
    this.setState({ loading: false })
    this.props.form.resetFields();
  }
  handleCancel = () => {
    this.__close();
  }
  render() {
    const {loading} = this.state;
    const {form, visible, type} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14},
    }
    return (
      <Modal title={type === 'add' ? "奖励萌豆" : "扣除萌豆"}
             visible={visible}
             confirmLoading={loading}
             onOk={this.handleSave}
             onCancel={this.handleCancel}
             okText="提交"
             cancelText="取消">
        <Form>
          <FormItem label="用户ID" {...formItemLayout}>
            {getFieldDecorator("userId",{
              initialValue: { userId: null, nickname: null },
              rules: [{required: true, message: "必须输入用户ID"}, {validator: checkUserId}]
            })(
              <UserInput />
            )}
          </FormItem>
          <FormItem label="数量" {...formItemLayout}>
            {getFieldDecorator("count", {
              initialValue: 1,
              rules: [{required: true, message: "必须输入萌豆数量"}]
            })(
              <InputNumber min={1} placeholder="请输入萌豆数量" style={{ width: '100%'}} />
            )}
          </FormItem>
          <FormItem label="备注" {...formItemLayout}>
            {getFieldDecorator("remark")(
              <Input type="textarea" rows={4} />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
CoinAwardForm = Form.create()(CoinAwardForm);

// 勋章奖励
class GoodsAwardForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      goodsList: []
    }
    this.handleSave = this.handleSave.bind(this);
  }
  handleSave(){
    const {form, type} = this.props;
    form.validateFields((err, values) => {
      if(!!err) return;
      webUtils.confirm(() => {
        this.setState({ loading: true });
        values['userId'] = values['userId']['userId']
        if(type === 'add') {
          UserService.presentUserGoods(values).then(result => {
            webUtils.alertSuccess("奖励勋章成功");
            this.__close(true);
          }).catch(() => {
            this.setState({loading: false});
          })
        } else {
          UserService.deductUserGoods(values).then(result => {
            webUtils.alertSuccess("回收勋章成功");
            this.__close(true);
          }).catch(() => {
            this.setState({loading: false});
          })
        }
      }, type === 'add' ? "确定奖励勋章吗？" : "确定回收勋章吗？");
    });
  }
  __close(isRefresh = false){
    this.props.onClose(GOODS, isRefresh)
    this.setState({ loading: false })
    this.props.form.resetFields();
  }
  handleCancel = () => {
    this.__close()
  }
  componentDidMount() {
    ConfigService.queryGoodsByType().then(goodsList => {
      this.setState({ goodsList });
    })
  }
  render() {
    const {goodsList, loading} = this.state;
    const {visible, form, type} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14},
    }
    return (
      <Modal title={type === 'add' ? "奖励勋章" : "删除勋章"}
             visible={visible}
             confirmLoading={loading}
             onOk={this.handleSave}
             onCancel={()=>this.handleCancel()}
             okText="提交"
             cancelText="取消">
        <Form>
          <FormItem label="用户ID" {...formItemLayout}>
            {getFieldDecorator("userId",{
              initialValue: { userId: null, nickname: null },
              rules: [{required: true, message: "必须输入用户ID"}, {validator: checkUserId}]
            })(
              <UserInput />
            )}
          </FormItem>
          <FormItem label="勋章" {...formItemLayout}>
            {getFieldDecorator("goodsId",{
              rules: [{required: true, message: "必须选择一个礼物"}]
            })(
              <Select placeholder="请选择奖励礼物">
                {
                  goodsList.map(goods => (
                    <Option key={goods.goodsId}>{goods.goodsName}</Option>
                  ))
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="有效天数" {...formItemLayout}>
            {getFieldDecorator("num", {
              initialValue: 1,
              rules: [{required: true, message: "必须输入奖励有效天数"}]
            })(
              <InputNumber min={1} style={{ width: '100%'}} />
            )}
          </FormItem>
          <FormItem label="备注" {...formItemLayout}>
            {getFieldDecorator("remark")(
              <Input type="textarea" rows={4} />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
GoodsAwardForm = Form.create()(GoodsAwardForm);

// 经验奖励
class ExpAwardForm extends Component {
  state = {
    loading: false,
  }
  handleSave = () => {
    this.props.form.validateFields((err, values) => {
      if(!!err) return;
      webUtils.confirm(() => {
        this.setState({ loading: true });
        values['userId'] = values['userId']['userId']
        UserService.presentUserExp(values).then(result => {
          webUtils.alertSuccess("奖励经验成功");
          this.__close(true);
        }).catch(() => {
          this.setState({ loading: false });
        })
      }, "确定奖励经验吗？");
    });
  }
  __close(isRefresh = false){
    this.props.onClose(EXP, isRefresh)
    this.setState({ loading: false })
    this.props.form.resetFields();
  }
  handleCancel = () => {
    this.__close()
  }
  render() {
    const {loading} = this.state;
    const {visible, form} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14},
    }
    return (
      <Modal title="奖励经验"
             visible={visible}
             confirmLoading={loading}
             onOk={this.handleSave}
             onCancel={this.handleCancel}
             okText="提交"
             cancelText="取消">
        <Form>
          <FormItem label="用户ID" {...formItemLayout}>
            {getFieldDecorator("userId",{
              initialValue: { userId: null, nickname: null },
              rules: [{required: true, message: "必须输入用户ID"}, {validator: checkUserId}]
            })(
              <UserInput />
            )}
          </FormItem>
          <FormItem label="类型" {...formItemLayout}>
            {getFieldDecorator("expType",{
              rules: [{required: true, message: "必须选择一种类型"}],
              initialValue: 'USER_EXP'
            })(
              <Select placeholder="请选择奖励礼物">
                <Option value="USER_EXP">增加用户经验</Option>
                <Option value="GIFT_EXP">增加主播经验</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="数量" {...formItemLayout}>
            {getFieldDecorator("num", {
              initialValue: 1,
              rules: [{required: true, message: "必须输入奖励数量"}]
            })(
              <InputNumber min={1} placeholder="请输入奖励数量" style={{ width: '100%'}} />
            )}
          </FormItem>
          <FormItem label="备注" {...formItemLayout}>
            {getFieldDecorator("remark")(
              <Input type="textarea" rows={4} />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
ExpAwardForm = Form.create()(ExpAwardForm);

export default class AwardManage extends Component {
  constructor(props){
    super(props);
    this.state = {
      // 萌豆奖励弹框
      coinVisible: false,
      // 奖励萌豆、扣除萌豆
      coinType: 'add',

      // 勋章奖励弹框
      goodsVisible: false,
      // 奖励勋章、删除勋章
      optrGoodsType: 'add',

      // 经验奖励弹框
      expVisible: false,
      // 奖励类型
      awardType: 'COIN',
    }
    this.handleSearch = this.handleSearch.bind(this);
    this.handleShowCoinModal = this.handleShowCoinModal.bind(this);
    this.handleShowGoodsModal = this.handleShowGoodsModal.bind(this);
    this.handleShowExpModal = this.handleShowExpModal.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }
  __getColumns() {
    let fieldTitle = "赠送物品";
    if(this.type === EXP) {
      fieldTitle = '经验类型'
    }else if(this.type === GOODS) {
      fieldTitle = "勋章名"
    }
    return [
      {title: '奖励编号', dataIndex: 'awardSn'},
      {title: '用户ID', dataIndex: 'objectId'},
      {title: '昵称', dataIndex: 'nickname'},
      {title: '用户类型', dataIndex: 'userType', render: (text) => {
        if(text === 'VIEWER') return '普通用户'
        else if(text === 'ANCHOR') return '主播'
        else if(text === 'MANAGER') return '管理员'
        return null
      }},
      {title: fieldTitle, dataIndex: 'awardType', render: (text) => {
        if(text === 'USER_EXP') return '用户经验'
        else if(text === 'GIFT_EXP') return '礼物经验'
        else if(text === COIN) return '萌豆'
        return text
      }},
      {title: '数量', dataIndex: 'num', render: (num) => {
        if(num < 0) return <Tag color="#f50">{num}</Tag>
        return num;
      }},
      {title: '创建时间', dataIndex: 'createTime'},
      {title: '备注', dataIndex: 'extendInfo'}
    ];
  }
  handleSearch(e) {
    e.preventDefault();
    const values = this.awardSearchForm.getFieldsValue();
    if(values.queryDate && values.queryDate.length > 0) {
      values['startDate'] = values.queryDate[0].format("YYYY-MM-DD HH:mm:ss")
      values['endDate'] = values.queryDate[1].format("YYYY-MM-DD HH:mm:ss")
    }
    delete values.queryDate;
    this.type = values['type'];
    this.refs.customTable.queryTableData(values);
  }
  // 打开奖励萌豆弹框
  handleShowCoinModal(coinType){
    this.setState({ coinVisible: true, coinType });
  }
  // 打开勋章奖励弹框
  handleShowGoodsModal(optrGoodsType) {
    this.setState({ goodsVisible: true, optrGoodsType })
  }
  // 打开经验奖励弹框
  handleShowExpModal() {
    this.setState({ expVisible: true });
  }
  // 关闭弹框，刷新表格数据
  handleClose(awardType, isRefresh) {
    if(!!isRefresh) {
      this.setState({
        awardType,
        coinVisible: false,
        goodsVisible: false,
        expVisible: false
      });
      this.refs.customTable.refreshTable({type: awardType });
    } else {
      this.setState({
        coinVisible: false,
        goodsVisible: false,
        expVisible: false
      });
    }
  }
  render() {
    const { coinVisible, coinType, goodsVisible, optrGoodsType, expVisible, awardType} = this.state;
    return (
      <div>
        <AwardSearchForm ref={(form) => { this.awardSearchForm = form }}
                         awardType={awardType}
                         onSearch={this.handleSearch}
                         onShowCoinModal={this.handleShowCoinModal}
                         onShowGoodsModal={this.handleShowGoodsModal}
                         onShowExpModal={this.handleShowExpModal}/>
        <CustomTable ref="customTable" rowKey="awardSn" columns={this.__getColumns()}
                     fetchTableDataMethod={UserService.queryUserAwardRecord}/>
        <CoinAwardForm visible={coinVisible} type={coinType} onClose={this.handleClose} />
        <GoodsAwardForm visible={goodsVisible} type={optrGoodsType} onClose={this.handleClose}/>
        <ExpAwardForm visible={expVisible} onClose={this.handleClose}/>
      </div>
    )
  }
}