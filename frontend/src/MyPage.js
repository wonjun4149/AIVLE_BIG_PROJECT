import React from 'react';
import Sidebar from './components/Sidebar';
import AccountInfo from './components/AccountInfo';
import PasswordChangeForm from './components/PasswordChangeForm';
import './MyPage.css';

const MyPage = () => (
    <div className="mypage-container">
        <Sidebar />
        <div className="main-content">
            <AccountInfo />

        </div>
    </div>
);

export default MyPage;