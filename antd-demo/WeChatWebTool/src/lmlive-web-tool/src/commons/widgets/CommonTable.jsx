import React, {Component} from 'react';
import {Table} from 'antd';

export default class CommonTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dataSource: [],
      pagination: props.config.pagination || {
        pageSize: props.pageSize || 10,
        showQuickJumper: true,  //显示可以快速跳转至某页
        showSizeChanger: true,  //显示可以改变 pageSize
        showTotal: ( total => (`共 ${total} 条`))   //显示总共有多少条数据
      }
    }
  }
  getPageSize(){
    return this.state.pagination.pageSize;
  }
  handleTableChange = ({current, pageSize}) => {
    const pager = {...this.state.pagination};
    pager.current = current;
    pager.pageSize = pageSize;
    // 加载中、修改当前分页数
    this.setState({
      loading: true,
      pagination: pager
    });

    // 表格分页参数：起始数、每页条数
    const params = {
      offset: pageSize * (current - 1),
      limit: pageSize
    };
    this.props.onSearch(params, (dataSource, totalCount) => {
      // 表格查询数据返回，dataSource：当前页表格数据；totalCount：整个表格数据条数
      pager.total = totalCount;
      this.setState({
        dataSource,
        pagination: pager,
        loading: false
      })
    }, () => this.setState({ loading: false }))
  }
  loading = () => {
    const loading = this.state.loading
    this.setState({ loading: !loading })
    return loading;
  }
  // 重新设置表格数据
  setTableData = (dataSource, totalCount) => {
    const pagination = {...this.state.pagination};
    pagination.current = 1;
    pagination.total = totalCount;
    this.setState({
      dataSource,
      pagination,
      loading: false,
    })
  }
  render() {
    return (
      <Table {...this.state}
             {...this.props.config}
             onChange={this.handleTableChange}
             bordered/>
    )
  }
}