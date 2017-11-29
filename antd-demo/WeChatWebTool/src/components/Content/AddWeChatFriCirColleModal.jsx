import React,{Component} from 'react';
import {Form ,Icon,Select,Row,Col,Input,Button,Modal,Upload} from 'antd';
import ContentService from '../../services/content';
import {Confirm, Success,Errors} from '../Commons/CommonConstants';
const FormItem = Form.Item;
const Option= Select.Option;
/**
 * 朋友圈库采集=>增加朋友圈库采集
 */
 class AddWeChatFriCirColleModal extends Component{
   constructor(props){
     super(props);
     this.state={
       visible:props.weChatFriCirColleVisible,
       anchorList: [],
     };
     this.handleOk = this.handleOk.bind(this);
     this.handleCancel = this.handleCancel.bind(this);
     this.filterAnchorOption=this.filterAnchorOption.bind(this);
   }

   handleOk(e){
     e.preventDefault();
     this.props.form.validateFields((errors, values) => {
       if(!!errors) return;
       Confirm(function(){
         ContentService.addShowPublishPickupConfig(values).then(({jsonResult})=>{
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

   filterAnchorOption(input, option){
     if(!input) return true;
     const inputValue = input.toLowerCase();
     const {value, children} = option.props;
     return value.toLowerCase() == inputValue || children.toLowerCase().indexOf(inputValue) >= 0;
   }

   componentDidMount(){
     ContentService.queryAnchorToAd().then(({jsonResult}) => {
       if(jsonResult.length > 0) {
         this.setState({
           anchorList: jsonResult
         });
       }
     });
   }

   render(){
     const formItemLayout = {
       labelCol: { span: 6 },
       wrapperCol: { span: 14 },
     };
     const {getFieldDecorator} = this.props.form;
     const {visible,anchorList} = this.state;
     return(
       <Modal visible={visible} maskClosable={false} title={`增加`}
          onCancel={this.handleCancel} onOk={this.handleOk}
         footer={[
           <Button icon="poweroff" size="large" onClick={this.handleCancel}>取消</Button>,
           <Button type="primary" icon="check" size="large" onClick={this.handleOk}>提交</Button>
         ]}
         >
         <Form horizontal>
           <FormItem label="主播" {...formItemLayout} >
             {getFieldDecorator('anchor_id')(
               <Select
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
           <FormItem label="微信号" {...formItemLayout}>
             {getFieldDecorator('wechat_account')(
               <Input />
             )}
           </FormItem>
        </Form>
    </Modal>
     );
   }
 }
export default Form.create()(AddWeChatFriCirColleModal);
