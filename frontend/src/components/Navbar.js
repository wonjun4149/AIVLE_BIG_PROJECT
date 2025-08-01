// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo.png';
import { auth } from '../firebase';
import Sidebar from './Sidebar'; // Sidebar 컴포넌트 import

const Navbar = ({ user, onSignUpClick, onLoginClick }) => {
  const navigate = useNavigate();
  const [userPoints, setUserPoints] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ API URL 결정 함수
  const getApiUrl = () => {
    // 1️⃣ 환경변수에서 URL 설정 시 무조건 사용
    if (process.env.REACT_APP_POINT_API_URL) {
      return process.env.REACT_APP_POINT_API_URL;
    }

    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // 2️⃣ GitPod 환경
    if (hostname.includes('gitpod.io')) {
      const gitpodUrl = hostname.replace(/^\d+-/, '8085-');
      return `${protocol}//${gitpodUrl}/api/points`;
    }

    // 3️⃣ GitHub Codespaces
    if (hostname.includes('github.dev') || hostname.includes('githubpreview.dev')) {
      const codespacesUrl = hostname.replace(/^\d+-/, '8085-');
      return `${protocol}//${codespacesUrl}/api/points`;
    }

    // 4️⃣ CodeSandbox
    if (hostname.includes('csb.app') || hostname.includes('codesandbox.io')) {
      const parts = hostname.split('-');
      if (parts.length > 1) {
        parts[0] = '8085';
        return `${protocol}//${parts.join('-')}/api/points`;
      }
    }

    // 5️⃣ 로컬 개발
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8085/api/points';
    }

    // 6️⃣ 기본값
    return `${protocol}//${hostname}/api/points`;
  };

  // 포인트 조회 함수
  const fetchUserPoints = async (showRefreshIndicator = false) => {
    if (!user || !user.uid) return;

    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }

    try {
      const apiUrl = getApiUrl();
      console.log('감지된 환경:', {
        hostname: window.location.hostname,
        환경: getEnvironmentType(),
        'API URL': apiUrl
      });

      const response = await fetch(`${apiUrl}/${user.uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
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
      navigate('/'); // 메인 페이지로 이동
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
            <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
          </div>
        </div>
      </header>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        user={user} 
        userPoints={userPoints}
      />
    </>
  );
};

export default Navbar;
