import React,{Component} from 'react';
import {Form ,Icon,Select,Row,Col,Input,Button,Modal,Upload,Radio } from 'antd';
import ContentService from '../../services/content';
import {Confirm, Success,Errors} from '../Commons/CommonConstants';
const FormItem = Form.Item;
const Option= Select.Option;
const RadioGroup = Radio.Group;
/**
 * 内容库=>增加朋友圈内容库
 */

class AddContentModal extends Component{
  constructor(props){
    super(props);
    this.state={
      fileList: [],          //上传的图片集合
      visible:props.addContentVisible,
      applyResult:[],
      radioValue:"1",
    };
    this.onBeforeUpload = this.onBeforeUpload.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
    this.handlePreview = this.handlePreview.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.onRadioChange=this.onRadioChange.bind(this);
  }
  handleOk(e){
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if(!!errors) return;
      let picDataList= this.state.fileList.map(item => item.data_file)
      values['pic_url_json']=JSON.stringify(picDataList);
      Confirm(function(){
        ContentService.addShowPublishLib(values).then(({jsonResult})=>{
          Success("提交成功!");
          this.handleCancel();
          this.props.onRefresh();
        });
      }.bind(this), "确定提交吗?");
    });
  }
  handleCancel(){
    this.setState({visible:false});
    this.props.onUpdateVisible();
  }
  componentDidMount(){
    ContentService.queryApply().then(({jsonResult})=>{
      this.setState({applyResult:jsonResult});
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
         file['thumbUrl'] = data['O'];
         file['url'] = data['O'];
         // data['B']不显示缩略图
         file['raw_url'] = data['B'];
         file['wx_thumbUrl'] = data['S'];

         file['data_file']=data;
         return true;
       } else {
         Errors("上传失败,请重新上传!"+res['message']);
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
onRadioChange(e){
  this.setState({
    radioValue: e.target.value,
  });
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
      labelCol: { span: 6 },
      wrapperCol: { span: 10 },
    };
    const {getFieldDecorator} = this.props.form;
    const {visible,applyResult,radioValue} = this.state;
    const action = AppName + "/ad/uploadAd";
    return(
      <Modal visible={visible} maskClosable={false} title={`增加朋友圈库`} width={1000}
        onOk={this.handleOk} onCancel={this.handleCancel}
        footer={[
          <Button icon="poweroff" size="large" onClick={this.handleCancel}>取消</Button>,
          <Button type="primary" icon="check" size="large" onClick={this.handleOk}>提交</Button>
        ]}
        >
        <Form horizontal>
          <Row gutter={16}>
            <Col span={24}>
              <FormItem label="内容类型" {...formItemLayout} required>
                {getFieldDecorator('content_type',{initialValue:radioValue})(
                  <RadioGroup value={radioValue} onChange={this.onRadioChange}>
                    <Radio value="1">图文</Radio>
                    <Radio value="3">链接</Radio>
                  </RadioGroup>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <FormItem label="文本信息" {...formItemLayout} required>
                {getFieldDecorator('text_content', {rules:[{required:true, message:"请输入文本信息"}]})(
                  <Input type="textarea" placeholder="请输入文本信息"/>
                )}
              </FormItem>
              {radioValue == "3" && <span><FormItem label="标题" {...formItemLayout}>
                {getFieldDecorator('title', {rules:[{required:true, message:"请输入标题"}]})(
                  <Input type="textarea" placeholder="请输入标题"/>
                )}
              </FormItem>
              <FormItem label="转发链接" {...formItemLayout}>
                {getFieldDecorator('transpond_link', {rules:[{required:true, message:"请输入转发链接"}]})(
                  <Input type="textarea" placeholder="请输入转发链接"/>
                )}
              </FormItem></span>}
              <FormItem label="图片" {...formItemLayout} required >
                {getFieldDecorator('pic_url_json', {rules:[{required:true, message:"请选择图片"}]})(
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
                )}
              </FormItem>
              <FormItem label="自评论" {...formItemLayout}>
                {getFieldDecorator('self_sns')(
                  <Input type="textarea" placeholder="请输入自评论"/>
                )}
              </FormItem>
              <FormItem label="种类" {...formItemLayout}>
                {getFieldDecorator('apply', {rules:[{required:true, message:"请选择种类"}]})(
                  <Select>
                    {
                      applyResult.map((item, idx)=> <Option value={item.item_value}>{item.item_name}</Option>)
                    }
                  </Select>
                )}
              </FormItem>
              <FormItem label="内容组" {...formItemLayout}>
                {getFieldDecorator("content_group", {initialValue:"",rules:[{required:true, message:"请输入内容组"}]})(
                  <Input/>
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
    </Modal>
    );
  }
}
export default Form.create()(AddContentModal);
