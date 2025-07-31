import React, { useState } from 'react';
import Navbar from './Navbar';
import './Create-Terms.css';

function CreateTerms({ user, onHomeClick, onSignUpClick }) {
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState('선택');
  const [productName, setProductName] = useState('');
  const [requirements, setRequirements] = useState('');
  const [generatedTerms, setGeneratedTerms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // API Base URL을 환경 변수에서 읽음 (.env 파일 필요)
  const CLOUD_RUN_API_BASE_URL = process.env.REACT_APP_CLOUD_RUN_API_BASE_URL;

  const categories = ['예금', '적금', '주택담보대출', '암보험', '자동차보험'];

  // -----------------------
  // ✅ 약관 생성 요청
  // -----------------------
  const handleSubmit = async () => {
    // 입력값 유효성 체크
    if (!companyName || category === '선택' || !productName || !requirements) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    setError('');
    setIsLoading(true);
    setGeneratedTerms('');

    try {
      // API 호출
      const response = await fetch(`${CLOUD_RUN_API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName,
          category,
          productName,
          requirements,
        }),
      });

      // 응답 확인
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '약관 생성에 실패했습니다.');
      }

      const data = await response.json();
      setGeneratedTerms(data.terms);
    } catch (err) {
      console.error('Error generating terms:', err);
      setError(err.message || '약관 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------
  // ✅ 화면 렌더링
  // -----------------------
  return (
    <div className="App">
      <Navbar user={user} onHomeClick={onHomeClick} onSignUpClick={onSignUpClick} />
      <main className="terms-main">
        <div className="terms-container">
          
          {/* 미리보기 섹션 */}
          <div className="preview-section">
            <div className="preview-placeholder">
              {isLoading ? (
                <p>약관 초안을 생성 중입니다. 잠시만 기다려 주세요...</p>
              ) : error ? (
                <p className="error-message">{error}</p>
              ) : generatedTerms ? (
                <div className="generated-terms-content">
                  <h3 style={{textAlign: 'center', marginBottom: '20px'}}>
                    {productName ? `${productName} 약관` : '생성된 약관'}
                  </h3>
                  <pre>{generatedTerms}</pre>
                </div>
              ) : (
                <p>AI 약관 초안이 여기에 표시됩니다.</p>
              )}
            </div>
          </div>

          {/* 입력 폼 섹션 */}
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
                onClick={handleSubmit}
                className="ai-draft-btn"
                disabled={isLoading}
              >
                {isLoading ? '생성 중...' : 'AI 초안 딸각 (5,000P)'}
              </button>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreateTerms;
