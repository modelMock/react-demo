import TablePanel from "./TablePanel";

/**
 * TabsPane中存放Table
 * @see: <ActiveTablePanel isActived={this.state.activeKey === 'user'} />
 */
export default class ActiveTablePanel extends TablePanel{
  static defaultProps = {
    isActived: false,
    // 表单数据是否验证通过能查询数据了：羚萌ID 或 直播间ID必输入
    canQuery: () => { return false }
  }
  componentDidMount(){
    // 当前TabsPane初次激活
    this.props.canQuery() && this.doFormSearch(this.props.formValues);
  }
  componentWillReceiveProps(nextProps){
    const {isActived, formValues} = nextProps
    if(isActived=== true && this.props.formValues !== formValues){
      // 每次被激活时，重新查询表格数据
      this.props.canQuery() && this.doFormSearch(formValues)
    }
  }
}