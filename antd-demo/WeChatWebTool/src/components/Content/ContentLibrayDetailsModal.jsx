import React,{Component} from 'react';
import {Form ,Icon,Select,Row,Col,Input,Button,Modal,Upload} from 'antd';
import ContentService from '../../services/content';
import {Confirm, Success,Errors} from '../Commons/CommonConstants';
const FormItem = Form.Item;
const Option= Select.Option;

/**
 * 内容库=>详情
 */

class ContentLibrayDetailsModal extends Component{
  constructor(props){
    super(props);
    this.state={
      visible:props.detailsVisible,
    };
    this.handleCancel = this.handleCancel.bind(this);
  }
  handleCancel(){
    this.setState({visible:false});
    this.props.onSetVisible();
  }
  render(){
      const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 14 },
      };
      const {getFieldDecorator} = this.props.form;
      const {visible} = this.state;
      console.log("this.props.recordDetails",this.props.recordDetails);
      return(
        <Modal visible={visible} maskClosable={false} title={`详情`} width={1000}
           onCancel={this.handleCancel}
          footer={[]}
          >
          <Form horizontal>
            <Row gutter={16}>
              <Col span={8}>
                <FormItem label="主播" {...formItemLayout} >
                  <p>{this.props.recordDetails.anchor_name}</p>
                </FormItem>
                <FormItem label="标题" {...formItemLayout}>
                  <p>{this.props.recordDetails.title}</p>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="文本信息" {...formItemLayout} >
                  <p>{this.props.recordDetails.text_content}</p>
                </FormItem>
                <FormItem label="转发链接" {...formItemLayout}>
                  {/* style={{width:"300px",overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} */}
                  <p>{this.props.recordDetails.transpond_link}</p>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="创建人" {...formItemLayout}>
                    <p>{this.props.recordDetails.create_optr_name}</p>
                </FormItem>
                <FormItem label="种类" {...formItemLayout} >
                    <p>{this.props.recordDetails.audit_time}</p>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="备注" {...formItemLayout}>
                  <p>{this.props.recordDetails.remark}</p>
                </FormItem>
                <FormItem label="状态" {...formItemLayout}>
                  <p>{this.props.recordDetails.status_text}</p>
                </FormItem>
              </Col>
              <Col span={8}>
              <FormItem label="使用范围" {...formItemLayout}>
                <p>{this.props.recordDetails.scope_text}</p>
              </FormItem>
              <FormItem label="种类" {...formItemLayout} >
                <p>{this.props.recordDetails.apply_name}</p>
              </FormItem>
            </Col>
            <Col span={8}>
                <FormItem label="记录id" {...formItemLayout} >
                  <p>{this.props.recordDetails.record_id}</p>
                </FormItem>
                <FormItem label="内容类型" {...formItemLayout}>
                  <p>{this.props.recordDetails.content_type}</p>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="自评" {...formItemLayout} >
                  <p>{this.props.recordDetails.self_sns}</p>
                </FormItem>
                <FormItem label="审核时间" {...formItemLayout}>
                  {/* style={{width:"300px",overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} */}
                  <p>{this.props.recordDetails.audit_time}</p>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="审核人" {...formItemLayout}>
                    <p>{this.props.recordDetails.audit_optr_name}</p>
                </FormItem>
                <FormItem label="来源" {...formItemLayout} >
                    <p>{this.props.recordDetails.from_type_text}</p>
                </FormItem>
              </Col>
             </Row>
             <Row>
               <Col span={8}>
                 <FormItem label="图片" {...formItemLayout}>
                   {
                     this.props.recordDetails.pic_url_json &&
                     JSON.parse(this.props.recordDetails.pic_url_json).map((item, idx)=>
                       <img src={item.B} width="80px" height="80px"/>
                     )
                   }
                 </FormItem>
               </Col>
             </Row>
          </Form>
      </Modal>
    );
  }
}
export default Form.create()(ContentLibrayDetailsModal);
