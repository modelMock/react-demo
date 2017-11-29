import React, {Component, PureComponent} from 'react'
import {Icon} from 'antd'

const LoadingTip = ({text='加载中...'}) => <p className="data-loading"><Icon type="loading" />  {text}</p>
const EmptyDataTip = ({text='没有数据'}) => <p className="data-loading"><Icon type="frown" />  {text}</p>

class LoadMoreTip extends PureComponent{
  static defaultProps={
    cls: 'load-more-top'
  }
  constructor(props){
    super(props)
    this.state = {
      loading: false
    }
    this.handleLoadMore = this.handleLoadMore.bind(this)
  }
  handleLoadMore(){
    if(this.state.loading) return
    this.setState({ loading: true })
    this.props.onLoadMore()
  }
  loadMoreFinish(){
    if(this.state.loading){
      this.setState({
        loading: false
      })
    }
  }
  render(){
    return (
      <p className={this.props.cls} onClick={this.handleLoadMore}>
        {this.state.loading && <Icon type="loading" />}加载更多
      </p>
    )
  }
}

export {
  LoadingTip,
  EmptyDataTip,
  LoadMoreTip
}
