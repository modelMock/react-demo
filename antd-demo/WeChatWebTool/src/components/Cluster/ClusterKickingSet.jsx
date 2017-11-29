import React from 'react';
import  {Form,Row,Table,Input,Button,Col,Select,InputNumber} from 'antd';
import {saveClusterKickCfg,queryClusterKickCfg} from '../../services/cluster';
import {Confirm, Success, Errors} from '../Commons/CommonConstants';

const FormItem=Form.Item;
const Option=Select.Option;

class ClusterKickingSet extends React.Component{
    constructor(props){
       super(props);
       this.state={
           jsonResult:{},
           chat_textsArr:[],
           chat_linksArr:[],
           nick_textsArr:[],
           visible:false,
       };
       this.handleSubmit=this.handleSubmit.bind(this);
    }
    handleSubmit(e){
      e.preventDefault();
      this.props.form.validateFields((errors, values) => {
        values["chat_texts"]=this.state.chat_textsArr;
        values["chat_links"]=this.state.chat_linksArr;
        values["nick_texts"]=this.state.nick_textsArr;
        Confirm(function(){
          saveClusterKickCfg(values).then(({jsonResult})=>{
            if(jsonResult.message=="success"){
              Success("提交成功！");
              this.props.form.resetFields();
              queryClusterKickCfg().then(({jsonResult})=>{
                this.setState({
                  jsonResult,
                  chat_textsArr:jsonResult.chat_texts,
                  chat_linksArr:jsonResult.chat_links,
                  nick_textsArr:jsonResult.nick_texts
                });
              });
            }
          });
        }.bind(this), "确定提交吗?");
        });
      }
  /**
   *聊天消息过滤文本
   */
  chatTextAdd(e){
    e.preventDefault();
    let addchat_textsArr=this.state.chat_textsArr;
    this.props.form.validateFields((errors, values) => {
      if(values.chat_texts==null||values.chat_texts==''){
        Errors("文本不能为空！");
        return;
      }
      addchat_textsArr.push(values.chat_texts);
      this.props.form.resetFields().chat_texts;
    });
    this.setState({chat_textsArr:addchat_textsArr});
  }
  chatTextRemove(value){
    let filterchatText = this.state.chat_textsArr.filter((ads,idx)=> {
      return idx!=value;
    });
    this.setState({chat_textsArr:filterchatText});
  }
  /**
   * 聊天消息过滤链接
   */
   chatLinkAdd(e){
     e.preventDefault();
     let addchat_linksArr=this.state.chat_linksArr;
     this.props.form.validateFields((errors, values) => {
       if(values.chat_links==null||values.chat_links==''){
         Errors("链接不能为空！");
         return;
       }
       addchat_linksArr.push(values.chat_links);
       this.props.form.resetFields().chat_links;
     });
     this.setState({chat_linksArr:addchat_linksArr});
   }
   chatLinkRemove(value){
     let filterchatLink = this.state.chat_linksArr.filter((ads,idx)=> {
       return idx!=value;
     });
     this.setState({chat_linksArr:filterchatLink});
   }
   /**
    *  群成员昵称过滤
    */
    nickTextsAdd(e){
      e.preventDefault();
      let addnickTextsArr=this.state.nick_textsArr;
      this.props.form.validateFields((errors, values) => {
        if(values.nick_texts==null||values.nick_texts==''){
          Errors("昵称不能为空！");
          return;
        }
        addnickTextsArr.push(values.nick_texts);
        this.props.form.resetFields().nick_texts;
      });
      this.setState({nick_textsArr:addnickTextsArr});
    }
    nickTextsRemove(value){
      let filternickTexts= this.state.nick_textsArr.filter((ads,idx)=> {
        return idx!=value;
      });
      this.setState({nick_textsArr:filternickTexts});
    }

