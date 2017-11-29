import React, { Component, PropTypes } from 'react';
import { Form, Select } from 'antd';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { queryChannelAndOpCountByName } from '../../services/channel';
const FormItem = Form.Item;
const Option = Select.Option;

//商业渠道下拉搜索框
export default class ChannelSelectField extends Component {

  static defaultProps = {
    formItem: {
      label: "商业渠道",
      labelCol: { span: 7 },
      wrapperCol: { span: 17 }
    },
    onSearchMethod: queryChannelAndOpCountByName,
  }

  static propTypes = {
    formItem: PropTypes.object.isRequired,
    onSearchMethod: PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state={
      channelList: []
    };
    this.handleSearch = this.handleSearch.bind(this);
  }

  handleSearch(inputValue) {
    console.log('ChannelField => handleSearch ', inputValue);
    if(inputValue && inputValue.trim().length > 0) {
      this.props.onSearchMethod(inputValue).then( ({ jsonResult }) => {
        let channelList = [];
        if(jsonResult.length > 0) {
          channelList = jsonResult.map( channel => {
            channel['channel_name'] = channel['channel_name'] + ` (当前${channel.operation_count}个可用运营号，共${channel.friend_cnts}人)`;
            return channel;
          });
        }
        this.setState({ channelList });
      });
    } else {
      this.setState({ channelList: [] });
    }
  }

  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }

  render() {
    const { formItem, onSearchMethod, getFieldDecorator } = this.props;
    return (
      <FormItem {...formItem}>
        {getFieldDecorator(
            <Select
                onSearch={ this.handleSearch }
                optionLabelProp="children"
                optionFilterProp="children"
                allowClear
                showSearch
                labelInValue
                defaultActiveFirstOption
                filterOption={false}
                dropdownMatchSelectWidth={false}
                dropdownMenuStyle={{ maxHeight: 500, overflow: 'auto' }}
                placeholder="请输入商业渠道名搜索" notFoundContent="没有找到该商业渠道"
              >
              {
                this.state.channelList.map((item, idx) => {
                  return <Option key={item.channel_id}>{item.channel_name}</Option>;
                })
              }
            </Select>
        )}
      </FormItem>
    );
  }
}
