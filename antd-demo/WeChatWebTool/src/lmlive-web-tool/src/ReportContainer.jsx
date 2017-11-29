import React, {Component} from 'react'

export default class ReportContainer extends Component{
  constructor(props){
    super(props)
  }
  render(){
    const reportPath = this.props.location.state.reportPath
    return reportPath && <iframe src={reportPath} frameBorder="0" width="100%" scrolling="no" height="100%"/>
  }
}