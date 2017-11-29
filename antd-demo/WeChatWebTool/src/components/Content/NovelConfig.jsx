import React from 'react';
import {Form, Input, InputNumber,Select, Button} from 'antd';
import ContentService from '../../services/content';
import {format} from 'date-fns';
import {Confirm, Success,Errors} from '../Commons/CommonConstants';
const FormItem = Form.Item;
const Option = Select.Option;

class NovelConfig extends React.Component{
  constructor(props){
     super(props);
     this.state = {
       noveResult:{},
       publishPlanMap:{},
       dataList:[]
     };
   this.handleSubmit=this.handleSubmit.bind(this);
  }

  handleSubmit(e){
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      let value={
        is_open:values.is_open,
        friend_cnt:values.friend_cnt,
        ad_delay_minute:values.ad_delay_minute,
        operation_max:values.operation_max,
        defaultPlan:values.defaultPlan,
        publishPlanMap:this.state.publishPlanMap,
      };
      Confirm(function(){
        ContentService.saveNovelConfig(value).then(({jsonResult})=>{
          Success("提交成功！");
          console.log(jsonResult);
        });
      }.bind(this), "确定提交吗?");
    });
  }

   getDateStr(AddDayCount) {
     let dd = new Date();
     let dataArr=[];
     dataArr.push(format(new Date(),'YYYY-MM-DD'));
     for(let i=1;i<=AddDayCount;i++){
       dd.setDate(dd.getDate()+1);//获取AddDayCount天后的日期
       let y = dd.getFullYear();
       let m = dd.getMonth()+1<10 ? "0"+(dd.getMonth()+1):dd.getMonth()+1;//获取当前月份的日期
       let d = dd.getDate();
       dataArr.push(y+"-"+m+"-"+d);
     }
     return dataArr;
   }
  onAddNoveTime(e){
    e.preventDefault();
    const {publishPlanMap}=this.state;
    this.props.form.validateFields((error,value)=>{
      if(value.datas==null || value.datas==''){
        Errors("请选择日期！");
        return;
      }
      if(value.time==null || value.time==''){
        Errors("添加时间不能为空！");
        return;
      }
      let nowdata={[value.datas]:value.time};
      console.log("nowdata",nowdata);
      console.log("publishPlanMap",publishPlanMap);
      if(this.state.publishPlanMap[value.datas]!==undefined){
        Confirm(function(){
          this.setState({publishPlanMap:Object.assign(publishPlanMap,nowdata)})
          this.props.form.resetFields(['time']);
        }.bind(this), "已存在该日期设置，确定覆盖该日期设置吗?");
      }else{
        this.setState({publishPlanMap:Object.assign(publishPlanMap,nowdata)})
        this.props.form.resetFields(['time']);
      }
    });
  }

  onPlanMapRemove(param){
    console.log("param",param);
    delete this.state.publishPlanMap[param];
    this.setState({publishPlanMap:this.state.publishPlanMap});
  }

  componentDidMount(){
    let dataList=this.getDateStr(5);
    ContentService.getNovelConfig().then(({jsonResult})=>{
      this.setState({
        noveResult:jsonResult,
        publishPlanMap:jsonResult.publishPlanMap?jsonResult.publishPlanMap:{},
        dataList:dataList
      });
    });
  }
  render(){
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 6},
    };
    const {getFieldDecorator} = this.props.form;
    const {noveResult,publishPlanMap,dataList}=this.state;
    return (
      <Form horizontal onSubmit={this.handleSubmit}>
        <FormItem label="是否开启推广" {...formItemLayout}>
          {getFieldDecorator("is_open",{
            initialValue:noveResult.is_open
          })(
            <Select style={{width: 200}}>
              <Option value="T">开启</Option>
              <Option value="F">关闭</Option>
            </Select>
          )}
        </FormItem>
        <FormItem label="每次投放覆盖好友数" {...formItemLayout}>
          {getFieldDecorator("friend_cnt",{
            initialValue:noveResult.friend_cnt
          })(
           <Input/>
          )}
        </FormItem>
        <FormItem label="每次投放朋友圈延迟" labelCol={{span:6}} wrappCol={{span:18}}>
          {getFieldDecorator("ad_delay_minute",{
            initialValue:noveResult.ad_delay_minute
          })(
           <InputNumber/>
          )}
          <p className="ant-form-text">分钟</p>
        </FormItem>
        <FormItem label="一个小说内容最多覆盖" labelCol={{span:6}} wrappCol={{span:18}}>
          {getFieldDecorator("operation_max",{
            initialValue:noveResult.operation_max
          })(
           <InputNumber/>
          )}
            <p className="ant-form-text">个运营号</p>
        </FormItem>
        <FormItem label="默认推广配置" labelCol={{span:6}} wrapperCol={{span:16}}>
          {getFieldDecorator("defaultPlan",{
            initialValue:noveResult.defaultPlan
          })(
           <Input style={{width:300}}/>
          )}
          <p className="ant-form-text">注：配置内容格式=>'时间点,内容组,推广好友数;'，如: 8:00,内容组1,20000;10:30,内容组2,20000。多个时间点推广用;隔开，一个时间点的推广格式间用,隔开。</p>
        </FormItem>
        <FormItem label="扩展推广配置" labelCol={{span:6}} wrapperCol={{span:12}}>
          {getFieldDecorator("datas",{initialValue:format(new Date(),'YYYY-MM-DD')})(
            <Select style={{width: 100}}>
              {
                dataList.map((item,idx)=>{
                  return <Option value={item}>{item}</Option>
                })
              }
            </Select>
          )}
          {getFieldDecorator("time",{initialValue:""})(
            <Input style={{width:400}}/>
           )}
           <Button type="primary" icon="plus" size="large" style={{marginLeft:"5%"}} onClick={this.onAddNoveTime.bind(this)}>增加</Button>
           <ul className="alertDatail-ul" style={{width:"700px",border:"1px solid #ccc",marginTop:'5px',height:"200px",overflow:"auto"}}>
             {
               publishPlanMap && Object.entries(publishPlanMap).map((items,idxs)=>{
                 return <li style={{borderBottom:"1px solid #ccc"}}>
                         <span style={{marginLeft:"5px"}}>{items[0]}&nbsp;&nbsp;&nbsp;{items[1]}</span>
                         <a style={{marginLeft:"50px"}} href="javascript:void(0)" onClick={this.onPlanMapRemove.bind(this, items[0])}>删除</a>
                       </li>
               })
             }
           </ul>
        </FormItem>
        <FormItem wrapperCol={{offset: 6, span: 6}}>
          <Button type="primary" icon="check" size="large" htmlType="submit">提交</Button>
        </FormItem>
      </Form>
    );
  }
}
export default Form.create()(NovelConfig);
