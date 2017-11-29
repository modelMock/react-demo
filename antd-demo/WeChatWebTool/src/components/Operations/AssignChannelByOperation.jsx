/*按运营号分配渠道*/
import React, { Component, PropTypes} from 'react'
import { Form, Select, Input, Button, Row, Col, message, Tooltip, Popconfirm } from 'antd';
import { is, Map } from 'immutable';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import AssignSearchForm from './AssignSearchForm';
import AssignChannelByFriend from './AssignChannelByFriend';
import CommonTable from '../Commons/CommonTable';
import ChannelSelectField from './ChannelSelectField';
import { queryOperationForChannelIdIsNul, updateAssignChannel, updateOperation }  from '../../services/operations';
import OperationStatusRender from './OperationStatusRender';
import { Confirm, Success } from '../Commons/CommonConstants';
const FormItem = Form.Item;
const Option = Select.Option;

//选择确认表单
class SelectConfirmForm extends Component {

  static propsTypes = {
    selectedRowKeys: PropTypes.array,     //选中的运营号operation_sn集合
    friendsTotal: PropTypes.number,       //选中的运营号好友总数
    totalCount: PropTypes.number,         //表格中记录数
    searchObj: PropTypes.object,          //表格搜索参数对象
    onSubmitCallback: PropTypes.func      //提交后的回调清空表格数据
  }

  constructor(props) {
    super(props);
    this.state={
      isDisabledSingleBtn: true,    //选择提交按钮是否禁用
      isDisabledMulitBtn: true,     //所有提交按钮是否禁用
    }
    this.handleSelectiveSubmit = this.handleSelectiveSubmit.bind(this);
    this.handleAllSubmit = this.handleAllSubmit.bind(this);
  }

  //选择提交分配：按用户选中表格行
  handleSelectiveSubmit() {
    this.props.form.validateFields( (errors, values) => {
      if(!!errors) return;

      Confirm(function(){

        values['channel_id'] = values['channel_id']['key'];
        values['operationSnList'] = [].concat(this.props.selectedRowKeys);
        console.log('handleSelectiveSubmit => ', values);
        this.submitAssignOptr(values);

      }.bind(this), "确定要给表格中选中运营号数据分配当前渠道吗", "可选择单行或多行进行分配");

    });
  }

  //全部提交分配：按表格查询条件
  handleAllSubmit() {
    this.props.form.validateFields( (errors, values) => {
      if(!!errors) return;

      Confirm(function(){

        values['channel_id'] = values['channel_id']['key'];
        Object.assign(values, this.props.searchObj);
        this.submitAssignOptr(values);

      }.bind(this),
      `确定要给表格中所有运营号数据(共${this.props.totalCount}个)分配当前渠道吗?`,
      "对整个表格数据进行分配"
    );

    });
  }

  //private:提交数据后重置界面组件、表单数据
  submitAssignOptr(values) {
    updateAssignChannel(values).then( ({jsonResult}) => {
        // message.success('分配商业渠道成功', 3);
        Success("分配商业渠道成功");
        this.setState({
          isDisabledSingleBtn: true,
          isDisabledMulitBtn: true
        });
        this.props.form.resetFields();
        this.props.onSubmitCallback();
    });
  }

  componentWillReceiveProps(nextProps) {
    let { isDisabledSingleBtn, isDisabledMulitBtn } = this.state;
    //接收到父组件表格中选择行数，激活禁用提交按钮
    if('selectedRowKeys' in nextProps &&　nextProps['selectedRowKeys'].length > 0) {
        if(this.state.isDisabledSingleBtn) {
          isDisabledSingleBtn = isDisabledMulitBtn = false;
        }
    } else {
      isDisabledSingleBtn = true;
    }

    if('totalCount' in nextProps && nextProps['totalCount'] > 0) {
      if(this.state.isDisabledMulitBtn) {
        isDisabledMulitBtn = false;
      }
    } else {
      isDisabledMulitBtn = true;
    }
    this.setState({ isDisabledSingleBtn, isDisabledMulitBtn });
  }

  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }

  render() {

    console.log('SelectConfirmForm => render => ', this.state);
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const { selectedRowKeys, friendsTotal } = this.props;
    const { isDisabledSingleBtn, isDisabledMulitBtn } = this.state;

    return (
      <Form horizontal>
      <Row>
        <Col sm={9}>
          <ChannelSelectField getFieldDecorator={getFieldDecorator('channel_id',{
                rules: [{type:'object', required: true, message: '请选择商业渠道'}]
            })} />
        </Col>
        <Col sm={9}>
          <FormItem labelCol={{ span:8 }} wrapperCol={{ span: 16　}} label="选择微信号">
            <p className="ant-form-text" id="userName" name="userName" style={{ color:'red' }}>已选择{selectedRowKeys.length}个运营号，共{friendsTotal}好友</p>
          </FormItem>
        </Col>
        <Col sm={3}>
          <Button type="primary" icon="check" size="large" disabled={ isDisabledSingleBtn } onClick={this.handleSelectiveSubmit}>
            选择提交
          </Button>
        </Col>
        <Col sm={3}>
          <Button type="primary" icon="check" size="large"
              disabled={ isDisabledMulitBtn } onClick={this.handleAllSubmit}>
              提交所有
          </Button>
        </Col>
      </Row>
      </Form>
    );
  }
}

