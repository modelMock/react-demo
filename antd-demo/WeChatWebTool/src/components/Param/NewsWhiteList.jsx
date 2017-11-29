import React from 'react';
import  {Form,Row,Table,Input,Button,Col,Select,InputNumber} from 'antd';
import {saveLinkWhitelistList,queryLinkWhitelistList} from '../../services/params';
import {Confirm, Success, Errors} from '../Commons/CommonConstants';

const FormItem=Form.Item;
const Option=Select.Option;
/**
 *链接消息白名单
 *
 */

class NewsWhiteList extends React.Component{
  constructor(props){
     super(props);
     this.state={
       chat_linksArr:[],//单聊链接白名单
       cluster_linksArr:[],//群聊链接白名单
       black_linksArr:[],//链接黑名单
     };
     this.handleSubmit=this.handleSubmit.bind(this);
    }
    handleSubmit(e){
      e.preventDefault();
      let chatLink=this.state.chat_linksArr && this.setUniq(this.state.chat_linksArr);
      let clusterLink=this.state.cluster_linksArr && this.setUniq(this.state.cluster_linksArr);
      let blackLink=this.state.black_linksArr && this.setUniq(this.state.black_linksArr);
      let value={
        chatLinkWhitelistList:chatLink,
        clusterLinkWhitelistList:clusterLink,
        blackLinkWhitelistList:blackLink
      };
      Confirm(function(){
        saveLinkWhitelistList(value).then(({jsonResult})=>{
          Success("提交成功！");
          this.queryLink();
        });
      }.bind(this), "确定提交吗?");
    }
  //数组对象去重
  setUniq(arr){
    let hash = {};
    let uni= arr.reduce(function(item, next) {
    hash[next.transpond_link] ? '' : hash[next.transpond_link] = true && item.push(next);
    return item
    }, [])
    return uni;
  }
  /**
   *单聊链接白名单
   */
  chatLinkAdd(e){
    e.preventDefault();
    let addChatlinkArr=this.state.chat_linksArr?this.state.chat_linksArr:[];
    this.props.form.validateFields((errors, values) => {
      if(values.chat_link==null||values.chat_link==''){
        Errors("单聊链接白名单不能为空！");
        return;
      }
      addChatlinkArr.push({type:"chat",record_id:"",transpond_link:values.chat_link});
      this.props.form.resetFields(['chat_link']);
    });
    this.setState({chat_linksArr:addChatlinkArr});
  }
  chatLinkRemove(value){
    let filterChatLink = this.state.chat_linksArr.filter((ads,idx)=> {
      return idx!=value;
    });
    this.setState({chat_linksArr:filterChatLink});
  }
  /**
   * 群聊链接白名单
   */
   clusterLinkAdd(e){
     e.preventDefault();
     let addClusterLinkArr=this.state.cluster_linksArr?this.state.cluster_linksArr:[];
     this.props.form.validateFields((errors,values)=>{
       if(values.cluster_links==null || values.cluster_links==''){
         Errors("群聊链接白名单不能为空！");
         return;
       }
       addClusterLinkArr.push({type:"cluster",record_id:"",transpond_link:values.cluster_links});
       this.props.form.resetFields(['cluster_links']);
     });
     this.setState({cluster_linksArr:addClusterLinkArr});
   }
   clusterLinkRemove(value){
     let filterClusterLink=this.state.cluster_linksArr.filter((ads,idx)=>{
       return idx!=value;
     });
     this.setState({cluster_linksArr:filterClusterLink});
   }
   /**
    *  链接黑名单
    */
    blackLinkAdd(e){
      e.preventDefault();
      let addBlackLinkArr=this.state.black_linksArr?this.state.black_linksArr:[];
      this.props.form.validateFields((errors,values)=>{
        if(values.black_links==null || values.black_links==''){
          Errors("链接黑名单不能为空！");
          return;
        }
        addBlackLinkArr.push({type:"black",record_id:"",transpond_link:values.black_links});
        this.props.form.resetFields(['black_links']);
      });
      this.setState({black_linksArr:addBlackLinkArr});
    }
    blackLinkRemove(value){
      let filterBlackLink=this.state.black_linksArr.filter((ads,idx)=>{
        return idx!=value;
      });
      this.setState({black_linksArr:filterBlackLink})
    }
    componentDidMount(){
      this.queryLink();
    }
    //查询链接白名单
    queryLink(){
      queryLinkWhitelistList().then(({jsonResult})=>{
        this.setState({
          chat_linksArr:jsonResult.chatLinkWhitelistList,
          cluster_linksArr:jsonResult.clusterLinkWhitelistList,
          black_linksArr:jsonResult.blackLinkWhitelistList
        });
      });
    }
  render(){
    const formItemLayout = {
      labelCol: {span: 3},
      wrapperCol: {span: 6},
    };
    const {getFieldDecorator} = this.props.form;
    const {chat_linksArr,cluster_linksArr,black_linksArr} = this.state;
    return (
      <Form horizontal onSubmit={this.handleSubmit}>
        <FormItem label="说明" labelCol={{span:3}} wrappCol={{span:22}}>
          <p className="ant-form-text">
           符合黑名单且非白名单的消息将会被阻止发送
          </p>
        </FormItem>
        <FormItem label="单聊链接消息白名单设置" labelCol={{span:3}} wrappCol={{span:22}}>
        </FormItem>
        <FormItem label="链接" {...formItemLayout}>
          {getFieldDecorator("chat_link",{initialValue:""})(
            <Input style={{width:200}}/>
           )}
           <Button type="primary" icon="plus" size="large" style={{marginLeft:"5%"}} onClick={this.chatLinkAdd.bind(this)}>增加</Button>
           <ul className="alertDatail-ul" style={{border:"1px solid #ccc",marginTop:'5px',height:"200px",overflow:"auto"}}>
             {
               chat_linksArr && chat_linksArr.map((item,idx)=>{
                 return <li style={{borderBottom:"1px solid #ccc"}}>
                         <span style={{marginLeft:"5px"}}>{item.transpond_link}</span>
                         <a style={{marginLeft:"50px"}} href="javascript:void(0)" onClick={this.chatLinkRemove.bind(this, idx)}>删除</a>
                       </li>
                     })
                   }
             </ul>
        </FormItem>
        <FormItem label="群聊链接消息白名单设置：" labelCol={{span:3}} wrappCol={{span:22}}>
          <p className="ant-form-text">
           （作用于群发布组和推荐组消息）
          </p>
        </FormItem>
        <FormItem label="链接" {...formItemLayout}>
          {getFieldDecorator("cluster_links",{initialValue:""})(
            <Input style={{width:200}}/>
           )}
           <Button type="primary" icon="plus" size="large" style={{marginLeft:"5%"}} onClick={this.clusterLinkAdd.bind(this)}>增加</Button>
           <ul className="alertDatail-ul" style={{border:"1px solid #ccc",marginTop:'5px',height:"200px",overflow:"auto"}}>
             {
               cluster_linksArr && cluster_linksArr.map((item,idx)=>{
                 return <li style={{borderBottom:"1px solid #ccc"}}>
                         <span style={{marginLeft:"5px"}}>{item.transpond_link}</span>
                         <a style={{marginLeft:"50px"}} href="javascript:void(0)" onClick={this.clusterLinkRemove.bind(this, idx)}>删除</a>
                       </li>
                     })
                   }
             </ul>
        </FormItem>
        <FormItem label="链接消息关键字黑名单设置：" labelCol={{span:3}} wrappCol={{span:22}}>
          <p className="ant-form-text">
           （单聊或群聊消息中的符合url规则且含以下关键字的rul将被进行业务处理）
          </p>
        </FormItem>
        <FormItem label="文本" {...formItemLayout}>
          {getFieldDecorator("black_links",{initialValue:""})(
            <Input style={{width:200}}/>
          )}
          <Button type="primary" icon="plus" size="large" style={{marginLeft:"5%"}} onClick={this.blackLinkAdd.bind(this)}>增加</Button>
          <ul className="alertDatail-ul" style={{border:"1px solid #ccc",marginTop:'5px',height:"200px",overflow:"auto"}}>
            {
              black_linksArr && black_linksArr.map((item,idx)=>{
                return <li style={{borderBottom:"1px solid #ccc"}}>
                         <span style={{marginLeft:"5px"}}>{item.transpond_link}</span>
                         <a style={{marginLeft:"50px"}} href="javascript:void(0)" onClick={this.blackLinkRemove.bind(this, idx)}>删除</a>
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
export default Form.create()(NewsWhiteList);
