import React, { useState } from 'react';
import Navbar from './Navbar'; // Navbar 컴포넌트가 있다고 가정
import './Create-Terms.css'; // CSS 파일이 있다고 가정

function CreateTerms({ user, onHomeClick, onSignUpClick }) {
  // 입력 필드의 상태 관리
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState('선택');
  const [productName, setProductName] = useState('');
  const [requirements, setRequirements] = useState('');
  // 생성된 약관 내용을 저장할 상태
  const [generatedTerms, setGeneratedTerms] = useState('');
  // 로딩 상태 (API 호출 중인지 여부)
  const [isLoading, setIsLoading] = useState(false);
  // 에러 메시지 상태
  const [error, setError] = useState('');

  // 약관 카테고리 옵션
  const categories = ['예금', '적금', '주택담보대출', '암보험', '자동차보험'];

  // AI 초안 생성 버튼 클릭 핸들러
  const handleSubmit = async () => {
    // 필수 입력 필드 유효성 검사
    if (!companyName || category === '선택' || !productName || !requirements) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    setError(''); // 기존 에러 메시지 초기화
    setIsLoading(true); // 로딩 상태 시작
    setGeneratedTerms(''); // 이전에 생성된 약관 초기화

    try {
      // 백엔드 API 호출
      // Cloud Run에 배포된 백엔드 서비스 URL로 변경되었습니다.
      const CLOUD_RUN_API_BASE_URL = 'https://terms-api-service-902267887946.us-central1.run.app';
      const response = await fetch(`${CLOUD_RUN_API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 입력된 데이터를 JSON 형태로 변환하여 전송
        body: JSON.stringify({
          companyName,
          category,
          productName,
          requirements,
        }),
      });

      // 응답이 성공적인지 확인
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '약관 생성에 실패했습니다.');
      }

      // 응답 데이터 파싱
      const data = await response.json();
      // 생성된 약관 내용을 상태에 저장하여 화면에 표시
      setGeneratedTerms(data.terms);
    } catch (err) {
      // 에러 발생 시 에러 메시지 설정
      console.error('Error generating terms:', err);
      setError(err.message || '약관 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false); // 로딩 상태 종료
    }
  };

  return (
    <div className="App">
      <Navbar user={user} onHomeClick={onHomeClick} onSignUpClick={onSignUpClick} />
      
      <main className="terms-main">
        <div className="terms-container">
          {/* 왼쪽 미리보기 영역 */}
          <div className="preview-section">
            <div className="preview-placeholder">
              {isLoading ? (
                <p>약관 초안을 생성 중입니다. 잠시만 기다려 주세요...</p>
              ) : error ? (
                <p className="error-message">{error}</p>
              ) : generatedTerms ? (
                // 생성된 약관 내용을 <pre> 태그로 감싸서 공백 및 줄바꿈 유지
                // 스타일을 적용하여 약관처럼 보이도록 할 수 있음
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

          {/* 오른쪽 입력 폼 영역 */}
          <div className="form-section">
            <div className="form-container">
              {/* 회사 이름 */}
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

              {/* 초안 카테고리 */}
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

              {/* 상품 이름 */}
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

              {/* 필수 조항 및 희망사항 */}
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

              {/* AI 초안 생성 버튼 */}
              <button
                onClick={handleSubmit}
                className="ai-draft-btn"
                disabled={isLoading} // API 호출 중일 때는 버튼 비활성화
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
