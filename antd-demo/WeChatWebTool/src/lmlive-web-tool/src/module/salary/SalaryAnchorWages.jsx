/**
 *主播工资结算
 * @author 谭亮红
 */
import React, {Component} from 'react';
import {Tabs} from 'antd';
import AwaitSettlement from './AnchorAwaitSettlement';
import AlreadySettlement from './AnchorAlreadySettlement';

const TabPane = Tabs.TabPane;

class SalaryAnchorWages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: '1',
    }
  }

  //切换Tabs
  onChange = (activeKey) => {
    this.setState({activeKey});
  }

  render() {
    const {activeKey} = this.state;
    return (
      <Tabs activeKey={activeKey} type="card" onChange={this.onChange}>
        <TabPane tab="待结算" key="1">
          <AwaitSettlement/>
        </TabPane>
        <TabPane tab="已结算" key="2">
          <AlreadySettlement/>
        </TabPane>
      </Tabs>
    )
  }
}

export default SalaryAnchorWages;