import React from 'react';
import {Form, Input, InputNumber,Select, Button,Row,Col} from 'antd';
import {querySupplementParam,
  updateSupplementPara,
  queryBusinessOperator,
  queryClusterBusinessOperator,
  saveBusinessOperatorForSupplement} from '../../services/cluster';
import {Confirm, Success} from '../Commons/CommonConstants';
const FormItem = Form.Item;
const Option = Select.Option;

class ClusterSupplement extends React.Component{
  constructor(props){
    super(props);
    this.state={
      result:[],
      optrBusinessOperator:[],
      supplementOperatorList:[],
    };
    this.OnUpdateSupplmentParam=this.OnUpdateSupplmentParam.bind(this);
  }
  //保存运营号补号参数
  OnUpdateSupplmentParam(e){
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log("values",values);
     if (!!err) return;
     const array = [], busiOptrStr = "business_operator", wechatgroup = "supplement_wechat_group",isOpen="supplement_is_open";
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
       processFun(key,value, wechatgroup, array);
       processFun(key,value, isOpen, array);
     }
     console.log("array",array);
    let value={
      cluster_oper_cnt_min:values['cluster_oper_cnt_min'],
      oper_joined_cluster_cnt:values['oper_joined_cluster_cnt'],
      business_operator_list:array,
    }
    Confirm(function(){
      updateSupplementPara(value).then(({jsonResult})=>{
        console.log("jsonResult",jsonResult);
        Success("提交成功");
        this.OnRefresh();
       })
      }.bind(this),"确定提交吗?");
    });
  }
  // //查询补号参数
  // OnSaveBusinessOperatorForSupplement(param){
  //   console.log("param",param);
  //   switch(param){
  //     case 1:
  //         this.props.form.validateFields((err, values) => {
  //         if (!!err) return;
  //         let jufangxing={
  //           value:1,
  //           supplement_wechat_group:values['supplement_wechat_group_jufangxing'],
  //           supplement_is_open:values['supplement_is_open_jufangxing']
  //         }
  //         Confirm(function(){
  //           saveBusinessOperatorForSupplement(jufangxing).then(({jsonResult})=>{
  //              Success("提交成功");
  //              this.OnRefresh();
  //           });
  //         }.bind(this),"确定提交吗?");
  //         });
  //        break;
  //     case 2:
  //         this.props.form.validateFields((err, values) => {
  //         if (!!err) return;
  //         let ouer={
  //           value:2,
  //           supplement_wechat_group:values['supplement_wechat_group_ouer'],
  //           supplement_is_open:values['supplement_is_open_ouer']
  //         }
  //         Confirm(function(){
  //           saveBusinessOperatorForSupplement(ouer).then(({jsonResult})=>{
  //              Success("提交成功");
  //              this.OnRefresh();
  //           });
  //         }.bind(this),"确定提交吗?");
  //        });
  //       break;
  //   }
  // }
  //刷新
  OnRefresh(){
    querySupplementParam().then(({jsonResult})=>{
      if(!jsonResult) return;
        this.setState({
          result:jsonResult,
          supplementOperatorList:jsonResult.business_operator_list,
        });
      });
  }
  componentDidMount(){
    this.OnRefresh();
    //查询运营方
    queryClusterBusinessOperator().then(({jsonResult})=> {
        if(!jsonResult) return;
        this.setState({
        optrBusinessOperator: jsonResult,
      });
    });
  }
  render(){
      const formItemLayout = {
          labelCol: {span: 6},
          wrapperCol: {span: 16},
      };
      const {getFieldDecorator} = this.props.form;
      const {result,optrBusinessOperator,supplementOperatorList}=this.state;
      console.log("result",result);
      return(
      <Form horizontal onSubmit={this.OnUpdateSupplmentParam}>
        <FormItem label="邀请组内可用+不可用的号低于" labelCol={{span: 6}} wrapperCol={{span: 18}}>
          {getFieldDecorator('cluster_oper_cnt_min',{initialValue:result.cluster_oper_cnt_min,
          rules:[{required:true, message:"不能为空！"}]})(
            <InputNumber min={1}/>
          )}
          <p className="ant-form-text">个，需立即向该邀请组补可用号，使可用+不可用号数满足当前设置的邀请号总数</p>
        </FormItem>
        <FormItem label="补号组里的相同运营号最多可以补到" labelCol={{span: 6}} wrapperCol={{span: 18}}>
          {getFieldDecorator('oper_joined_cluster_cnt',{initialValue:result.oper_joined_cluster_cnt,
          rules:[{required:true, message:"不能为空！"}]})(
            <InputNumber min={1}/>
          )}
          <p className="ant-form-text">个群里，所在群少的号优先被使用</p>
        </FormItem>
        {
          supplementOperatorList.length>0?
          <div>
          {
            supplementOperatorList.map((items, idx)=>{
              return(
                    <Row gutter={16}>
                      <Col span={7}>
                        <FormItem label="运营方" {...formItemLayout}>
                          {getFieldDecorator(`business_operator${idx}`, {initialValue:items.business_operator})(
                            <Select style={{width:150}} disabled>
                              <Option value="">全部</Option>
                              {
                                optrBusinessOperator.map((item, idx)=> <Option value={`${item.item_value}`}>{item.item_name}</Option>)
                              }
                            </Select>
                          )}
                        </FormItem>
                        </Col>
                        <Col span={7}>
                        <FormItem label="邀请组" {...formItemLayout}>
                          {getFieldDecorator(`supplement_wechat_group${idx}`,{initialValue:items.supplement_wechat_group,
                          rules:[{required:true, message:"邀请组不能为空！"}]})(
                            <Input />
                          )}
                          </FormItem>
                        </Col>
                        <Col span={7}>
                        <FormItem label="补号" {...formItemLayout}>
                            {getFieldDecorator(`supplement_is_open${idx}`,{initialValue:items.supplement_is_open,
                            rules:[{required:true, message:"请选择补号！"}]})(
                              <Select>
                                <Option value="T">开启</Option>
                                <Option value="F">关闭</Option>
                              </Select>
                            )}
                          </FormItem>
                      </Col>
                      {/* <Col span={3}>
                        <Button type="primary" icon="check" size="large" onClick={this.OnSaveBusinessOperatorForSupplement.bind(this,1)}>提交</Button>
                      </Col> */}
                      </Row>
                    )
                  })
                }
                </div>
                :null
        }
        <FormItem wrapperCol={{offset: 6, span: 6}}>
          <Button type="primary" icon="check" size="large" htmlType="submit">提交</Button>
        </FormItem>
    </Form>);
  }
}
export default Form.create()(ClusterSupplement);
