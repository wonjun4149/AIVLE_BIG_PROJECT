// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo.png';
import { auth } from '../firebase';

const Navbar = ({ user, onSignUpClick, onLoginClick }) => {
  const navigate = useNavigate();
  const [userPoints, setUserPoints] = useState(0);

  // 포인트 조회 함수
  const fetchUserPoints = async () => {
    if (!user || !user.uid) return;

    try {
      // Point 서버의 API 엔드포인트 (포트 8085)
      const response = await fetch(`http://localhost:8085/api/points/${user.uid}`);
      if (response.ok) {
        const pointData = await response.json();
        setUserPoints(pointData.amount || 0);
      } else {
        console.error('포인트 조회 실패:', response.status);
        setUserPoints(0);
      }
    } catch (error) {
      console.error('포인트 조회 중 오류:', error);
      setUserPoints(0);
    }
  };

  // 사용자가 로그인했을 때 포인트 조회
  useEffect(() => {
    if (user) {
      fetchUserPoints();
      // 포인트 주기적 업데이트 (선택사항)
      const interval = setInterval(fetchUserPoints, 30000); // 30초마다 업데이트
      return () => clearInterval(interval);
    } else {
      setUserPoints(0);
    }
  }, [user]);

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

  const handleMyPageClick = () => {
    navigate('/mypage');
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

  // 포인트를 천 단위로 포맷팅하는 함수
  const formatPoints = (points) => {
    return points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 사용자 이름에서 실제 이름 부분만 추출하는 함수
  const formatUserName = (userName) => {
    if (!userName) return '';
    // "님"이 있는 경우 제거하고 이름만 추출
    const nameOnly = userName.replace(/님$/, '');
    return nameOnly;
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
              <span className="user-name">
                <span className="name-highlight">
                  {formatUserName(user.name || user.displayName || user.email)}
                </span>
                님
              </span>
              <div className="points-display">
                <span className="points-value">{formatPoints(userPoints)}P</span>
              </div>
              <button className="header-btn mypage-btn" onClick={handleMyPageClick}>
                마이페이지
              </button>
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