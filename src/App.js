import React from 'react';
import './App.css';
// import Home from './pages/home';
// import Login from './pages/login';
import Time from './pages/time';
import Sprint from './pages/sprint';
import Files from './pages/files';
import Navbar from './pages/navBar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className='App'>
        <Navbar />
        <Switch>
          <Route path="/" exact component={Time} />
          <Route path="/sprint" component={Sprint} />
          <Route path="/files" component={Files} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
