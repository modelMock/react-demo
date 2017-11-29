import React,{Component} from 'react';
import {Form ,Icon,Select,Row,Col,Input,Button,Modal,Upload} from 'antd';
import ContentService from '../../services/content';
import {Confirm, Success,Errors} from '../Commons/CommonConstants';
import resourceManage from '../ResourceManage';
const FormItem = Form.Item;
const Option= Select.Option;
/**
 * 内容库=>审核主播朋友圈库
 */

class AuditShowPublishLibModal extends Component{
  constructor(props){
    super(props);
    this.state={
      visible:props.auditShowPublishLiVisible,
      applyResult:[],
      acopeResult:[],
    };
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleAuditNoPass=this.handleAuditNoPass.bind(this);
    this.auditShowId=resourceManage.getActivedBtnIds().indexOf("63-1") >= 0;
  }
  handleOk(e){
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if(!!errors) return;
      values['agree']='T';
      values['record_id']=this.props.record.record_id;
      Confirm(function(){
        ContentService.auditShowPublishLib(values).then(({jsonResult})=>{
          Success("提交成功!");
          this.handleCancel();
          this.props.onRefreshAudit();
        });
      }.bind(this), "确定提交吗?");
    });
  }
  handleAuditNoPass(e){
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if(!!errors) return;
      values['agree']='F';
      values['record_id']=this.props.record.record_id;
      Confirm(function(){
        ContentService.auditShowPublishLib(values).then(({jsonResult})=>{
          Success("提交成功!");
          this.handleCancel();
          this.props.onRefreshAudit();
        });
      }.bind(this), "确定提交吗?");
    });
  }
  handleCancel(){
    this.setState({visible:false});
    this.props.onSetVisible();
  }
  componentDidMount(){
    ContentService.queryApply().then(({jsonResult})=>{
      this.setState({applyResult:jsonResult});
    });
    ContentService.queryScope().then(({jsonResult})=>{
      this.setState({acopeResult:jsonResult});
    });
  }
  render(){
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const {getFieldDecorator} = this.props.form;
    const {visible} = this.state;
    console.log("this.props.record.pic_url_json",this.props.record)
    return(
      <Modal visible={visible} maskClosable={false} title={`审核朋友圈库`} width={1000}
        onOk={this.handleOk} onCancel={this.handleCancel}
        footer={
            this.auditShowId && this.props.record.is_audit=='T'?
            [
              <Button type="primary" icon="check" size="large" onClick={this.handleOk}>审核通过</Button>,
              <Button icon="close" size="large" onClick={this.handleAuditNoPass}>审核不通过</Button>
            ]
            :null
        }
        >
        <Form horizontal>
          <FormItem label="标题" {...formItemLayout}>
            <p>{this.props.record.title}</p>
          </FormItem>
          <FormItem label="文本信息" {...formItemLayout} >
            <p>{this.props.record.text_content}</p>
          </FormItem>
          <FormItem label="转发链接" {...formItemLayout}>
            <p style={{width:"300px",overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}><a href={`${this.props.record.transpond_link}`} target="_blank">{this.props.record.transpond_link}</a></p>
          </FormItem>
          <FormItem label="图片" {...formItemLayout}>
            {
              this.props.record.pic_url_json &&
              JSON.parse(this.props.record.pic_url_json).map((item, idx)=>
                <a href={`${item.O}`} target="_blank" ><img src={item.O} width="80px" height="80px"/></a>
              )
            }
          </FormItem>
          <FormItem label="内容库ID" {...formItemLayout}>
            <p>{this.props.record.record_id}</p>
          </FormItem>
          <FormItem label="使用范围" {...formItemLayout}>
            {getFieldDecorator('scope',{initialValue:this.props.record.scope})(
              <Select  allowClear>
                {
                  this.state.acopeResult.map((item, idx)=> <Option key={idx}
                                                                 value={`${item.item_value}`}>{item.item_name}</Option>)
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="种类" {...formItemLayout} >
            {getFieldDecorator('apply',{initialValue:this.props.record.apply})(
              <Select  allowClear>
                {
                  this.state.applyResult.map((item, idx)=> <Option key={idx}
                                                                 value={`${item.item_value}`}>{item.item_name}</Option>)
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="综合来源" {...formItemLayout} >
            <p>{this.props.record.source_info}</p>
          </FormItem>
          <FormItem label="自评论" {...formItemLayout} >
            <p>{this.props.record.self_sns}</p>
          </FormItem>
        </Form>
    </Modal>
    );
  }
}
export default Form.create()(AuditShowPublishLibModal);
