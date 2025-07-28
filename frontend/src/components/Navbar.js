// src/components/Navbar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo.png';

const Navbar = ({ onSignUpClick, onLoginClick, userName }) => {
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

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="보라계약 로고" className="logo-icon" />
          <span className="logo-text">보라계약</span>
        </div>
        <div className="header-buttons">
          {userName ? (
            <span className="user-name">{userName}님</span>
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
