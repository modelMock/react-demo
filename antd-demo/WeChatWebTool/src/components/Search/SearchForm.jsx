import React, {Component} from 'react';
import {Form, Row, Col, Input, Select, Radio, Button} from 'antd';
import './SearchContainer.less';
import {getProvinces, getCitiesByProvinces} from '../../services/ads';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

class SearchForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time_type: "0",   //聊天时间类型，今天填 0 ,昨天填1，前天填2，近一周不填
      provinceList: [],
      cityList: [],
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChangeProvince = this.handleChangeProvince.bind(this);
    this.handleChangeTimeType = this.handleChangeTimeType.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSearch(this.props.form.getFieldsValue());
  }

  handleReset() {
    this.props.form.resetFields();
  }

  handleChangeProvince(value) {
    console.log(value);
    getCitiesByProvinces({
      provinces: [value]
    }).then(({jsonResult}) => {
      let cityList = jsonResult[value].map( c => (
        c['city']
      ));
      this.setState({ cityList })
    });
  }
  handleChangeTimeType(e) {
    /*this.setState({
      time_type: e.targe.value
    })*/
  }

  fetchInitData() {
    getProvinces().then(({jsonResult}) => {
      let provinceList = jsonResult.map(p => (
        p['province']
      ));
      this.setState({ provinceList });
    });
  }

  componentDidMount() {
    this.fetchInitData();
  }

  render() {
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14 }
    };
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const { time_type, provinceList, cityList } = this.state;

    return <Form horizontal className="search-form" onSubmit={this.handleSubmit}>
      <Row gutter={16}>
        <Col sm={8}>
          <FormItem {...formItemLayout} label="微信号">
            {getFieldDecorator('friend_wechat')(<Input placeholder="请输入好友号" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="国家">
            {getFieldDecorator('country', {initialValue: 'China'})(
              <Select>
                <Option value="China">中国</Option>
              </Select>
            )}
          </FormItem>
        </Col>
        <Col sm={8}>
          <FormItem {...formItemLayout} label="昵称/备注名">
            {getFieldDecorator('remark_name')(<Input placeholder="请输入备注名" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="省份">
            {getFieldDecorator('province', {
              onChange: this.handleChangeProvince
            })(
              <Select showSearch allowClear
               optionFilterProp="children" notFoundContent="无法找到" placeholder="请选择省份">
                {
                  provinceList.map( province => (
                    <Option key={province}>{province}</Option>
                  ))
                }
              </Select>
            )}
          </FormItem>
        </Col>
        <Col sm={8}>
          <FormItem {...formItemLayout} label="性别">
            {getFieldDecorator('gender')(
              <Select placeholder="请选择性别" allowClear>
                <Option value="M">男</Option>
                <Option value="W">女</Option>
                <Option value="U">未知</Option>
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="城市">
            {getFieldDecorator('city')(
              <Select
                showSearch allowClear
                optionFilterProp="children"
                notFoundContent="无法找到"
                placeholder="请选择城市">
                {
                  cityList.map( city => (
                    <Option key={city}>{city}</Option>
                  ))
                }
              </Select>
            )}
          </FormItem>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col sm={8}>
          <FormItem {...formItemLayout} label="聊天消息">
            {getFieldDecorator('chat_message')(<Input placeholder="请输入聊天消息" />)}
          </FormItem>
        </Col>
        <Col sm={16}>
        <FormItem wrapperCol={{span: 24}}>
          {getFieldDecorator('chat_time_type', {
            initialValue: "0",
            onChange: this.handleChangeTimeType
          })(
            <RadioGroup>
              <Radio value="0">今天</Radio>
              <Radio value="1">昨天</Radio>
              <Radio value="2">前天</Radio>
              <Radio value="">近一周</Radio>
            </RadioGroup>
          )}
        </FormItem>
        </Col>
      </Row>
      <Row>
        <Col sm={12} offset={12} style={{ textAlign: 'right' }}>
        <Button type="primary" icon="search" htmlType="submit">搜索</Button>
        <Button icon="cross" onClick={this.handleReset}>重置</Button>
        </Col>
      </Row>
    </Form>
  }
}

export default Form.create()(SearchForm);
