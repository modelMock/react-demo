import React from 'react';
import {Select,Button,Popover,Modal} from 'antd';
import groupChatService from '../../services/groupChatService';
/**
 * 给好友打标签
 */
export default class EditUserTags extends React.Component {
  static contextTypes = {
    onEditSystemTags: React.PropTypes.any
  }
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      tagList: [],
      selectedTags: [],
    }
    this.handleSave = this.handleSave.bind(this);
    this.handleVisibleChange = this.handleVisibleChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  handleVisibleChange(visible) {
    if(visible === true) {
      //显示：重新查询当前好友打标签数据
      groupChatService.queryShowTagDefines(this.props.operation_sn, this.props.friend_sn).then(({jsonResult}) => {
        let selectedTags = [];
        jsonResult.forEach(tag => {
          if(tag.is_select === true) {
            selectedTags.push(tag.tag_id.toString());
          }
        })
        this.setState({ tagList: jsonResult, selectedTags, visible: true });
      });
    } else {
      this.setState({ visible: false, tagList: [], selectedTags: [] });
    }
  }
  handleChange(selectedTags) {
    //选中的标签
    this.setState({ selectedTags });
  }
  handleSave() {
    const selectedTags = this.state.selectedTags.length > 0 ? this.state.selectedTags.join(",") : undefined;
    if(this.props.tag_id_list !== selectedTags) {
      groupChatService.updateUserTag(this.props.operation_sn, this.props.friend_sn, this.state.selectedTags)
        .then(({jsonResult}) => {
          console.log('jsonResult', jsonResult)
          const modal = Modal.success({
            title: '成功提示',
            content: '打标签成功'
          });
          setTimeout(() => modal.destroy(), 1000);
          this.setState({ visible: false });
          this.context.onEditSystemTags(this.props.operation_sn, this.props.friend_sn, jsonResult, selectedTags);
        })
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    console.log('EditUserTags => shouldComponentUpdate');
    return this.state.visible != nextState.visible || this.props.tag_id_list !== nextProps.tag_id_list
      || this.state.tagList != nextState.tagList || this.state.selectedTags !== nextState.selectedTags;
  }
  render() {
    console.log('EditUserTags => render', this.state, this.props);
    return (
      <Popover title="打标签" placement="topLeft" trigger="click"
        visible={this.state.visible} onVisibleChange={this.handleVisibleChange}
        content={
          <div className="edit-big">
            <Select multiple value={this.state.selectedTags} onChange={this.handleChange}
              getPopupContainer={trigger => trigger.parentNode} placeholder="请选择标签" style={{ width: '100%' }}>
              {
                this.state.tagList.map(tag => (
                  <Select.Option key={tag.tag_id}>{tag.tag_name}</Select.Option>
                ))
              }
            </Select>
            <Button type="primary" icon="check" onClick={this.handleSave}>提交</Button>
            <Button type="ghost" icon="close" onClick={() => {this.handleVisibleChange(false)}}>取消</Button>
          </div>
        }>
        <Button type="ghost" icon="tags" title="打标记"/>
      </Popover>
    )
  }
}
