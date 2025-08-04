// src/components/Navbar.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo.png';
import { auth } from '../firebase';

const Navbar = ({ user, userPoints, isRefreshing, onRefreshPoints, onSignUpClick, onLoginClick }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogoClick = () => navigate('/');
  const handleSignUpClick = () => onSignUpClick ? onSignUpClick() : navigate('/signup');
  const handleLoginClick = () => onLoginClick ? onLoginClick() : navigate('/login');
  const handleMyPageClick = () => navigate('/mypage');
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      alert('로그아웃 되었습니다.');
      navigate('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  const handleMenuClick = () => setIsSidebarOpen(!isSidebarOpen);
  const handleOverlayClick = () => setIsSidebarOpen(false);

  const formatPoints = (points) => {
    return points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const formatUserName = (userName) => {
    if (!userName) return '';
    return userName.replace(/님$/, '');
  };

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <img src={logo} alt="보라계약 로고" className="logo-icon" />
            <span className="logo-text">보라계약</span>
          </div>
          <div className="header-buttons">
            {user ? (
              <>
                <span className="header-btn">
                  <span className="name-highlight">
                    {formatUserName(user.name || user.displayName || user.email)} 님
                  </span>
                </span>
                <div
                  className={`points-display ${isRefreshing ? 'refreshing' : ''}`}
                  onClick={onRefreshPoints}
                  style={{ cursor: 'pointer', opacity: isRefreshing ? 0.7 : 1, transition: 'opacity 0.2s ease' }}
                  title="클릭하여 포인트 새로고침"
                >
                  <span className="points-value">
                    {isRefreshing ? '새로고침...' : `${formatPoints(userPoints)}P`}
                  </span>
                </div>
                <button className="header-btn mypage-btn" onClick={handleMyPageClick}>마이페이지</button>
                <button className="header-btn" onClick={handleLogout}>로그아웃</button>
              </>
            ) : (
              <>
                <button className="header-btn" onClick={handleLoginClick}>로그인</button>
                <button className="header-btn" onClick={handleSignUpClick}>회원가입</button>
              </>
            )}
            <button className="menu-btn" onClick={handleMenuClick}>☰</button>
          </div>
        </div>
      </header>

      {isSidebarOpen && (
        <>
          <div className="sidebar-overlay" onClick={handleOverlayClick}></div>
          <div className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <div className="sidebar-header">
              <h2>보라계약</h2>
              <button className="sidebar-close-btn" onClick={handleMenuClick}>×</button>
            </div>
            {user && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">
                  {formatUserName(user.name || user.displayName || user.email)} 님
                </div>
                <div className="sidebar-user-points">
                  포인트: {formatPoints(userPoints)}P
                </div>
              </div>
            )}
            <nav className="sidebar-nav">
              <ul>
                <li onClick={() => { navigate('/mypage'); setIsSidebarOpen(false); }}>마이페이지</li>
                <li onClick={() => { navigate('/contracts'); setIsSidebarOpen(false); }}>계약서 관리</li>
                <li onClick={() => { navigate('/points'); setIsSidebarOpen(false); }}>포인트 관리</li>
                <li onClick={() => { navigate('/qna'); setIsSidebarOpen(false); }}>질문 게시판</li>
                <li onClick={() => { navigate('/settings'); setIsSidebarOpen(false); }}>설정</li>
                {user && (
                  <li onClick={() => { handleLogout(); setIsSidebarOpen(false); }}>로그아웃</li>
                )}
              </ul>
            </nav>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;