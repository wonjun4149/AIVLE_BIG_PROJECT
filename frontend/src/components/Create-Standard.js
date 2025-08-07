import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import './Create-Terms.css'; // 동일한 CSS 파일 사용

function CreateStandard() {
  const { user, authLoading } = useOutletContext();
  const [companyName, setCompanyName] = useState('');
  const [clientName, setClientName] = useState(''); // 거래처 이름 추가
  const [category, setCategory] = useState('선택');
  const [productName, setProductName] = useState('');
  const [requirements, setRequirements] = useState('');

  const categories = ['예금', '적금', '주택담보대출', '암보험', '자동차보험'];

  const handleSubmit = () => {
    // AI 초안 생성 로직
    console.log({
      companyName,
      clientName,
      category,
      productName,
      requirements
    });
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

  return (
    <div className="App">
      
      <main className="terms-main">
        <div className="terms-container">
          {/* 왼쪽 미리보기 영역 */}
          <div className="preview-section">
            <div className="preview-placeholder">
              {/* 미리보기 내용이 들어갈 영역 */}
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

              {/* 거래처 이름 (새로 추가된 필드) */}
              <div className="form-group">
                <label className="form-label">거래처 이름</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="form-input"
                  placeholder="거래처 이름을 입력하세요"
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
                  placeholder="필수 조항 및 희망사항을 입력하세요"
                  rows={12}
                />
              </div>

              {/* AI 초안 생성 버튼 */}
              <button
                onClick={handleSubmit}
                className="ai-draft-btn"
              >
                AI 초안 딸각 (5,000P)
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreateStandard;