import React,{Component} from 'react';
import {Form ,Icon,Select,Row,Col,Input,Button} from 'antd';
import CommonTable from '../Commons/CommonTable';
import ContentService from '../../services/content';
import AddContentModal from './AddContentModal';
import AuditShowPublishLibModal from './AuditShowPublishLibModal';
import DisableShowPublishLibModal from './DisableShowPublishLibModal';
import ReuseShowPublishLibModal from './ReuseShowPublishLibModal';
import {Confirm, Success,Errors} from '../Commons/CommonConstants';
const FormItem = Form.Item;
const Option= Select.Option;
/**
 * 内容库
 */
class ContentLibraryForm extends Component{
  constructor(props){
    super(props);
    this.state={
      addContentVisible:false,
      disableShowVisible:false,
      reuseShowVisible:false,
      applyResult:[],
      acopeResult:[],
      publishLibStatus:[],
      anchorList: [],
    };
    this.record='';
    this.onSubmit=this.onSubmit.bind(this);
    this.onAddContent=this.onAddContent.bind(this);
    this.onUpdateVisible=this.onUpdateVisible.bind(this);
    this.filterAnchorOption=this.filterAnchorOption.bind(this);
    this.disableShow=this.disableShow.bind(this);
    this.reuseShow=this.reuseShow.bind(this);
  }
  onSubmit(e){
    e.preventDefault();
    //this.props.onSearch(this.props.form.getFieldsValue());
      this.props.form.validateFields((errors, values) => {
        this.props.onSearch(values);
      });
  }
  onUpdateVisible(){
    this.setState({addContentVisible:false,disableShowVisible:false,reuseShowVisible:false});
  }
  disableShow(){
     if(this.props.selectedRowKeys.length<=0){
       Errors("请选择内容库！");
       return;
     }
     this.setState({disableShowVisible:true});
  }
  reuseShow(){
    if(this.props.selectedRowKeys.length<=0){
      Errors("请选择内容库！");
      return;
    }
    this.setState({reuseShowVisible:true});
  }
  onAddContent(e){
    e.preventDefault();
    this.setState({addContentVisible:true});
  }
  onShowModal(){
    const {addContentVisible,disableShowVisible,reuseShowVisible}=this.state;
    if(addContentVisible === true){
      return <AddContentModal addContentVisible={addContentVisible} onUpdateVisible={this.onUpdateVisible} onRefresh={this.props.onRefresh}/>
    }else if(disableShowVisible===true){
      return <DisableShowPublishLibModal disableShowVisible={disableShowVisible} onUpdateVisible={this.onUpdateVisible} onRefresh={this.props.onRefresh}
      recordKeys={this.props.selectedRowKeys}/>
    }else if(reuseShowVisible===true){
      return <ReuseShowPublishLibModal reuseShowVisible={reuseShowVisible} onUpdateVisible={this.onUpdateVisible} onRefresh={this.props.onRefresh}
      recordKeys={this.props.selectedRowKeys}/>
    }
    return null;
  }
  componentDidMount(){
    ContentService.queryApply().then(({jsonResult})=>{
      this.setState({applyResult:jsonResult});
    });
    ContentService.queryScope().then(({jsonResult})=>{
      this.setState({acopeResult:jsonResult});
    });
    ContentService.queryPublishLibStatus().then(({jsonResult})=>{
      this.setState({publishLibStatus:jsonResult});
    });
    ContentService.queryAnchorToAd().then(({jsonResult}) => {
      if(jsonResult.length > 0) {
        this.setState({
          anchorList: jsonResult
        });
      }
    });
  }
  filterAnchorOption(input, option){
    if(!input) return true;
    const inputValue = input.toLowerCase();
    const {value, children} = option.props;
    return value.toLowerCase() == inputValue || children.toLowerCase().indexOf(inputValue) >= 0;
  }
  render(){
    const {getFieldDecorator} = this.props.form;
    const formItemLayout={
      labelCol:{span:8},
      wrapperCol:{span:16}
    };
    const {anchorList,publishLibStatus,applyResult}=this.state;
    return(
      <div>
        {this.onShowModal()}
      <Form onSubmit={this.onSubmit} horizontal className="ant-advanced-search-form">
        <Row gutter={16}>
          <Col span={8}>
            <FormItem label="内容" {...formItemLayout}>
              {getFieldDecorator("text_content",{initialValue:''})(
                <Input/>
              )}
            </FormItem>
            <FormItem label="种类" {...formItemLayout}>
              {getFieldDecorator("apply",{initialValue:''})(
                <Select  allowClear>
                  {
                    applyResult.map((item, idx)=> <Option key={idx}
                                                                   value={`${item.item_value}`}>{item.item_name}</Option>)
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="标题" {...formItemLayout}>
              {getFieldDecorator("title",{initialValue:''})(
                <Input/>
              )}
            </FormItem>
            <FormItem label="主播" {...formItemLayout}>
              {getFieldDecorator("anchor_id",{initialValue:''})(
                <Select
                  optionFilterProp="children"
                  showSearch
                  allowClear
                  filterOption={this.filterAnchorOption}
                   >
                  {
                    anchorList.map(anchor => (
                      <Option value={anchor.anchor_id}>{anchor.anchor_name}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="状态" {...formItemLayout}>
              {getFieldDecorator("status",{initialValue:''})(
                <Select  allowClear>
                  {
                    publishLibStatus.map((item, idx)=> <Option key={idx}
                                                                   value={`${item.item_value}`}>{item.item_name}</Option>)
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label="通用" {...formItemLayout}>
              {getFieldDecorator("scope",{initialValue:''})(
                <Select>
                  <Option value="T">是</Option>
                  <Option value="F">否</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <FormItem label="内容组" {...formItemLayout}>
              {getFieldDecorator("content_group",{initialValue:''})(
                <Input/>
              )}
            </FormItem>
          </Col>
          <Col span={8} offset={8} >
            <FormItem style={{ float: 'right' }}>
            <Button  key="search" icon="search" type="primary" htmlType="submit">搜索</Button>
            <Button  type="primary"  htmlType="button" onClick={this.onAddContent}>增加</Button>
            <Button  type="primary"  htmlType="button" onClick={this.disableShow}>批量作废</Button>
            <Button  type="primary"  htmlType="button" onClick={this.reuseShow}>批量重用</Button>
            </FormItem>
         </Col>
        </Row>
      </Form>
      </div>
    );
  }
}
ContentLibraryForm=Form.create()(ContentLibraryForm);

export default class ContentLibrary extends Component{
  constructor(props){
    super(props);
    this.state={
      selectedRowKeys:[],
      selectedRows:[],
      auditShowPublishLiVisible:false,
      record:{},
    }
    this.columns=[
      {title: '文本', dataIndex: 'text_content',render: (text, record) => (
        <span style={{display:'inline-block',width:135,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{text}</span>
      )},
      {title: '标题', dataIndex: 'title', render: (text, record) => (
        <span style={{display:'inline-block',width:135,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{text}</span>
      )},
      {title: '状态', dataIndex: 'status_text', width: 120},
      {title: '应用类别', dataIndex: 'apply_name', width: 80},
      {title: '主播', dataIndex: 'anchor_name', width: 80},
      {title: '通用', dataIndex: 'scope_text', width: 80},
      {title: '内容组', dataIndex: 'content_group', width: 80},
      {title: '创建人', dataIndex: 'create_optr_name', width: 120},
      {title: '创建时间', dataIndex: 'create_time', width: 150},
      {title: '审核人', dataIndex: 'audit_optr_name', width: 80},
      {title: '审核时间', dataIndex: 'audit_time', width: 80},
      {title: '累计使用次数', dataIndex: 'publish_deadline_total', width: 120},
      {title: '已使用次数', dataIndex: 'published_cnt', width: 120},
      {title: '操作', fixed: 'right', width: 150,render: (text, record) => (
        <span>
          <a href="javascript:void(0)" onClick={this.onAuditShow.bind(this,record)}>详情</a>
          <span className="ant-divider" />
          {
            record.is_disable==='T'?
            <span>
              <a href="javascript:void(0)" onClick={this.disableShowPublishLib.bind(this,record)}>作废</a>
              <span className="ant-divider" />
            </span>
            :null
          }
          {
            record.is_reuse==='T'?
            <a href="javascript:void(0)" onClick={this.reuseShowPublishLib.bind(this,record)}>重用</a>
            :null
          }
        </span>
      )}
    ];
    this.onSearch=this.onSearch.bind(this);
    this.onSetVisible=this.onSetVisible.bind(this);
    this.handleRefresh=this.handleRefresh.bind(this);
  }
  onSearch(params){
    this.refs.commonTable.queryTableData(params);
    this.setState({selectedRowKeys:[]});
  }
  handleRefresh(){
    this.refs.commonTable.refreshTable();
    this.setState({selectedRowKeys:[]});
  }
  onSetVisible(){
    this.setState({auditShowPublishLiVisible:false});
  }
  onAuditShow(record){
    this.setState({auditShowPublishLiVisible:true,record})
  }
  disableShowPublishLib(record){
    Confirm(function(){
      let record_ids=[];
      record_ids.push(record.record_id);
      ContentService.disableShowPublishLib({record_ids:record_ids}).then(({jsonResult})=>{
        Success("提交成功!");
        record_ids=[];
        this.refs.commonTable.refreshTable();
      });
    }.bind(this), "确定作废提交吗?");
  }
  reuseShowPublishLib(record){
    Confirm(function(){
      ContentService.reuseShowPublishLib({record_id:record.record_id}).then(({jsonResult})=>{
        Success("提交成功!");
        this.refs.commonTable.refreshTable();
      });
    }.bind(this), "确定重用提交吗?");
  }
  operationModal(){
    const {auditShowPublishLiVisible,record}=this.state;
    if(auditShowPublishLiVisible===true){
      return <AuditShowPublishLibModal auditShowPublishLiVisible={auditShowPublishLiVisible} onSetVisible={this.onSetVisible}
      record={record} onRefreshAudit={this.handleRefresh}/>
    }
    return null;
  }
  //所有选中行记录集合
  handleRowChange(selectedRowKeys, selectedRows) {
        this.setState({selectedRowKeys,selectedRows});
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  }
 render(){
   const {selectedRowKeys}=this.state;
   return(
     <div>
      <ContentLibraryForm ref={obj => this._contentLibraryForm=obj} onSearch={this.onSearch} onRefresh={this.handleRefresh} selectedRowKeys={selectedRowKeys}/>
      <CommonTable
        rowSelection = {{
          selectedRowKeys,
          onChange: this.handleRowChange.bind(this),
        }}
        ref="commonTable"
        columns={this.columns}
        rowKey="record_id"
        fetchTableDataMethod={ContentService.queryShowPublishLibList}
        scroll={{x: 1600}}
      />
      {this.operationModal()}
     </div>
   );
 }

}
