import React, { useState } from 'react';
import './SignUp.css';
import logo from '../assets/logo.png';

function SignUp({ onHomeClick }) {
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    name: '',
    company: '',
    password: '',
    confirmPassword: '',
    isVerified: false
  });

  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
    all: false
  });

  const [timer, setTimer] = useState(459); // 7분 39초

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAgreementChange = (field, checked) => {
    if (field === 'all') {
      setAgreements({
        terms: checked,
        privacy: checked,
        marketing: checked,
        all: checked
      });
    } else {
      const newAgreements = {
        ...agreements,
        [field]: checked
      };
      
      newAgreements.all = newAgreements.terms && newAgreements.privacy && newAgreements.marketing;
      setAgreements(newAgreements);
    }
  };

  const sendVerificationCode = () => {
    if (!formData.email) {
      alert('이메일을 입력해주세요.');
      return;
    }
    alert('인증번호가 발송되었습니다.');
    setTimer(459);
  };

  const handleSubmit = () => {
    if (!formData.email || !formData.name || !formData.company || !formData.password) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!agreements.terms || !agreements.privacy) {
      alert('필수 약관에 동의해주세요.');
      return;
    }

    alert('회원가입이 완료되었습니다.');
    onHomeClick();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="signup-page">
      {/* 간단한 헤더 */}
      <header className="signup-header">
        <div className="signup-logo" onClick={onHomeClick} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="보라계약 로고" className="signup-logo-icon" />
        </div>
        <button className="menu-btn">☰</button>
      </header>

      <main className="signup-main">
        <div className="signup-container">
          {/* 브랜드 섹션 */}
          <div className="signup-brand">
            <div className="signup-brand-icon">
              <img src={logo} alt="보라계약 로고" className="signup-brand-logo" />
            </div>
            <h1 className="signup-title">보라계약</h1>
          </div>

          {/* 회원가입 폼 */}
          <div className="signup-form">
            {/* 이메일 */}
            <div className="form-row">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="signup-input"
              />
              <button onClick={sendVerificationCode} className="verification-btn">
                인증번호
              </button>
            </div>

            {/* 인증번호 */}
            <div className="form-row">
              <input
                type="text"
                placeholder="인증번호"
                value={formData.verificationCode}
                onChange={(e) => handleInputChange('verificationCode', e.target.value)}
                className="signup-input"
              />
              <span className="timer">{formatTime(timer)}</span>
            </div>

            {/* 이름 */}
            <div className="form-row">
              <input
                type="text"
                placeholder="이름"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="signup-input full-width"
              />
            </div>

            {/* 재직중인 회사 이름 */}
            <div className="form-row">
              <input
                type="text"
                placeholder="재직중인 회사 이름"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="signup-input"
              />
              <div className="verification-check">
                <input
                  type="checkbox"
                  id="company-verify"
                  checked={formData.isVerified}
                  onChange={(e) => handleInputChange('isVerified', e.target.checked)}
                />
                <label htmlFor="company-verify">본인 확인</label>
              </div>
            </div>

            {/* 비밀번호 */}
            <div className="form-row">
              <input
                type="password"
                placeholder="비밀번호"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="signup-input full-width"
              />
            </div>

            {/* 비밀번호 확인 */}
            <div className="form-row">
              <input
                type="password"
                placeholder="비밀번호 확인"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="signup-input full-width"
              />
            </div>

            {/* 약관 동의 */}
            <div className="agreements">
              <div className="agreement-item">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreements.terms}
                  onChange={(e) => handleAgreementChange('terms', e.target.checked)}
                />
                <label htmlFor="terms">이용약관 및 처리방침(필수)</label>
              </div>
              
              <div className="agreement-item">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={agreements.privacy}
                  onChange={(e) => handleAgreementChange('privacy', e.target.checked)}
                />
                <label htmlFor="privacy">개인정보 처리 방침(필수)</label>
              </div>

              <div className="agreement-item">
                <input
                  type="checkbox"
                  id="marketing"
                  checked={agreements.marketing}
                  onChange={(e) => handleAgreementChange('marketing', e.target.checked)}
                />
                <label htmlFor="marketing">마케팅 수신 동의(선택)</label>
              </div>

              <div className="agreement-item">
                <input
                  type="checkbox"
                  id="all"
                  checked={agreements.all}
                  onChange={(e) => handleAgreementChange('all', e.target.checked)}
                />
                <label htmlFor="all">모든 약관 동의</label>
              </div>
            </div>

            {/* 회원가입 버튼 */}
            <button onClick={handleSubmit} className="signup-submit-btn">
              회원가입
            </button>

            {/* 로그인 링크 */}
            <div className="login-link">
              <span>로그인</span>
            </div>

            {/* 구글 로그인 */}
            <button className="google-signin-btn">
              <span className="google-icon">G</span>
              Sign in with Google
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SignUp;