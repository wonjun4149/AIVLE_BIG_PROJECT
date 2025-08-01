// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo.png';
import { auth } from '../firebase';

const Navbar = ({ user, onSignUpClick, onLoginClick }) => {
  const navigate = useNavigate();
  const [userPoints, setUserPoints] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ API URL 결정 함수
  const getApiUrl = () => {
    if (process.env.REACT_APP_CLOUD_RUN_POINT_API_BASE_URL) {
      return process.env.REACT_APP_CLOUD_RUN_POINT_API_BASE_URL + '/api/points';
    }
    if (process.env.REACT_APP_POINT_API_URL) {
      return process.env.REACT_APP_POINT_API_URL;
    }

    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    if (hostname.includes('gitpod.io')) {
      const gitpodUrl = hostname.replace(/^\d+-/, '8085-');
      return `${protocol}//${gitpodUrl}/api/points`;
    }
    if (hostname.includes('github.dev') || hostname.includes('githubpreview.dev')) {
      const codespacesUrl = hostname.replace(/^\d+-/, '8085-');
      return `${protocol}//${codespacesUrl}/api/points`;
    }
    if (hostname.includes('csb.app') || hostname.includes('codesandbox.io')) {
      const parts = hostname.split('-');
      if (parts.length > 1) {
        parts[0] = '8085';
        return `${protocol}//${parts.join('-')}/api/points`;
      }
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8085/api/points';
    }
    return `${protocol}//${hostname}/api/points`;
  };

  // ✅ Firebase 토큰 포함 포인트 조회
  const fetchUserPoints = async (showRefreshIndicator = false) => {
    if (!user || !user.uid) return;

    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }

    try {
      const apiUrl = getApiUrl();

      // 🔹 Firebase에서 토큰 가져오기
      const token = await user.getIdToken();

      console.log('감지된 환경:', {
        hostname: window.location.hostname,
        환경: getEnvironmentType(),
        'API URL': apiUrl
      });

      const response = await fetch(`${apiUrl}/${user.uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}` // ✅ 토큰 추가
        }
      });

      if (response.ok) {
        const pointData = await response.json();
        console.log('포인트 조회 성공:', pointData);
        setUserPoints(pointData.amount || 0);
      } else {
        console.error('포인트 조회 실패:', response.status);
        setUserPoints(0);
      }
    } catch (error) {
      console.error('포인트 조회 중 오류:', error);
      setUserPoints(0);
    } finally {
      if (showRefreshIndicator) {
        setIsRefreshing(false);
      }
    }
  };

  const handlePointRefresh = async () => {
    if (isRefreshing) return;
    console.log('포인트 수동 새로고침 시작');
    await fetchUserPoints(true);
  };

  const getEnvironmentType = () => {
    const hostname = window.location.hostname;
    if (process.env.REACT_APP_CLOUD_RUN_POINT_API_BASE_URL) return 'Cloud Run (env)';
    if (process.env.REACT_APP_POINT_API_URL) return 'Environment Variable';
    if (hostname.includes('gitpod.io')) return 'GitPod';
    if (hostname.includes('github.dev')) return 'GitHub Codespaces';
    if (hostname.includes('csb.app')) return 'CodeSandbox';
    if (hostname === 'localhost') return 'Local Development';
    return 'Production/Custom';
  };

  useEffect(() => {
    if (user) {
      fetchUserPoints();
      const interval = setInterval(() => fetchUserPoints(), 30000);
      return () => clearInterval(interval);
    } else {
      setUserPoints(0);
    }
  }, [user]);

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
                  onClick={handlePointRefresh}
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
                <li onClick={() => { navigate('/qna'); setIsSidebarOpen(false); }}>질문 게시판</li>
                <li onClick={() => { navigate('/points'); setIsSidebarOpen(false); }}>포인트 관리</li>
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
