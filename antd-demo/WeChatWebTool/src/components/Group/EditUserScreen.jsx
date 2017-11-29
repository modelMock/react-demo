 import React from 'react';
 import {Select,Button,Popover,Modal} from 'antd';
 import groupChatService from '../../services/groupChatService';
 const Option=Select.Option;
 /**
  * 屏蔽用户聊天时长
  */
 export default class EditUserScreen extends React.Component {
   constructor(props) {
     super(props);
     this.state = {
       visible: false,
       screening_hour: undefined,
     }
     this.handleSave = this.handleSave.bind(this);
     this.handleVisibleChange = this.handleVisibleChange.bind(this);
     this.handleChange = this.handleChange.bind(this);
   }
   handleVisibleChange(visible) {
     if(visible === false){
       this.setState({ visible: false, screening_hour: undefined });
       this.refs.screenSelect.value="";
     } else {
       this.setState({ visible });
     }
   }
   handleChange(screening_hour) {
     //没有保存时，清空screening_hour
     this.setState({ screening_hour });
   }
   handleSave() {
     if(!!this.state.screening_hour) {
       groupChatService.updateUserScreening(this.props.operation_sn, this.props.friend_sn, this.state.screening_hour)
         .then(({jsonResult}) => {
           const modal = Modal.success({
             title: '成功提示',
             content: '屏蔽成功'
           });
           setTimeout(() => modal.destroy(), 1000);
           this.setState({ visible: false });
           this.props.onShielded(true);
         })
     }
   }
   shouldComponentUpdate(nextProps, nextState) {
     return this.state.visible !== nextState.visible || this.state.screening_hour !== nextState.screening_hour;
   }
   render() {
     console.log('EditUserScreen => render', this.state);
     return (
       <Popover title="屏蔽" placement="topLeft" trigger="click"
         visible={this.state.visible} onVisibleChange={this.handleVisibleChange}
         content={
           <div className="edit-small">
             <Select ref="screenSelect" style={{ width: '100%' }} value={this.state.screening_hour}
                  onChange={this.handleChange} getPopupContainer={trigger => trigger.parentNode}
                  placeholder="请选择要屏蔽的时长" allowClear>
               <Option value="1">1小时</Option>
               <Option value="6">6小时</Option>
               <Option value="24">1天</Option>
               <Option value="72">3天</Option>
               <Option value="168">7天</Option>
             </Select>
             <Button type="primary" icon="check" onClick={this.handleSave}>提交</Button>
             <Button type="ghost" icon="close" onClick={() => {this.handleVisibleChange(false)}}>取消</Button>
           </div>
         }>
         <Button type="ghost" icon="notification" title="屏蔽"/>
       </Popover>
     )
   }
 }
