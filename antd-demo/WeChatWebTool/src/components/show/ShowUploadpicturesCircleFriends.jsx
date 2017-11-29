import React from 'react';
import { Form, Row, Col, Input, Select, Button, Table, Tag,Modal,Upload,Icon} from 'antd';
import {
  queryAssignAnchors,
  queryAssignOptrsAndFromAnchors,
  saveShowSnsTemplet,
  queryShowSnsPicTemplet,
  delShowSnsPicTemplet,
  queryShowSnsTextTemplet
} from '../../services/showAnchor';
import {Errors} from '../Commons/CommonConstants';
import {Confirm, Success} from '../Commons/CommonConstants';
import UploadField from '../Ads/UploadField';
const FormItem = Form.Item;
const Option = Select.Option;

class UploadpicturesCircleFriends extends React.Component{
  constructor(props){
     super(props);
     this.state={
       fileList: [],          //上传的图片集合
       dataUrl:null,         //后台返回的二维码图片地址
       anchorList:[],
       selectedAnchor: {},   //选中的主播
       imgUrl:[],           //展示主播图片
       anchor_id:null,
       showSnsTextTemplet:{}, //初始化通用文字模板  专用文字模板
     };
     this.onBeforeUpload = this.onBeforeUpload.bind(this);
     this.onFileChange = this.onFileChange.bind(this);
     this.handlePreview = this.handlePreview.bind(this);
     this.handleRemove = this.handleRemove.bind(this);
     this.handleSubmit=this.handleSubmit.bind(this);
     this.handleChangeAnchor=this.handleChangeAnchor.bind(this);
     this.deletShowSnsPicTemplet=this.deletShowSnsPicTemplet.bind(this);
     this.onQueryShowSnsTextTemplet=this.onQueryShowSnsTextTemplet.bind(this);
     this.filterAnchorOption=this.filterAnchorOption.bind(this);
  }

handleSubmit(e){
  e.preventDefault();
  this.props.form.validateFields((errors, values) => {
    if(!!errors){
      return;
    }
    let picDataList= this.state.fileList.map(item => item.data_file)
    values['picList']=picDataList;
    saveShowSnsTemplet(values).then(({jsonResult}) => {
      if(jsonResult){
        Success("提交成功！");
        this.props.form.setFieldsValue({
          text_templet_type: '',
          text:'',
          text_anchor:''
        });
        this.setState({fileList:[],imgUrl:[]});
      }
    });
  });
}

filterAnchorOption(input, option){
  if(!input) return true;
  const inputValue = input.toLowerCase();
  const {value, children} = option.props;
  return value.toLowerCase() == inputValue || children.toLowerCase().indexOf(inputValue) >= 0;
}

//当选择主播改变时，对应下面的组件值相应改变
handleChangeAnchor(value){
  this.ShowSnsPicTemplet(value);
  this.queryOptrAndOperationInfo(value);
  this.setState({anchor_id:value});
  this.props.form.setFieldsValue({
    text_templet_type: '',
    text:'',
    text_anchor:''
  });
}
//选择主播时，调用showmanage/queryShowSnsPicTemplet 展示已上传的模板图片
ShowSnsPicTemplet(anchorId){
  queryShowSnsPicTemplet(anchorId).then(({jsonResult}) => {
    this.setState({imgUrl:jsonResult});
  });
}
// 根据主播查询客服和运营号数据
queryOptrAndOperationInfo(anchorId) {
  queryAssignOptrsAndFromAnchors(anchorId).then(({jsonResult}) => {
    // 当前选中的主播数据对象
    const selectedAnchor = this.state.anchorList.find( anchor => anchor.anchor_id == anchorId);
    this.setState({selectedAnchor});
  });
}
//删除已上传的图片模板 delShowSnsPicTemplet
deletShowSnsPicTemplet(anchor_id,record_id){
  Confirm(function(){
    delShowSnsPicTemplet(anchor_id,record_id).then(({jsonResult}) => {
      if(jsonResult.message=="success"){
        Success("删除成功！");
        this.ShowSnsPicTemplet(anchor_id);
      }
    });
  }.bind(this), '确认执行删除该图片吗？');
}
//初始化通用文字模板  专用文字模板
onQueryShowSnsTextTemplet(value){
  this.props.form.setFieldsValue({
    text:'',
    text_anchor:''
  });
  if(value==null||value==''){
    Errors("文字模板类型不能为空！");
    return;
  }
  queryShowSnsTextTemplet({anchor_id:this.state.selectedAnchor.anchor_id||this.state.anchor_id,text_templet_type:value}).then(({jsonResult}) => {
    this.props.form.setFieldsValue({
                text:jsonResult.text,
                text_anchor:jsonResult.text_anchor
              });
            });
          }

componentDidMount() {
  queryAssignAnchors().then(({jsonResult}) => {
    if(jsonResult.length > 0) {
      this.setState({
        anchorList: jsonResult,
      });
       // 查询第一个主播对应客服和运营号数据
       this.queryOptrAndOperationInfo(jsonResult[0].anchor_id);
       this.ShowSnsPicTemplet(jsonResult[0].anchor_id);
      }
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
  const action = AppName + "/ad/uploadAd";
  const {anchorList,selectedAnchor,imgUrl} = this.state;
  return (
    <Form horizontal onSubmit={this.handleSubmit}>
      <FormItem {...formItemLayout} label="选择主播" required>
        {getFieldDecorator('anchor_id', {
          initialValue: selectedAnchor.anchor_id,
          rules:[{required:true, message:"请选择主播"}]})(
            <Select
              onChange={this.handleChangeAnchor}
              optionFilterProp="children"
              allowClear
              showSearch
              filterOption={this.filterAnchorOption}
              >
              {
                anchorList.map(anchor => (
                  <Option value={anchor.anchor_id}>{anchor.anchor_name}</Option>
                ))
              }
            </Select>
          )}
        </FormItem>
        <FormItem labelCol={{span: 4}} wrapperCol={{span: 20}} label="新增主播图片" isRequired>
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
        <FormItem label="文字模板类型" {...formItemLayout}>
          {getFieldDecorator('text_templet_type')(
            <Select allowClear
              onChange={this.onQueryShowSnsTextTemplet}
              optionFilterProp="children"
              >
              <Option value="notify">主播自有流量模板</Option>
              <Option value="notify_day">白天流量模板</Option>
              <Option value="notify_night">夜晚流量模板</Option>
            </Select>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="通用文字模板" extra="注：多个文本使用#分隔  " >
          {getFieldDecorator('text')(
            <Input type="textarea" size="large"/>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="专用文字模板" extra="注：多个文本使用#分隔  " >
          {getFieldDecorator('text_anchor')(
            <Input type="textarea" size="large"/>
          )}
        </FormItem>
        <FormItem wrapperCol={{offset: 4, span: 6}}>
          <Button type="primary" icon="check" size="large" htmlType="submit">提交</Button>
        </FormItem>
        <FormItem labelCol={{span: 4}} wrapperCol={{span: 20}} >
          {
            imgUrl.map((item, idx)=>
            <span style={{backgroundColor:"#ccc",height:"80px",display:"inline-block",marginRight:15}}>
              <img src={item.local_pic_url} width="80" height="80" />
              <a href="javascript:void(0)" onClick={this.deletShowSnsPicTemplet.bind(this,item.anchor_id,item.record_id)}>删除</a>
            </span>)
          }
        </FormItem>
      </Form>
    );
  }
}
export default Form.create()(UploadpicturesCircleFriends);
