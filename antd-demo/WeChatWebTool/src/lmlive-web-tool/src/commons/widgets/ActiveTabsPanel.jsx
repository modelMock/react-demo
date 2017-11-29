import React, {Component} from 'react';

/**
 * TabsPane中存放普通面板
 * @see: <ActiveTablePanel isActived={this.state.activeKey === 'user'} />
 */
export default class ActiveTabsPanel extends Component{
  static defaultProps = {
    isActived: false,
    // 表单数据是否验证通过能查询数据了：羚萌ID 或 直播间ID必输入
    canQuery: () => { return false }
  }
  componentDidMount(){
    // 当前TabsPane初次激活
    this.props.canQuery() && this.activedPanel(this.props.formValues);
  }
  componentWillReceiveProps(nextProps){
    const {isActived, formValues} = nextProps
    if(isActived=== true && this.props.formValues !== formValues){
      this.props.canQuery() && this.activedPanel(formValues)
    }
  }
  // 当前tab页激活了，开始你的表演~
  activedPanel(params){

  }
}