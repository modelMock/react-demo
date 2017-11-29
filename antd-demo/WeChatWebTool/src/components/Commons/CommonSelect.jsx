/*数据字典Select*/
import React, { Component, PropTypes } from 'react';
import { Select } from 'antd';
import { queryItemValueByKey } from '../../services/commons.js';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {List, is} from 'immutable';
const Option = Select.Option;

export default class CommonSelect extends Component {
  static propTypes = {
    item_key: PropTypes.string.isRequired,    //数据字典唯一标识
  }
  constructor(props) {
    super(props);
    this.state = {
      itemList: [],
    };
  }
  fetchItemData() {
    queryItemValueByKey({'item_key': this.props.item_key}).then( ({jsonResult}) => {
      this.setState({ itemList: jsonResult });
    });
  }
  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }
  componentDidMount() {
    this.fetchItemData();
  }
  render() {
    const {getFieldDecorator, placeholder, item_key, ...others} = this.props;
    return <div>
      {getFieldDecorator(
        <Select allowClear placeholder={placeholder} {...others}>
          {
            this.state.itemList.map(item => <Option key={item.item_value} value={item.item_value}>{item.item_name}</Option>)
          }
        </Select>
      )}
    </div>
  }
}
