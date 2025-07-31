import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
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
        <>
            {/* 네비게이션바 추가 */}
            <Navbar user={user} />
            
            <div className="mypage-container">
                <Sidebar />
                <div className="main-content">
                    <AccountInfo />
                </div>
            </div>
        </>
    );
};

export default MyPage;