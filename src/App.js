import React from 'react';
// import Home from './pages/home';
// import Login from './pages/login';
import Time from './pages/time';
import Sprint from './pages/sprint';
import Files from './pages/files';
import Navbar from './pages/navBar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import "devextreme/dist/css/dx.light.css";
import "antd/dist/antd.css";
import './App.css';

function App() {
  return (
    <Router>
      <div className='App'>
        <Navbar />
        <div className="mainBody">
          <Switch>
            <Route path="/" exact component={Time} />
            <Route path="/sprint" component={Sprint} />
            <Route path="/files" component={Files} />
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;
