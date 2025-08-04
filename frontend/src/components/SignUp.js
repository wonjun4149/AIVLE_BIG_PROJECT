import React, { useState } from 'react';
import './SignUp.css';
import logo from '../assets/logo.png';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import googleLogo from '../assets/google-logo.png';
import PDFModal from './PDFModal';

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

  const [modalOpen, setModalOpen] = useState(false);
  const [modalUrl, setModalUrl] = useState('');
  const [modalTitle, setModalTitle] = useState('');

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

  const openModal = (title, url) => {
    setModalTitle(title);
    setModalUrl(url);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalUrl('');
    setModalTitle('');
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.name || !formData.password) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      alert('비밀번호는 영문과 숫자를 포함해 6자 이상이어야 합니다.');
      return;
    }

    if (!agreements.terms || !agreements.privacy) {
      alert('필수 약관에 동의 해주세요.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.name });
      await sendEmailVerification(user);

      const timestamp = new Date().toISOString();

      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        company: formData.company,
        email: formData.email,

        createdAt: new Date(),
        agreedTerms: {
          termsOfService: agreements.terms,
          privacyPolicy: agreements.privacy,
          marketingAgreed: agreements.marketing,
          timestamp: timestamp,

          version: {
            termsOfService: "v1.0",
            privacyPolicy: "v1.1"
          }
        }
      });

      await signOut(auth);

      alert('✅회원 가입이 완료 되었습니다. 이메일 인증 링크를 확인 해주세요.');
      navigate('/login');
      onHomeClick();
    } catch (error) {
      console.error('😂회원가입 실패:', error);
      alert(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!agreements.terms || !agreements.privacy) {
      alert('Google로 가입하기 전에 필수 약관에 동의해주세요.');
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const timestamp = new Date().toISOString();

      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName || '',
        email: user.email,
        company: '',
        createdAt: new Date(),
        agreedTerms: {
          termsOfService: agreements.terms,
          privacyPolicy: agreements.privacy,
          marketingAgreed: agreements.marketing,
          timestamp: timestamp,
          version: {
            termsOfService: "v1.0",
            privacyPolicy: "v1.1"
          }
        }
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
              {/* 입력 폼 */}
              <div className="form-row">
                <input type="email" placeholder="이메일" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="signup-input full-width" />
              </div>

              <div className="form-row">
                <input type="text" placeholder="이름" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="signup-input full-width" />
              </div>

              <div className="form-row relative-row">
                <input type="text" placeholder="재직중인 회사 이름" value={formData.company} onChange={(e) => handleInputChange('company', e.target.value)} className="signup-input full-width" />
                <div className="verification-check right-absolute">
                  <input type="checkbox" id="company-verify" checked={formData.isVerified} onChange={(e) => handleInputChange('isVerified', e.target.checked)} />
                  <label htmlFor="company-verify">무직 체크</label>
                </div>
              </div>

              <div className="form-row">
                <input type="password" placeholder="비밀번호" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} className="signup-input full-width" />
              </div>

              <div className="form-row">
                <input type="password" placeholder="비밀번호 확인" value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} className="signup-input full-width" />
              </div>

              {/* 약관 동의 */}
              <div className="agreements">
                <div className="agreement-item">
                  <input type="checkbox" id="terms" checked={agreements.terms} onChange={(e) => handleAgreementChange('terms', e.target.checked)} />
                  <label htmlFor="terms">이용약관 (필수)</label>
                  <button className="view-btn" onClick={() => openModal(
                      '이용약관',
                      'https://firebasestorage.googleapis.com/v0/b/aivle-team0721.firebasestorage.app/o/%E1%84%87%E1%85%A9%E1%84%85%E1%85%A1%E1%84%80%E1%85%A8%E1%84%8B%E1%85%A3%E1%86%A8%20%E1%84%89%E1%85%A5%E1%84%87%E1%85%B5%E1%84%89%E1%85%B3%20%E1%84%8B%E1%85%B5%E1%84%8B%E1%85%AD%E1%86%BC%E1%84%8B%E1%85%A3%E1%86%A8%E1%84%80%E1%85%AA%E1%86%AB.pdf?alt=media&token=0c1285a4-9d0d-4e3d-8027-fad7384ea164')}>
                    보기
                  </button>
                </div>

                <div className="agreement-item">
                  <input type="checkbox" id="privacy" checked={agreements.privacy} onChange={(e) => handleAgreementChange('privacy', e.target.checked)} />
                  <label htmlFor="privacy">개인정보 처리방침 (필수)</label>
                  <button
                      className="view-btn"
                      onClick={() =>
                          openModal(
                              '개인정보 처리방침',
                              'https://firebasestorage.googleapis.com/v0/b/aivle-team0721.firebasestorage.app/o/%E1%84%80%E1%85%A2%E1%84%8B%E1%85%B5%E1%86%AB%E1%84%8C%E1%85%A5%E1%86%BC%E1%84%87%E1%85%A9%20%E1%84%87%E1%85%A9%E1%84%92%E1%85%A9%E1%84%87%E1%85%A5%E1%86%B8(%E1%84%87%E1%85%A5%E1%86%B8%E1%84%85%E1%85%B2%E1%86%AF)(%E1%84%8C%E1%85%A619234%E1%84%92%E1%85%A9)(20250313).pdf?alt=media&token=57b960cc-050b-45d5-9c98-4786d16ecac2'
                          )
                      }
                  >
                    보기
                  </button>
                </div>

                <div className="agreement-item">
                  <input type="checkbox" id="marketing" checked={agreements.marketing} onChange={(e) => handleAgreementChange('marketing', e.target.checked)} />
                  <label htmlFor="marketing">마케팅 수신 동의 (선택)</label>
                        <button
                      className="view-btn"
                      onClick={() =>
                          openModal(
                              '마케팅 수신 동의',
                              'https://firebasestorage.googleapis.com/v0/b/aivle-team0721.firebasestorage.app/o/%E1%84%86%E1%85%A1%E1%84%8F%E1%85%A6%E1%84%90%E1%85%B5%E1%86%BC_%E1%84%89%E1%85%A5%E1%86%AB%E1%84%90%E1%85%A2%E1%86%A8%E1%84%8B%E1%85%A3%E1%86%A8%E1%84%80%E1%85%AA%E1%86%AB.pdf?alt=media&token=4ea282fa-f074-4894-9daa-4bf7d54238c7'
                          )
                      }
                  >
                    보기
                  </button>
                </div>

                <div className="agreement-item">
                  <input type="checkbox" id="all" checked={agreements.all} onChange={(e) => handleAgreementChange('all', e.target.checked)} />
                  <label htmlFor="all">모든 약관 동의</label>
                </div>
              </div>

              <button onClick={handleSubmit} className="signup-submit-btn">
                회원가입
              </button>

              <div className="login-link" onClick={() => navigate('/login')} style={{ cursor: 'pointer', marginTop: '10px' }}>
                <span>이미 계정이 있으신가요? 로그인</span>
              </div>

              <button className="google-signin-btn" onClick={handleGoogleSignIn}>
                <img src={googleLogo} alt="Google 로고" className="google-icon-img" />
                Sign in with Google
              </button>
            </div>
          </div>
        </main>

        {/* PDF 모달 */}
        <PDFModal open={modalOpen} onClose={closeModal} pdfUrl={modalUrl} title={modalTitle} />
      </div>
  );
}

export default SignUp;