    componentDidMount(){
      queryClusterKickCfg().then(({jsonResult})=>{
        this.setState({
          jsonResult,
          chat_textsArr:jsonResult.chat_texts,
          chat_linksArr:jsonResult.chat_links,
          nick_textsArr:jsonResult.nick_texts
        });
      });
    }
  render(){
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 6},
    };
    const {getFieldDecorator} = this.props.form;
    const {queryMonitor,jsonResult,chat_textsArr,nick_textsArr,chat_linksArr} = this.state;
    return (
      <Form horizontal onSubmit={this.handleSubmit}>
        <FormItem label="当前群数据" labelCol={{span:3}} wrappCol={{span:22}}>
          <p className="ant-form-text">
            用于自建群管理，所有参数配置对非运营号群成员生效，被踢人将列入黑名单管理
          </p>
        </FormItem>
        <FormItem label="关键字过滤踢人（本群踢）" {...formItemLayout}>
          {getFieldDecorator("key_filter",{initialValue:jsonResult.key_filter})(
            <Select style={{width: 200}}>
              <Option value="T">开启</Option>
              <Option value="F">关闭</Option>
            </Select>
          )}
        </FormItem>
        <p className="ant-form-text" style={{marginLeft:"15%"}}>
          1、 聊天消息过滤
        </p>
        <FormItem label="淘口令" {...formItemLayout}>
          {getFieldDecorator("chat_taopass",{initialValue:jsonResult.chat_taopass})(
            <Select style={{width: 200}}>
              <Option value="T">开启</Option>
              <Option value="F">关闭</Option>
            </Select>
          )}
        </FormItem>
        <FormItem label="文本" {...formItemLayout}>
          {getFieldDecorator("chat_texts",{initialValue:""})(
            <Input style={{width:200}}/>
          )}
          <Button type="primary" icon="plus" size="large" style={{marginLeft:"5%"}} onClick={this.chatTextAdd.bind(this)}>增加</Button>
          <ul className="alertDatail-ul" style={{border:"1px solid #ccc",marginTop:'5px',height:"200px",overflow:"auto"}}>
            {
              chat_textsArr.map((item,idx)=>{
                return <li style={{borderBottom:"1px solid #ccc"}}>
                         <span style={{marginLeft:"5px"}}>{item}</span>
                         <a style={{marginLeft:"50px"}} href="javascript:void(0)" onClick={this.chatTextRemove.bind(this, idx)}>删除</a>
                       </li>
                     })
                   }
            </ul>
        </FormItem>
        <FormItem label="链接" {...formItemLayout}>
          {getFieldDecorator("chat_links",{initialValue:""})(
            <Input style={{width:200}}/>
           )}
           <Button type="primary" icon="plus" size="large" style={{marginLeft:"5%"}} onClick={this.chatLinkAdd.bind(this)}>增加</Button>
           <ul className="alertDatail-ul" style={{border:"1px solid #ccc",marginTop:'5px',height:"200px",overflow:"auto"}}>
             {
               chat_linksArr.map((item,idx)=>{
                 return <li style={{borderBottom:"1px solid #ccc"}}>
                         <span style={{marginLeft:"5px"}}>{item}</span>
                         <a style={{marginLeft:"50px"}} href="javascript:void(0)" onClick={this.chatLinkRemove.bind(this, idx)}>删除</a>
                       </li>
                     })
                   }
             </ul>
        </FormItem>
        <p className="ant-form-text" style={{marginLeft:"15%"}}>
            2、 群成员昵称过滤
          </p>
          <FormItem label="昵称" {...formItemLayout}>
            {getFieldDecorator("nick_texts",{initialValue:""})(
              <Input style={{width:200}}/>
            )}
            <Button type="primary" icon="plus" size="large" style={{marginLeft:"5%"}} onClick={this.nickTextsAdd.bind(this)}>增加</Button>
            <ul className="alertDatail-ul" style={{border:"1px solid #ccc",marginTop:'5px',height:"200px",overflow:"auto"}}>
              {
                nick_textsArr.map((item,idx)=>{
                  return <li style={{borderBottom:"1px solid #ccc"}}>
                         <span style={{marginLeft:"5px"}}>{item}</span>
                         <a style={{marginLeft:"50px"}} href="javascript:void(0)" onClick={this.nickTextsRemove.bind(this, idx)}>删除</a>
                     </li>
                   })
                 }
               </ul>
          </FormItem>
          <FormItem label="私拉好友踢人（所在群踢）" {...formItemLayout}>
            {getFieldDecorator('illegal_invite',{initialValue:jsonResult.illegal_invite})(
              <Select style={{width: 200}}>
                <Option value="T">开启</Option>
                <Option value="F">关闭</Option>
              </Select>
            )}
        </FormItem>
        <FormItem label="踢人"  labelCol={{span: 6}} wrapperCol={{span:16}} >
          <Col span={2}>
            {getFieldDecorator("hours",{initialValue:jsonResult.hours})(
              <Input style={{width:80}}/>
            )}
          </Col>
          <Col span={5} offset={1}>
             <p className="ant-form-text">小时内好友请求超过</p>
          </Col>
          <Col span={2}>
            {getFieldDecorator("friend_count",{initialValue:jsonResult.friend_count})(
              <Input style={{width:80}}/>
            )}
          </Col>
          <Col span={3} offset={1}>
            <p style={{color:'#7F7F7F'}}>个执行踢人</p>
          </Col>
        </FormItem>
        <FormItem wrapperCol={{offset: 6, span: 6}}>
          <Button type="primary" icon="check" size="large" htmlType="submit">提交</Button>
        </FormItem>
      </Form>

     );
   }
}
export default Form.create()(ClusterKickingSet);
