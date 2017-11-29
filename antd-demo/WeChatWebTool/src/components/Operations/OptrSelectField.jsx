import React, { Component, PropTypes } from 'react';
import { Form, Select } from 'antd';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { queryOptrAndOpCountByName } from '../../services/optr';
const FormItem = Form.Item;
const Option = Select.Option;

//客服下拉搜索框
export default class OptrSelectField extends Component {

  static defaultProps = {
    formItem: {
      label: "客服号",
      labelCol: { span: 7 },
      wrapperCol: { span: 17 }
    },
    onSearchMethod: queryOptrAndOpCountByName,
  }

  static propTypes = {
    formItem: PropTypes.object.isRequired,
    onSearchMethod: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state={
      optrList: []
    };
    this.handleSearch = this.handleSearch.bind(this);
  }

  handleSearch(inputValue) {
    console.log('GroupField => handleSearch ', inputValue);
    if(inputValue && inputValue.trim().length > 0) {
      this.props.onSearchMethod(inputValue).then( ({ jsonResult }) => {
        let optrList = [];
        if(jsonResult.length > 0) {
          optrList = jsonResult.map( optr => {
            optr['optr_name'] = optr['optr_name'] + ` (当前${optr.operation_count}个运营微信号，共${optr.friend_cnts}人)`;
            return optr;
          });
        }
        this.setState({ optrList });
      });
    } else {
      this.setState({ optrList: [] });
    }
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
              placeholder="请输入客服名搜索" notFoundContent="没有找到该客服"
            >
            {
              this.state.optrList.map((item, idx) => {
                return <Option key={item.service_optr_id}>{item.optr_name}</Option>;
              })
            }
          </Select>
        )}
      </FormItem>
    );
  }
}
