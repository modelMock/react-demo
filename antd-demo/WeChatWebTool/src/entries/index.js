import './index.less';
import React from 'react';
import ReactDOM from 'react-dom';
import { hashHistory } from 'react-router';
import Routes from '../routes/index';

ReactDOM.render(<Routes history={ hashHistory } />, document.getElementById('appContainer'));
