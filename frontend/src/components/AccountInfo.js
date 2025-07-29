import React, { useState } from 'react';
import { auth } from '../firebase'; 
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import './AccountInfo.css';

const AccountInfo = () => {
    const user = auth.currentUser;

    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [message, setMessage] = useState('');

    const handleSave = async () => {
        if (!user) return;

        if (newPwd !== confirmPwd) {
            setMessage("새 비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPwd);
            await user.reauthenticateWithCredential(credential); // compat 방식에서는 user에서 직접 호출
            await user.updatePassword(newPwd); // user 객체에서 직접 호출
            setMessage("비밀번호가 성공적으로 변경되었습니다.");
        } catch (error) {
            console.error(error);
            setMessage("비밀번호 변경 실패: " + error.message);
        }
    };

    return (
        <main className="account-content">
            <div className="info-row"><label>이름</label><span>{user?.displayName || 'N/A'}</span></div>
            <div className="info-row"><label>Email</label><span>{user?.email}</span></div>

            <div className="info-row">
                <label>현재 비밀번호</label>
                <input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} />
            </div>
            <div className="info-row">
                <label>새 비밀번호</label>
                <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
            </div>
            <div className="info-row">
                <label>새 비밀번호 확인</label>
                <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
            </div>

            <button className="save-button" onClick={handleSave}>수정된 정보 저장</button>
            {message && <p className="message">{message}</p>}
        </main>
    );
};

export default AccountInfo;
