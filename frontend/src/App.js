import React, { useState } from 'react';
import Navbar from './components/Navbar';
import CreateTerms from './components/Create-Terms';
import CreateStandard from './components/Create-Standard';
import SignUp from './components/SignUp';
import './App.css';

// 이미지들을 import
import logo from './assets/logo.png';
import iconStandard from './assets/icon-standard.png';
import iconRentMoney from './assets/icon-rent-money.png';
import iconLabor from './assets/icon-labor.png';
import iconTerms from './assets/icon-terms.png';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [contractText, setContractText] = useState('');

  const handleIconClick = (iconType) => {
    if (iconType === 'standard') {
      setCurrentPage('create-standard');
    } else if (iconType === 'terms') {
      setCurrentPage('create-terms');
    } else if (iconType === 'labor' || iconType === 'rent-money') {
      alert('해당 서비스는 아직 준비중입니다.');
    }
  };

  const handleHomeClick = () => {
    setCurrentPage('home');
  };

  const handleSignUpClick = () => {
    setCurrentPage('signup');
  };

  // 홈 페이지 컴포넌트
  const HomePage = () => (
    <div className="App">
      <Navbar onHomeClick={handleHomeClick} onSignUpClick={handleSignUpClick} />

      {/* Main Content */}
      <main className="main-content">
        <div className="hero-section">
          <h1 className="main-title">
            <span className="highlight">딸깍</span>으로 계약서 생성
          </h1>
          
          <div className="brand-section">
            <div className="brand-icon">
              <img src={logo} alt="보라계약 로고" className="brand-logo" />
            </div>
          </div>

          <div className="upload-section">
            <div className="upload-container">
              <input 
                type="text" 
                placeholder="분석할 계약서를 업로드 하세요"
                value={contractText}
                onChange={(e) => setContractText(e.target.value)}
                className="upload-input"
              />
              <button className="upload-btn">계약서 업로드</button>
            </div>
          </div>

          <div className="contract-creation">
            <h3 className="section-title">계약서 생성하기</h3>
            <div className="contract-options">
              <div 
                className="contract-option"
                onClick={() => handleIconClick('standard')}
              >
                <img src={iconStandard} alt="표준 계약서" className="option-icon" />
                <span className="option-text">표준 계약서</span>
              </div>
              <div 
                className="contract-option"
                onClick={() => handleIconClick('terms')}
              >
                <img src={iconTerms} alt="표준약관" className="option-icon" />
                <span className="option-text">표준약관</span>
              </div>
              <div 
                className="contract-option"
                onClick={() => handleIconClick('labor')}
              >
                <img src={iconLabor} alt="근로계약서" className="option-icon" />
                <span className="option-text">근로계약서</span>
              </div>
              <div 
                className="contract-option"
                onClick={() => handleIconClick('rent-money')}
              >
                <img src={iconRentMoney} alt="차용증" className="option-icon" />
                <span className="option-text">차용증</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  // 페이지 렌더링
  if (currentPage === 'create-terms') {
    return <CreateTerms onHomeClick={handleHomeClick} onSignUpClick={handleSignUpClick} />;
  } else if (currentPage === 'create-standard') {
    return <CreateStandard onHomeClick={handleHomeClick} onSignUpClick={handleSignUpClick} />;
  } else if (currentPage === 'signup') {
    return <SignUp onHomeClick={handleHomeClick} />;
  }

  return <HomePage />;
}

export default App;