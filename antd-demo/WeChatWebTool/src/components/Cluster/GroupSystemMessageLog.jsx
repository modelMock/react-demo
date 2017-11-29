import React from 'react';
import { Form, Row, Col, Input, Select, Button, Table, Tag,Modal } from 'antd';
import {queryClusterSysNote} from '../../services/cluster';
import CommonTable from '../Commons/CommonTable';
import {Errors} from '../Commons/CommonConstants';
import {Confirm, Success} from '../Commons/CommonConstants';
const FormItem = Form.Item;
const Option = Select.Option;

class GroupSystemMessageLogForm extends React.Component{
  constructor(props){
      super(props);
      this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(event){
    event.preventDefault();

    if(this.props.form.getFieldsValue().cluster_id.trim()==null||this.props.form.getFieldsValue().cluster_id.trim()==''){
        Errors("群ID不能为空！");
        return;
    }
    this.props.onSearch(this.props.form.getFieldsValue());

  }
  render(){
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const formItemLayout = {
        labelCol: {span: 8},
        wrapperCol: {span: 16},
    };
     return(
        <Form horizontal onSubmit={this.handleSubmit} className="ant-advanced-search-form">
               <Row gutter={16}>
                  <Col span={6}>
                     <FormItem label="群ID" {...formItemLayout}>
                       {getFieldDecorator("cluster_id",{
                         initialValue:''
                       })(
                        <Input />
                       )}
                     </FormItem>
                  </Col>
                  <Col span={6}>
                    <FormItem label="系统消息" {...formItemLayout}>
                      {getFieldDecorator("search_info",{
                        initialValue:''
                      })(
                       <Input />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={6}>
                       <Button type="primary" key="search" htmlType="submit">搜索</Button>
                  </Col>
               </Row>

        </Form>

     );

  }

}
GroupSystemMessageLogForm=Form.create()(GroupSystemMessageLogForm);


export default class GroupSystemMessageLog extends React.Component{
  constructor(props){
      super(props);
      this.columns=[
        {title: '时间', dataIndex: 'chat_time', width: 60},
        {title: '群ID', dataIndex: 'cluster_id', width: 60},
        {title: '系统消息', dataIndex: 'chat_content',width: 130}
      ];
      this.handleSearch=this.handleSearch.bind(this);
  }
  handleSearch(params){
     this.refs.commonTable.queryTableData(params)
  }
  render(){
       return(
         <div>
         <GroupSystemMessageLogForm onSearch={this.handleSearch}/>
         <CommonTable
           fetchTableDataMethod={queryClusterSysNote}
           ref="commonTable"
           columns={this.columns}
           rowKey="cluster_sn"
           scroll={{x: 1200}} />
        </div>
       );

  }
}
