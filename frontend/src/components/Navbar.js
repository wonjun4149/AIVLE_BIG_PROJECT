import React, { useEffect, useState } from 'react';
import './Navbar.css';
import logo from '../assets/logo.png';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Navbar = ({ onHomeClick }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogoClick = () => {
    if (onHomeClick) onHomeClick();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('로그아웃 되었습니다.');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const goTo = (path) => {
    window.location.href = path;
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
              <span className="header-username">{user.displayName || user.email}</span>
              <button className="header-btn" onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <>
              <button className="header-btn" onClick={() => goTo('/login')}>로그인</button>
              <button className="header-btn" onClick={() => goTo('/signup')}>회원가입</button>
            </>
          )}
          <button className="menu-btn">☰</button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;