import React, { useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import AccountInfo from './components/AccountInfo';
import './MyPage.css';

const MyPage = () => {
    const { user, authLoading } = useOutletContext();
    const navigate = useNavigate();
    const effectRan = useRef(false); // 중복 실행 방지 플래그

    useEffect(() => {
        // 개발 환경의 StrictMode에서 두 번 실행되는 것을 방지
        if (effectRan.current === false) {
            // 인증 상태 확인이 끝나고, user가 없을 경우 (로그인 안 됨)
            if (!authLoading && !user) {
                alert('로그인이 필요한 페이지입니다.');
                navigate('/login');
            }
        }

        // cleanup 함수: 컴포넌트가 unmount될 때 실행되어 플래그를 true로 설정
        return () => {
            effectRan.current = true;
        };
    }, [user, authLoading, navigate]); // 의존성 배열

    // 로딩 중이거나, 리디렉션이 필요한 경우 로딩 화면 표시
    if (authLoading || !user) {
        return (
            <div className="loading-container">
                <div>로딩 중...</div>
            </div>
        );
    }

    // 로딩이 끝났고, user가 있을 경우에만 페이지 내용 표시
    return (
        <div className="mypage-container-nosidebar">
            <div className="main-content-full">
                <AccountInfo />
            </div>
        </div>
    );
};

export default MyPage;