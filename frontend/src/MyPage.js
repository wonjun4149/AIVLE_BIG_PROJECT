import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import AccountInfo from './components/AccountInfo';
import './MyPage.css';

const MyPage = () => {
    const { user, authLoading } = useOutletContext();

    if (authLoading) {
        return (
            <div className="loading-container">
                <div>로딩 중...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="mypage-layout-container"> {/* PointLayout과 통일된 컨테이너 클래스 */}
                <div className="login-prompt">
                    <h2>로그인 필요</h2>
                    <p>마이페이지를 보려면 로그인이 필요합니다.</p>
                    <Link to="/login" className="login-btn-link">로그인 페이지로 이동</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mypage-layout-container"> {/* PointLayout과 통일된 컨테이너 클래스 */}
            <h1>마이페이지</h1>
            <div className="mypage-view"> {/* PointLayout의 .point-view와 같은 역할 */}
                <AccountInfo />
            </div>
        </div>
    );
};

export default MyPage;