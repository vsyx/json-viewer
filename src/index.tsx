import React from 'react';
import ReactDOM from 'react-dom';
import 'sanitize.css';
import 'long-press-event';

import './index.scss';

import App from './components/App';

ReactDOM.render (
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);
