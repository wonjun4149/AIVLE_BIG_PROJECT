// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import SignUp from './components/SignUp';
import Login from './components/Login';
import CreateTerms from './components/Create-Terms';
import CreateStandard from './components/Create-Standard';
import CompleteSignUp from './components/CompleteSignUp';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import MyPage from './MyPage';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (userAuth) => {
      if (userAuth) {
        const userDocRef = doc(db, 'users', userAuth.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ ...userAuth, ...userDoc.data() });
        } else {
          setUser(userAuth);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/signup" element={<SignUp onHomeClick={() => window.location.href = '/'} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-terms" element={<CreateTerms user={user} />} />
        <Route path="/create-standard" element={<CreateStandard user={user} />} />
        <Route path="/complete-signup" element={<CompleteSignUp />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
    </Router>
  );
}

export default App;
