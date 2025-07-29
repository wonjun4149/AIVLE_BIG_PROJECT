// src/components/Navbar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo.png';
import { auth } from '../firebase';

const Navbar = ({ user, onSignUpClick, onLoginClick }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleSignUpClick = () => {
    if (onSignUpClick) onSignUpClick();
    else navigate('/signup');
  };

  const handleLoginClick = () => {
    if (onLoginClick) onLoginClick();
    else navigate('/login');
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      alert('로그아웃 되었습니다.');
      window.location.reload();
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="보라계약 로고" className="logo-icon" />
          <span className="logo-text">보라계약</span>
        </div>
        <div className="header-buttons">
          {user ? (
            <>
              <span className="user-name">{(user.name || user.displayName || user.email)}님</span>
              <button className="header-btn" onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <>
              <button className="header-btn" onClick={handleLoginClick}>로그인</button>
              <button className="header-btn" onClick={handleSignUpClick}>회원가입</button>
            </>
          )}
          <button className="menu-btn">☰</button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
