import React from 'react';
import './Navbar.css';
import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <img src={logo} alt="보라계약 로고" className="logo-icon" />
          <span className="logo-text">보라계약</span>
        </div>
        <div className="header-buttons">
          <button className="header-btn">로그인</button>
          <button className="header-btn">회원가입</button>
          <button className="menu-btn">☰</button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;