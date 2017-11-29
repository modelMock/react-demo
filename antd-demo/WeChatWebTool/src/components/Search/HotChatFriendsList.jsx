import React, {Component, PropTypes} from 'react';
import { hashHistory } from 'react-router';
import './SearchContainer.less';
import {queryHotUsers} from '../../services/search';

class FriendItem extends Component {

  static propTypes = {
    head_url: PropTypes.string,
    nick_name: PropTypes.string.isRequired,
  }
  static defaultProps = {
    head_url: 'https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png'
  }
  constructor(props) {
    super(props);
    this.onClickFriend = this.onClickFriend.bind(this);
  }

  onClickFriend() {
    const { friend_sn, operation_sn } = this.props;
    hashHistory.replace({
      pathname: "/chat",
      state: { friend_sn, operation_sn }
    });
  }

  render() {
    const { head_url, nick_name } = this.props;
    return (
      <a className="friend" href="javascript:void(0)" onClick={this.onClickFriend}>
        <img src={head_url} width="50" height="50" />
        <p className="friend-bottom">{nick_name}</p>
      </a>
    )
  }
}

export default class HosChatFriendsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      friedList: []
    }
  }

  fetchInitData() {
    queryHotUsers().then(({jsonResult}) => {
      this.setState({
        friedList:jsonResult||[]
      });
    });
  }

  componentDidMount() {
    this.fetchInitData()
  }

  render() {
    console.log('HosChatFriendsList => render => ');
    return (
      <div className="friend-list">
        {
          this.state.friedList.map(friend => (
            <FriendItem key={friend['friend_wechat']}
              operation_sn={friend['operation_sn']}
              friend_sn={friend['friend_sn']}
              nick_name={friend['nick_name']}
              head_url={friend['head_url']} />
          ))
        }
      </div>
    )
  }
}
