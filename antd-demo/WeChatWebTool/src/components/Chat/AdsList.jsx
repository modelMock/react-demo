/**右侧广告列表**/
import React, {Component, PropTypes} from 'react';
import {Icon, Spin} from 'antd';
import classNames from 'classnames';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { LIMIT_MESSAGE_PAGE } from './Utils';
import {Errors} from '../Commons/CommonConstants'
import './ChatContainer.less';

export default class AdsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      adsList: [],
      commentList: [],
      activedAdId: '',
      loading: false
    }
    this.onClickAdsItem = this.onClickAdsItem.bind(this);
    this.onLoadMore = this.onLoadMore.bind(this);
  }
  setAdsList(adsList) {
    this.adId = null;
    if(adsList.length > 0) {
      this.setState({ adsList, commentList: [] });
      this.onClickAdsItem(adsList[0]['ad_id']);
    } else {
      this.setState({adsList: [], commentList: []});
    }
  }
  setCommentList(commentList) {
    this.setState({ commentList, loading: false });
  }
  addCommentList(commentList) {
    this.setState({ commentList: this.state.commentList.concat(commentList), loading: false });
  }
  setHasMore(hasMore) {
    this.hasMore = hasMore;
  }
  onClickAdsItem(adId) {
    console.log('onClickAdsItem: ', this.adId, adId);
    if(this.adId !== adId) {
      this.adId = adId;
      this.hasMore = true;
      this.setState({ loading: true, activedAdId: adId })
      this.props.onClickAdsItem(adId);
    }
  }
  onLoadMore() {
    if(this.hasMore) {
      this.props.onClickAdsItem(this.adId, true);
    } else {
      Errors('没有更多评论了');
    }
  }

  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }

  render() {
    const { adsList, commentList, activedAdId, loading } = this.state;
    const adsActived = classNames({'actived': true});
    return <div className="ads-container">
            <div className="ads-list-content">
              <p className="ads-list-title">
                <b><Icon type="tablet"/>  广告朋友圈互动记录</b>
              </p>
              <ul className="ads-list-ul">
                {
                  adsList.map( ads => {
                    const liCls = "ads-list-item " + classNames({"actived": activedAdId === ads.ad_id});
                    return <li key={ads['ad_id']} className={liCls}
                        onClick={ () => {this.onClickAdsItem(ads['ad_id'])}}
                        >
                      <p>{ads['ad_name']}(ID: {ads['ad_id']})</p>
                    </li>
                  })
                }
              </ul>
            </div>
            <div className="ads-comments">
              <span className="ads-comments-header">
                <b><Icon type="message"/> 评论列表</b>
              </span>
              <Spin style={{minHeight: 300}} tip="正在加载广告数据..." spinning={loading}>
                <div className="ads-comment-body">
                  <ul>
                    {
                      commentList.map(comment => (
                        <li key={comment['interact_sn']} className="ads-comment-item">
                          <p>{comment['interact_content']}</p>
                          <span>{comment['interact_time']}</span>
                        </li>
                      ))
                    }
                    <li>
                    <p className="load-more" hidden={ commentList.length < LIMIT_MESSAGE_PAGE } onClick={this.onLoadMore}>加载更多么？</p>
                    </li>
                  </ul>
                </div>
              </Spin>
            </div>
      </div>
  }

}
