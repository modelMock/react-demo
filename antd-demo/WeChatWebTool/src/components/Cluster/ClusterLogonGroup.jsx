import React from 'react';
import { Form, Row, Col, Input, Select, Button, Table, Tag,Modal,Upload,Icon } from 'antd';
import {qrLogin} from '../../services/cluster';
import {Errors} from '../Commons/CommonConstants';
import {Confirm, Success} from '../Commons/CommonConstants';
import UploadField from '../Ads/UploadField';
const FormItem = Form.Item;
const Option = Select.Option;

class ClusterLogonGroup extends React.Component{
  constructor(props){
     super(props);
     this.state={
       fileList: [],              //上传的图片集合
       dataUrl:null               //后台返回的二维码图片地址
     };
     this.onBeforeUpload = this.onBeforeUpload.bind(this);
     this.onFileChange = this.onFileChange.bind(this);
     this.handlePreview = this.handlePreview.bind(this);
     this.handleRemove = this.handleRemove.bind(this);
     this.handleSubmit=this.handleSubmit.bind(this);
  }

handleSubmit(e){
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
         if(values.mobile==null||values.mobile==''){
           Errors("运营手机号不能为空！");
           return;
         }
        if(this.state.dataUrl==null){
          Errors("二维码图片不能为空！");
          return;
        }
         let value={
           mobile:values.mobile,
           qrlogin_url:this.state.dataUrl
         }
       qrLogin(value).then(({jsonResult}) => {
            this.setState({dataUrl:''});
         });
    });
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
    console.log("yyzy",res);
    if (res) {
      if(res['code'] === 200) {
        let data = res['data'][0];
        this.setState({dataUrl:data});
        return true;
      } else {
        Errors("上传失败,请重新上传:"+res['message']);
      }
      return false;
    }
    return true;
  });
  this.setState({ fileList });
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
}

componentWillReceiveProps(nextProps) {
  if('isResetData' in nextProps && nextProps['isResetData'] === true) {
    this.setState({
      fileList: [],
    });
  }
}

  render(){
    const formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span:6},
    };
    const {getFieldDecorator} = this.props.form;
        const action = AppName + "/common/upload2";
    return (
      <Form horizontal onSubmit={this.handleSubmit}>
                <FormItem label="运营手机号" {...formItemLayout}>
                    {getFieldDecorator('mobile', {initialValue:''})(
                        <Input placeholder="请输入运营手机号" />
                    )}
                </FormItem>
                <FormItem labelCol={{span: 4}} wrapperCol={{span: 20}} label="二维码图片" isRequired>
                  <Upload
                      multiple
                      action={action}
                      data={{
                        sessionId: localStorage.getItem('sessionId'),
                        upload_type:"QrCode"
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
                  </Upload>
                </FormItem>
                <FormItem wrapperCol={{offset: 4, span: 6}}>
                  <Button type="primary" icon="check" size="large" htmlType="submit">提交</Button>
                </FormItem>
      </Form>
    );
  }
}
export default Form.create()(ClusterLogonGroup);
