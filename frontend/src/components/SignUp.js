import React, { useState } from 'react';
import './SignUp.css';
import logo from '../assets/logo.png';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import googleLogo from '../assets/google-logo.png';

function SignUp({ onHomeClick }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
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

  const handleSubmit = async () => {
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

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 이메일 인증 발송
      await sendEmailVerification(user);

      // 사용자 정보 저장
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        marketingAgreed: agreements.marketing,
        createdAt: new Date()
      });

      alert('회원가입이 완료되었습니다. 이메일을 확인해주세요.');
      navigate('/');
      onHomeClick();
    } catch (error) {
      console.error('회원가입 실패:', error);
      alert(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName || '',
        email: user.email,
        company: '',
        marketingAgreed: false,
        createdAt: new Date()
      });

      alert('Google 로그인 성공');
      onHomeClick();
    } catch (error) {
      console.error('Google 로그인 실패:', error);
      alert(error.message);
    }
  };

  return (
    <div className="signup-page">
      <header className="signup-header">
        <div className="signup-logo" onClick={onHomeClick} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="보라계약 로고" className="signup-logo-icon" />
        </div>
        <button className="menu-btn">☰</button>
      </header>

      <main className="signup-main">
        <div className="signup-container">
          <div className="signup-brand">
            <div className="signup-brand-icon">
              <img src={logo} alt="보라계약 로고" className="signup-brand-logo" />
            </div>
            <h1 className="signup-title">보라계약</h1>
          </div>

          <div className="signup-form">
            {/* 이메일 */}
            <div className="form-row">
              <input
                type="email"
                placeholder="이메일"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="signup-input full-width"
              />
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

            {/* 회사 + 본인확인 */}
            <div className="form-row relative-row">
              <input
                type="text"
                placeholder="재직중인 회사 이름"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="signup-input full-width"
              />
              <div className="verification-check right-absolute">
                <input
                  type="checkbox"
                  id="company-verify"
                  checked={formData.isVerified}
                  onChange={(e) => handleInputChange('isVerified', e.target.checked)}
                />
                <label htmlFor="company-verify">무직 체크</label>
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
                <label htmlFor="terms">이용약관 및 처리방침 (필수)</label>
              </div>
              <div className="agreement-item">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={agreements.privacy}
                  onChange={(e) => handleAgreementChange('privacy', e.target.checked)}
                />
                <label htmlFor="privacy">개인정보 처리방침 (필수)</label>
              </div>
              <div className="agreement-item">
                <input
                  type="checkbox"
                  id="marketing"
                  checked={agreements.marketing}
                  onChange={(e) => handleAgreementChange('marketing', e.target.checked)}
                />
                <label htmlFor="marketing">마케팅 수신 동의 (선택)</label>
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

            {/* 회원가입 */}
            <button onClick={handleSubmit} className="signup-submit-btn">
              회원가입
            </button>

            {/* 로그인 링크 */}
            <div
              className="login-link"
              onClick={() => navigate('/login')}
              style={{ cursor: 'pointer', marginTop: '10px' }}
            >
              <span>이미 계정이 있으신가요? 로그인</span>
            </div>

            {/* 구글 로그인 */}
            <button className="google-signin-btn" onClick={handleGoogleSignIn}>
              <img src={googleLogo} alt="Google 로고" className="google-icon-img" />
              Sign in with Google
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SignUp;
