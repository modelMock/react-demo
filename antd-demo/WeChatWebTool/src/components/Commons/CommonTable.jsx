/*通用Table*/
import React, { Component, PropTypes } from 'react';
import { Table, message, Input } from 'antd';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import './CommonTable.less';

const PAGE_SIZE = 10;
export default class CommonTable extends Component {

  static proptypes = {
    //表格columns
    columns: PropTypes.array.isRequired,
    //行选择
    rowSelection: PropTypes.object,
    //表格ajax请求service方法
    fetchTableDataMethod:  PropTypes.func.isRequired,
    //查询完数据后回调
    onLoadedData: PropTypes.func,
    //表格行主键，建议填写
    rowKey: React.PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func
    ]),
  }

  static defaultProps = {
    //自定义，设计时每个表格都有一列id
    rowSelection: null,
    onLoadedData: function(){},
    scroll: { x: 1100 },
  }

  constructor(props) {
    super(props);
    let onShowSizeChange=(current, pageSize) => {
      let pagination={pagination:{pageSize: pageSize}};
       this.setState({ pagination: pagination });
     };
    this.state = {
      dataSource: [],
      pagination: {
        pageSize: PAGE_SIZE,
        onShowSizeChange:onShowSizeChange,//选择一页显示多少条记录
        showQuickJumper: true,  //显示可以快速跳转至某页
        showSizeChanger: true,  //显示可以改变 pageSize
        showTotal: ( total => (`共 ${total} 条`))   //显示总共有多少条数据
      },
      loading: false
    };

    this.handleTableChange = this.handleTableChange.bind(this);
    //除了分页等参数外：form表单搜索数据等
    this._extraParams = null;
  }

  //public:对外查询表格方法
  queryTableData(extraParams) {
      this._extraParams = extraParams;
      this.fetch();
  }

  setExtraParams(params) {
    if(!this._extraParams) {
      this._extraParams = params;
    }
  }

  //刷新数据：保留前面的查询条件数据
  refreshTable() {
    const pagination = this.state.pagination;
    this.fetch({
      offset: pagination.pageSize * (pagination.current - 1),
      limit: pagination.pageSize
    }, pagination.current);
  }

  //private: 表格change事件：分页，过滤、排序等操作
  handleTableChange(pagination) {
    this.fetch({
      offset: pagination.pageSize * (pagination.current - 1),
      limit: pagination.pageSize
    }, pagination.current);
  }

  //private: ajax请求数据，默认带上分页数据
  fetch(params = {offset: 0, limit: PAGE_SIZE}, current=1) {
    params = Object.assign({}, params, this._extraParams);

    //开始加载数据
    this.setState({ loading: true });

    this.props.fetchTableDataMethod(params).then( ({jsonResult}) => {
      const dataSource = jsonResult['records'];
      const pagination = this.state.pagination;
      pagination.current = current;
      pagination.total = jsonResult['totalCount'];

      //数据加载完成，显示表格数据
      this.setState({
        loading: false,
        dataSource,
        pagination
      });
      this.props.onLoadedData();
    });
  }

  //返回当前表格数据
  getDataRource() {
    return this.state.dataSource;
  }

  getTotalCount() {
    return this.state.pagination.total;
  }

  //浅层比较props、statue值，未检测到变化，返回false，减少render，优化性能
  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }

  render() {
    console.log('CommonTable => render ');

    const { dataSource, pagination, loading } = this.state;

    return (
      <Table {...this.props}
          {...this.state}
          dataSource = { dataSource }
          pagination = { pagination }
          loading = { loading }
          onChange = { this.handleTableChange }
          bordered/>
    );
  }
}
