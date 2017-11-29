import React from 'react';
import {QQFACES} from './Utils';
import './FaceCollection.less';

// 表情层抽象类封装
class FaceLayer extends React.Component{
  constructor(props){
    super(props)
  }
  handleFaceClicked(item, e){
    e.preventDefault()
    this.props.onFaceClick(item)
  }
  render(){
    return (
      <div className="face-container">
        <div className={this.props.rootCls}>
          {this.props.items.map((item, index)=>{
            return  <a key={item.type+"_"+index}
              title={item.title}
              type={item.type}
              onClick={this.handleFaceClicked.bind(this, item)}
              className={item.class}>
              {item.title}
            </a>
          })}
        </div>
      </div>
    )
  }
}
FaceLayer.PropTypes = {
  rootCls: React.PropTypes.string.isRequired,
  items: React.PropTypes.array.isRequired
}
const FaceCollection = (props) => {
  return (
    <div className="face-tab-container">
      <FaceLayer onFaceClick={props.onFaceClick} rootCls="qq_face" items={QQFACES} />
    </div>
  )
}
FaceCollection.PropTypes = {
  onFaceClick: React.PropTypes.func.isRequired
}
export default FaceCollection;
