// src/components/Create-Terms.js
import React, { useState } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import './Create-Terms.css';

function CreateTerms() {
  const { user, authLoading } = useOutletContext();
  const navigate = useNavigate();

  // 입력값
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState('선택');
  const [productName, setProductName] = useState('');
  const [requirements, setRequirements] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');

  // 상태값
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ AI 생성 서비스 베이스 URL (환경변수 > 호스트 자동 분기)
  const CLOUD_RUN_API_BASE_URL =
    process.env.REACT_APP_CLOUD_RUN_API_BASE_URL ||
    (window.location.hostname === 'localhost'
      ? 'http://localhost:8080' // 로컬에서 AI 서비스 포트(다르면 수정)
      : 'https://terms-api-service-eck6h26cxa-uc.a.run.app'); // 배포 AI 서비스 URL

  const categories = [
    { value: 'deposit', label: '예금' },
    { value: 'savings', label: '적금' },
    { value: 'loan', label: '주택담보대출' },
    { value: 'cancer_insurance', label: '암보험' },
    { value: 'car_insurance', label: '자동차보험' },
  ];

  // ✅ 약관 생성 요청 → 성공 시 즉시 Edit-Terms로 네비게이트
  const handleSubmit = async () => {
    if (!companyName || category === '선택' || !productName || !requirements || !effectiveDate) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    if (!user || !user.uid) {
      alert('사용자 인증 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${CLOUD_RUN_API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-authenticated-user-uid': user.uid,
        },
        body: JSON.stringify({
          companyName,
          category,
          productName,
          requirements,
          effectiveDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '약관 생성 중 알 수 없는 오류가 발생했습니다.');
      }

      // ✅ 즉시 편집 페이지로 이동 (이 페이지에서는 미리보기 표시 안 함)
      const today = new Date();
      const createdAt = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
        today.getDate()
      ).padStart(2, '0')}`;

      navigate('/terms/new/edit', {
        state: {
          title: `${productName} 이용 약관`,
          content: data.terms, // 백엔드가 내려준 초안
          createdAt,           // 표시용(서버 저장 아님)
          meta: {
            companyName,
            category,
            productName,
            requirements,
            effectiveDate,
          },
        },
        replace: true,
      });

      if (data.warning) {
        alert(data.warning);
      }
    } catch (err) {
      console.error('Error generating terms:', err);
      const errorMessage = err.message || '';
      setError(errorMessage);

      if (errorMessage.includes('포인트')) {
        alert('포인트가 부족합니다.');
      } else {
        alert('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
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

  // ✅ 화면 렌더링 (좌측 폼 + 우측 미리보기 영역은 레이아웃만 유지, 내용 표시 없음)
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
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">초안 카테고리</label>
                <div className="select-container">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-select"
                    disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">시행 날짜</label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="form-input"
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>

              <button
                onClick={handleSubmit}
                className="ai-draft-btn"
                disabled={isLoading}
              >
                {isLoading ? '생성 중...' : 'AI 초안 딸각 (5,000P)'}
              </button>

              {error && <p className="error-message" style={{ marginTop: '12px' }}>{error}</p>}
            </div>
          </div>

          {/* 미리보기 섹션 (오른쪽) — UI 통일성만 유지, 아무 내용도 표시하지 않음 */}
          <div className="preview-section">
            <div className="preview-placeholder">
              {/* 비워둠: 생성되면 즉시 편집 페이지로 이동 */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreateTerms;
