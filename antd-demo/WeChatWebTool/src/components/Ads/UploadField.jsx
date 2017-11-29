import React, {Component} from 'react';
import {Upload, Button, Icon} from 'antd';
import {Errors} from '../Commons/CommonConstants';

export default class UploadField extends Component {

  constructor(props) {
    super(props);
    this.state={
      fileList: [],              //上传的图片集合
    };
    this.onBeforeUpload = this.onBeforeUpload.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
    this.handlePreview = this.handlePreview.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
  }

  onBeforeUpload(file) {
    // headers['X-Requested-With']跨域，这里设置为null
    console.log("上传文件类型 => ", file);
    if(file.type !== 'image/jpeg' && file.type !== 'image/png') {
      Errors('只能上传 JPG或PNG 文件哦！');
      return false;
    }

    if(file.size > 10*1024*1024) {
      Errors('只能上传 小于10M 的文件哦！');
      return false;
    }

    if(this.state.fileList.length > this.props.maxFileSize - 1) {
      Errors(`只能上传最多${this.props.maxFileSize}张图片`);
      return false;
    }
    return true;
  }

  onFileChange({event, file, fileList}) {
    fileList = fileList.filter((file) => {
      const res = file.response;
      if (res) {
        if(res['code'] === 200) {
          let data = res['data'][0];
          file['thumbUrl'] = data['O'];
          file['url'] = data['O'];
          // data['B']不显示缩略图
          file['raw_url'] = data['B'];
          file['wx_thumbUrl'] = data['S'];
          return true;
        } else {
          Errors("上传失败,请重新上传!"+res['message']);
        }
        return false;
      }
      return true;
    });
    this.setState({ fileList });
    this.onFetchImgUrl();
  }

  handlePreview(file) {
    window.open('javascript:window.name;', '<script>location.replace("'+file['url']+'")<\/script>')
  }

  handleRemove(file) {
    let fileList = [];
    this.state.fileList.forEach( f => {
        if(f.uid !== file.uid) {
          fileList.push(f);
        }
    });
    console.log(fileList);
    this.setState({ fileList });
    this.onFetchImgUrl();
  }

  onFetchImgUrl() {
    let imgUrlList = this.state.fileList.map( file => (
        {"B": file['raw_url'],"S": file['wx_thumbUrl'],"O": file['thumbUrl']}
    ));
    this.props.onFetchImgUrl(imgUrlList);
  }

  componentWillReceiveProps(nextProps) {
    if('isResetData' in nextProps && nextProps['isResetData'] === true) {
      this.setState({
        fileList: [],
      });
    }
  }

  render() {
    const action = AppName + "/ad/uploadAd";
    return (
      <Upload
          multiple
          action={action}
          data={{
            sessionId: localStorage.getItem('sessionId')
          }}
          className="upload-list-inline"
          listType="picture"
          fileList={this.state.fileList}
          beforeUpload={this.onBeforeUpload}
          onChange={this.onFileChange}
          onPreview={this.handlePreview}
          onRemove={this.handleRemove}>
        <Button type="ghost" >
          <Icon type="upload" /> 点击上传
        </Button>
        {this.props.extraInfo}
      </Upload>
    );
  }
}
