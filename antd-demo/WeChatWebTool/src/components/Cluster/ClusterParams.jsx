import React from 'react';
import {Form, InputNumber, Select, Button,Input} from 'antd';
import {queryClusterParams, saveClusterParams} from '../../services/cluster';
import {Confirm, Success} from '../Commons/CommonConstants';
const FormItem = Form.Item;
const Option = Select.Option;

class ClusterParams extends React.Component{
  constructor(props){
    super(props);
    this.state={
      configMap: {},
      operation_totals: 0,
      large_groups: 0,
      operation_friends: 0,
      small_groups: 0,
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }
  handleSubmit(e){
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if(!!errors) return;
      Confirm(function(){
        saveClusterParams(values).then(({jsonResult}) => {
          if(jsonResult.message=="success"){
              Success("提交成功");
          }

        });
      }.bind(this), "确定提交吗?")
    });
  }
  handleCancel(){
    this.props.form.resetFields();
  }
  componentDidMount(){
    queryClusterParams().then(({jsonResult}) => {
      console.log("ClusterParams",jsonResult);
      if(!!jsonResult){
        this.setState({configMap:jsonResult.configMap});
      }
    });
  }
  render(){
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 18},
    };
    const {getFieldDecorator} = this.props.form;
    const {configMap, operation_totals, large_groups, operation_friends, small_groups,outer_groups,cultivate_groups} = this.state;
    return (
      <Form horizontal onSubmit={this.handleSubmit}>
        <FormItem label="当前群数据" labelCol={{span:3}} wrappCol={{span:22}}>
          <p className="ant-form-text">
            自建大群数量{large_groups}个,  外部群数量{outer_groups}个；
            当前好友小群{small_groups}个，养号群数量{cultivate_groups}个。
          </p>
        </FormItem>
        <FormItem label="参与大群业务的运营组号" {...formItemLayout}>
          {getFieldDecorator("large_wechat_group_filter",{
            initialValue: configMap.large_wechat_group_filter
          })(
            <Input style={{width: 130}}/>
          )}
          <p className="ant-form-text" style={{marginLeft: 60}}>注：不同运营组号用“,”分隔，0表示无限制。</p>
        </FormItem>
        <FormItem label="每个运营号创建运营号大群" {...formItemLayout}>
          {getFieldDecorator("large_groups",{
            initialValue: configMap.large_groups
          })(
            <InputNumber min={1}/>
          )}
          <p className="ant-form-text" style={{marginLeft:10}}>个</p>
        </FormItem>
        <FormItem label="每个运营号成立群需拉的好友" {...formItemLayout}>
          {getFieldDecorator("large_create_friend_cnt",{
            initialValue: configMap.large_create_friend_cnt
          })(
            <InputNumber min={1}/>
          )}
          <p className="ant-form-text" style={{marginLeft: 10}}>个</p>
        </FormItem>
        <FormItem label="建群后拉一组进群的运营号数" {...formItemLayout}>
          {getFieldDecorator("large_groups_ops",{
            initialValue: configMap.large_groups_ops
          })(
            <InputNumber min={1}/>
          )}
          <p className="ant-form-text" style={{marginLeft:10}}>个</p>
          <p className="ant-form-text" style={{marginLeft: 64}}>注：80个运营号（含一个群主）为一组，关系不变。用于邀请好友进群迅速壮大群成员。</p>
        </FormItem>
        <FormItem label="同时存在的新群最大数量" {...formItemLayout}>
          {getFieldDecorator("group_invite_start_cnt",{
            initialValue: configMap.group_invite_start_cnt
          })(
            <InputNumber min={1}/>
          )}
              <p className="ant-form-text" style={{marginLeft:10}}>个</p>
          <p className="ant-form-text" style={{marginLeft: 64}}>注：小于该值时会创建新群</p>
        </FormItem>
        <FormItem label="相同运营号群成员邀请好友进群时间间隔" {...formItemLayout}>
          {getFieldDecorator("cluster_invite_interval",{
            initialValue: configMap.cluster_invite_interval
          })(
            <InputNumber min={1}/>
          )}
            <p className="ant-form-text" style={{marginLeft: 10}}>小时</p>
        </FormItem>
        <FormItem label="运营号上的好友新增" {...formItemLayout}>
          {getFieldDecorator("new_friend_delay_minutes",{
            initialValue: configMap.new_friend_delay_minutes
          })(
            <InputNumber min={1}/>
          )}
            <p className="ant-form-text" style={{marginLeft: 10}}>分钟后向其发起进群邀请</p>
        </FormItem>
        <FormItem label="邀请好友进群开启组设置" {...formItemLayout}>
          {getFieldDecorator("invite_group",{
            initialValue: configMap.invite_group
          })(
            <Input style={{width: 130}}/>
          )}
            <p className="ant-form-text" style={{marginLeft: 64}}>注：输入的组需是参与大群业务的运营组</p>
        </FormItem>
        <FormItem label="每个运营号每天最多邀请进群的非运营号好友个数" {...formItemLayout}>
          {getFieldDecorator("oper_invite_friend_cnt",{
            initialValue: configMap.oper_invite_friend_cnt
          })(
            <InputNumber min={1}/>
          )}
              <p className="ant-form-text" style={{marginLeft:10}}>个</p>
            <p className="ant-form-text" style={{marginLeft: 64}}>注：允许邀请进群的好友非任何群成员，非运营号，符合被邀请时间间隔且未被邀请过的优先被邀请</p>
        </FormItem>
        <FormItem label="非群成员的好友允许被二次邀请进群的时间间隔" {...formItemLayout}>
          {getFieldDecorator("oper_reinvite_interval",{
            initialValue: configMap.oper_reinvite_interval
          })(
            <InputNumber min={1}/>
          )}
              <p className="ant-form-text" style={{marginLeft:10}}>天</p>
            <p className="ant-form-text" style={{marginLeft: 64}}>注：二次邀请</p>
        </FormItem>
        <FormItem label="每个群停止自动邀请好友进群的非运营号群成员数" {...formItemLayout}>
          {getFieldDecorator("cluster_stop_invite_cnt",{
            initialValue: configMap.cluster_stop_invite_cnt
          })(
            <InputNumber min={1}/>
          )}
              <p className="ant-form-text" style={{marginLeft:10}}>人</p>
            <p className="ant-form-text" style={{marginLeft: 64}}>注：之后群成员流失可通过广告大群列表邀请好友进群</p>
        </FormItem>
        <FormItem label="已满且开启发广告的群中非运营号群成员数低于" {...formItemLayout}>
          {getFieldDecorator("cluster_resume_invite_cnt",{
            initialValue: configMap.cluster_resume_invite_cnt
          })(
            <InputNumber min={1}/>
          )}
          <p className="ant-form-text" style={{marginLeft: 64}}>人时，该群里的可用邀请号优先本群执行邀请好友进群至二次满群</p>
        </FormItem>
        <FormItem label="自动邀请停止后，每个群留存的正常运营号数" {...formItemLayout}>
          {getFieldDecorator("cluster_stop_reserve_oper",{
            initialValue: configMap.cluster_stop_reserve_oper
          })(
            <InputNumber min={1}/>
          )}
              <p className="ant-form-text" style={{marginLeft:10}}>个</p>
            <p className="ant-form-text" style={{marginLeft: 64}}>注：群符合停止自动邀请进群条件，就保留10个可用，群主如果可用的，则群主在10个可用中</p>
        </FormItem>
        <FormItem label="每个运营号创建好友小群含非运营号好友个数" {...formItemLayout}>
          {getFieldDecorator("small_groups_friends",{
            initialValue: configMap.small_groups_friends
          })(
            <InputNumber min={1}/>
          )}
              <p className="ant-form-text" style={{marginLeft:10}}>个</p>
            <p className="ant-form-text" style={{marginLeft: 64}}>注：小群不参与发广告业务</p>
        </FormItem>
        <FormItem label="相同运营号创建群延时范围" {...formItemLayout}>
          {getFieldDecorator("same_groups_delay_hours",{
            initialValue: configMap.same_groups_delay_hours
          })(
            <InputNumber min={0}/>
          )}
              <p className="ant-form-text" style={{marginLeft:10}}>小时</p>
          <p className="ant-form-text" style={{marginLeft: 64}}>注：0表示无时间限制</p>
        </FormItem>
        <FormItem label="创建群优先级" {...formItemLayout}>
          {getFieldDecorator("create_group_priority",{
            initialValue: configMap.create_group_priority
          })(
            <Select style={{width: 200}}>
              <Option value="LARGE">运营号大群优先</Option>
              <Option value="SMALL">好友小群优先</Option>
            </Select>
          )}
        </FormItem>
        <FormItem label="开启建群" {...formItemLayout}>
          {getFieldDecorator("open_group_type",{
            initialValue: configMap.open_group_type
          })(
            <Select style={{width: 200}}>
              <Option value="LARGE">只创建运营号大群</Option>
              <Option value="SMALL">只创建好友小群</Option>
              <Option value="ALL">创建运营号大群和好友小群</Option>
              <Option value="CLOSE">关闭</Option>
            </Select>
          )}
        </FormItem>
        <FormItem wrapperCol={{offset: 6, span: 6}}>
          <Button type="primary" icon="check" size="large" htmlType="submit">提交</Button>
          <Button icon="poweroff" size="large" onClick={this.handleCancel} style={{marginLeft: 16}}>重置</Button>
        </FormItem>
      </Form>
    );
  }
}
export default Form.create()(ClusterParams);
