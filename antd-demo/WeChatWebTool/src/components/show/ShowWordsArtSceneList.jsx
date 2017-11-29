import React from 'react';
import { Form, Row, Col, Input,Icon, Select, Button, Table, Tag,Modal,Upload } from 'antd';
import CommonTable from '../Commons/CommonTable';
import {Confirm, Success,Errors} from '../Commons/CommonConstants';
import EditModal from './EditModal';
import {queryMassSceneList,queryMassReplyList,initReplyEdit,saveReplyEdit} from '../../services/showAnchor';
const FormItem = Form.Item;
const Option = Select.Option;
/**
 * 话术场景列表
 */
class ShowWordsArtSceneList extends React.Component{
  constructor(props){
    super(props);
    this.state={
      artSceneVisible:false,
      artSceneListDataSource:[],
      detailDataSource:[],
      selectedRowKeys:[],
      selectedRows:[],
      sceneRecord:[],
      record:null,
    };
    this.onAddArtScene=this.onAddArtScene.bind(this);
    this.updateVisible=this.updateVisible.bind(this);
    this.handleRowChange=this.handleRowChange.bind(this);
    this.onRefresh=this.onRefresh.bind(this);
    this.columns=[
      {title: '场景名称', dataIndex: 'reply_group_desc', width: 80},
      {title: '场景类型', dataIndex: 'reply_group', width: 130},
      {title: '创建时间', dataIndex: 'create_time',width: 80},
    ];
    this.columnsDetails=[
      {title: '套路编号', dataIndex: 'reply_config_id', width: 80},
      {title: '套路名称', dataIndex: 'reply_config_name', width: 130},
      {title: '话术条数', dataIndex: 'reply_cnt',width: 80},
      {title: '适用时间段', width: 150,render: (text, record) => (
        <span>
          {record.start_time}~{record.end_time}
        </span>
      ),},
      {title: '好友场景', dataIndex: 'friend_scene', width: 130},
      {title: '创建时间', dataIndex: 'create_time',width: 80},
      {title: '操作', dataIndex: '',width: 80,render: (text, record) => {
        return <span>
                 <a href="javascript:void(0)" onClick={this.detailEdit.bind(this,record)}>编辑</a>
               </span>
      }},
    ]
  }
  //编辑话术场景详情记录
  detailEdit(record){
    initReplyEdit({reply_config_id:record.reply_config_id,reply_group:record.reply_group}).then(({jsonResult})=>{
      if(!jsonResult){
        Errors("编辑套路失败，请联系管理员!");
        return;
      }
      this.setState({
        record:jsonResult,
        artSceneVisible:true
      })
    });
  }
  // //话术场景列表行点击事件
  // onShowDetail(selectedRow,index){
  //   console.log("selectedRow",selectedRow,index);
  //   this.setState({selectedRowKeys:selectedRow.scene_sn})
  //   queryMassReplyList({reply_group:selectedRow.reply_group,scene_sn:selectedRow.scene_sn}).then(({jsonResult})=>{
  //     if(!jsonResult){return;}
  //     this.setState({
  //       sceneRecord:selectedRow,
  //       detailDataSource:jsonResult
  //     })
  //   });
  // }
  //新增套路方法
  onAddArtScene(e){
    e.preventDefault();
    const {sceneRecord}=this.state;
    console.log("sceneRecord",sceneRecord)
    if(sceneRecord.length<=0){
      Errors("请选择一条话术");
      return;
    }
    initReplyEdit({reply_config_id:null,reply_group:sceneRecord[0].reply_group}).then(({jsonResult})=>{
      if(!jsonResult){
        Errors("新增套路失败，请联系管理员!");
        return;
      }
      this.setState({
        record:jsonResult,
        artSceneVisible:true
      })
    });
  }
  //更新modal状态
  updateVisible(){
    this.setState({
      artSceneVisible:false
     });
  }
  showModal(){
    const {artSceneVisible,record} = this.state;
    if(artSceneVisible === true){
      return <EditModal  artSceneVisible={artSceneVisible} updateVisible={this.updateVisible}
                record={record} sceneRecord={this.state.sceneRecord} onRefresh={this.onRefresh}/>
    }
    return null;
  }
  componentDidMount(){
   queryMassSceneList().then(({jsonResult})=>{
     if(!jsonResult){return;}
     this.setState({artSceneListDataSource:jsonResult})
   });
  }
  //成功回调刷新
  onRefresh(selectedRows){
    this.setState({selectedRows});
    console.log("selectedRows",selectedRows);
    queryMassReplyList({reply_group:selectedRows[0].reply_group,scene_sn:selectedRows[0].scene_sn}).then(({jsonResult})=>{
      if(!jsonResult){return;}
      this.setState({
        sceneRecord:selectedRows,
        detailDataSource:jsonResult
      })
    });
  }
  //选中行记录 查询话术场景详情
  handleRowChange(selectedRowKeys, selectedRows) {
        this.setState({selectedRowKeys,selectedRows});
        console.log("selectedRows",selectedRows,selectedRowKeys);
        queryMassReplyList({reply_group:selectedRows[0].reply_group,scene_sn:selectedRows[0].scene_sn}).then(({jsonResult})=>{
          if(!jsonResult){return;}
          this.setState({
            sceneRecord:selectedRows,
            detailDataSource:jsonResult
          })
        });
  }
  render(){
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 14}
    }
    const {selectedRowKeys,selectedRows,artSceneListDataSource,detailDataSource,sceneRecord}=this.state;
    console.log("selectedRowKeys",selectedRowKeys);
    return(
      <div>
        {this.showModal()}
        <Table
          ref="commonTable"
          rowSelection = {{
            selectedRowKeys,
            onChange: this.handleRowChange.bind(this),
            type:"radio"
          }}
          //onRowClick={this.onShowDetail.bind(this)}
          columns={this.columns}
          dataSource={artSceneListDataSource}
          rowKey="scene_sn"
          scroll={{x: 700, y: 200}}
        />
        <Row gutter={16} style={{marginTop:10,marginBottom:10}}>
            <Col sm={12}>
            <FormItem  {...formItemLayout}>
                <h3>话术场景详情：{sceneRecord[0]?<Tag color="#87d068">{sceneRecord[0].reply_group_desc}</Tag>:null}</h3>
            </FormItem>
          </Col>
          <Col sm={10} offset={2}>
            <FormItem  {...formItemLayout}>
              <Button type="primary" size="large" icon="plus" onClick={this.onAddArtScene}>新增套路</Button>
            </FormItem>
          </Col>
        </Row>
        <Table
          ref="commonTableDetails"
          columns={this.columnsDetails}
          dataSource={detailDataSource}
          rowKey="reply_config_id"
          scroll={{x: 700, y: 300}}
        />
      </div>
    );
  }
}
export default Form.create()(ShowWordsArtSceneList);
