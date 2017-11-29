import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Form, Checkbox, Collapse } from 'antd';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import './SendADToWeChat.less';
const CheckboxGroup = Checkbox.Group;
const Panel = Collapse.Panel;

export default class CityPanel extends Component {

  constructor(props){
    super(props);
    this.state = {
      checkedValues: []       //当前选中的城市数据
    };
    this.handleSelectAllCity = this.handleSelectAllCity.bind(this);
    this.handleCityChange = this.handleCityChange.bind(this);
    this.city_map = {};
  }

  //Panel.header上全选、全取消
  handleSelectAllCity(e) {
    const checked = e.target.checked;
    let checkedValues = checked ? this.props.cityList : [];
    this.setState({ checkedValues });
    this.__setProvinceChecked(checked);
  }

  __setProvinceChecked(checked) {
    let obj = {};
    obj['p_'+this.props.province] = checked;
    this.props.form.setFieldsValue(obj);
  }

  //单个选择城市change事件
  handleCityChange(checkedValues) {
    console.log(checkedValues);
    const oldLength = this.state.checkedValues.length;
    this.setState({ checkedValues });

    this.__setProvinceChecked(checkedValues.length === this.props.cityList.length);
  }

  /*shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }*/

  shouldComponentUpdate(nextProps, nextState) {
    if(this.props.province === nextProps.province && this.state.checkedValues.length === nextState.checkedValues.length) {
      return false;
    }
    return true;
  }

  render() {
    const { cityList, province, form, key, ...others } = this.props;
    console.log('CityPanel => render => ', province);
    const { getFieldProps} = form;
    const { checkedValues } = this.state;

    let cityOptions = [];
    if(cityList.length > 0) {
      cityOptions = cityList.map(city => (
        {label: city, value: city}
      ))
    }
    const checked = checkedValues.length === cityList.length;
    const provinceProps = getFieldProps('p_'+province, {
        initialValue: false,
        valuePropName: 'checked',
        onChange: this.handleSelectAllCity,
    });
    const cityProps = getFieldProps('c_'+province, {
          initialValue: [],
          rule: [{type:'array'}],
          onChange: this.handleCityChange
    });
    console.log('provinceProps', provinceProps, cityProps);
    return (
      <Panel {...others}　key={province} header={ <Checkbox {...provinceProps} checked={checked}>{province}</Checkbox> }>
        <CheckboxGroup {...cityProps} options={cityOptions}　value={checkedValues}/>
      </Panel>
    )
  }

  /*render() {
    const { cityList, province, form, key, ...others } = this.props;
    console.log('CityPanel => render => ', province);
    const getFieldDecorator = form.getFieldDecorator;

    let cityOptions = [];
    if(cityList.length > 0) {
      cityOptions = cityList.map(city => (
        {label: city, value: city}
      ))
    }

    return (
      <Panel {...others}　key={province} header={
        getFieldDecorator('p_'+province, {
            initialValue: false,
            valuePropName: 'checked',
            onChange: this.handleSelectAllCity,
        })(
          <Checkbox checked={this.state.checkedValues.length === cityList.length}>{province}</Checkbox>
        )
      }>
        {getFieldDecorator('c_'+province, {
              initialValue: [],
              rule: [{type:'array'}],
              onChange: this.handleCityChange
        })(
          <CheckboxGroup options={cityOptions}　value={this.state.checkedValues}/>
        )}
      </Panel>
    )
  }*/
}
