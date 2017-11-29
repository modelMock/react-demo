import React, {Component, PropTypes} from 'react';
import AdsItemList from './AdsItemList';
import SearchForm from './SearchForm';
import HotChatFriendsList from './HotChatFriendsList';
import SearchFriendTable from './SearchFriendTable';
import './SearchContainer.less';

export default class SearchContainer extends Component {
  constructor(props) {
    super(props);
    this.onSearch = this.onSearch.bind(this);
    this.onClickAdsItem = this.onClickAdsItem.bind(this);
  }

  onSearch(values) {
    console.log('SearchContainer => onSearch => ', values);
    values['ad_id'] = this.ad_id;
    this.refs.searchFriendTable.onSearch(values);
  }

  onClickAdsItem(adId) {
    if(this.ad_id != adId) {
      this.ad_id = adId;
    }
  }

  render() {
    return (
      <div className="search-container">
        <div className="search-ads">
          <AdsItemList onClickAdsItem={this.onClickAdsItem}/>
        </div>
        <div className="search-friends">
          <SearchForm onSearch={this.onSearch}/>
          <HotChatFriendsList />
          <SearchFriendTable ref="searchFriendTable" />
        </div>
      </div>
    );
  }
}
