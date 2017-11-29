import React from 'react';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import Popover from 'antd/lib/popover';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import groupChatService from '../../services/groupChatService';

export default class EditRemarkInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    }
    this.handleSave = this.handleSave.bind(this);
    this.handleVisibleChange = this.handleVisibleChange.bind(this);
  }
  handleSave() {
    const remark = this.refs.remarkInput.refs.input.value;
    if(remark !== this.props.remark) {
      groupChatService.updateUserRemark(this.props.operation_sn, this.props.friend_sn, remark).then(({jsonResult}) => {
        this.setState({ visible: false });
        this.props.onEditRemark(remark);
      })
    }
  }
  handleVisibleChange(visible) {
    this.setState({ visible });
  }
  componentDidUpdate() {
    if(this.state.visible === true) {
      this.refs.remarkInput.refs.input.value = this.props.remark||'';
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return this.state.visible != nextState.visible || this.props.remark != nextProps.remark;
  }
  render() {
    console.log('EditRemarkInfo => render', this.props);
    return(
      <Popover title="修改备注" placement="bottomLeft" trigger="click"
        visible={this.state.visible} onVisibleChange={this.handleVisibleChange}
        content={
          <div className="edit-small">
            <Input ref="remarkInput" placeholder="请输入备注名"/>
            <Button type="primary" icon="check" onClick={this.handleSave}>提交</Button>
            <Button type="ghost" icon="close" onClick={() => {this.handleVisibleChange(false)}}>取消</Button>
          </div>
        } >
        <span className="text" >{!!this.props.remark ? this.props.remark : '点击修改备注'}</span>
      </Popover>
    );
  }
}