SelectConfirmForm = Form.create()(SelectConfirmForm);

//按运营号分配
export default class AssignChannelByOperation extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [], //表格选中行
      friendsTotal: 0,    //选中好友数
      totalCount: 0,      //表格总记录数
      searchObj:null        //搜索参数
    };
    this.handelSearch = this.handelSearch.bind(this);
    this.handleSubmitCallback = this.handleSubmitCallback.bind(this);
    this.onRefresh = this.onRefresh.bind(this);

    this.columns = [
      {title: '分配渠道时间',        dataIndex: 'create_time',    width: 135},
      {title: '原始组号',        dataIndex: 'wechat_group',    width: 100},
      {title: '运营手机号',      dataIndex: 'mobile',    width: 100},
      {title: '运营微信号',      dataIndex: 'operation_wechat',    width: 120},
      {title: '运营微信号状态',  dataIndex: 'status',    width: 105,
          render: (text, record) => OperationStatusRender(text, record['status_text'])},
      {title: '好友总数(人)',  dataIndex: 'friend_cnt',    width: 100}
    ];
    this.type = "channel";
  }

  onRefresh() {
    updateOperation().then( ({jsonResult}) => {
      this.refs.commontable.setExtraParams({type: this.type});
      this.refs.commontable.refreshTable();
    });
  }

  handelSearch(searchObj) {
    searchObj['type'] = this.type;
    this.refs.commontable.queryTableData(searchObj);
    this.setState({ searchObj, selectedRowKeys: [] });
  }

  //所有选中行记录集合
  handleRowChange(selectedRowKeys, selectedRows) {
    let friendsTotal = 0;
    selectedRows.forEach( record =>(
      friendsTotal += record['friend_cnt']
    ));
    this.setState({ selectedRowKeys, friendsTotal });
  }

  onLoadedData() {
    this.setState({ totalCount: this.refs.commontable.getTotalCount() });
  }

  //子组件中提交后台后的回调
  handleSubmitCallback() {
    this.setState({
      selectedRowKeys: [],
      friendsTotal: 0,
      totalCount: 0,
    });
    this.refs.commontable.refreshTable();
  }

  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }

  render() {
    console.log('OperationsPane => render => ', this.state);
    const { selectValue, selectedRowKeys, friendsTotal, totalCount, searchObj } = this.state;
    return (
      <div>
        <SelectConfirmForm selectedRowKeys={ selectedRowKeys } friendsTotal={ friendsTotal }
            totalCount={ totalCount } searchObj={ searchObj }
            onSubmitCallback={ this.handleSubmitCallback}/>
        <div style={{'borderBottom':'1px solid #e9e9e9', marginBottom: 24}} />
        <AssignSearchForm onSearchChannel = { this.handelSearch } onRefresh={this.onRefresh}  />
        <div style={{'borderBottom':'1px solid #e9e9e9', marginBottom: 24}} />
        <CommonTable ref="commontable"
          columns = { this.columns }
          pageSize={10}
          rowSelection = {{
            selectedRowKeys,
            onChange: this.handleRowChange.bind(this),
          }}
          scroll={{x: 750}}
          rowKey = "operation_sn"
          fetchTableDataMethod = { queryOperationForChannelIdIsNul }
          onLoadedData = { this.onLoadedData.bind(this) }
        />
      </div>
    );

  }
}
