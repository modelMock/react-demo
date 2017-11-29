/*按好友数分配客服*/
import React, { Component, PropTypes} from 'react';
import { Tabs, Form, Select, Input, InputNumber, Button, Radio, Row, Col, message, Alert, Tooltip, Popconfirm } from 'antd';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import OptrSelectField from './OptrSelectField';
import { queryAssignOptrForFrdCnt, queryUnassignOptrCount , updateAssignOptrForFrdCnt }  from '../../services/operations';
import { Confirm, Success } from '../Commons/CommonConstants';
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

class AssignOptrByFriend extends Component {

  constructor(props) {
    super(props);
    this.state = {
      opCount: 0,       //输入好友数可分配的记录数
      opSumFrdNum: 0,   //输入好友数可分配的记录数 好友汇总
      sumFrdNum: 0,     //可分配好友总数
      minFrdNum: 0,     //单个记录最少好友数
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

  //表单验证通过才显示确认框
  handleSubmit() {
    this.props.form.validateFields( (errors, values) => {
      if(!!errors) return;

      Confirm(function(){

        values['service_optr_id'] = values['service_optr_id']['key'];
        updateAssignOptrForFrdCnt(values).then( ({jsonResult}) => {
          Success('按好友分配客服成功');
          this.setState({ visible: false });
          this.props.form.resetFields();
          this.fetchInitData();
        });

      }.bind(this), "确认分配吗?")
    })
  }

  //根据用户输入好友数，估算需要分配的运营号个数
  handleInputChange(inputValue) {
    if(this.preInputNum != inputValue && inputValue >= this.state.minFrdNum && inputValue <= this.state.sumFrdNum) {
      queryAssignOptrForFrdCnt({friend_cnt: inputValue}).then( ({jsonResult}) => {
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
    queryUnassignOptrCount().then( ({jsonResult}) => {
        this.setState({
          sumFrdNum: jsonResult['friend_cnts'],
          minFrdNum: jsonResult['friend_cnt_min']
        })
    });
  }

  componentDidMount() {
      console.log('AssignOptrByFriend => componentDidMount');
      this.fetchInitData();
  }

  componentWillReceiveProps(nextProps) {
      console.log('AssignOptrByFriend => componentWillReceiveProps');
      if('isActivated' in nextProps && nextProps['isActivated'] === true) {
          this.fetchInitData();
      }
  }

  shouldComponentUpdate(...args) {
      return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }

  render() {
      console.log('AssignOptrByFriend => render =>');
      const getFieldDecorator = this.props.form.getFieldDecorator;
      const { sumFrdNum, minFrdNum, opCount, opSumFrdNum, visible } = this.state;

      return (
          <Form horizontal>
              <OptrSelectField getFieldDecorator={getFieldDecorator('service_optr_id', {rules:[{type:'object'}]})}
                  formItem={{ label:"选择客服", labelCol: { span:8 }, wrapperCol: { span:12 }, required: true }}
                  onSelect={ this.handleSelect } />
            　<FormItem labelCol={{ span:8 }} wrapperCol={{ span:16　}} label="分配好友" hasFeedback>
              {getFieldDecorator('friend_cnt', {　
                  rules: [{type:'number', required: true, message: '请输入分配好友数'}],
                  onChange: this.handleInputChange　
              })(
                <InputNumber min={minFrdNum} max={sumFrdNum}
                  placeholder="请输入分配好友数"　style={{ width: 300 }}/>
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

export default Form.create()(AssignOptrByFriend);
