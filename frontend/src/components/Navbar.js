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

  // 스마트한 API URL 감지
  const getApiUrl = () => {
    // 1. 환경변수가 설정되어 있으면 최우선 사용 (팀원이 수동으로 설정한 경우)
    if (process.env.REACT_APP_POINT_API_URL) {
      return process.env.REACT_APP_POINT_API_URL;
    }
    
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // 2. GitPod 환경 자동 감지
    if (hostname.includes('gitpod.io')) {
      // 현재 URL에서 포트 번호를 8085로 변경
      const gitpodUrl = hostname.replace(/^\d+-/, '8085-');
      return `${protocol}//${gitpodUrl}/api/points`;
    }
    
    // 3. GitHub Codespaces 환경 감지
    if (hostname.includes('github.dev') || hostname.includes('githubpreview.dev')) {
      const codespacesUrl = hostname.replace(/^\d+-/, '8085-');
      return `${protocol}//${codespacesUrl}/api/points`;
    }
    
    // 4. CodeSandbox 환경 감지
    if (hostname.includes('csb.app') || hostname.includes('codesandbox.io')) {
      const parts = hostname.split('-');
      if (parts.length > 1) {
        parts[0] = '8085';
        return `${protocol}//${parts.join('-')}/api/points`;
      }
    }
    
    // 5. 로컬 개발 환경
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8085/api/points';
    }
    
    // 6. 배포 서버 IP 감지 (특정 IP 대응)
    if (hostname === '34.54.82.32') {
      return `http://34.54.82.32:8085/api/points`;
    }
    
    // 7. HTTPS 환경에서는 HTTPS 포트 사용 (일반적인 배포 환경)
    if (protocol === 'https:') {
      return `${protocol}//${hostname}:8085/api/points`;
    }
    
    // 8. 기본값 - HTTP 환경
    return `${protocol}//${hostname}:8085/api/points`;
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
      
      // Point 서버의 API 엔드포인트
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
        
        if (showRefreshIndicator) {
          // 성공 피드백 (선택사항)
          console.log('포인트 새로고침 완료');
        }
      } else {
        console.error('포인트 조회 실패:', response.status);
        setUserPoints(0);
      }
    } catch (error) {
      console.error('포인트 조회 중 오류:', error);
      setUserPoints(0);
      
      if (showRefreshIndicator) {
        // 오류 발생 시 사용자에게 알림 (선택사항)
        console.error('포인트 새로고침 실패');
      }
    } finally {
      if (showRefreshIndicator) {
        setIsRefreshing(false);
      }
    }
  };

  // 포인트 수동 새로고침 함수
  const handlePointRefresh = async () => {
    if (isRefreshing) return; // 이미 새로고침 중이면 중복 실행 방지
    
    console.log('포인트 수동 새로고침 시작');
    await fetchUserPoints(true);
  };

  // 환경 타입 감지 함수 (디버깅용)
  const getEnvironmentType = () => {
    const hostname = window.location.hostname;
    
    if (process.env.REACT_APP_POINT_API_URL) return 'Environment Variable';
    if (hostname.includes('gitpod.io')) return 'GitPod';
    if (hostname.includes('github.dev')) return 'GitHub Codespaces';
    if (hostname.includes('csb.app')) return 'CodeSandbox';
    if (hostname === 'localhost') return 'Local Development';
    return 'Production/Custom';
  };

  // 사용자가 로그인했을 때 포인트 조회
  useEffect(() => {
    if (user) {
      fetchUserPoints();
      // 포인트 주기적 업데이트 (선택사항)
      const interval = setInterval(() => fetchUserPoints(), 30000); // 30초마다 업데이트
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
              <span className="header-btn">
                <span className="name-highlight">
                  {formatUserName(user.name || user.displayName || user.email)}
                  &nbsp;님
                </span>
              </span>
              <div 
                className={`points-display ${isRefreshing ? 'refreshing' : ''}`}
                onClick={handlePointRefresh}
                style={{ 
                  cursor: 'pointer',
                  opacity: isRefreshing ? 0.7 : 1,
                  transition: 'opacity 0.2s ease'
                }}
                title="클릭하여 포인트 새로고침"
              >
                <span className="points-value">
                  {isRefreshing ? '새로고침...' : `${formatPoints(userPoints)}P`}
                </span>
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