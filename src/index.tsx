import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import 'sanitize.css';
import 'long-press-event';

ReactDOM.render (
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);
