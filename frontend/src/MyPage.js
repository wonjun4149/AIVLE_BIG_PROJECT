import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import AccountInfo from './components/AccountInfo';
import PasswordChangeForm from './components/PasswordChangeForm';
import './MyPage.css';

const MyPage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div>로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="mypage-container-nosidebar"> {/* Sidebar가 없으므로 새로운 클래스명 사용 */}
            <div className="main-content-full"> {/* Sidebar가 없으므로 새로운 클래스명 사용 */}
                <AccountInfo />
            </div>
        </div>
    );
};

export default MyPage;