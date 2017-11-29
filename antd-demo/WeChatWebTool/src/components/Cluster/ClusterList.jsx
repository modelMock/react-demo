import React from 'react';
import {Form, Row, Col, Input, Select, Button, Tag, Modal} from 'antd';
import CommonTable from '../Commons/CommonTable';
import CommonSelect from '../Commons/CommonSelect';
import {Errors} from '../Commons/CommonConstants';
import EditClusterModal from './EditClusterModal';
import InviteFriendsModal from './InviteFriendsModal';
import TransferCluster from './TransferCluster';
import {queryClusterList, queryClusterInviteFriends} from '../../services/cluster';
const FormItem = Form.Item;
const Option = Select.Option;
/**
 * 群列表
 */
class ClusterFrom extends React.Component{
  constructor(props){
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }
  handleSubmit(e){
    e.preventDefault();
    this.props.onSearch(this.props.form.getFieldsValue());
  }
  handleReset(){
    this.props.form.resetFields();
  }
  render(){
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 16},
    };
    const getFieldDecorator = this.props.form.getFieldDecorator;
    return (
      <Form horizontal onSubmit={this.handleSubmit} className="ant-advanced-search-form">
        <Row gutter={16}>
          <Col sm={8}>
            <FormItem label="群ID" {...formItemLayout}>
              {getFieldDecorator("cluster_id")(
                <Input placeholder="请输入群ID"/>
              )}
            </FormItem>
            <FormItem label="群名称" {...formItemLayout}>
              {getFieldDecorator("cluster_name")(
                <Input placeholder="请输入群名称"/>
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="当前群主" {...formItemLayout}>
              {getFieldDecorator("master_info")(
                <Input placeholder="请输入当前群主名称"/>
              )}
            </FormItem>
            <FormItem label="初创群主手机号" {...formItemLayout}>
              {getFieldDecorator("create_master_info")(
                <Input placeholder="请输入初创群主手机号"/>
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="创建群类型" {...formItemLayout}>
              <CommonSelect item_key="ClusterType" placeholder="请选择创建群类型"
                getFieldDecorator={getFieldDecorator("cluster_type")} />
            </FormItem>
            <FormItem label="群成员数" {...formItemLayout}>
              {getFieldDecorator("sort_type")(
                <Select allowClear placeholder="请选择群成员数">
                  <Option value="desc">多到少</Option>
                  <Option value="asc">少到多</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={12} offset={12} style={{ textAlign: 'right' }}>
            <Button type="primary" size="large" icon="search" htmlType="submit">搜索</Button>
            <Button icon="poweroff" size="large" onClick={this.handleReset}>重置</Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

ClusterFrom = Form.create()(ClusterFrom);
export default class ClusterList extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      editVisible: false,       //修改群信息弹出框
      inviteVisible: false,     //邀请好友弹出框
      transferVisible: false,   //转让群主弹出框
      record: {},               //点击行群数据
      inviteFrdData: {},        //邀请好友初始化数据
    }
    this.columns=[
      {title: '群ID', dataIndex: 'cluster_id', width: 80, fixed: 'left'},
      {title: '创建时间', dataIndex: 'create_time', width: 130},
      {title: '创建群类型', dataIndex: 'cluster_type', width: 100, render: (text, record) => {
          if(text == "LARGE") return <Tag color="blue">{record.cluster_type_text}</Tag>;
          else if(text == "SMALL") return <Tag color="green">{record.cluster_type_text}</Tag>
          return text;
        }
      },
      {title: '群名称', dataIndex: 'cluster_name'},
      {title: '当前群主', dataIndex: 'master_info', width: 120},
      {title: '群成员数', dataIndex: 'cluster_member_cnt', width: 80},
      {title: '男成员数', dataIndex: 'cluster_man_cnt', width: 80},
      {title: '女成员数', dataIndex: 'cluster_woman_cnt', width: 80},
      {title: '更新时间', dataIndex: 'change_time', width: 130},
      {title: '操作', dataIndex: '', fixed: 'right', width: 200, render: (text, record) => {
          return <span>
            <a href="javascript:void(0)" onClick={this.editGroup.bind(this, record)}>编辑群信息</a>
            <span className="ant-divider"></span>
            <a href="javascript:void(0)" onClick={this.inviteFriends.bind(this, record)}>邀请好友</a>
            <span className="ant-divider"></span>
            <a href="javascript:void(0)" onClick={this.transferGroup.bind(this, record)}>转让群主</a>
            <span className="ant-divider"></span>
          </span>
        }
      },
    ];
    this.handleSearch = this.handleSearch.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.handleUpdateVisible = this.handleUpdateVisible.bind(this);
  }
  editGroup(record){
    this.setState({ record, editVisible: true, inviteVisible: false, transferVisible: false });
  }
  inviteFriends(record){
    //查询邀请好友初始化数据，是否有可用运营号
    queryClusterInviteFriends(record.cluster_sn).then(({jsonResult}) => {
      if(jsonResult.active_opts > 0){
        this.setState({
          record,
          inviteFrdData: jsonResult,
          editVisible: false,
          inviteVisible: true,
          transferVisible: false,
        })
      }else{
        Errors("没有可用运营号");
      }
    });
  }
  transferGroup(record){
    this.setState({ record, editVisible: false, inviteVisible: false, transferVisible: true });
  }
  handleUpdateVisible(){
    console.log("重置所有显示弹出框变量为false");
    this.setState({editVisible: false, inviteVisible: false, transferVisible: false, record: null, inviteVisible: null});
  }
  handleRefresh(){
    this.refs.commonTable.refreshTable();
  }
  handleSearch(params){
    this.refs.commonTable.queryTableData(params);
  }
  render(){
    console.log("ClusterList => render");
    return (
      <div>
        <ClusterFrom onSearch={this.handleSearch}/>
        <CommonTable ref="commonTable" columns={this.columns} rowKey="cluster_sn"
          fetchTableDataMethod={queryClusterList} scroll={{x: 1200}} />
        {this.renderModal()}
      </div>
    );
  }
  renderModal(){
    const {editVisible, inviteVisible, transferVisible, record} = this.state;
    if(editVisible === true){
      return <EditClusterModal editVisible={editVisible} record={record}
                onRefresh={this.handleRefresh} onUpdateVisible={this.handleUpdateVisible} />
    } else if(inviteVisible === true){
      return <InviteFriendsModal inviteVisible={inviteVisible} cluster_sn={record.cluster_sn}
                inviteFrdData={this.state.inviteFrdData}
                onRefresh={this.handleRefresh} onUpdateVisible={this.handleUpdateVisible} />
    } else if(transferVisible === true){
      return <TransferCluster transferVisible={transferVisible} record={record}
                onRefresh={this.handleRefresh} onUpdateVisible={this.handleUpdateVisible} />
    }
    return null;
  }
}
