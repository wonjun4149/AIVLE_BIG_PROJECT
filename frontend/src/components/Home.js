import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../App.css';

// 이미지들을 import
import logo from '../assets/logo.png';
import iconStandard from '../assets/icon-standard.png';
import iconRentMoney from '../assets/icon-rent-money.png';
import iconLabor from '../assets/icon-labor.png';
import iconTerms from '../assets/icon-terms.png';

function Home() {
  const [contractText, setContractText] = useState('');
  const navigate = useNavigate();

  const handleIconClick = (iconType) => {
    if (iconType === 'standard') {
      navigate('/create-terms');
    }
    // 다른 아이콘들의 처리 로직도 여기에 추가할 수 있습니다
  };

  return (
    <div className="App">
      <Navbar />

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
              <div className="contract-option">
                <img src={iconTerms} alt="표준약관" className="option-icon" />
                <span className="option-text">표준약관</span>
              </div>
              <div className="contract-option">
                <img src={iconLabor} alt="근로계약서" className="option-icon" />
                <span className="option-text">근로계약서</span>
              </div>
              <div className="contract-option">
                <img src={iconRentMoney} alt="차용증" className="option-icon" />
                <span className="option-text">차용증</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;