import React from 'react';
import './Navbar.css';
import logo from '../assets/logo.png';

const Navbar = ({ onHomeClick, onSignUpClick }) => {
  const handleLogoClick = () => {
    if (onHomeClick) {
      onHomeClick();
    }
  };

  const handleSignUpClick = () => {
    if (onSignUpClick) {
      onSignUpClick();
    }
  };

  const handleLoginClick = () => {
    // 로그인 기능은 아직 구현하지 않았으므로 알림만 표시
    alert('로그인 기능은 준비중입니다.');
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="보라계약 로고" className="logo-icon" />
          <span className="logo-text">보라계약</span>
        </div>
        <div className="header-buttons">
          <button className="header-btn" onClick={handleLoginClick}>로그인</button>
          <button className="header-btn" onClick={handleSignUpClick}>회원가입</button>
          <button className="menu-btn">☰</button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;