import React, { useState } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import './Create-Terms.css';

function CreateTerms() {
  const { user, authLoading } = useOutletContext();
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState('선택');
  const [productName, setProductName] = useState('');
  const [requirements, setRequirements] = useState('');
  const [generatedTerms, setGeneratedTerms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ 환경 변수 또는 기본값 사용
  const CLOUD_RUN_API_BASE_URL =
    process.env.REACT_APP_CLOUD_RUN_API_BASE_URL ||
    'https://terms-api-service-eck6h26cxa-uc.a.run.app';

  const categories = [
    { value: 'deposit', label: '예금' },
    { value: 'savings', label: '적금' },
    { value: 'loan', label: '주택담보대출' },
    { value: 'cancer_insurance', label: '암보험' },
    { value: 'car_insurance', label: '자동차보험' },
  ];

  // ✅ 약관 생성 요청
  const handleSubmit = async () => {
    if (!companyName || category === '선택' || !productName || !requirements) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (!user || !user.uid) {
      alert('사용자 인증 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }

    setError('');
    setIsLoading(true);
    setGeneratedTerms('');

    try {
      const response = await fetch(`${CLOUD_RUN_API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-authenticated-user-uid': user.uid, // 2. user.uid 헤더 추가
        },
        body: JSON.stringify({
          companyName,
          category,
          productName,
          requirements,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '약관 생성 중 알 수 없는 오류가 발생했습니다.');
      }
      
      setGeneratedTerms(data.terms);

      if(data.warning) {
        alert(data.warning);
      }

    } catch (err) {
      // 3. alert()를 사용한 오류 처리
      console.error('Error generating terms:', err);
      const errorMessage = err.message || "";

      if (errorMessage.includes("포인트")) {
        alert("포인트가 부족합니다.");
      } else {
        alert("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToTranslation = () => {
    navigate('/translation');
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="terms-main">
        <div className="login-prompt" style={{ textAlign: 'center', paddingTop: '50px' }}>
          <h2>로그인 필요</h2>
          <p>이 페이지에 접근하려면 로그인이 필요합니다.</p>
          <Link to="/login" className="login-btn-link">로그인 페이지로 이동</Link>
        </div>
      </div>
    );
  }

  // ✅ 화면 렌더링
  return (
      <div className="App">
        <main className="terms-main">
          <div className="terms-container">
            {/* 입력 폼 섹션 (왼쪽) */}
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
                      disabled={isLoading || generatedTerms}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">초안 카테고리</label>
                  <div className="select-container">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="form-select"
                        disabled={isLoading || generatedTerms}
                    >
                      <option value="선택">선택</option>
                      {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
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
                      disabled={isLoading || generatedTerms}
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
                      disabled={isLoading || generatedTerms}
                  />
                </div>

              <button
                onClick={handleSubmit}
                className="ai-draft-btn"
                disabled={isLoading || generatedTerms}
              >
                {isLoading ? '생성 중...' : 'AI 초안 딸각 (5,000P)'}
              </button>
              {generatedTerms && (
                <button
                  onClick={handleGoToTranslation}
                  className="translate-redirect-btn"
                >
                  번역 페이지로 이동
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreateTerms;
