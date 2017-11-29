import React, {Component, PropTypes} from 'react';
import {Menu, Breadcrumb, Icon, Modal, Button} from 'antd';
import classNames from 'classnames';
import './TipTools.less';

export class Loading extends Component {
    constructor(props) {
        super(props);
    }
    render(){

      const loadCls = classNames('w-loading',{
        "w-loading-layer": this.props.layer === true
      })

      return (
        <div className={loadCls} >
          <div className="w-loading-body">
            <Icon type="loading" /> 加载中...
          </div>
        </div>
      )
    }
}

export class EmptyDataTip extends Component{
  static defaultProps = {
    msg: "暂无数据显示"
  }
  constructor(props){
    super(props)
  }
  render(){
    return (
      <div className="lv-empty-tips">
        <Icon type="frown-o" />
        <span>{this.props.msg}</span>
      </div>
    )
  }
}
