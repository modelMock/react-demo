/**
 *公会工资结算
 * @author 谭亮红
 */
import React, {Component} from 'react';
import {Form, Row, Col, Input, Button, Select, DatePicker,Tabs } from 'antd';
import GuildAwaitSettlement from './GuildAwaitSettlement';
import GuildAlreadySettlement from './GuildAlreadySettlement';

const FormItem = Form.Item;
const Option = Select.Option;
const {RangePicker} = DatePicker;
const TabPane = Tabs.TabPane;

class SalaryGuildWages extends Component{
  constructor(props){
    super(props);
    this.state={
      activeKey:'1',
    }
    //需要判断权限的btn集合
    this.btnResList = props.location.state ? props.location.state.btnResList||[] : [];
  }
  //切换Tabs
  onChange = (activeKey) => {
    this.setState({ activeKey });
  }
  render(){
    const {activeKey}=this.state;
    return (
      <Tabs activeKey={ activeKey } type="card" onChange={this.onChange}>
        <TabPane tab="待结算" key="1">
          <GuildAwaitSettlement/>
        </TabPane>
        <TabPane tab="已结算" key="2">
          <GuildAlreadySettlement btnResList={this.btnResList}/>
        </TabPane>
      </Tabs>
    )
  }
}
export default SalaryGuildWages;