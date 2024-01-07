import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Home from './Home';

function App() {
 return (
   <Router>
     <Routes>
       <Route exact path="/login" element={<Login />} />
       <Route exact path="/" element={<Register/>} />
       <Route exact path="/home" element={<Home />} />
     </Routes>
   </Router>
 );
}

export default App;
