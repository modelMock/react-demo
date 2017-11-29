import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Button, Icon} from 'antd'
import webUtils from '../../commons/utils/webUtils'
import './UploadImg.less'

export default class ImageUpLoad extends Component {
  static propTypes = {
    // 上传按钮文本
    uploadButtonText: PropTypes.string,
    // 上传图片最大大小
    maxSize: PropTypes.number,
    //支持的上传图片的数量
    maxImgLength: PropTypes.number
  }
  static defaultProps = {
    uploadButtonText: "上传",
    maxSize: 4,
    maxImgLength: 4
  }

  constructor(props) {
    super(props)
    let fileList = []
    if(props.fileList){
      fileList = this._mapAllUrls(props.fileList)
    }
    this.state = {
      fileList: fileList
    }
    this.handleTriggerUploadEvent = this.handleTriggerUploadEvent.bind(this)
    this.handleUpload = this.handleUpload.bind(this)
  }
  _mapAllUrls(urlListStr = '') {
    return urlListStr.split(',').map(url => ({url: webUtils.fullPictureUrl(url)}))
  }
  // 触发上传图片事件
  handleTriggerUploadEvent(e) {
    e.stopPropagation()
      this.fileInput && this.fileInput.click()
  }
  _checkFile(file) {
    if(file.type !== 'image/jpeg' && file.type !== 'image/png'){
      webUtils.alertFailure("只能上传 JPG或PNG 文件哦！", 0)
      return false
    }
    if(file.size > this.props.maxSize * 1024 * 1024){
      webUtils.alertFailure(`只能上传 小于${this.props.maxSize}M 的图片哦！`)
      return false
    }
    return true
  }
  // 上传图片
  handleUpload(e) {
    e.stopPropagation()
    let files = Array.from(e.target.files)
    for (let file of files) {
      if(this._checkFile(file) === false){
        return false
      }
      file.url = URL.createObjectURL(file)
    }
    let fileList = this.state.fileList.concat(files)
    // 超过4张，后面的删掉
    if(fileList.length > this.props.maxImgLength){
      fileList.splice(this.props.maxImgLength, fileList.length - this.props.maxImgLength)
    }
    this.setState({
      fileList
    })
    // 清除当前值，不然相同图片二次上传失效
    e.target.value = ''
    if(fileList.length > 0){
      this.triggerChange(fileList)
    }else{
      this.triggerChange("")
    }
  }
  // 将fileList当做控件的值
  triggerChange(changedValue) {
    const onChange = this.props.onChange
    if(onChange){
      onChange(changedValue)
    }
  }
  // 删除当前待上传图片
  handleRemove(url, e) {
    e && e.stopPropagation()
    const fileList = this.state.fileList.filter(file => file.url !== url)
    this.setState({
      fileList
    })
    this.triggerChange(fileList)
  }
  componentWillReceiveProps(nextProps) {
    // form表单重置时，清空上传图片列表
    if(!nextProps.fileList){
      this.setState({
        fileList: []
      })
      //在点击上传后nextProps.fileList会是完整的数组 所以要判断一下类型
    }else if(typeof nextProps.fileList === 'string'){
      const fileList = this._mapAllUrls(nextProps.fileList)
      this.setState({
        fileList
      })
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return this.state.fileList !== nextState.fileList
  }
  renderItem(file, index) {
    return (
      <li className="upload-select-item" key={index}>
        <a href={file.url} target="_blank">
          <img src={file.url}/>
        </a>
        <span className="upload-delete"
              onClick={this.handleRemove.bind(this, file.url)}>
         <Icon type="delete"/>
       </span>
      </li>
    )
  }
  render() {
    const {fileList} = this.state
    const disabled = this.props.disabled || fileList.length >= this.props.maxImgLength
    return (
      <div className="img-upload-container">
        <div className="img-upload-upload" >
          <Button icon="upload"
                  disabled={disabled}
                  onClick={this.handleTriggerUploadEvent}>
            {this.props.uploadButtonText}
            </Button>
          <input ref={obj => this.fileInput = obj}
                 type="file" name="fileSelect"
                 multiple={true}
                 accept="image/jpg,image/jpeg,image/png"
                 onChange={this.handleUpload}
                 style={{display: 'none'}}/>
        </div>
        <ul className="img-upload-preview">
          {fileList.map((file, index) => this.renderItem(file, index))}
        </ul>
      </div>
    )
  }
}