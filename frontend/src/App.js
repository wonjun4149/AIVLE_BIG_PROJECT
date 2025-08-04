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
import QnaList from './components/QnaList';
import QnaWrite from './components/QnaWrite';
import QnaDetail from './components/QnaDetail';
import MainLayout from './components/MainLayout';
import ResetPassword from './components/ResetPassword';


function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (userAuth) => {
      if (userAuth && userAuth.emailVerified) {
        const userDocRef = doc(db, 'users', userAuth.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser(Object.assign(userAuth, userDoc.data()));
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
        {/* 네비게이션 바가 있는 페이지들 */}
        <Route element={<MainLayout user={user} />}>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/create-terms" element={<CreateTerms user={user} />} />
          <Route path="/create-standard" element={<CreateStandard user={user} />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/qna" element={<QnaList />} />
          <Route path="/qna/write" element={<QnaWrite />} />
          <Route path="/qna/:id" element={<QnaDetail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* 네비게이션 바가 없는 페이지들 */}
        <Route path="/signup" element={<SignUp onHomeClick={() => window.location.href = '/'} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/complete-signup" element={<CompleteSignUp />} />
      </Routes>
    </Router>
  );
}

export default App;
