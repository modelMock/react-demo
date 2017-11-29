/*精粉投放*/
import React, { Component, PropTypes } from 'react';
import { Form, Select, Button, Checkbox, Collapse, InputNumber } from 'antd';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { getProvinces, getCitiesByProvinces } from '../../services/ads';
import CommonSelect from '../Commons/CommonSelect';
import {Errors} from '../Commons/CommonConstants';
import CityPanel from './CityPanel.jsx';
import './SendADToWeChat.less';
const FormItem = Form.Item;
const Option = Select.Option;

export default class ChosenPutIn extends Component {

  constructor(props){
    super(props);
    this.state = {
      provinceList: [],  //省级CheckGroup.options
      cityOptions: [],  //城市级CheckGroup.options(单个对象属性：{province:{}, cityList:[], selectedOptions:[], checkedAll:false})
      activeKey: [],   //Collapse中激活展开的省级key
      friendTimeList: [], //成为好友时常

      friend_min_cnt: 0,      //最小投放好友数
      friend_max_cnt: 0,	   //最大投放好友数
    };

    this.handleProvinceChange = this.handleProvinceChange.bind(this);
    this.onFetchChosenData = this.onFetchChosenData.bind(this);
    this.onChangeConfirm = this.onChangeConfirm.bind(this);
    this.city_map = {};
  }

  //选择省级CheckBox.onchange事件
  handleProvinceChange(provinces) {
    console.log('TraffickingFlour => handleProvinceChange => ', provinces);
    let cityList = [], cityOptions = [], activeKey = [];
    if(provinces.length == 0) {
      this.setState({ cityOptions, activeKey });
    } else {
      getCitiesByProvinces({provinces}).then( ({jsonResult}) => {
        let cityList = [];
        provinces.forEach(p => {
          jsonResult[p].forEach( c => {
            cityList.push(c.city);
          })
          cityOptions.push({province: p, cityList});
          cityList = [];
        })

        this.setState({
          cityOptions,
          activeKey: provinces,
        });

      });
    }
  }

  fetchProvinceData() {
    getProvinces().then( ({jsonResult}) => {
      let provinceList = jsonResult.map(p => (
        // {label: p['province'], value: p['province']}
        p['province']
      ));
      this.setState({ provinceList });
    });
  }

  componentDidMount(){
    this.fetchProvinceData();
  }

  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }

  componentWillReceiveProps(nextProps) {
    if('isResetData' in nextProps && nextProps['isResetData'] === true) {
      console.debug('componentWillReceiveProps')
      this.setState({
        cityOptions: [],
        activeKey: [],
        friend_min_cnt: 0,
        friend_max_cnt: 0
      });
    }
  }

  setOperationsTotal(total) {
    console.debug('total: ', total);
    this.setState(total);
  }

  //根据省、市、性别，提取精粉统计数据
  onFetchChosenData() {
    const {getFieldValue} = this.props.form;
    const provinceList = this.props.form.getFieldValue('province');

    this.city_map = {};

    if(provinceList &&　provinceList.length > 0) {
      provinceList.forEach(province => {
        const checked = this.props.form.getFieldValue('p_' + province);
        if(checked === true) {
          this.city_map[province] = [];
        } else {
          this.city_map[province] = this.props.form.getFieldValue('c_' + province);
        }
      });
    }

    console.log(this.city_map, this.props.form.getFieldsValue());

    this.props.onFetchChosenData({
      put_type: 'Chosen',
      gender_list: getFieldValue('gender_list'),
      friend_time: getFieldValue('friend_time'),
      city_map: this.city_map
    });
  }

  onChangeConfirm() {
    const want_friend_cnt = this.props.form.getFieldValue('friend_cnt');
    if(want_friend_cnt) {
      this.props.onChangeConfirm({ want_friend_cnt });
    } else {
      Errors("请输入期望粉丝数量!");
    }
  }

  render() {
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const { provinceList, cityOptions, activeKey, sendRadioValue, friend_min_cnt, friend_max_cnt } = this.state;

    console.log('ChosenPutIn => render => ', this.state);

    const provinceOptions = provinceList.map( p => (
        {label: p, value: p}
    ));
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 }
    };

    const displayStyle = { 'display': (cityOptions.length > 0 ? 'block' : 'none') }

    return (
      <div>
        <FormItem labelCol={{span: 4}} wrapperCol={{span: 6}} label="成为好友时长">
          <CommonSelect placeholder="请选择好友时长" item_key="FriendTime"
              getFieldDecorator={getFieldDecorator('friend_time')}
              dropdownMenuStyle={{ maxHeight: 350, overflow: 'auto' }}/>
        </FormItem>
        <FormItem labelCol={{span: 4}} wrapperCol={{span: 6}} label="性别">
          {getFieldDecorator('gender_list')(
            <Select multiple placeholder="请选择性别">
              <Option key="男">男</Option>
              <Option key="女">女</Option>
              <Option key="未知">未知</Option>
            </Select>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="省份">
          {getFieldDecorator('province', {onChange: this.handleProvinceChange})(
            <Checkbox.Group options={provinceOptions}/>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="城市" style={displayStyle}>
          <Collapse activeKey={activeKey}>
            {
              cityOptions.map( (city, index) => {
                return <CityPanel
                          key={city.province}
                          form={this.props.form}
                          cityList={ city.cityList } province={city.province} />
              })
            }
          </Collapse>
        </FormItem>
        <FormItem wrapperCol={{offset:4, span:4}}>
          <p className="ant-form-text" style={{color:'red'}}>注：不选代表选择了全部省份</p>
        </FormItem>
        <FormItem wrapperCol={{span:4, offset: 4}}>
          <Button type="primary" size="large" icon="check" onClick={this.onFetchChosenData}>提取数据</Button>
        </FormItem>
        <FormItem labelCol={{span: 4}} wrapperCol={{span: 10}} label="期望粉丝数"
            extra={`当前最多可投放${friend_max_cnt}人，最少投放${friend_min_cnt}人`}>
            {getFieldDecorator('friend_cnt')(
              <InputNumber style={{ width: 150 }} min={friend_min_cnt} max={friend_max_cnt} placeholder="请输入投放数量" />
            )}
        </FormItem>
        <FormItem wrapperCol={{span:4, offset: 4}}>
          <Button type="primary" icon="check" size="large" onClick={this.onChangeConfirm}>确认数据</Button>
        </FormItem>
      </div>
    );
  }
}
