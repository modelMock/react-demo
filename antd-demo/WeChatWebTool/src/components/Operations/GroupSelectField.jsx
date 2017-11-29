import React, { Component, PropTypes } from 'react';
import { Form, Select } from 'antd';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { queryOperationGroup } from '../../services/operations';
const FormItem = Form.Item;
const Option = Select.Option;

//组号下拉搜索框
export default class GroupSelectField extends Component {
  static defaultProps = {
    formItem: {
      label: "原始组号",
      labelCol: { span: 7 },
      wrapperCol: { span: 17 }
    }
  }

  static propTypes = {
    formItem: PropTypes.object.isRequired,
  }
  constructor(props) {
    super(props);
    this.state={
      groupList: []
    };
    this.handleSearch = this.handleSearch.bind(this);
  }

  handleSearch(inputValue) {
    console.log('GroupField => handleSearch ', inputValue);
    if(inputValue && inputValue.trim().length > 0) {
      queryOperationGroup({wechat_group: inputValue}).then( ({ jsonResult }) => {
        this.setState({ groupList: jsonResult });
      });
    } else{
      this.setState({ groupList: [] });
    }
  }

  render() {
    const { formItem, getFieldDecorator } = this.props;
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
              placeholder="请输入组号名搜索" notFoundContent="没有找到该组号"
            >
            {
              this.state.groupList.map((item, idx) => {
                return <Option key={item.wechat_group} value={item.wechat_group}>{item.wechat_group}</Option>;
              })
            }
          </Select>
        )}
      </FormItem>
    );
  }
}
