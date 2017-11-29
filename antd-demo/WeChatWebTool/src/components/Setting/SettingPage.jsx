import React from 'react';
import {Button, Table, Input, Select, InputNumber, Form, Modal, Tag} from 'antd';
import {initMultManage, modShowGroup, modShowLanguage, updateOptrConfig} from '../../services/multManage';
import {Success, Confirm, Errors} from '../Commons/CommonConstants';
import './SettingPage.less';
const FormItem = Form.Item;
const Option = Select.Option;

const statusRender = (status) => {
  if(status === 'ACTIVE'){
    return <Tag color="green">正常</Tag>;
  } else if(status === 'DISABLED'){
    return <Tag color="red">禁用</Tag>;
  }
  return status;
}
export default class SettingPage extends React.Component {
  constructor(props){
    super(props);
    this.state={
      groupList: [],      //分组
      languageList: [],   //常用语
      anchorList: [],     //主播
      robotModeList: [],  //机器人模式
      multWindowsNum: 1,  //聊天窗口个数
      rebotMode: 'common',  //机器人开启模式

      groupVisible: false,
      group_id: '',
      group_name: '',

      languageVisible: false,
      record_id: '',
      content: '',
    };
    this.handleWindowsNumChange = this.handleWindowsNumChange.bind(this);
    this.handleRebotModeChange = this.handleRebotModeChange.bind(this);
    this.updateOptrConfig = this.updateOptrConfig.bind(this);
    this.addGroup = this.addGroup.bind(this);
    this.saveGroup = this.saveGroup.bind(this);
    this.closeGroup = this.closeGroup.bind(this);
    this.handleGroupInputChange = this.handleGroupInputChange.bind(this);
    this.addLanguage = this.addLanguage.bind(this);
    this.saveLanguage = this.saveLanguage.bind(this);
    this.closeLanguage = this.closeLanguage.bind(this);
    this.handleLanguageInputChange = this.handleLanguageInputChange.bind(this);

    this.groupColumns=[
      {title:'分组编号', dataIndex: 'group_id', key:'group_id'},
      {title:'分组名称', dataIndex: 'group_name'},
      {title:'好友数', dataIndex: 'friend_cnt'},
      {title:'状态', dataIndex: 'status', render: statusRender},
      {title:'操作', dataIndex: 'group_id', key:'operation', render: (text, record) => {
        if(record.status === 'DISABLED')
          return <a href="javascript:void(0)" onClick={this.activedGroup.bind(this, record.group_id)}>激活</a>;
        return <span>
                <a href="javascript:void(0)" onClick={this.editGroup.bind(this, record)}>修改</a>
                <span className="ant-divider"></span>
                <a href="javascript:void(0)" onClick={this.disabledGroup.bind(this, record.group_id)}>禁用</a>
              </span>
      }}
    ];
    this.languageColumns=[
      {title:'序号', dataIndex: 'record_id', key:'record_id'},
      {title:'内容', dataIndex: 'content'},
      {title:'操作', dataIndex: 'record_id', key:'operation', render: (text, record) => {
          return <span>
                  <a href="javascript:void(0)" onClick={this.editLanguage.bind(this, record)}>修改</a>
                  <span className="ant-divider"></span>
                  <a href="javascript:void(0)" onClick={this.deleteLanguage.bind(this, record.record_id)}>删除</a>
                 </span>
      }}
    ];
    this.anchorColumns=[
      {title:'主播编号', dataIndex: 'anchor_id', key:'anchor_id'},
      {title:'主播名称', dataIndex: 'anchor_name'},
      {title:'好友数', dataIndex: 'friend_cnt'},
      {title:'状态', dataIndex: 'status', render: statusRender},
      {title:'创建时间', dataIndex: 'create_time'},
    ];
  }
  //分组名称输入onChange事件
  handleGroupInputChange(e){
    this.setState({
      group_name: e.target.value,
    });
  }
  //新增分组，显示modal
  addGroup(){
    this.setState({ groupVisible: true, groupTitle: '添加分组'});
  }
  //修改分组，显示modal
  editGroup(record){
    this.setState({
      groupVisible: true,
      group_id: record.group_id,
      group_name: record.group_name,
      groupTitle: `修改分组[编号${record.group_id}]`
    })
  }
  //关闭分组modal
  closeGroup(){
    this.setState({
      groupVisible: false,
      group_id: '',
      group_name: '',
      groupTitle: ''
    })
  }
  //添加、修改、删除分组操作
  __modShowGroup(group_id, successTitle, status){
    if(!status && !this.state.group_name){
      Errors('请输入分组名称');
      return;
    }
    modShowGroup(group_id, this.state.group_name, status).then(({jsonResult}) => {
      Success(successTitle);
      this.fetchInitData();
      this.closeGroup();
    });
  }
  //删除分组
  disabledGroup(group_id){
    Confirm(function(){
      this.__modShowGroup(group_id, "禁用成功", "DISABLED");
    }.bind(this), `确定禁用分组[编号${group_id}]吗?`)
  }
  activedGroup(group_id){
    Confirm(function(){
      this.__modShowGroup(group_id, "激活成功", "ACTIVE");
    }.bind(this), `确定激活分组[编号${group_id}]吗?`)
  }
  //添加、修改分组
  saveGroup(){
    if(!!this.state.group_id) {
      this.__modShowGroup(this.state.group_id, "修改分组成功");
    } else {
      this.__modShowGroup(null, "添加分组成功");
    }
  }
  handleLanguageInputChange(e){
    this.setState({
      content: e.target.value,
    });
  }
  addLanguage(){
    this.setState({ languageVisible: true, languageTitle: '添加常用语'});
  }
  //修改分组，显示modal
  editLanguage(record){
    this.setState({
      languageVisible: true,
      record_id: record.record_id,
      content: record.content,
      languageTitle: `修改常用语[编号${record.record_id}]`
    })
  }
  closeLanguage(){
    this.setState({
      languageVisible: false,
      record_id: '',
      content: '',
      languageTitle: ''
    })
  }
  __modShowLanguage(record_id, successTitle, status){
    if(!!status && status === 'ACTIVE' && !this.state.content){
      Errors('请输入常用语内容');
      return;
    }
    modShowLanguage(record_id, this.state.content, status).then(({jsonResult}) => {
      Success(successTitle);
      this.fetchInitData();
      this.closeLanguage();
    });
  }
  deleteLanguage(record_id){
    Confirm(function(){
      this.__modShowLanguage(record_id, "删除成功", "DISABLED");
    }.bind(this), `确定删除常用语[编号${record_id}]吗?`)
  }
  saveLanguage(){
    if(!!this.state.record_id) {
      this.__modShowLanguage(this.state.record_id, "修改常用语成功");
    } else {
      this.__modShowLanguage(null, "添加常用语成功");
    }
  }
  updateOptrConfig(){
    Confirm(function(){
      updateOptrConfig({MULT_WINDOWS: this.state.multWindowsNum, RebotMode: this.state.rebotMode.join(",")}).then(({jsonResult}) => {
        Success("修改成功");
      });
    }.bind(this), "确定修改吗?")
  }
  handleWindowsNumChange(multWindowsNum){
    if(multWindowsNum !== this.state.multWindowsNum){
      this.setState({multWindowsNum});
    }
  }
  handleRebotModeChange(rebotMode){
    if(rebotMode !== this.state.rebotMode){
      this.setState({rebotMode});
    }
  }
  fetchInitData(){
    initMultManage().then(({jsonResult}) => {
      let multWindowsNum = this.state.multWindowsNum, rebotMode = this.state.rebotMode;
      if(jsonResult.configMap){
        if(jsonResult.configMap.MULT_WINDOWS)
          multWindowsNum = jsonResult.configMap.MULT_WINDOWS;
        if(jsonResult.configMap.RebotMode)
          rebotMode = jsonResult.configMap.RebotMode;
          rebotMode = rebotMode.split(",");
      }
      this.setState({
        multWindowsNum,
        rebotMode,
        groupList: jsonResult.groupList,
        languageList: jsonResult.languageList,
        anchorList: jsonResult.anchorList,
        robotModeList: jsonResult.robotModeList
      })
    });
  }
  componentDidMount(){
    this.fetchInitData();
  }
  render(){
    const {multWindowsNum, rebotMode, groupList, languageList, anchorList, robotModeList,
      groupVisible, group_id, group_name, groupTitle, languageVisible, record_id, content, languageTitle} = this.state;
    return (
      <div className="setting-container">
        <FormItem label="聊天窗个数" labelCol={{span:3}} wrappCol={{span: 21}}>
          <InputNumber min={1} value={multWindowsNum} onChange={this.handleWindowsNumChange}/>
        </FormItem>
        <FormItem label="机器人开启模式" labelCol={{span:3}} wrappCol={{span: 21}}>
          <Select multiple value={rebotMode} placeholder="请选择机器人开启模式" style={{width: 300}}
            onChange={this.handleRebotModeChange}>
            {
              robotModeList.map(robot => (
                <Option key={robot.item_value}>{robot.item_name}</Option>
              ))
            }
          </Select>
          <Button type="primary" icon="edit" style={{marginLeft: 16}} onClick={this.updateOptrConfig}>修改</Button>
        </FormItem>
        <div className="inline-table">
          <div className="group-table">
            <div className="config-title">
              <Button icon="plus" type="primary" onClick={this.addGroup}>添加</Button>
              <p>分组</p>
            </div>
            <Table rowKey="group_id" columns={this.groupColumns} dataSource={groupList} pagination={false} bordered/>
          </div>
          <div className="language-table" style={{marginLeft: 16}}>
            <div className="config-title">
              <Button icon="plus" type="primary" onClick={this.addLanguage}>添加</Button>
              <p>常用语</p>
            </div>
            <Table rowKey="record_sn" columns={this.languageColumns} dataSource={languageList} pagination={false} bordered/>
          </div>
        </div>
        <div className="anchor-table">
          <p className="config-title">主播</p>
          <Table rowKey="anchor_id" columns={this.anchorColumns} dataSource={anchorList} pagination={false} bordered/>
        </div>
        <Modal visible={groupVisible} title={groupTitle} onOk={this.saveGroup} onCancel={this.closeGroup}
          footer={[
            <Button key="cancel" icon="cross" size="large" onClick={this.closeGroup}>取消</Button>,
            <Button key="submit" type="primary" icon="check" size="large" onClick={this.saveGroup}>提交</Button>
          ]}>
            <Input type="hidden" value={group_id} />
            <Input placeholder="请输入分组名称" value={group_name} onChange={this.handleGroupInputChange}/>
        </Modal>
        <Modal visible={languageVisible} title={languageTitle} onOk={this.saveLanguage} onCancel={this.closeLanguage}
          footer={[
            <Button key="cancel" icon="cross" size="large" onClick={this.closeLanguage}>取消</Button>,
            <Button key="submit" type="primary" icon="check" size="large" onClick={this.saveLanguage}>提交</Button>
          ]}>
            <Input type="hidden" value={record_id} />
            <Input placeholder="请输入常用语内容" value={content} onChange={this.handleLanguageInputChange}/>
        </Modal>
      </div>
    )
  }
}
