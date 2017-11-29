import React, {Component, PropTypes} from 'react';
import {Input} from 'antd';
import SearchInput from './SearchInput';
import classNames from 'classnames';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import './SearchContainer.less';
import {queryAdByOptr} from '../../services/search';
const InputGroup = Input.Group;

class AdsItem extends Component {

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.onClickAdsItem(this.props['ad_id']);
  }

  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }

  render() {
    const activeCls = classNames({
      "actived": this.props.isActived
    });
    return (
        <div className="search-ad-item" onClick={this.onClick}>
          <a href="javascript:void(0)" className={activeCls}>
            <p>{this.props.ad_name}</p>
          </a>
        </div>
    )
  }
}

export default class AdsItemList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      adsList: [],
      activedAdId: ''
    }
    this.onSearch = this.onSearch.bind(this);
    this.onClickAdsItem = this.onClickAdsItem.bind(this);
  }

  onSearch(value) {
    if(value && value.length > 0) {
      let adsList = this.adsList.filter(ads => {
        return ads['ad_name'].indexOf(value) >= 0;
      });
      this.setState({ adsList });
    } else {
      this.setState({ adsList: this.adsList });
    }
  }

  onClickAdsItem(adId) {
    if(this.state.activedAdId != adId) {
      this.props.onClickAdsItem(adId);
      this.setState({ activedAdId: adId })
    } else {
      this.props.onClickAdsItem('');
      this.setState({ activedAdId: '' })
    }
  }

  fetchInitData() {
    queryAdByOptr().then(({jsonResult}) => {
      this.adsList = jsonResult.map(ads => (
        {ad_id: ads['ad_id'], ad_name: ads['ad_name']}
      ));
      this.setState({
        adsList: this.adsList
      })
    })
  }

  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }

  componentDidMount() {
    this.fetchInitData()
  }

  render() {
    console.log('AdsItemList => render => ');
    const {activedAdId,adsList} = this.state;
    return (
      <div className="search-ads-left">
        <div className="search-ads-input">
          <SearchInput placeholder="请输入广告名称过滤" onSearch={this.onSearch}/>
        </div>
        <div className="search-ads-list">
        {
          adsList.map( ads => (
            <AdsItem key={ads['ad_id']}
              ad_id={ads['ad_id']} ad_name={ads['ad_name']}
              isActived={activedAdId === ads['ad_id']}
              onClickAdsItem={this.onClickAdsItem}/>
          ))
        }
        </div>
      </div>
    );
  }
}
