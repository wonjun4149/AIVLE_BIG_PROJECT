import React, { useState } from 'react';
import Navbar from './Navbar';
import './Create-Terms.css';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; // auth 모듈 직접 임포트

function CreateTerms({ user, onHomeClick, onSignUpClick }) {
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState('선택');
  const [productName, setProductName] = useState('');
  const [requirements, setRequirements] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const categories = ['예금', '적금', '주택담보대출', '암보험', '자동차보험'];

  const handleAiRequest = async () => {
    if (!user || !auth.currentUser) { // auth.currentUser 확인 추가
      alert('AI 초안 생성을 위해서는 로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    if (!companyName || category === '선택' || !productName || !requirements) {
      alert('AI 초안 생성을 위해 모든 필드를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const idToken = await auth.currentUser.getIdToken();
      const firebaseUid = auth.currentUser.uid;

      // 1. 포인트 확인
      const pointResponse = await fetch(`/api/points/${firebaseUid}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!pointResponse.ok) {
        throw new Error('포인트 정보를 가져오는 데 실패했습니다.');
      }

      const pointData = await pointResponse.json();
      if (pointData.amount < 5000) {
        alert(`포인트가 부족합니다. (현재 보유: ${pointData.amount}P)`);
        setIsLoading(false);
        return;
      }

      // 2. 포인트 충분 시, 약관 생성 요청
      const requestBody = {
        title: `${productName} 약관`,
        content: requirements, // 사용자가 입력한 요구사항을 초기 content로 설정
        category: category,
        productName: productName,
        requirement: requirements,
        userCompany: companyName,
        client: '', // '일반 약관'에서는 거래처(client)가 특정되지 않으므로 빈 값으로 설정
        termType: "general", // 약관 종류 추가
      };

      const termResponse = await fetch('/terms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!termResponse.ok) {
        throw new Error('AI 초안 생성 요청에 실패했습니다.');
      }

      await termResponse.json();
      alert('AI 초안 생성 요청이 완료되었습니다. 잠시 후 마이페이지에서 확인하실 수 있습니다.');
      navigate('/');
    } catch (error) {
      console.error('AI 초안 생성 요청 중 오류 발생:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <Navbar user={user} onHomeClick={onHomeClick} onSignUpClick={onSignUpClick} />
      <main className="terms-main">
        <div className="terms-container">
          <div className="preview-section">
            <div className="preview-placeholder">
              {isLoading ? (
                <p>AI 초안 생성 요청을 보내는 중입니다...</p>
              ) : (
                <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                  <p>'AI 초안 딸각' 버튼을 누르면 생성 요청이 접수됩니다.</p>
                  <p style={{ marginTop: '10px' }}>완료된 약관은 '마이페이지'에서 확인하실 수 있습니다.</p>
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <div className="form-container">
              <div className="form-group">
                <label className="form-label">회사 이름</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="form-input"
                  placeholder="회사 이름을 입력하세요"
                />
              </div>

              <div className="form-group">
                <label className="form-label">초안 카테고리</label>
                <div className="select-container">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-select"
                  >
                    <option value="선택">선택</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <div className="select-arrow">▼</div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">상품 이름</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="form-input"
                  placeholder="상품 이름을 입력하세요"
                />
              </div>

              <div className="form-group">
                <label className="form-label">필수 조항 및 희망사항</label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="form-textarea"
                  placeholder="필수 조항 및 희망사항을 입력하세요 (예: 보장 내용, 면책 조항, 특약 등)"
                  rows={12}
                />
              </div>

              <button
                onClick={handleAiRequest}
                className="ai-draft-btn"
                disabled={isLoading}
              >
                {isLoading ? '요청 중...' : 'AI 초안 딸각 (5,000P)'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreateTerms;
