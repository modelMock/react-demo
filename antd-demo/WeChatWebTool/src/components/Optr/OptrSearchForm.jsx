/*客服列表中搜索表单*/
import React, { Component, PropTypes} from 'react';
import {Form, Input, Select, Button, Row, Col} from 'antd';
import {Success, Confirm,Errors} from '../Commons/CommonConstants';
import CommonSelect from '../Commons/CommonSelect';
import {querySelectedParty,queryClusterBusinessOperator,queryClusterReferrerConfig} from '../../services/optr';
import SetOptrSelectedParty from './SetOptrSelectedParty'
import OptrBusinessOperatorModal from './OptrBusinessOperatorModal'
import ClusterReferrerConfigModal from './ClusterReferrerConfigModal'
const FormItem = Form.Item;
const Option = Select.Option;

class OptrSearchForm extends Component {

  static propTyps = {
    activedBtnIds: PropTypes.array,
    onSearchData: PropTypes.func.isRequired,
    form: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.state={
      record:[],
      selectedPartyVisible:false,
      businessOperatorVisible:false,
      clusterReferrerConfigVisible:false,
      optrBusinessOperator:[],//运营方数据
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.onSelectedParty=this.onSelectedParty.bind(this);
    this.onUpdateVisible=this.onUpdateVisible.bind(this);
    this.onOptrBusinessOperator=this.onOptrBusinessOperator.bind(this);
    this.onClusterReferrerConfig=this.onClusterReferrerConfig.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSearchData( this.props.form.getFieldsValue() );
  }

  handleAdd(e) {
    e.preventDefault();
    this.props.onAddModal();
  }
  onUpdateVisible(){
    this.setState({selectedPartyVisible:false,businessOperatorVisible:false,clusterReferrerConfigVisible:false});
  }
  //设置选品方弹出框
  onSelectedParty(e){
    e.preventDefault();
    if(typeof(this.props.optrRowsDetails)=="undefined"||this.props.optrRowsDetails.length<=0){
      Errors("请选择客服!");
      return;
    }
    this.setState({selectedPartyVisible:true})

  }
  //设置运营方
  onOptrBusinessOperator(e){
    e.preventDefault();
    if(typeof(this.props.optrRowsDetails)=="undefined"||this.props.optrRowsDetails.length<=0){
      Errors("请选择客服!");
      return;
    }
    this.setState({businessOperatorVisible:true})
  }
  //群客服自动配置
  onClusterReferrerConfig(e){
    e.preventDefault();
    this.setState({clusterReferrerConfigVisible:true});
  }
  renderSelectModal(){
    const {selectedPartyVisible,businessOperatorVisible,clusterReferrerConfigVisible} = this.state;
    if(selectedPartyVisible === true){
      return <SetOptrSelectedParty selectedPartyVisible={selectedPartyVisible} onUpdateVisible={this.onUpdateVisible}
        optrId={this.props.optrId} optrRowsDetails={this.props.optrRowsDetails} onRefreshTable={this.props.onRefreshTable}/>
    }else if(businessOperatorVisible === true){
      return <OptrBusinessOperatorModal businessOperatorVisible={businessOperatorVisible} updateVisible={this.onUpdateVisible}
         clusterSns={this.props.optrId} businessOperatorDetails={this.props.optrRowsDetails} onRefresh={this.props.onRefreshTable} />
    }else if(clusterReferrerConfigVisible === true){
      return <ClusterReferrerConfigModal clusterReferrerConfigVisible={clusterReferrerConfigVisible}
        updateVisible={this.onUpdateVisible} onRefresh={this.props.onRefreshTable} />
    }
    return null;
  }
  componentDidMount(){
    querySelectedParty().then(({jsonResult})=> {
        if(!jsonResult) return;
        this.setState({
        record: jsonResult
      });
    });
    //查询运营方
    queryClusterBusinessOperator().then(({jsonResult})=> {
        if(!jsonResult) return;
        this.setState({
        optrBusinessOperator: jsonResult
      });
    });
  }

  render() {
    console.log("OptrSearchForm => render");
    const getFieldDecorator = this.props.form.getFieldDecorator;
    //新增渠道按钮是否显示
    const btnStyle = this.props.activedBtnIds.indexOf("12-1") >= 0 ? {} : {display: 'none'};
    const btnSelectedParty = this.props.activedBtnIds.indexOf("12-6") >= 0 ? {} : {display: 'none'};
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
   const {record}=this.state;
    return (
      <div>
        {this.renderSelectModal()}
      <Form horizontal onSubmit={ this.handleSubmit } className="ant-advanced-search-form">
        <Row gutter={16}>
          <Col sm={8}>
            <FormItem label="客服号" {...formItemLayout}>
              {getFieldDecorator('login_account')(<Input placeholder="请输入客服号" />)}
            </FormItem>
            <FormItem label="客服名称" {...formItemLayout}>
              {getFieldDecorator('optr_name')(<Input placeholder="请输入客服名称" />)}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="客服状态"  {...formItemLayout}>
              <CommonSelect placeholder="请选择客服状态" item_key="Status" getFieldDecorator={getFieldDecorator('status')} />
            </FormItem>
            <FormItem label="客服分组"  {...formItemLayout}>
              {getFieldDecorator('selected_party',{initialValue:''})(
                <Select placeholder="请选择客服分组">
                  <Option value="">全部</Option>
                  {
                    record.map((item, idx)=> <Option key={idx}
                                                 value={item.item_value}>{item.item_name}</Option>)
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="好友总数"  {...formItemLayout}>
              {getFieldDecorator('sort_type')(
                <Select placeholder="请选择好友总数">
                  <Option value="1">全部</Option>
                  <Option value="2">多到少</Option>
                  <Option value="3">少到多</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="渠道名称" {...formItemLayout}>
              {getFieldDecorator('channel_name')(<Input placeholder="请输入渠道名称" />)}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="运营方" {...formItemLayout}>
              {getFieldDecorator("business_operator")(
                <Select allowClear placeholder="请选择运营方">
                  <Option value="">全部</Option>
                  {
                    this.state.optrBusinessOperator.map((item, idx)=> <Option key={idx}
                                                                   value={`${item.item_value}`}>{item.item_name}</Option>)
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="备注" {...formItemLayout}>
              {getFieldDecorator('remark')(<Input placeholder="请输入备注" />)}
            </FormItem>
          </Col>
          <Col offset={8} sm={16} style={{ textAlign: 'right' }}>
            <Button type="ghost" icon="plus" size="large" onClick={ this.handleAdd } style={ btnStyle }>添加客服</Button>
            <Button type="primary" icon="search" size="large" htmlType="submit">搜索</Button>
            <Button type="primary" icon="search" size="large" onClick={this.onSelectedParty} style={ btnSelectedParty }>设置选品方</Button>
            <Button type="primary" icon="search" size="large" onClick={this.onOptrBusinessOperator} style={ btnSelectedParty }>设置运营方</Button>
            <Button type="primary" icon="search" size="large" onClick={this.onClusterReferrerConfig} style={ btnSelectedParty }>群客服自动配置</Button>
          </Col>
        </Row>
      </Form>
    </div>
    );
  }
}

export default Form.create()(OptrSearchForm);
