import React from 'react';
import  {Form,Row,Table,Input,Button,Col,Select,InputNumber} from 'antd';
import {queryBusinessOperator,getImageObfuscationConfig,saveImageObfuscationConfig} from '../../services/params';
import {Confirm, Success, Errors} from '../Commons/CommonConstants';
const FormItem=Form.Item;
const Option=Select.Option;
/**
 * sns图片混淆设置
 */
 class ClusterSupplement extends React.Component{
   constructor(props){
     super(props);
     this.state={
       result:[],
       optrBusinessOperator:[],
       ecommerce:[],
     };
     this.onImObfuscConfig=this.onImObfuscConfig.bind(this);
   }
   //保存运营号补号参数
   onImObfuscConfig(e){
     e.preventDefault();
     this.props.form.validateFields((err, values) => {
       console.log("values",values);
      if (!!err) return;
      const array = [], busiOptrStr = "business_operator", isOpen="is_open";
      const processFun = (objKey,value,constKey, array) => {
        if(objKey.startsWith(constKey)){
          const index = parseInt(objKey.substring(constKey.length))
          if(array.length > index){
            array[index][constKey] = value
          } else {
            const obj = {}
            obj[constKey] = value
            array.push(obj)
          }
        }
      }
      for(let [key, value] of Object.entries(values)){
        processFun(key,value, busiOptrStr, array);
        processFun(key,value, isOpen, array);
      }
      console.log("array",array);
     let prams={
       channel:values['channel'],
       clutivate:values['clutivate'],
       ecommerce:array,
     };
     console.log("prams",prams);
     Confirm(function(){
       saveImageObfuscationConfig(prams).then(({jsonResult})=>{
         console.log("jsonResult",jsonResult);
         Success("提交成功");
         this.OnRefresh();
        })
       }.bind(this),"确定提交吗?");
     });
   }
   //刷新
   OnRefresh(){
     getImageObfuscationConfig().then(({jsonResult})=>{
       if(!jsonResult) return;
         this.setState({
           result:jsonResult,
           ecommerce:jsonResult.ecommerce,
         });
       });
   }
   componentDidMount(){
     this.OnRefresh();
     //查询运营方
     queryBusinessOperator().then(({jsonResult})=> {
         if(!jsonResult) return;
         this.setState({
         optrBusinessOperator: jsonResult,
       });
     });
   }
   render(){
     const formItemLayout = {
       labelCol: {span: 3},
       wrapperCol: {span: 16},
     };
     const {getFieldDecorator} = this.props.form;
     const {result,optrBusinessOperator,ecommerce}=this.state;
     console.log("result",result,optrBusinessOperator,ecommerce);
     return(
       <Form horizontal onSubmit={this.onImObfuscConfig}>
         <FormItem >
           <p>按sns业务设置图片混淆</p>
         </FormItem>
         <FormItem label="开启图片混淆说明" {...formItemLayout}>
           <p className="ant-form-text">所有传入sns接口的图片都经过混淆处理，混淆方式是随机修改5到20个pixel 不改变图片尺寸，图片不会失真</p>
         </FormItem>
         <FormItem label="电商朋友圈业务" {...formItemLayout}>
         </FormItem>
         {
           ecommerce.length>0?
           <div>
             {
               ecommerce.map((items, idx)=>{
                 return(
                   <Row gutter={16}>
                     <Col span={10} offset={2}>
                       <FormItem label="运营方" {...formItemLayout}>
                         {getFieldDecorator(`business_operator${idx}`, {initialValue:items.business_operator})(
                           <Select style={{width:150}} disabled>
                             {
                               optrBusinessOperator.map((item, idx)=> <Option value={`${item.value}`}>{item.name}</Option>)
                             }
                           </Select>
                         )}
                       </FormItem>
                     </Col>
                     <Col span={10} pull={4}>
                       <FormItem label="图片混淆" {...formItemLayout}>
                         {getFieldDecorator(`is_open${idx}`,{initialValue:items.is_open,
                           rules:[{required:true, message:"请选择补号！"}]})(
                             <Select style={{width:150}}>
                               <Option value="T">开启混淆</Option>
                               <Option value="F">关闭混淆,直接转发</Option>
                             </Select>
                           )}
                         </FormItem>
                       </Col>
                     </Row>
                   )
                 })
               }
             </div>
             :null
           }
           <FormItem label="渠道朋友圈业务" {...formItemLayout}>
           </FormItem>
           <FormItem label="渠道代码" {...formItemLayout}>
             {getFieldDecorator('channel',{initialValue:result.channel||""})(
               <Input style={{width:"300px"}}/>
             )}
             <p className="ant-form-text" style={{marginLeft:"30px"}}>注：多个渠道号用，隔开</p>
           </FormItem>
           <FormItem label="图片混淆" {...formItemLayout}>
             <p className="ant-form-text">开启混淆</p>
           </FormItem>
           <FormItem label="活跃朋友圈业务" {...formItemLayout}>
           </FormItem>
           <Row gutter={16}>
             <Col span={8} offset={2}>
               <FormItem label="运营组" {...formItemLayout}>
                 <p>开启朋友圈活跃的全部运营组</p>
               </FormItem>
             </Col>
             <Col span={10} pull={4}>
               <FormItem label="图片混淆" {...formItemLayout}>
                 {getFieldDecorator(`clutivate`,{initialValue:result.clutivate,
                   rules:[{required:true, message:"请选择补号！"}]})(
                     <Select style={{width:150}}>
                       <Option value="T">开启混淆</Option>
                       <Option value="F">关闭混淆,直接转发</Option>
                   </Select>
                 )}
               </FormItem>
             </Col>
           </Row>
           <FormItem wrapperCol={{offset: 6, span: 6}}>
             <Button type="primary" icon="check" size="large" htmlType="submit">提交</Button>
           </FormItem>
         </Form>
       );
     }
 }
 export default Form.create()(ClusterSupplement);
