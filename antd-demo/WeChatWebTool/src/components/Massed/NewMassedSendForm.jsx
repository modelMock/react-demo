import React from 'react';
import { Form, Row, Col, Input, Select, DatePicker, Button } from 'antd';
import moment from 'moment';
import { initMassSearch, massSearch } from '../../services/multManage';
const FormItem = Form.Item;
const Option = Select.Option;

//最大日期为前一天17点整
const maxDate = moment().add(0, "days");
class NewMassedSendForm extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      showAnchors: [],
      userLevels: [],
      rolyLevels: [],
      showTags: [],
      showGroups: [],
      startCreateValue: null,   //好友开始创建日期
      endCreateValue: maxDate,     //好友结束创建日期
    }
    this.disabledStartDate = this.disabledStartDate.bind(this);
    this.disabledEndDate = this.disabledEndDate.bind(this);
    this.onStartChange = this.onStartChange.bind(this);
    this.onEndChange = this.onEndChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.filterAnchorOption=this.filterAnchorOption.bind(this);
  }
  disabledStartDate(startValue){
    if(!startValue || !this.state.endCreateValue) return false;
    return startValue && (startValue.valueOf() > this.state.endCreateValue.valueOf() || startValue.valueOf() > maxDate.valueOf());
  }
  disabledEndDate(endValue){
    if(!endValue || !this.state.startCreateValue) return false;
    return endValue && (endValue.valueOf() < this.state.startCreateValue.valueOf() || endValue.valueOf() > maxDate.valueOf());
  }
  onStartChange(startCreateValue){
    this.setState({startCreateValue})
  }
  onEndChange(endCreateValue){
    this.setState({endCreateValue})
  }
  handleSearch(e){
    e.preventDefault();
    let params = this.props.form.getFieldsValue();
    if(!!params.friend_create_start){
      params.friend_create_start = params.friend_create_start.format("YYYY-MM-DD HH:mm:ss");
    }
    if(!!params.friend_create_end){
      params.friend_create_end = params.friend_create_end.format("YYYY-MM-DD HH:mm:ss");
    }
    this.props.onSearch(params);
  }
  handleReset(){
    this.props.form.resetFields();
  }

  filterAnchorOption(input, option){
    if(!input) return true;
    const inputValue = input.toLowerCase();
    const {value, children} = option.props;
    return value.toLowerCase() == inputValue || children.toLowerCase().indexOf(inputValue) >= 0;
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.isReset === true) {
      this.props.form.resetFields();
    }
  }
  componentDidMount(){
    initMassSearch().then(({jsonResult}) => {
      this.setState({
        showAnchors: jsonResult.showAnchors,
        userLevels: jsonResult.userLevels,
        rolyLevels: jsonResult.rolyLevels,
        showTags: jsonResult.showTags,
        showGroups: jsonResult.showGroups
      })
    });
  }

  render(){
    console.log('NewMassedSendForm => render', this.state)
    const formItemLayout = {
      labelCol: {span: 7},
      wrapperCol: {span: 17}
    }
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const { showAnchors, userLevels, rolyLevels, showTags, showGroups, startCreateValue, endCreateValue } = this.state;
    console.log("endCreateValue",endCreateValue)
    let userLevelStartOptions = [], userLevelEndOptions = [],
        rolyLevelStartOptions = [], rolyLevelEndOptions = [];
    userLevels.forEach(item => {
      const value = item.item_value, text = item.item_name;
      if(!this.userLevelEnd || parseInt(value) <= this.userLevelEnd) {
        userLevelStartOptions.push(<Option key={value}>{text}</Option>);
      }
      if(!this.userLevelStart || parseInt(value) >= this.userLevelStart) {
        userLevelEndOptions.push(<Option key={value}>{text}</Option>);
      }
    });
    rolyLevels.forEach(item => {
      const value = item.item_value, text = item.item_name;
      if(!this.rolyLevelEnd || parseInt(value) <= this.rolyLevelEnd) {
        rolyLevelStartOptions.push(<Option key={value}>{text}</Option>);
      }
      if(!this.rolyLevelStart || parseInt(value) >= this.rolyLevelStart) {
        rolyLevelEndOptions.push(<Option key={value}>{text}</Option>);
      }
    })

    return (
      <Form horizontal className="ant-advanced-search-form" onSubmit={this.handleSearch}>
        <Row gutter={16}>
          <Col sm={8}>
            <FormItem label="系统标签" {...formItemLayout}>
              {getFieldDecorator("tag_ids")(
                <Select multiple placeholder="请选择系统标签">
                  {
                    showTags.map(tag => (
                      <Option key={tag.tag_id}>{tag.tag_name}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label="好友分组" {...formItemLayout}>
              {getFieldDecorator("group_ids")(
                <Select multiple placeholder="请选择好友分组">
                  {
                    showGroups.map(group => (
                      <Option key={group.group_id}>{group.group_name}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label="秀场等级>=" {...formItemLayout}>
              {getFieldDecorator("user_level_start")(
                <Select allowClear placeholder="请选择秀场等级" onChange={(level) => this.userLevelStart = parseInt(level)}>
                  {userLevelStartOptions}
                </Select>
              )}
            </FormItem>
            <FormItem label="秀场等级<=" {...formItemLayout}>
              {getFieldDecorator("user_level_end")(
                <Select allowClear placeholder="请选择秀场等级" onChange={(level) => this.userLevelEnd = parseInt(level)}>
                  {userLevelEndOptions}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="运营号分配" {...formItemLayout}>
              {getFieldDecorator("assign_anchor_ids")(
                <Select
                multiple
                optionFilterProp="children"
                allowClear
                showSearch
                filterOption={this.filterAnchorOption}
                placeholder="请选择主播">
                  {
                    showAnchors.map(anchor => (
                      <Option value={anchor.anchor_id}>{anchor.anchor_name}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label="不含系统标签" {...formItemLayout}>
              {getFieldDecorator("no_tag_ids")(
                <Select multiple placeholder="请选择不含系统标签">
                  {
                    showTags.map(tag => (
                      <Option key={tag.tag_id}>{tag.tag_name}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label="秀场用户ID" {...formItemLayout}>
              {getFieldDecorator("user_id")(
                <Input placeholder="请输入秀场用户ID" />
              )}
            </FormItem>
            {/* <FormItem label="备注" {...formItemLayout}>
              {getFieldDecorator("remark")(
                <Input placeholder="请输入备注"/>
              )}
            </FormItem> */}
          </Col>
          <Col sm={8}>
            <FormItem label="好友创建>=" {...formItemLayout}>
              {getFieldDecorator("friend_create_start",{initialValue:startCreateValue})(
                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss"
                  disabledDate={this.disabledStartDate} onChange={this.onStartChange}
                  placeholder="请选择创建好友开始时间" style={{width:'100%'}} />
              )}
            </FormItem>
            <FormItem label="好友创建<=" {...formItemLayout}>
              {getFieldDecorator("friend_create_end",{initialValue:endCreateValue})(
                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss"
                  disabledDate={this.disabledEndDate} onChange={this.onEndChange}
                  placeholder="请选择创建好友结束时间" style={{width:'100%'}} />
              )}
            </FormItem>
            <FormItem label="昵称" {...formItemLayout}>
              {getFieldDecorator("nick_name")(
                <Input placeholder="请输入昵称" />
              )}
            </FormItem>
          </Col>
          <Col span={8}  style={{ textAlign: 'right' }}>
            <Button type="primary" icon="search" size="large" htmlType="submit">搜索</Button>
            <Button type="ghost" icon="close" size="large" onClick={this.handleReset}>重置</Button>
          </Col>
        </Row>
      </Form>
    );
  }
}
export default Form.create()(NewMassedSendForm);
