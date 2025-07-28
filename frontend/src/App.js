// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import SignUp from './components/SignUp';
import Login from './components/Login';
import CreateTerms from './components/Create-Terms';
import CreateStandard from './components/Create-Standard';
import CompleteSignUp from './components/CompleteSignUp';




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp onHomeClick={() => window.location.href = '/'} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-terms" element={<CreateTerms />} />
        <Route path="/create-standard" element={<CreateStandard />} />
        <Route path="/complete-signup" element={<CompleteSignUp />} />
      </Routes>
    </Router>
  );
}

export default App;
