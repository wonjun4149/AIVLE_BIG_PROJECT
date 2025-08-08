// src/components/Edit-Terms.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';

// ✅ Term 서비스 API 베이스 URL
const TERM_SERVICE_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:8083'
    : 'https://term-service-902267887946.us-central1.run.app';

function EditTerms() {
  const { user, authLoading } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();

  // 1) location.state 우선, 2) sessionStorage 보조
  const statePayload = location.state || (() => {
    try {
      const saved = sessionStorage.getItem('draftPayload');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const termsInit = statePayload?.terms || '';
  const metaInit = statePayload?.meta || {};

  const {
    companyName = '',
    category = '',
    productName = '',
    requirements = '',
    effectiveDate = '',
  } = metaInit;

  // 화면 상태
  const [title, setTitle] = useState(productName ? `${productName} 이용 약관` : '');
  const [memo, setMemo] = useState('');
  const [createdAt] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = `${d.getMonth() + 1}`.padStart(2, '0');
    const dd = `${d.getDate()}`.padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const editorRef = useRef(null);
  const [termsContent, setTermsContent] = useState(termsInit);

  const [saving, setSaving] = useState(false);

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  // 초안이 하나도 없으면 Create 페이지로
  useEffect(() => {
    if (!authLoading) {
      if (!termsInit || !companyName || !category || !productName) {
        alert('초안 데이터가 없습니다. 먼저 초안을 생성해주세요.');
        navigate('/create-terms');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  // 초기 contentEditable 채우기
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerText = termsContent || '';
    }
  }, [termsContent]);

  const handleEditorInput = useCallback(() => {
    if (!editorRef.current) return;
    setTermsContent(editorRef.current.innerText);
  }, []);

  // Ctrl/Cmd + S 로 저장
  useEffect(() => {
    const onKeyDown = async (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      if ((isMac && e.metaKey && e.key.toLowerCase() === 's') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 's')) {
        e.preventDefault();
        await onClickSave();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, memo, termsContent, companyName, category, productName, requirements]);

  const onClickSave = useCallback(async () => {
    if (!user || !user.uid) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!title || !termsContent) {
      alert('제목과 본문은 비어 있을 수 없습니다.');
      return;
    }
    if (!companyName || !category || !productName) {
      alert('회사/카테고리/상품명 정보가 없습니다. 처음 화면에서 다시 시도해주세요.');
      return;
    }

    try {
      setSaving(true);
      const idToken = await user.getIdToken();

      const payload = {
        title: title,
        category: category,
        productName: productName,
        content: termsContent,
        requirement: requirements,
        userCompany: companyName,
        termType: 'AI_DRAFT',
        memo: memo, // A안: memo만 추가
      };

      const res = await fetch(`${TERM_SERVICE_BASE_URL}/terms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
          'x-authenticated-user-uid': user.uid,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (!res.ok) {
        console.error('Save failed:', res.status, text);
        alert(text || `저장 실패: ${res.status}`);
        return;
      }

      // 저장 성공 후, draftPayload 정리(선택)
      sessionStorage.removeItem('draftPayload');
      alert('저장 완료되었습니다.');
    } catch (e) {
      console.error(e);
      alert(`저장 실패: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }, [user, title, termsContent, requirements, companyName, category, productName, memo]);

  if (authLoading || !termsInit) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <main className="terms-main">
        <div className="terms-container">
          {/* 왼쪽 폼 */}
          <div className="form-section">
            <div className="form-container">
              <div className="form-group">
                <label className="form-label">계약서 이름</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="계약서 이름을 입력하세요"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label className="form-label">최초 생성일</label>
                <input
                  type="date"
                  className="form-input"
                  value={createdAt}
                  readOnly
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">수정 메모</label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="예: 5장 면책조항 문구 완화 필요 / 금액 기준 최신화 등"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label className="form-label">메타 정보</label>
                <div style={{ fontSize: '0.9rem', color: '#555' }}>
                  <div>회사명: {companyName || '-'}</div>
                  <div>카테고리: {category || '-'}</div>
                  <div>상품명: {productName || '-'}</div>
                  <div>시행 날짜: {effectiveDate || '-'}</div>
                </div>
              </div>

              <button
                onClick={onClickSave}
                className="ai-draft-btn"
                disabled={saving}
              >
                {saving ? '저장 중...' : '계약서 저장'}
              </button>

              <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#666' }}>
                ⌘/Ctrl + S 로도 저장할 수 있어요.
              </div>
            </div>
          </div>

          {/* 오른쪽 편집 영역 */}
          <div className="preview-section">
            <div className="generated-terms-content" style={{ outline: 'none' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
                {title || '계약서 제목'}
              </h3>

              <div
                ref={editorRef}
                onInput={handleEditorInput}
                contentEditable
                suppressContentEditableWarning
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                  minHeight: '60vh',
                  padding: '0.5rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  background: '#fff',
                }}
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EditTerms;
