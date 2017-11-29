/**
 *请假列表
 * @author 谭亮红
 */
import React, {Component} from 'react';
import {Form, Row, Col, Input, Button, Select, DatePicker, Modal} from 'antd';
import moment from 'moment';
import webUtils from '../../commons/utils/webUtils';
import commonUtils from '../../commons/utils/commonUtils';
import CustomTable from '../../commons/widgets/CustomTable';
import AnchorService from '../../service/AnchorService';

const FormItem = Form.Item;
const Option = Select.Option;
const {TextArea} = Input;
const {RangePicker} = DatePicker;
//一天的毫秒数
const ONE_DAY = 24 * 60 * 60 * 1000

//请假搜索表单
class AnchorLeaveListForm extends Component {
  constructor(props) {
    super(props)
  }

  handleReset = () => {
    this.props.form.resetFields()
  }
  handleSearch = (e) => {
    e.preventDefault()
    const value = this.props.form.getFieldsValue()
    this.props.onSearch(value)
  }

  render() {
    const {form, onAddEvent, allAnchorList, leaveOperationList} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    return (
      <Form layout="horizontal" onSubmit={this.handleSearch} className="ant-advanced-search-form">
        <Row>
          <Col sm={8}>
            <FormItem label="创建时间" {...formItemLayout}>
              {getFieldDecorator("data")(
                <RangePicker format="YYYY-MM-DD"></RangePicker>
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="主播ID" {...formItemLayout}>
              {getFieldDecorator("anchorUserId")(
                <Input placeholder="主播ID" />
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="状态" {...formItemLayout}>
              {getFieldDecorator("status")(
                <Select>
                  <Option value="leave">已请假</Option>
                  <Option value="cancel">已销假</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="运营归属" {...formItemLayout}>
              {getFieldDecorator("tutorUserId")(
                <Select allowClear placeholder="请选择运管">
                  {
                    leaveOperationList.map(user => (
                      <Option key={String(user.userId)}>{user.nickname}({user.userId})</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col offset={16} span={8} style={{textAlign: 'right'}}>
            <Button type="ghost" icon="plus" size="large" onClick={onAddEvent}>请假</Button>
            <Button type="primary" icon="search" size="large" htmlType="submit">查询</Button>
            <Button type="ghost" icon="cross" size="large" onClick={this.handleReset}>清除</Button>
          </Col>
        </Row>
      </Form>
    )
  }
}

AnchorLeaveListForm = Form.create()(AnchorLeaveListForm);

//请假弹出框
class AnchorLeaveModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startValue: moment(new Date(), "YYYY-MM-DD"),
      endValue: null,
    }
  }

  handleReset = () => {
    this.props.form.resetFields()
    this.setState({
      startValue: moment(new Date(), "YYYY-MM-DD"),
      endValue: null
    })
  }
  //保存录入直播请假
  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, oriValues) => {
      if(!!err) return;
      const values = Object.assign({}, oriValues)
      values["startDate"] = values["startDate"].format('YYYY-MM-DD 00:00:00');
      values["endDate"] = values["endDate"].format('YYYY-MM-DD 23:59:59');
      if(this.state.endValue - this.state.startValue <= 0){
        webUtils.alertFailure("请假时间有误,请重新选择!")
        return;
      }
      webUtils.confirm(() => {
        AnchorService.leave(values).then(jsonResult => {
          webUtils.alertSuccess("录入请假信息成功！");
          this.props.onClose(true);
          this.handleReset()
        })
      }, "确定录入请假吗?")
    });
  }
  //开始日期只能是当前日期或小于结束日期
  disabledStartDate = (startValue) => {
    const endValue = this.state.endValue;
    return startValue && startValue.valueOf() < new Date(new Date().getTime() - ONE_DAY);
  }
  //对选择框的时间选择范围进行限制
  _startDisabledDate = (current) => {
    if(!this.state.endValue){
      return current && current.valueOf() <= Date.now() - ONE_DAY
    }else{
      return current && (current.valueOf() <= Date.now() - ONE_DAY || current.valueOf() >= this.state.endValue.valueOf())
    }
  }
  _endDisabledDate = (current) => {
    return current && current.valueOf() <= this.state.startValue.valueOf()
  }
  //开始时间更改回调
  onStartChange = (value) => {
    this.setState({
      startValue: value
    })
  }
  //结束时间更改回调
  onEndChange = (value) => {
    this.setState({
      endValue: value
    })
  }
  onClose = () => {
    this.props.onClose();
    this.handleReset()
  }

  render() {
    const {visible, form, allAnchorList} = this.props;
    const {getFieldDecorator} = form;
    const {startValue, endValue} = this.state;
    const allTimes = endValue && startValue
      ? Math.floor((endValue - startValue) / ONE_DAY) + 1
      : 0
    const formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 16},
    };
    return (
      <Modal title="请假"
             width={660}
             visible={visible}
             okText="确定"
             cancelText="取消"
             onOk={this.handleSave}
             onCancel={this.onClose}>
        <Form>
          <FormItem label="选择主播" {...formItemLayout}>
            {getFieldDecorator("anchorUserId", {rules: [{required: true, message: '请输入主播ID或名称'}]})(
              <Select
                optionFilterProp="children"
                allowClear
                showSearch>
                {
                  allAnchorList.map((anchor, idx) => (
                    <Option key={anchor.userId}>{anchor.nickname}</Option>
                  ))
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="开始时间" {...formItemLayout}>
            {getFieldDecorator("startDate", {
              initialValue: startValue,
              rules: [{required: true, message: '请选择开始时间'}],
            })(
              <DatePicker
                disabledDate={this._startDisabledDate}
                format="YYYY-MM-DD"
                allowClear={false}
                onChange={this.onStartChange}
                placeholder="请选择开始时间"/>
            )}
          </FormItem>
          <FormItem label="结束时间" {...formItemLayout}>
            {getFieldDecorator("endDate", {
              initialValue: endValue,
              rules: [{required: true, message: '请选择结束时间'}],
            })(
              <DatePicker
                disabledDate={this._endDisabledDate}
                format="YYYY-MM-DD"
                allowClear={false}
                onChange={this.onEndChange}
                placeholder="请选择结束时间"/>
            )}
          </FormItem>
          <FormItem label="时长（天）" {...formItemLayout}>
            <Input value={allTimes} disabled={true}/>
          </FormItem>
          <FormItem label="请假原因" {...formItemLayout}>
            {getFieldDecorator("leaveReason", {
              rules: [{required: true, message: '请输入请假原因'}],
            })(
              <TextArea rows="4" placeholder="请输入请假原因"/>
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

AnchorLeaveModal = Form.create()(AnchorLeaveModal)
export default class AnchorLeaveList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openAnchorLeaveVisible: false,
      allAnchorList: [],
      leaveOperationList: []
    };
    this.columns = [
      {title: '编号', dataIndex: 'recordId', key: 'recordId', width: 50},
      {title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 85},
      {title: '创建人', dataIndex: 'createUserName', key: 'createUserName', width: 85},
      {title: '主播ID', dataIndex: 'anchorUserId', key: 'anchorUserId', width: 85},
      {title: '昵称', dataIndex: 'anchorUserName', key: 'anchorUserName', width: 85},
      {title: '请假开始时间', dataIndex: 'startDate', key: 'startDate', width: 85, render: (text, record) => {
        return <p>{moment(text).format("YYYY-MM-DD")}</p>
      }
      },
      {title: '请假结束时间', dataIndex: 'endDate', key: 'endDate', width: 85,
        sorter: (a, b) => moment(a.endDate) - moment(b.endDate),
        render: (text, record) => {
          return <p>{moment(text).format("YYYY-MM-DD")}</p>
        }
      },
      {title: '时长（天）', dataIndex: 'dayCount', key: 'dayCount', width: 85,
        sorter: (a, b) => a.dayCount - b.dayCount,
        render: (text) => commonUtils.getFormatDaysFromDay(text)
      },
      {title: '请假原因', dataIndex: 'leaveReason', key: 'leaveReason', width: 85},
      {title: '状态', dataIndex: 'status', key: 'status', width: 85},
      {title: '销假时间', dataIndex: 'sickLeaveTime', key: 'sickLeaveTime', width: 85},
      {title: '归属运营', dataIndex: 'tutorUserName', key: 'tutorUserName', width: 85},
    ]
  }

  _getAllLists() {
    //获取主播  创建人

		AnchorService.queryUserByType().then(result => {
			this.setState({leaveOperationList: result})
		})
		AnchorService.queryAllAnchor().then(result => {
			this.setState({allAnchorList: result})
		})
  }

  componentDidMount() {
    this._getAllLists()
  }

  //时间数据转换
  getDataValues(value) {
    let leaveList = Object.assign({}, value);
    if(leaveList['data'] && leaveList['data'].length > 0){
      leaveList['data'][0] && (leaveList['beginTime'] = leaveList['data'][0].format('YYYY-MM-DD 00:00:00'));
      leaveList['data'][1] && (leaveList['endTime'] = leaveList['data'][1].format('YYYY-MM-DD 23:59:59'));
    }
    delete leaveList["data"];
    return leaveList;
  }

  // 表单搜索
  handleOnSearch = (value) => {
    this._customTable.queryTableData(this.getDataValues(value));
  }
  //打开主播请假弹出框
  onOpenAnchorLeaveModal = (e) => {
    e.preventDefault();
    this.setState({openAnchorLeaveVisible: true})
  }
  //关闭请假弹出框
  handleClose = (isRefresh = false) => {
    isRefresh && this._customTable.refreshTable();
    this.setState({
      openAnchorLeaveVisible: false
    })
  }

  render() {
    const {openAnchorLeaveVisible, allAnchorList, leaveOperationList} = this.state;
    return (
      <div>
        <AnchorLeaveListForm
          onSearch={this.handleOnSearch}
          allAnchorList={allAnchorList}
          onAddEvent={this.onOpenAnchorLeaveModal}
          leaveOperationList={leaveOperationList}
        />
        <CustomTable ref={table => this._customTable = table}
                     rowKey="recordId"
                     columns={this.columns}
                     scroll={{x: 1280}}
                     fetchTableDataMethod={AnchorService.queryLeaveList}/>
        <AnchorLeaveModal visible={openAnchorLeaveVisible} onClose={this.handleClose} allAnchorList={allAnchorList}/>
      </div>
    )
  }
}