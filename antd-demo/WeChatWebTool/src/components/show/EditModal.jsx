import React from 'react';
import { Form, Row, Col, Input, Select, Button, Table, Tag,Modal,Upload,Icon,DatePicker,InputNumber } from 'antd';
import CommonTable from '../Commons/CommonTable';
import {Confirm, Success,Errors} from '../Commons/CommonConstants';
import EditModalTable from './EditModalTable';
import {format, isToday} from 'date-fns';
import moment from 'moment';
import {queryMassSceneList,queryMassReplyList,initReplyEdit,saveReplyEdit} from '../../services/showAnchor';
const FormItem = Form.Item;
const Option = Select.Option;
/**
 * 话术编辑弹出框
 */
class EditModal extends React.Component{
  constructor(props){
    super(props);
    this.state={
      record:props.record,
      sceneRecord:props.sceneRecord,
      visible: props.artSceneVisible,
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }
  onSubmit(e){
    e.preventDefault();
    const details=this.refs.EditModalTable.getDetails();
    if(details.length<=0){
      Errors("明细列表不能为空!");
      return;
    }
    console.log("onSubmit",details);
    this.props.form.validateFields((errors, values) => {
      if(!!errors) return;
      values['details']=details;
      values['scene_sn']=this.state.sceneRecord[0].scene_sn,
      values['start_time']=format(values['start_time'],'HH:mm:ss');
      values['end_time']=format(values['end_time'],'HH:mm:ss');
      saveReplyEdit(values).then((jsonResult)=>{
        console.log("jsonResult",jsonResult)
          Success("保存成功！");
          this.handleCancel();
          this.props.onRefresh(this.state.sceneRecord);
      }).catch((err) => {
        Errors(err);
      });
    });

  }
  handleCancel(){
    this.setState({
      visible: false
     });
    this.props.updateVisible();
  }

  render(){
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 16}
    }
    const {getFieldDecorator} = this.props.form;
    const {visible,record} = this.state;
    console.log("moment()",moment().format(record.end_time));
    return (
      <Modal visible={visible} maskClosable={false} title={`话术编辑`} width={1200}
        onOk={this.handleOk} onCancel={this.handleCancel}
        footer={[]}>
        <Form horizontal onSubmit={this.onSubmit}>
          {
            record.reply_config_id?
            <div>
              <Row gutter={16}>
                  <Col sm={12}>
                  <FormItem label="套路编号" {...formItemLayout}>
                    {getFieldDecorator('reply_config_id', {initialValue:record.reply_config_id,
                      rules: [{required: true, message: '套路编号'}]
                    })(
                      <Input disabled/>
                    )}
                  </FormItem>
                </Col>
                <Col sm={12}>
                  <FormItem label="套路分组" {...formItemLayout}>
                    {getFieldDecorator('reply_group', {initialValue:record.reply_group,
                      rules: [{required: true,  message: '场景类型'}]
                    })(
                      <Input disabled/>
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={16}>
                  <Col sm={12}>
                    <FormItem label="套路名称" {...formItemLayout}>
                      {getFieldDecorator('reply_config_name', {initialValue:record.reply_config_name,
                        rules: [{required: true, message: '套路名称'}]
                      })(
                        <Input/>
                      )}
                    </FormItem>
                </Col>
                <Col sm={12}>
                <FormItem label="套路总条数" {...formItemLayout}>
                  {getFieldDecorator('reply_cnt', {initialValue:record.reply_cnt,
                    rules: [{required: true, message: '套路总条数'}]
                  })(
                    <InputNumber min={1}/>
                  )}
                </FormItem>
                </Col>
              </Row>
              <Row gutter={16}>
                  <Col sm={12}>
                  <FormItem label="适用时间端起" {...formItemLayout}>
                    {getFieldDecorator("start_time",{initialValue:moment(record.start_time, 'HH:mm:ss'),
                      rules: [{required: true,message: '适用时间端起'}]
                  })(
                      <DatePicker showTime format="HH:mm:ss"
                       style={{width:'100%'}} />
                    )}
                  </FormItem>
                </Col>
                <Col sm={12}>
                  <FormItem label="适用时间端止" {...formItemLayout}>
                    {getFieldDecorator("end_time",{initialValue:moment(record.end_time, 'HH:mm:ss'),
                      rules: [{required: true,message: '适用时间端止'}]
                  })(
                      <DatePicker showTime format="HH:mm:ss"
                       style={{width:'100%'}} />
                    )}
                  </FormItem>
                </Col>
              </Row>
                <EditModalTable ref="EditModalTable" tableRecord={record}/>
              <FormItem style={{textAlign:'center'}}>
                <Button style={{marginRight:20}} icon="close" type="primary" size="large" onClick={this.handleCancel}>取消</Button>
                <Button icon="check" type="primary" size="large" htmlType="submit">保存</Button>
              </FormItem>
            </div>
            :
            <div>
              <Row gutter={16}>
                  <Col sm={12}>
                  <FormItem label="套路编号" {...formItemLayout}>
                    {getFieldDecorator('reply_config_id')(
                      <Input disabled/>
                    )}
                  </FormItem>
                </Col>
                <Col sm={12}>
                  <FormItem label="套路分组" {...formItemLayout}>
                    {getFieldDecorator('reply_group', {initialValue:record.reply_group,
                      rules: [{required: true,message: '场景类型'}]
                    })(
                      <Input disabled/>
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={16}>
                  <Col sm={12}>
                  <FormItem label="套路名称" {...formItemLayout}>
                    {getFieldDecorator('reply_config_name', {
                      rules: [{required: true, message: '套路名称'}]
                    })(
                      <Input/>
                    )}
                  </FormItem>
                </Col>
                <Col sm={12}>
                <FormItem label="套路总条数" {...formItemLayout}>
                  {getFieldDecorator('reply_cnt', {
                    rules: [{required: true,message: '套路总条数'}]
                  })(
                    <InputNumber min={1}/>
                  )}
                </FormItem>
              </Col>
              </Row>
              <Row gutter={16}>
                  <Col sm={12}>
                  <FormItem label="适用时间端起" {...formItemLayout}>
                    {getFieldDecorator("start_time", {initialValue:"",
                      rules: [{required: true,message: '适用时间端起'}]
                    })(
                      <DatePicker showTime format="HH:mm:ss"
                       style={{width:'100%'}} />
                    )}
                  </FormItem>
                </Col>
                <Col sm={12}>
                  <FormItem label="适用时间端止" {...formItemLayout}>
                    {getFieldDecorator("end_time", {initialValue:"",
                      rules: [{required: true,message: '适用时间端止'}]
                  })(
                      <DatePicker showTime format="HH:mm:ss"
                       style={{width:'100%'}} />
                    )}
                  </FormItem>
                </Col>
              </Row>
                <EditModalTable ref="EditModalTable" tableRecord={record}/>
              <FormItem style={{textAlign:'center'}}>
                <Button style={{marginRight:20}} icon="close" type="primary" size="large" onClick={this.handleCancel}>取消</Button>
                <Button icon="check" type="primary" size="large" htmlType="submit">保存</Button>
              </FormItem>
            </div>
          }

      </Form>
      </Modal>
    );
  }
}
export default Form.create()(EditModal);
