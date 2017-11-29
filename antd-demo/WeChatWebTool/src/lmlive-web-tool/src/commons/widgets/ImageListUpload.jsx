import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Upload, Button, Icon} from 'antd';
import {hashHistory} from 'react-router';
import webUtils from '../../commons/utils/webUtils';

/**
 * 多图片上传，返回url串，不支持编辑
 */
export default class ImageListUpload extends Component {
  static propTypes = {
    // 图片上传存储目录
    uploadFolderName: PropTypes.string.isRequired,
    // 上传按钮文本
    uploadButtonText: PropTypes.string,
    // 上传图片最大大小
    maxSize: PropTypes.number,
  };
  static defaultProps = {
    uploadButtonText: "上传",
    maxSize: 4,
  };
  constructor(props) {
    super(props);
    this.state = {
      fileList: []
    };
    this.beforUpload = this.beforUpload.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  // 验证图片类型 和 大小
  beforUpload(file) {
    if(file.type !== 'image/jpeg' && file.type !== 'image/png') {
      webUtils.alertFailure("只能上传 JPG或PNG 文件哦！", 0);
      return false;
    }
    if(file.size > this.props.maxSize*1024*1024) {
      webUtils.alertFailure('只能上传 大于4M 的图片哦！');
      return false;
    }
    return true;
  }
  // 上传文件改变事件
  handleChange(info) {
    let fileList = info.fileList;
    fileList = fileList.filter((file) => {
      if (file.response) {
        if(file.response.code !== 200 && !!file.response.message) {
          webUtils.alertFailureCallback(file.response.message, () => {
            if(file.response.code === 500) {
              hashHistory.replace("/login");
            }
          });
        }
        return file.response.code === 200;
      }
      return true;
    });
    this.setState({ fileList });

    if(fileList.length > 0) {
      const urlList = [];
      for(const file of fileList){
        if(file.response && file.response.code === 200 && file.response.message === 'success') {
          urlList.push(file.response.data)
        }
      }
      if(urlList.length > 0){
        this.triggerChange(urlList);
      }
    } else {
      this.triggerChange()
    }
  }
  // 将后台回传url串当做控件的值
  triggerChange(changedValue) {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(changedValue);
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return this.state.fileList !== nextState.fileList
  }
  componentDidMount() {
    if(!this.props.uploadFolderName) {
      webUtils.alertFailure("请正确填写图片上传目录！")
    }
  }
  render() {
    const action = webUtils.getDebugMode() ? "/show-manager/app/uploadImage" : "/app/uploadImage";
    const {uploadFolderName, uploadButtonText, disabled} = this.props;
    return (
      <Upload
        action={action}
        fileList={this.state.fileList}
        data={file => ({
          uploadFolderName: uploadFolderName,
          sessionId: localStorage.getItem("sessionId"),
        })}
        listType="picture"
        className="upload-list-inline"
        showUploadList={true}
        beforeUpload={this.beforeUpload}
        onChange={this.handleChange}>
        <Button disabled={disabled}>
          <Icon type="upload" /> {uploadButtonText}
        </Button>
      </Upload>
    )
  }
}
