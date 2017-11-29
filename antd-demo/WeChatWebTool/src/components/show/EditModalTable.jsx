import React from 'react';
import { Form, Row, Col, Icon,Input, Select, Button, Table, Tag,Modal,InputNumber,DatePicker,Popconfirm } from 'antd';
import {queryMassSceneList,queryMassReplyList,initReplyEdit,saveReplyEdit} from '../../services/showAnchor';
const FormItem = Form.Item;
const Option = Select.Option;
/**
 * 话术编辑弹出框 可编辑Table
 */

class EditableCell extends React.Component {
  state = {
    value: this.props.value,
    editable: false,
  }
  handleChange = (e) => {
    const value = e.target.value;
    if (this.props.onChange) {
      console.log("value2=>",value);
      this.props.onChange(value);
    }
    this.setState({ value });
  }
  check = () => {
    this.setState({ editable: false });
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  }
  edit = () => {
    this.setState({ editable: true });
  }
  render() {
    const { value, editable } = this.state;
    return (
      <div className="editable-cell">
            <div className="editable-cell-input-wrapper">
              <Input
                style={{ width: this.props.width }}
                value={value}
                onChange={this.handleChange}
              />
            </div>
      </div>
    );
  }
}

export default class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.columns = [{
      title: '索引',
      dataIndex: 'reply_idx',
      width: 50,
      render: (text, record, index) => (
        <EditableCell
          value={text}
          onChange={this.onCellChange(index, 'reply_idx')}
        />
      ),
    }, {
      title: '触发方式',
      dataIndex: 'trigger_type',
      width:100,
      render: (text, record, index) =>{
        return (
          text?
          <Select
            allowClear
            defaultValue={`${text}`}
            onChange={this.onSeletChange(index, 'trigger_type')}
            >
            <Option value="">无</Option>
            {
              this.props.tableRecord.triggerTypeList.map((item, idx)=> <Option key={idx}
                                                             value={`${item.item_value}`}>{item.item_name}</Option>)
            }
          </Select>
          :
          <Select
            allowClear
            onChange={this.onSeletChange(index, 'trigger_type')}
            >
            <Option value="">无</Option>
            {
              this.props.tableRecord.triggerTypeList.map((item, idx)=> <Option key={idx}
                                                             value={`${item.item_value}`}>{item.item_name}</Option>)
            }
          </Select>
        )
      } ,
    }, {
      title: '未触发文本',
      dataIndex: 'untrigger_content',
      width:180,
      render: (text, record, index) => (
        <EditableCell
          value={text}
          onChange={this.onCellChange(index, 'untrigger_content')}
        />
      ),
    },{
       title: '句0规则',
       dataIndex: 'chat_rule_id',
       width: 150,
       render: (text, record, index) => {
         return (
           text?
           <Select
             allowClear
             defaultValue={`${text}`}
             onChange={this.onSeletChange(index, 'chat_rule_id')}
             >
             {
               this.props.tableRecord.chatRuleList.map((item, idx)=> <Option key={idx}
                                                              value={`${item.item_value}`}>{item.item_name}</Option>)
             }
           </Select>
           :
           <Select
             allowClear
             onChange={this.onSeletChange(index, 'chat_rule_id')}
             >
             {
               this.props.tableRecord.chatRuleList.map((item, idx)=> <Option key={idx}
                                                              value={`${item.item_value}`}>{item.item_name}</Option>)
             }
           </Select>
         )},
     },{
        title: '句0类型',
        dataIndex: 'chat_type',
        width: 100,
        render: (text, record, index) =>{
          return (
            text?
            <Select
              allowClear
              defaultValue={`${text}`}
              onChange={this.onSeletChange(index, 'chat_type')}
              >
              {
                this.props.tableRecord.chatTypeList.map((item, idx)=> <Option key={idx}
                                                               value={`${item.item_value}`}>{item.item_name}</Option>)
              }
            </Select>
            :
            <Select
              allowClear
              onChange={this.onSeletChange(index, 'chat_type')}
              >
              {
                this.props.tableRecord.chatTypeList.map((item, idx)=> <Option key={idx}
                                                               value={`${item.item_value}`}>{item.item_name}</Option>)
              }
            </Select>
          )
        },
      },{
       title: '句0内容',
       dataIndex: 'chat_content',
       width: 300,
       render: (text, record, index) => (
         <EditableCell
           value={text}
           defaultValue={`${text}`}
           onChange={this.onCellChange(index, 'chat_content')}
         />
       ),
     },{
        title: '句1规则',
        dataIndex: 'chat_rule_id1',
        width: 150,
        render: (text, record, index) => {
          return (
            text?
            <Select
              allowClear
              defaultValue={`${text}`}
              onChange={this.onSeletChange(index, 'chat_rule_id1')}
              >
              {
                this.props.tableRecord.chatRuleList.map((item, idx)=> <Option key={idx}
                                                               value={`${item.item_value}`}>{item.item_name}</Option>)
              }
            </Select>
            :
            <Select
              allowClear
              onChange={this.onSeletChange(index, 'chat_rule_id1')}
              >
              {
                this.props.tableRecord.chatRuleList.map((item, idx)=> <Option key={idx}
                                                               value={`${item.item_value}`}>{item.item_name}</Option>)
              }
            </Select>
          )
        },
      },{
         title: '句1类型',
         dataIndex: 'chat_type1',
         width:100,
         render: (text, record, index) => {
           return (
             text?
             <Select
               allowClear
               defaultValue={`${text}`}
               onChange={this.onSeletChange(index, 'chat_type1')}
               >
               {
                 this.props.tableRecord.chatTypeList.map((item, idx)=> <Option key={idx}
                                                                value={`${item.item_value}`}>{item.item_name}</Option>)
               }
             </Select>
             :
             <Select
               allowClear
               onChange={this.onSeletChange(index, 'chat_type1')}
               >
               {
                 this.props.tableRecord.chatTypeList.map((item, idx)=> <Option key={idx}
                                                                value={`${item.item_value}`}>{item.item_name}</Option>)
               }
             </Select>
           )
         },
       },{
        title: '句1内容',
        dataIndex: 'chat_content1',
        width:180,
        render: (text, record, index) => (
          <EditableCell
            value={text}
            onChange={this.onCellChange(index, 'chat_content1')}
          />
        ),
      },{
         title: '句2规则',
         dataIndex: 'chat_rule_id2',
         width: 150,
         render: (text, record, index) =>{
           return (
             text?
            <Select
              allowClear
              defaultValue={`${text}`}
              onChange={this.onSeletChange(index, 'chat_rule_id2')}
              >
              {
                this.props.tableRecord.chatRuleList.map((item, idx)=> <Option key={idx}
                                                               value={`${item.item_value}`}>{item.item_name}</Option>)
              }
            </Select>
            :
            <Select
              allowClear
              onChange={this.onSeletChange(index, 'chat_rule_id2')}
              >
              {
                this.props.tableRecord.chatRuleList.map((item, idx)=> <Option key={idx}
                                                               value={`${item.item_value}`}>{item.item_name}</Option>)
              }
            </Select>
          )
         },
       },{
          title: '句2类型',
          dataIndex: 'chat_type2',
          width: 100,
          render: (text, record, index) =>{
            return (
              text?
             <Select
               allowClear
               defaultValue={`${text}`}
               onChange={this.onSeletChange(index, 'chat_type2')}
               >
               {
                 this.props.tableRecord.chatTypeList.map((item, idx)=> <Option key={idx}
                                                                value={`${item.item_value}`}>{item.item_name}</Option>)
               }
             </Select>
             :
             <Select
               allowClear
               onChange={this.onSeletChange(index, 'chat_type2')}
               >
               {
                 this.props.tableRecord.chatTypeList.map((item, idx)=> <Option key={idx}
                                                                value={`${item.item_value}`}>{item.item_name}</Option>)
               }
             </Select>
           )
          },
        },{
         title: '句2内容',
         dataIndex: 'chat_content2',
         width: 300,
         render: (text, record, index) => (
           <EditableCell
             value={text}
             onChange={this.onCellChange(index, 'chat_content2')}
           />
         ),
       },{
          title: '句3规则',
          dataIndex: 'chat_rule_id3',
          width: 150,
          render: (text, record, index) => {
            return (
              text?
              <Select
                allowClear
                defaultValue={`${text}`}
                onChange={this.onSeletChange(index, 'chat_rule_id3')}
                >
                {
                  this.props.tableRecord.chatRuleList.map((item, idx)=> <Option key={idx}
                                                                 value={`${item.item_value}`}>{item.item_name}</Option>)
                }
              </Select>
              :
              <Select
                allowClear
                onChange={this.onSeletChange(index, 'chat_rule_id3')}
                >
                {
                  this.props.tableRecord.chatRuleList.map((item, idx)=> <Option key={idx}
                                                                 value={`${item.item_value}`}>{item.item_name}</Option>)
                }
              </Select>
            )
          },
        },{
           title: '句3类型',
           dataIndex: 'chat_type3',
           width:100,
           render: (text, record, index) => {
             return (
               text?
               <Select
                 allowClear
                 defaultValue={`${text}`}
                 onChange={this.onSeletChange(index, 'chat_type3')}
                 >
                 {
                   this.props.tableRecord.chatTypeList.map((item, idx)=> <Option key={idx}
                                                                  value={`${item.item_value}`}>{item.item_name}</Option>)
                 }
               </Select>
               :
               <Select
                 allowClear
                 onChange={this.onSeletChange(index, 'chat_type3')}
                 >
                 {
                   this.props.tableRecord.chatTypeList.map((item, idx)=> <Option key={idx}
                                                                  value={`${item.item_value}`}>{item.item_name}</Option>)
                 }
               </Select>
             )
           },
         },{
          title: '句3内容',
          dataIndex: 'chat_content3',
          width: 300,
          render: (text, record, index) => (
            <EditableCell
              value={text}
              onChange={this.onCellChange(index, 'chat_content3')}
            />
          ),
        },{
          title: '操作',
          dataIndex: 'operation',
          width: 50,
          render: (text, record, index) => {
            return (
                <Popconfirm title="确定删除?" onConfirm={() => this.onDelete(index)}>
                  <a href="#">删除</a>
                </Popconfirm>
            );
          },
    }];
    this.state = {
      dataSource: [],
    };
  }
  onCellChange = (index, key) => {
    return (value) => {
      const dataSource = [...this.state.dataSource];
      dataSource[index][key] = value;
      this.setState({ dataSource });
    };
  }
  onSeletChange= (index, key) => {
    return (value) => {
      const dataSource = [...this.state.dataSource];
      dataSource[index][key] = value;
      this.setState({ dataSource });
    };
  }
  onDelete = (index) => {
    const dataSource = [...this.state.dataSource];
    dataSource.splice(index, 1);
    this.setState({ dataSource });
  }
  handleAdd = () => {
    const {dataSource } = this.state;
    const newData = {
      reply_idx: '',
      trigger_type: '',
      untrigger_content: '',
      chat_rule_id: '',
      chat_type: '',
      chat_content: '',
      chat_rule_id1: '',
      chat_type1: '',
      chat_content1: '',
      chat_rule_id2: '',
      chat_type2: '',
      chat_content2: '',
      chat_rule_id3: '',
      chat_type3: '',
      chat_content3: '',
    };
    this.setState({
      dataSource: [...dataSource, newData],
    });
  }
  getDetails(){
    return this.state.dataSource;
  }
  componentDidMount(){
    this.setState({dataSource:this.props.tableRecord.details})
  }
  render() {
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 14}
    }
    const { dataSource } = this.state;
    console.log("dataSource",dataSource);
    const columns = this.columns;
    return (
      <div>
        <Row gutter={16} style={{marginTop:10,marginBottom:10}}>
            <Col sm={12}>
            <FormItem  {...formItemLayout}>
                <h3>套路明细列表(可编辑的表格)</h3>
            </FormItem>
          </Col>
          <Col sm={10} offset={2}>
            <FormItem  {...formItemLayout}>
              <Button className="editable-add-btn" type="primary" size="large" icon="plus" onClick={this.handleAdd}>增加</Button>
            </FormItem>
          </Col>
        </Row>
        <Table bordered dataSource={dataSource} columns={columns} scroll={{x: 3000,y:300}}/>
      </div>
    );
  }
}
