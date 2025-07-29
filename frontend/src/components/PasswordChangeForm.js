import React from 'react';

const PasswordChangeForm = () => (
    <form className="password-form">
        <label>현재 비밀번호</label>
        <input type="password" />
        <label>새 비밀번호</label>
        <input type="password" />
        <label>새 비밀번호 확인</label>
        <input type="password" />
        <button type="submit">수정된 정보 저장</button>
    </form>
);

export default PasswordChangeForm;