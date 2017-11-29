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

export default class TableTest extends TablePanel {
  constructor(props){
    super(props);
  }
  handleSearch = (e) => {
    e && e.stopPropagation();
    this.searchForm.validateFields((err, values) => {
      if(!!err) return
      this.doFormSearch(values);
    });
  }
  doSearch(params){
    console.log("开始请求后台数据", params)
  }
  tableTitle = (data) => {
    console.log(data)
    return '啊啊啊'
  }
  render(){
    return (
      <div>
        <SearchForm ref={form => this.searchForm=form} onSearch={this.handleSearch}/>
        {this.renderTable({title: this.tableTitle})}
      </div>
    )
  }
}