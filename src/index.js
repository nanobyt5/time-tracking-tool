import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.css';
import InsertData from './components/insertData';
import ReadData from './components/readData';
import ReplaceData from './components/replaceData';

ReactDOM.render(<App />, document.getElementById('title'));
ReactDOM.render(<InsertData />, document.getElementById('insert'));
ReactDOM.render(<ReadData />, document.getElementById('read'));
ReactDOM.render(<ReplaceData />, document.getElementById('replace'));

reportWebVitals();
