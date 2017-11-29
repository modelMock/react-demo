/*转移客服好友弹出框*/
import React, { Component, PropTypes} from 'react'
import { Form, Input, InputNumber, Select, Button } from 'antd';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {queryOperCountByOptrId, queryOperByOptrIdAndFrdCnt,
      transferKefuFriends, queryOptrCountInfoByChannelId} from '../../services/optr';
import { Confirm, Success, Errors } from '../Commons/CommonConstants';
import CommonModal from '../Commons/CommonModal';
const FormItem = Form.Item;
const Option = Select.Option;

class TransferFrdsModal extends Component {

  static propTypes = {
    type: PropTypes.string.isRequired,        //原始客服id
    data: PropTypes.object.isRequired,
    onRefreshTable: PropTypes.func.isRequired,
    form: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.state={
      opCount: 0,       //输入好友数可分配的记录数
      opSumFrdNum: 0,   //输入好友数可分配的记录数 好友汇总
      sumFrdNum: 0,     //可分配好友总数
      minFrdNum: 0,     //单个记录最少好友数
      optrList: [],
    };

    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleAllTransfer = this.handleAllTransfer.bind(this);
  }

  fetch(optr_id) {
    //原客服下的运营好友统计数据
    queryOperCountByOptrId({optr_id}).then(({jsonResult}) =>{
      this.setState({
        sumFrdNum: jsonResult['friend_cnts'],
        minFrdNum: jsonResult['friend_cnt_min']
      })
    });

    queryOptrCountInfoByChannelId().then(({jsonResult}) =>{
      let optrList = [];
      if(jsonResult.length > 0) {
        for(let [index, optr] of jsonResult.entries()) {
          if(optr['optr_id'] == this.props.data['optr_id']) {
            jsonResult.splice(index, 1);
          } else {
            optr['optr_name'] = optr['optr_name'] + ` (当前${optr.operation_count}个运营微信号，共${optr.friend_cnts}人)`;
            optrList.push(optr);
          }
        }
        console.log('queryOptrCountInfoByChannelId: ', optrList);
        optrList = jsonResult;
      }
      this.setState({ optrList })
    });
  }

  handleInputChange(inputValue) {
    if(inputValue > 0 && this.friend_cnt != inputValue) {
      this.friend_cnt = inputValue;
      queryOperByOptrIdAndFrdCnt({
        optr_id: this.props.data['optr_id'],
        friend_cnt: inputValue
      }).then(({jsonResult}) =>{
        this.setState({
          opCount: jsonResult['operation_count'],
          opSumFrdNum: jsonResult['friend_cnts']
        })
      });
    }
  }

  handleOk() {
    this.props.form.validateFields( (errors, values) => {
      if(!!errors) return;
      console.log('values:', values);
      if(!values['friendsCount'] || values['friendsCount'] == 0) {
        Errors("移入人数应大于0");
        return;
      }
      Confirm(function(){
        transferKefuFriends(values).then(({jsonResult}) => {
          Success("转移成功");
          this.handleCancel();
          this.props.onRefreshTable();
        });
      }.bind(this), "确定转移好友吗？");
    });
  }

  handleCancel() {
    this.setState({opCount: 0, opSumFrdNum: 0, sumFrdNum: 0, minFrdNum: 0, optrList: []});
    this.props.form.resetFields();
    this.props.onResetState();
    this.refs.commonModal.hide();
  }

  handleAllTransfer() {
    this.props.form.setFieldsValue({
      friendsCount: this.state.sumFrdNum
    });
    this.handleInputChange(this.state.sumFrdNum)
  }

  componentWillReceiveProps(nextProps) {
    if(!this.refs.commonModal.isShow() && nextProps['type'] === 'MOVE') {
      this.refs.commonModal.show();
      this.fetch(nextProps.data['optr_id']);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(nextProps['type'] !== 'MOVE') {
      return false;
    }
    return PureRenderMixin.shouldComponentUpdate.apply(this, nextProps, nextState);
  }

  render() {
    console.log('TransferFrdsModal= > render => ', this.props);

    const getFieldDecorator = this.props.form.getFieldDecorator;
    const {optr_id, optr_name} = this.props.data;
    const { sumFrdNum, minFrdNum, opCount, opSumFrdNum, optrList } = this.state;

    return (
      <CommonModal ref="commonModal" title="移动客服好友" onOk={this.handleOk} onCancel={this.handleCancel}>
        <Form horizontal>
          {getFieldDecorator('from_optr_id',{
            initialValue: optr_id,
            rules:[{required: true, type:'number'}]
          })(<Input type="hidden"/>)}
          <FormItem labelCol={{span: 8}} wrapperCol={{span: 10}} label="原客服姓名" required>
            <p className="ant-form-text">{optr_name}</p>
          </FormItem>
          <FormItem labelCol={{span: 8}} wrapperCol={{span: 16}} label="目标客服" required>
            {getFieldDecorator('to_optr_id', {
              rules: [{type:'string', required: true, message: '请选择要转移的目标客服'}],
              onChange: this.handleChange
            })(
              <Select dropdownMenuStyle={{ maxHeight: 500, overflow: 'auto' }}
                  style={{ width: '100%' }} placeholder="请选择客服">
                  {
                    optrList.map(optr =>(
                      <Option key={optr['service_optr_id']}>{optr['optr_name']}</Option>
                    ))
                  }
              </Select>
            )}
          </FormItem>
          <FormItem labelCol={{ span:8 }} wrapperCol={{ span:16　}} label="移入人数" required>
            {getFieldDecorator('friendsCount',{
              rules: [{type:'number', required: true, message: '请输入转移人数'}],
              onChange: this.handleInputChange
            })(
              <InputNumber min={minFrdNum} max={sumFrdNum}
                  size="large" placeholder="请输入转移好友数" style={{ width: '40%' }}/>
            )}
            <span className="ant-form-text" style={{marginLeft: 8, marginRight:8 }}>人</span>
            <Button type="primary" onClick={this.handleAllTransfer} disabled={sumFrdNum == 0}>全部</Button>
          </FormItem>
          <FormItem wrapperCol={{ span:16, offset: 6 }}>
            <p className="ant-form-text" id="static" name="static" style={{ 'color':'red' }}>
              可移入最多{sumFrdNum}人，最少移入{minFrdNum}人
            </p>
          </FormItem>
          <FormItem labelCol={{ span: 8, offset: 2 }} label="实际将分配好友">
            <p className="ant-form-text" id="static" name="static">
              来自
              <span style={{ 'color':'red' }}>{opCount}</span>
              个运营微信号，共
              <span style={{ 'color':'red' }}>{opSumFrdNum}</span>人
            </p>
          </FormItem>
        </Form>
      </CommonModal>
    );
  }
}

export default Form.create()(TransferFrdsModal);
