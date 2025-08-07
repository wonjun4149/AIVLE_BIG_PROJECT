import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import './Create-Translation.css';

function CreateTranslation() {
  const { user, authLoading } = useOutletContext();
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetCountry, setTargetCountry] = useState('선택');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const countries = [
    { value: 'vi', label: '베트남' },
    { value: 'ur', label: '파키스탄' },
    { value: 'fa', label: '이란' },
    { value: 'zh-CN', label: '중국' },
    { value: 'es', label: '콜롬비아' },
    { value: 'en', label: '나이지리아' },
  ];

  const handleTranslate = async () => {
    if (!sourceText || targetCountry === '선택') {
      setError('원문과 국가를 모두 선택해주세요.');
      return;
    }

    setError('');
    setIsLoading(true);
    setTranslatedText('');

    try {
      const response = await fetch('http://localhost:8080/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sourceText,
          target_language: targetCountry,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '번역에 실패했습니다.');
      }

      const data = await response.json();
      setTranslatedText(data.translated_text);
    } catch (err) {
      console.error('Error translating text:', err);
      setError(err.message || '번역 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="translation-main">
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
      <main className="translation-main">
        <div className="translation-container">
          {/* 왼쪽 입력 섹션 */}
          <div className="translation-section">
            <div className="form-group">
              <select
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                className="form-select"
                disabled={isLoading}
              >
                <option value="선택">국가 선택</option>
                {countries.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleTranslate}
                className="translate-btn"
                disabled={isLoading}
              >
                {isLoading ? '번역 중...' : '딸깍'}
              </button>
            </div>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="form-textarea"
              placeholder="번역할 내용을 입력하세요."
              rows={20}
              disabled={isLoading}
            />
          </div>

          {/* 오른쪽 결과 섹션 */}
          <div className="translation-section">
            <textarea
              value={translatedText}
              className="form-textarea"
              readOnly
              placeholder="번역 결과가 여기에 표시됩니다."
              rows={20}
            />
            <div className="button-group">
              <button className="action-btn" disabled={isLoading}>초안 저장하기</button>
              <button className="action-btn" disabled={isLoading}>비교 딸깍</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreateTranslation;