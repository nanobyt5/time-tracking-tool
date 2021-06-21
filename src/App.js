import React from 'react';
import Home from './pages/home';
import Login from './pages/login';
import Time from './pages/time';
import Navbar from './pages/navBar';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import SprintVelocity from "./pages/sprintVelocity";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/time" component={Time} />
          <Route path="/sprint_velocity" component={SprintVelocity} />
          <Route path="/login" component={Login} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
