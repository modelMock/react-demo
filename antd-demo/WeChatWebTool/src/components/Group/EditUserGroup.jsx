import React from 'react';
import {Select,Button,Popover,Modal} from 'antd';
import groupChatService from '../../services/groupChatService';
/**
 * 好友分组
 */
export default class EditUserGroup extends React.Component {
  static contextTypes = {
    onEditGroup: React.PropTypes.any
  }
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      groupList: [],
      group_id: props.group_id,
    }
    this.handleSave = this.handleSave.bind(this);
    this.handleVisibleChange = this.handleVisibleChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  handleVisibleChange(visible) {
    //没有保存时，还原group_id
    if(visible === false){
      if(this.state.group_id !== this.props.group_id) {
        this.setState({ visible: false, group_id: this.props.group_id });
      } else {
        this.setState({ visible: false });
      }
    } else {
      //第一次显示时才查询分组数据
      if(this.state.groupList.length > 0) {
        this.setState({ visible: true });
      } else {
        console.log("第一次查询分组数据")
        groupChatService.queryShowGroupDefines().then(({jsonResult}) => {
          this.setState({ groupList: jsonResult, visible: true });
        });
      }
    }
  }
  handleChange(group_id) {
    //选中的标签
    this.setState({ group_id });
  }
  handleSave() {
    console.log(this.state.group_id, this.props.group_id)
    if(this.state.group_id !== this.props.group_id) {
      groupChatService.updateUserGroup(this.props.operation_sn, this.props.friend_sn, this.state.group_id)
        .then(({jsonResult}) => {
          const modal = Modal.success({
            title: '成功提示',
            content: '变更分组成功'
          });
          setTimeout(() => modal.destroy(), 1000);
          this.setState({ visible: false });
          this.context.onEditGroup(this.props.operation_sn, this.props.friend_sn, this.state.group_id, jsonResult);
        })
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    console.log('EditUserGroup => shouldComponentUpdate',
      this.state.visible !== nextState.visible,
      this.state.group_id !== nextState.group_id,
      this.state.groupList !== nextState.groupList
    );
    return this.state.visible !== nextState.visible || this.state.group_id !== nextState.group_id
      || this.state.groupList !== nextState.groupList;
  }
  render() {
    console.log('EditUserGroup => render', this.state);
    const {visible, group_id, groupList} = this.state;
    return (
      <Popover title="更换分组" placement="topLeft" trigger="click"
        visible={visible} onVisibleChange={this.handleVisibleChange}
        content={
          <div className="edit-small">
            <Select style={{ width: '100%' }} value={group_id} onChange={this.handleChange}
              getPopupContainer={trigger => trigger.parentNode} dropdownMatchSelectWidth={false}
              placeholder="请选择要变更的分组" allowClear>
              {
                groupList.map(tag => (
                  <Select.Option key={tag.group_id}>{tag.group_name}</Select.Option>
                ))
              }
            </Select>
            <Button type="primary" icon="check" onClick={this.handleSave}>提交</Button>
            <Button type="ghost" icon="close" onClick={() => {this.handleVisibleChange(false)}}>取消</Button>
          </div>
        }>
        <Button type="ghost" icon="team" title="分组"/>
      </Popover>
    )
  }
}
