import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import { getAuth } from 'firebase/auth';

const Sidebar = () => {
    const [displayName, setDisplayName] = useState('');

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            setDisplayName(user.displayName || '사용자'); // 이름 없으면 대체
        }
    }, []);

    return (
        <div className="sidebar">
            <h2>보라계약</h2>
            <div className="user-name">
                {displayName} 님<br />마이페이지
            </div>
            <nav>
                <ul>
                    <li className="active">계정 관리</li>
                    <li>포인트 관리</li>
                    <li>계약서 관리</li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;