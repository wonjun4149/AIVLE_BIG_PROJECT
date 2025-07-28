// src/components/Login.js
import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('로그인 성공');
      navigate('/');
    } catch (error) {
      console.error('로그인 실패:', error);
      alert(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert('Google 로그인 성공');
      navigate('/');
    } catch (error) {
      console.error('Google 로그인 실패:', error);
      alert(error.message);
    }
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <div className="login-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="보라계약 로고" className="login-logo-icon" />
        </div>
        <button className="menu-btn">☰</button>
      </header>

      <main className="login-main">
        <div className="login-container">
          <div className="login-brand">
            <div className="login-brand-icon">
              <img src={logo} alt="보라계약 로고" className="login-brand-logo" />
            </div>
            <h1 className="login-title">로그인</h1>
          </div>

          <div className="login-form">
            <div className="form-row">
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input full-width"
              />
            </div>

            <div className="form-row">
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input full-width"
              />
            </div>

            <button className="login-submit-btn" onClick={handleLogin}>
              로그인
            </button>

            <button className="google-signin-btn" onClick={handleGoogleLogin}>
              <img src={require('../assets/google-logo.png')} alt="Google 로고" className="google-icon-img" />
              Sign in with Google
            </button>

            <div className="login-link" onClick={() => navigate('/signup')}>
              <span>아직 회원이 아니신가요? 회원가입</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
