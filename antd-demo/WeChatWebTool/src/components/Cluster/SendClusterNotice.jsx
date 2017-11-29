import React from 'react';
import {Form, Input, Button, Modal, Select, DatePicker, Upload, Icon} from 'antd';
import {Success, Confirm,Errors} from '../Commons/CommonConstants';
import {batchClusterNotice} from '../../services/cluster';
const FormItem = Form.Item;
/**
 * 群公告用语
 */
 class SendClusterNotice extends React.Component{
   constructor(props){
     super(props);
     this.state={
       visible: props.clusterNoticeVisible,
       record: props.clusterNoticeDetails,
       contentType: "text",
       adsContent: "",
       file_notice: "",
       fileList: []
     }
     this.handleOk = this.handleOk.bind(this)
     this.handleCancel = this.handleCancel.bind(this)
     this.handleContentTypeChange = this.handleContentTypeChange.bind(this)
     this.onBeforeUpload = this.onBeforeUpload.bind(this)
     this.onFileChange = this.onFileChange.bind(this)
     this.handlePreview = this.handlePreview.bind(this)
     this.handleRemove = this.handleRemove
       .bind(this)
   }

  onBeforeUpload(file) {
    const fileName = file.name
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'), fileName.length).toLowerCase()
    if(fileExtension !== '.xlsx' && fileExtension !== '.xls') {
      Errors('只能上传 xlsx或xls 文件哦！');
      return false;
    }

    if(file.size > 10*1024*1024) {
      Errors('只能上传 小于10M 的文件哦！');
      return false;
    }

    if(this.state.fileList.length > this.props.maxFileSize - 1) {
      Errors(`只能上传最多${this.props.maxFileSize}个文件`);
      return false;
    }
    return true;
  }

  onFileChange({event, file, fileList}) {
     var adsContent = "", file_notice = ""
    fileList = fileList.filter((file) => {
      const res = file.response;
      console.log("yyzy",res);
      if (res) {
        if(res['code'] === 200) {
          adsContent = res['data']['echoNoticeList'][0]['notice'] || ""
          file_notice = res['data']['file_notice'] || ""
          return true
        } else {
          Errors("上传失败,请重新上传!"+res['message']);
          return false;
        }
      }
      return true;
    });
    this.setState({
      fileList,
      adsContent,
      file_notice
    });
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
    this.setState({
      fileList,
      adsContent: "",
      file_notice: ""
    });
  }

  handleContentTypeChange(type){
     if( this.state.contentType === type ) return false
     this.setState({
       contentType: type
     })
   }

   handleOk(){
     this.props.form.validateFields((errors, values) => {
       if(!!errors) {
         return;
       }
       let value={
         cluster_sn_list: this.props.clusterSns,
         all_flag: values.all_flag,
         notice: values.notice,
         file_notice: this.state.file_notice,
         send_time: values['send_time'].format('YYYY-MM-DD HH:mm:ss')
       };
       Confirm(function(){
         batchClusterNotice(value).then(({jsonResult}) => {
           Success("发送成功");
           this.handleCancel();
         });
       }.bind(this), "确定发送群公告用语吗?")
     })
   }
   handleCancel(){
     this.setState({
       visible: false,
       fileList: []
     });
     this.props.onUpdateVisible();
     this.props.onRefresh();
     this.props.handleSubmitCallback();

   }
   render(){
     const formItemLayout = {
       labelCol: {span: 8},
       wrapperCol: {span: 14}
     }
     const {getFieldDecorator} = this.props.form;
     const {visible, record, contentType, fileList, adsContent} = this.state;
     const action = AppName + "/cluster/loadClusterNoticeFile1";
     return (
       <Modal visible={visible} maskClosable={false} title={`发群公告`}
         onOk={this.handleOk} onCancel={this.handleCancel}
         footer={[
           <Button icon="poweroff" size="large" onClick={this.handleCancel}>取消</Button>,
           <Button type="primary" icon="check" size="large" onClick={this.handleOk}>提交</Button>
         ]}>
         <Form horizontal>
           <FormItem label="群ID" {...formItemLayout} style={{marginTop: -12}}>
             <p>
               {
                record.map((item, idx)=> <span style={{with:'60px'}}>{item.cluster_id},</span>)
               }
            </p>
           </FormItem>
           <FormItem label="是否全部群" {...formItemLayout}>
             {getFieldDecorator('all_flag', {initialValue:''})(
               <Select allowClear >
                 <Select.Option value="T">是</Select.Option>
                 <Select.Option value="">不是</Select.Option>
               </Select>
             )}
           </FormItem>
           <FormItem label="发布方式" {...formItemLayout}>
               <Select onChange={this.handleContentTypeChange} value={contentType}>
                 <Select.Option value="text">输入文字</Select.Option>
                 <Select.Option value="file">上传文件</Select.Option>
               </Select>
           </FormItem>
           {contentType === 'text' && (
             <FormItem label="群公告用语" {...formItemLayout} required>
               {getFieldDecorator('notice', {initialValue:"", rules: [{required: true, message: '请输入群公告用语'}]}
               )(
                 <Input type="textarea" rows={5} placeholder="群公告用语，跟ta说句话吧~"/>
               )}
             </FormItem>
           )}
           {contentType === 'file' && (
             <FormItem label="上传公告" {...formItemLayout} required>
               {getFieldDecorator('file_notice', {initialValue:"", rules: [{required: true, message: '请选择上传文件'}]}
               )(
                 <Upload
                   multiple
                   action={action}
                   className="upload-list-inline"
                   fileList={fileList}
                   beforeUpload={this.onBeforeUpload}
                   onChange={this.onFileChange}
                   onPreview={this.handlePreview}
                   onRemove={this.handleRemove}>
                   <Button type="ghost" >
                     <Icon type="upload" /> 点击上传
                   </Button>
                 </Upload>
               )}
               <p>{adsContent}</p>
             </FormItem>
           )}
           <FormItem label="公告发送时间" {...formItemLayout} required>
             {getFieldDecorator('send_time', {initialValue:"", rules: [{required: true, message: '请输入公告发送时间'}]}
             )(
               <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{width: "100%"}}/>
             )}
           </FormItem>
         </Form>
       </Modal>
     );
   }
 }
 export default Form.create()(SendClusterNotice);
