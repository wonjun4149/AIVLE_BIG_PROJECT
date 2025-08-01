import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

// 메뉴 데이터: 이름, 경로, 로그인 필요 여부 (순서 변경)
const menuItems = [
    { name: '마이페이지', path: '/mypage', requiresAuth: true },
    { name: '계약서 관리', path: '/contracts', requiresAuth: true },
    { name: '포인트 관리', path: '/points', requiresAuth: true },
    { name: '질문 게시판', path: '/qna', requiresAuth: false },
    { name: '설정', path: '/settings', requiresAuth: true },
];

const Sidebar = ({ isOpen, onClose, user, userPoints = 0 }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleMenuClick = (item) => {
        onClose(); // 메뉴 클릭 시 사이드바 닫기

        if (item.requiresAuth && !user) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/login', { state: { from: location } });
        } else {
            navigate(item.path);
        }
    };

    const formatUserName = (userName) => {
        if (!userName) return '';
        return userName.replace(/님$/, '');
    };

    return (
        <>
            {/* 사이드바가 열렸을 때 화면의 나머지 부분을 어둡게 처리하는 오버레이 */}
            {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}

            <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-header">
                    <h2>보라계약</h2>
                    <button className="sidebar-close-btn" onClick={onClose}>×</button>
                </div>

                {user && (
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">
                            {formatUserName(user.name || user.displayName || user.email)} 님
                        </div>
                        <div className="sidebar-user-points">
                            포인트: {userPoints.toLocaleString()}P
                        </div>
                    </div>
                )}

                <nav className="sidebar-nav">
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.name} onClick={() => handleMenuClick(item)}>
                                {item.name}
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </>
    );
};

export default Sidebar;