import React, {Component} from 'react';
import {Form, Tabs, Input, Button} from 'antd';
import TablePanel from "../../commons/widgets/TablePanel";
import ActiveTabsPanel from "../../commons/widgets/ActiveTabsPanel";
import ActiveTablePanel from "../../commons/widgets/ActiveTablePanel";

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

class SearchForm extends Component {
  render(){
    const {form, onSearch} = this.props;
    const {getFieldDecorator} = form;
    return (
      <Form>
        <FormItem label="用户ID">
          {getFieldDecorator('userId', {
            rules: [{
              required: true, message: '请输入用户ID'
            }]
          })(<Input />)}
        </FormItem>
        <FormItem label="年龄">
          {getFieldDecorator('age')(<Input />)}
        </FormItem>
        <Button onClick={onSearch}>搜索</Button>
      </Form>
    )
  }
}
SearchForm = Form.create()(SearchForm)

class CustomComp1 extends ActiveTabsPanel{
  constructor(props){
    super(props);
    this.state = {
      num: 1
    }
  }
  activedPanel(params){
    console.log("第一个tabs", params)
  }
  render(){
    const num = this.state.num
    return (
      <div>
        <Button onClick={() => this.setState({num: num+1})}>第{num}次</Button>
      </div>
    )
  }
}

class CustomComp2 extends ActiveTablePanel{
  constructor(props){
    super(props)
  }
  doSearch(params, successFn, failFn){
    console.log("第二个", params)
  }
  render(){
    return (
      <div>{this.renderTable()}</div>
    )
  }
}

export default class TabsTest extends Component {
  constructor(props){
    super(props);
    this.state = {
      activeKey: '2',
      formValues: {},
    }
  }
  componentDidMount(){
    console.log(this.props)
  }
  doSearch = (e) => {
    e && e.stopPropagation();
    this.searchForm.validateFields((err, values) => {
      if(!!err) return
      this.setState({
        formValues: values
      })
    });
  }
  handleChange = (activeKey) => {
    this.setState({ activeKey });
  }
  canQuery = () => {
    return !!this.state.formValues['userId']
  }
  render(){
    const {activeKey, formValues} = this.state
    return [
      <SearchForm key='1' ref={form => this.searchForm=form} onSearch={this.doSearch}/>,
      <Tabs key='2' type="card" activeKey={activeKey} onChange={this.handleChange}>
        <TabPane tab="组件1" key="1">
          <CustomComp1 isActived={activeKey === '1'} formValues={formValues} canQuery={this.canQuery}/>
        </TabPane>
        <TabPane tab="组件2" key="2">
          <CustomComp2  isActived={activeKey === '2'} formValues={formValues} canQuery={this.canQuery}/>
        </TabPane>
      </Tabs>
    ]
  }
}