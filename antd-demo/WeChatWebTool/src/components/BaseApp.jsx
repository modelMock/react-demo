import React from 'react';
import {queryWebMappingListOfOptr} from '../services/optr';
import resourceManage from './ResourceManage';

export default class BaseApp extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isActive: false
    }
  }
  fetchInitData() {
    queryWebMappingListOfOptr().then(({jsonResult}) => {
      resourceManage.handleRoleRes(jsonResult);
      this.hasChatRole();
    });
  }
  hasChatRole(){}
  componentDidMount() {
    this.fetchInitData();
  }
}
