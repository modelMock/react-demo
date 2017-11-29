/*按好友数分配渠道*/
import React, { Component } from 'react';
import { Form, Select, InputNumber, Button } from 'antd';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ChannelSelectField from './ChannelSelectField';
import { queryAssignChanellForFrdCnt, queryUnassignChannelCount , updateAssignChanellForFrdCnt, queryAllWechatGroup }  from '../../services/operations';
import { Confirm, Success } from '../Commons/CommonConstants';
const FormItem = Form.Item;
const Option = Select.Option

class AssignChannelByFriend extends Component {
  constructor(props) {
    super(props);
    this.state = {
      opCount: 0,       //输入好友数可分配的记录数
      opSumFrdNum: 0,   //输入好友数可分配的记录数 好友汇总
      sumFrdNum: 0,     //可分配好友总数
      minFrdNum: 0,     //单个记录最少好友数
      wechatGroup: []   //微信组号
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.preInputNum = 0;
  }

  handleClick() {
    this.props.form.setFieldsValue({
      friend_cnt: this.state.sumFrdNum
    });
  }

  handleSubmit() {
    this.props.form.validateFields( (errors, values) => {
      if(!!errors) return;
      Confirm(() => {
        values['channel_id'] = values['channel_id']['key'];
        updateAssignChanellForFrdCnt(values).then(({ jsonResult }) => {
          Success('按好友分配渠道成功');
          this.setState({ visible: false });
          this.props.form.resetFields();
          this.fetchInitData();
        });

      }, "确认分配吗?");

    })
  }

  //根据用户输入好友数，估算需要分配的运营号个数
  handleInputChange(inputValue) {
    if(this.preInputNum != inputValue && inputValue >= this.state.minFrdNum && inputValue <= this.state.sumFrdNum) {
      queryAssignChanellForFrdCnt({friend_cnt: inputValue}).then( ({jsonResult}) => {
        this.setState({
          opCount: jsonResult['operation_count'],
          opSumFrdNum: jsonResult['friend_cnts']
        });
        this.preInputNum = inputValue;
      });
    }
  }

  //挂载初始化：查询系统还有多少好友数没有被分配 和 最少的一个运营号好友数
  fetchInitData() {
    queryUnassignChannelCount({wechat_group: this.props.form.getFieldValue("wechat_group") }).then( ({jsonResult}) => {
      this.setState({
        sumFrdNum: jsonResult['friend_cnts'],
        minFrdNum: jsonResult['friend_cnt_min']
      })
    })
  }

  // 获取微信组号
  queryAllWechatGroup(){
    queryAllWechatGroup().then( ({jsonResult}) => {
      this.setState({
        wechatGroup: jsonResult
      })
    })
  }

  componentDidMount() {
    this.fetchInitData()
    this.queryAllWechatGroup()
  }

  componentWillReceiveProps(nextProps) {
    if('isActivated' in nextProps && nextProps['isActivated'] === true) {
      this.fetchInitData();
    }
  }

  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }

  render() {
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const { sumFrdNum, minFrdNum, opCount, opSumFrdNum, wechatGroup } = this.state;
    return (
      <Form horizontal>
        <FormItem labelCol={{ span:8 }} wrapperCol={{ span:12　}} label="运营组号">
          {getFieldDecorator('wechat_group', {initialValue: ''})(
            <Select placeholder="请输入运营组号">
              <Option value="">全部</Option>
              {
                wechatGroup.map(item => {
                  return <Option key={item}>{item}</Option>;
                })
              }
            </Select>
          )}
        </FormItem>
        <ChannelSelectField getFieldDecorator={getFieldDecorator('channel_id', {rules:[{type:'object'}]})}
          formItem={{
            label:"选择商业渠道",
            labelCol: { span:8 },
            wrapperCol: { span:12 },
            required: true
          }} />
        <FormItem labelCol={{ span:8 }} wrapperCol={{ span:16　}} label="分配好友">
          {getFieldDecorator('friend_cnt', {
              rules: [{type:'number', required: true, message: '请输入分配好友数'}],
              onChange: this.handleInputChange
          })(
            <InputNumber min={minFrdNum} max={sumFrdNum} placeholder="请输入分配好友数" style={{ width: 300 }}　/>
          )}
          <span className="ant-form-text" style={{marginLeft: 8, marginRight:16}}>人</span>
          <Button type="ghost" icon="plus-circle-o" onClick={this.handleClick} disabled={sumFrdNum == 0}>全部</Button>
        </FormItem>
        <FormItem wrapperCol={{ span:8, offset: 10 }}>
          <p className="ant-form-text" id="static" name="static" style={{ 'color':'red' }}>可分配好友{sumFrdNum}人，最少分配{minFrdNum}人</p>
        </FormItem>
        <FormItem labelCol={{ span: 8, offset: 4 }} label="实际将分配好友">
          <p className="ant-form-text" id="static" name="static">
            来自<span style={{ 'color':'red' }}>{opCount}</span>个运营微信号，共<span style={{ 'color':'red' }}>{opSumFrdNum}</span>人
          </p>
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 10 }}>
          <Button icon="check" type="primary" disabled={sumFrdNum == 0} onClick={this.handleSubmit}>提交</Button>
          <Button icon="reload" style={{marginLeft: 32}}
            onClick={() => {this.fetchInitData()}}>刷新</Button>
        </FormItem>
      </Form>
    );
  }
}

export default Form.create()(AssignChannelByFriend);
