import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Table} from 'antd';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import './CustomTable.less';

/**
 * @deprecated
 * @see CommonTable
 */
export default class CustomTable extends Component {
  static proptypes = {
    //表格columns
    columns: PropTypes.array.isRequired,
    //行选择
    rowSelection: PropTypes.object,
    //表格ajax请求service方法
    fetchTableDataMethod:  PropTypes.func.isRequired,
    //查询完数据后回调
    loadCallback: PropTypes.func,
    // 清空选中行
    clearSelectedRows: PropTypes.func,
    //表格行主键，建议填写
    rowKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func
    ]).isRequired,
    // 横向或纵向支持滚动，也可用于指定滚动区域的宽高度：{{ x: true, y: 300 }}
    scroll: PropTypes.object,
    pageSize: PropTypes.number,
  }

  static defaultProps = {
    // 默认每页10条数据
    pageSize: 10,
    loadCallback: () => {},
  }
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      loading: false,
      pagination: {
        pageSize: this.props.pageSize,
        showQuickJumper: true,  //显示可以快速跳转至某页
        showSizeChanger: true,  //显示可以改变 pageSize
        showTotal: ( total => (`共 ${total} 条`))   //显示总共有多少条数据
      }
    }
    this.handleChange = this.handleChange.bind(this);
    // 表格查询数据
    this.params = {};
  }
  __search(current = 1, offset = 0, limit= this.state.pagination.pageSize) {
    let formParams;
    if(!!this.params) {
      formParams = {...this.params, offset, limit};
    } else {
      formParams = {offset, limit};
    }

    this.props.clearSelectedRows && this.props.clearSelectedRows()

    this.setState({ loading: true });
    this.props.fetchTableDataMethod(formParams).then(result => {
      const dataSource = result['records'];
      const pagination = this.state.pagination;
      pagination.current = current;
      pagination.total = result['totalCount'];
      pagination.pageSize = limit;

      this.setState({
        loading: false,
        dataSource,
        pagination
      });
      this.props.loadCallback();
    }).catch(err=>{
      this.setState({ loading: false })
    });
  }
  handleChange(pagination) {
    this.__search(pagination.current, pagination.pageSize * (pagination.current - 1), pagination.pageSize)
  }
  queryTableData(params) {
    this.params = params;
    this.__search()
  }
  //刷新数据：保留前面的查询条件数据
  refreshTable(obj) {
    if(obj){
      Object.assign(this.params, obj);
    }
    const pagination = this.state.pagination;
    this.__search(pagination.current, pagination.pageSize * (pagination.current - 1), pagination.pageSize);
  }
  resetTable(){
    this.params = {};
    this.props.clearSelectedRows && this.props.clearSelectedRows()
    this.setState({
      dataSource: [],
      pagination: {
        current: undefined,
        total: 0,
      }
    })
  }
  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }
  render() {
    return (
      <Table {...this.state}
             {...this.props}
        onChange={this.handleChange}
        bordered/>
    )
  }
}
