import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Login from './components/Login';

function App() {
  return (
    <Router>
      <div className='app'>
        <Routes>
          <Route path='/login' element={<Login/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
