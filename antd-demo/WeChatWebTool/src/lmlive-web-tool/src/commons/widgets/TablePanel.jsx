import React, {Component} from 'react'
import CommonTable from "./CommonTable";

const DEFAULT_PAGE_SIZE = 10;
class TablePanel extends Component {
  /**
   * 主动查询：通用表格分页change查询数据
   * @param tableParams 表格分页自带参数：页数、每页数据条数
   * @param successFn   请求成功
   * @param failFn      请求失败
   */
  doTableSearch = (tableParams, successFn, failFn) => {
    const formValues = !this.formValues ? this.props.formValues || {} : this.formValues || {};
    const params = {...formValues, ...tableParams};
    this.doSearch(params, successFn, failFn);
  }
  /**
   * 被动查询：form表单搜索
   * @param values  表单数据对象
   */
  doFormSearch = (values={}) => {
    // 已经在加载中了
    if(this.commonTable.loading()) return

    // 通常情况下，上下结构：上是表单，下是表格，这个时候不需要this.props.formValues了
    // 如果是主播、用户综合信息中多个tab页的，这个时候表单值存放到父类State中，传到各个TabPane下的表格中更好，
    // 这样就不需要每个子TabPane存放一个this.formValues了
    !('formValues' in this.props) && (this.formValues = values)

    // limit：取pagination中pageSize，因为有可能手动选择每页20、30条记录
    const params = {...values, offset: 0, limit: this.commonTable.getPageSize()}
    this.doSearch(params, (dataSource, totalCount) => {
      this.commonTable.setTableData(dataSource, totalCount);
    }, () => this.commonTable.loading())
  }
  // 查询表格数据后台方法，必须覆盖
  doSearch(params, successFn, failFn){
    /*BaseService.queryTableData(params).then(result => {
      successFn && successFn(result['records'], result['totalCount'])
    }).catch(err => failFn && failFn())*/
  }
  renderTable(config={}){
    return <CommonTable ref={obj => this.commonTable = obj}
                        pageSize={config.pageSize || DEFAULT_PAGE_SIZE}
                        config={config}
                        onSearch={this.doTableSearch} />
  }
}

export default TablePanel;