import React,{Component} from 'react';
import {Form ,Icon,Select,Row,Col,Input,Button} from 'antd';
import CommonTable from '../Commons/CommonTable';
import ContentService from '../../services/content';
import {Confirm, Success,Errors} from '../Commons/CommonConstants';
import AddWeChatFriCirColleModal from './AddWeChatFriCirColleModal';
const FormItem = Form.Item;
const Option= Select.Option;
/**
 * 微信号朋友圈采集
 */

class ContentWeChatFriCirColleForm extends Component{
  constructor(props){
    super(props);
    this.state={
      weChatFriCirColleVisible:false,
      anchorList: [],
    };
    this.onSubmit=this.onSubmit.bind(this);
    this.onUpdateVisible=this.onUpdateVisible.bind(this);
    this.onAddWeChatFriCir=this.onAddWeChatFriCir.bind(this);
    this.filterAnchorOption=this.filterAnchorOption.bind(this);
  }

  onSubmit(e){
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      this.props.onSearch(values);
    });
  }

  onAddWeChatFriCir(e){
    e.preventDefault();
    this.props.form.resetFields();
    this.setState({weChatFriCirColleVisible:true});
  }

  onUpdateVisible(){
    this.setState({weChatFriCirColleVisible:false});
  }

  onShowModal(){
    const {weChatFriCirColleVisible}=this.state;
    if(weChatFriCirColleVisible === true){
      return <AddWeChatFriCirColleModal weChatFriCirColleVisible={weChatFriCirColleVisible} onUpdateVisible={this.onUpdateVisible}
        onRefresh={this.props.onRefresh} />
    }
    return null;
  }

  filterAnchorOption(input, option){
    if(!input) return true;
    const inputValue = input.toLowerCase();
    const {value, children} = option.props;
    return value.toLowerCase() == inputValue || children.toLowerCase().indexOf(inputValue) >= 0;
  }

  componentDidMount(){
    ContentService.queryAnchorToAd().then(({jsonResult}) => {
      if(jsonResult.length > 0) {
        this.setState({
          anchorList: jsonResult
        });
      }
    });
  }

  render(){
    const {getFieldDecorator}=this.props.form;
    const formItemLayout={
      labelCol:{span:8},
      wrapperCol:{span:16}
    };
    const {anchorList}=this.state;
    return(
      <div>
        {this.onShowModal()}
      <Form  horizontal onSubmit={this.onSubmit} className="ant-advanced-search-form">
        <Row gutter={16}>
          <Col span={8}>
            <FormItem label="主播" {...formItemLayout}>
              {getFieldDecorator("anchor_id")(
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
            <FormItem label="微信号" {...formItemLayout}>
              {getFieldDecorator("wechat_account",{initialValue:''})(
                <Input/>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <Button  key="search" icon="search" type="primary" htmlType="submit">搜索</Button>
            <Button  type="primary"  htmlType="button" onClick={this.onAddWeChatFriCir}>增加</Button>
         </Col>
        </Row>
      </Form>
    </div>
    );
  }
}
ContentWeChatFriCirColleForm=Form.create()(ContentWeChatFriCirColleForm)

export default class ContentWeChatFriCirColle extends Component{
  constructor(props){
    super(props);
    this.state={
      selectedRowKeys:[],
      selectedRows:[],
    };
    this.columns=[
      {title:'主播',dataIndex:'anchor_name',width:120},
      {title:'微信号',dataIndex:'wechat_account',width:120},
      {title:'状态',dataIndex:'status_text',width:120},
      {title:'创建时间',dataIndex:'create_time',width:120},
      {title:'失败次数',dataIndex:'pickup_failure_cnt',width:120},
      {title:'上次采集时间',dataIndex:'last_pickup_time',width:120},
      {title:'上次采集失败原因',dataIndex:'last_pickup_failure',width:120},
      {title:'备注',dataIndex:'remark',width:120},
    ];
    this.onSearch=this.onSearch.bind(this);
    this.handleRefresh=this.handleRefresh.bind(this);
  }
  onSearch(params){
    this.refs.commonTable.queryTableData(params);
    this.setState({selectedRowKeys:[]});
  }
  handleRefresh(){
    this.refs.commonTable.queryTableData({});
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
        <ContentWeChatFriCirColleForm onSearch={this.onSearch} onRefresh={this.handleRefresh}/>
        <CommonTable
          rowSelection = {{
            selectedRowKeys,
            onChange: this.handleRowChange.bind(this),
          }}
          ref="commonTable"
          columns={this.columns}
          rowKey="cluster_sn"
          fetchTableDataMethod={ContentService.getShowPublishPickupConfigList}
          scroll={{x: 900}}
        />
      </div>
    );
  }
}
