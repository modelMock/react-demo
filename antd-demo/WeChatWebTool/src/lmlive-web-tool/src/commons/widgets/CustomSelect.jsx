import React from 'react';
import {Select} from 'antd';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import AppService from '../../service/AppService';
const Option = Select.Option;

export default class CustomSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itemList: []
    }
  }
  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }
  queryItemValues(itemKey){
    AppService.getItemValueList(itemKey).then(itemList => {
      this.setState({ itemList });
    })
  }
  componentDidMount() {
    this.queryItemValues(this.props.itemKey)
  }
  componentWillReceiveProps(nextProps){
    if(nextProps.itemKey=="GuildAward" || nextProps.itemKey=="GuildPunish" || nextProps.itemKey=="GuildVjkb"){
      AppService.getItemValueList(nextProps.itemKey).then(itemList => {
        this.setState({ itemList });
      })
    }
  }
  render() {
    return (
      <Select allowClear {...this.props}>
        {
          this.state.itemList.map(item => (
            <Option key={item.itemValue} value={item.itemValue}>{item.itemName}</Option>
          ))
        }
      </Select>
    )
  }
}
