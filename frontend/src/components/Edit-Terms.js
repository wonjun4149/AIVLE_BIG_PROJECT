// src/components/Edit-Terms.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';

// ✅ Term 서비스 API 베이스 URL (환경에 따라 자동 선택)
const TERM_SERVICE_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:8083' // 로컬 개발용
    : 'https://term-service-902267887946.us-central1.run.app'; // 배포용(절대경로)

function EditTerms() {
  const { user, authLoading } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Create-Terms.js에서 push한 state (초안 결과) 받기
  const {
    terms = '',                // 생성된 약관 본문
    meta = {},                 // 생성 시 메타
  } = location.state || {};

  const {
    companyName = '',
    category = '',
    productName = '',
    requirements = '',
    effectiveDate = '',
  } = meta;

  // 화면 상태
  const [title, setTitle] = useState(productName ? `${productName} 이용 약관` : '');
  const [memo, setMemo] = useState('');
  const [createdAt] = useState(() => {
    // 최초 생성일(당일) 표기용
    const d = new Date();
    // YYYY-MM-DD
    const yyyy = d.getFullYear();
    const mm = `${d.getMonth() + 1}`.padStart(2, '0');
    const dd = `${d.getDate()}`.padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // 오른쪽 편집 영역(contentEditable)
  const editorRef = useRef(null);
  const [termsContent, setTermsContent] = useState(terms || '');

  // 편의상 로딩/에러
  const [saving, setSaving] = useState(false);

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  // 초기 컨텐츠 주입 (contentEditable에 HTML로 넣으면 줄바꿈/공백 보존 쉬움)
  useEffect(() => {
    if (editorRef.current) {
      // pre-wrap과 유사하게 보이도록 <div> 안에 텍스트로만 넣고 CSS에서 처리
      editorRef.current.innerText = termsContent || '';
    }
  }, [termsContent]);

  // contentEditable 변경 처리
  const handleEditorInput = useCallback(() => {
    if (!editorRef.current) return;
    // innerText로 가져와서 순수 텍스트 보존
    const txt = editorRef.current.innerText;
    setTermsContent(txt);
  }, []);

  // Ctrl/Cmd+S 저장 단축키
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

  // 저장 핸들러
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

      // ✅ Firebase ID 토큰을 Authorization 헤더로
      const idToken = await user.getIdToken();

      // 서버가 기대하는 페이로드(A안: 기존 호환 유지 + memo만 추가)
      const payload = {
        title: title,
        category: category,
        productName: productName,
        content: termsContent,     // 편집된 전체 본문
        requirement: requirements, // 생성에 사용된 요구사항 원문
        userCompany: companyName,
        termType: 'AI_DRAFT',
        // 선택 필드들(있으면 서버가 저장하거나 무시)
        memo: memo,                // 🔹 추가 필드 (A안)
        // effectiveDate 자체는 생성 프롬프트에만 쓰였고,
        // 저장 스키마에 없다면 서버가 무시할 수 있음. 필요 시 payload에 넣고 서버 DTO에 필드 추가.
      };

      const res = await fetch(`${TERM_SERVICE_BASE_URL}/terms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 서버 로그에 'Missing request header Authorization'가 있었으므로 필수
          'Authorization': `Bearer ${idToken}`,
          // 예전 호환 유지(서버가 헤더에서 userId 읽을 수도 있음)
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

      // 성공
      try {
        const json = JSON.parse(text);
        // json.id 등이 있으면 여기서 활용 가능
      } catch (_e) {
        // 바디가 비어있거나 Non-JSON일 수 있음 → 무시
      }

      alert('저장 완료되었습니다.');
    } catch (e) {
      console.error(e);
      alert(`저장 실패: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }, [user, title, termsContent, requirements, companyName, category, productName, memo]);

  if (authLoading) return <div>Loading...</div>;
  if (!user) return null;

  // UI: Create-Terms와 동일 레이아웃 유지 (좌: 요약/입력, 우: 편집기)
  return (
    <div className="App">
      <main className="terms-main">
        <div className="terms-container">
          {/* 왼쪽: 정보/입력 섹션 */}
          <div className="form-section">
            <div className="form-container">
              {/* 계약서 이름(제목) */}
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

              {/* 최초 생성일(읽기 전용) */}
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

              {/* 수정 메모 */}
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

              {/* 메타(참고용, 읽기 전용) */}
              <div className="form-group">
                <label className="form-label">메타 정보</label>
                <div style={{ fontSize: '0.9rem', color: '#555' }}>
                  <div>회사명: {companyName || '-'}</div>
                  <div>카테고리: {category || '-'}</div>
                  <div>상품명: {productName || '-'}</div>
                  <div>시행 날짜: {effectiveDate || '-'}</div>
                </div>
              </div>

              {/* 저장 버튼 */}
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

          {/* 오른쪽: 편집 섹션 (클릭/타이핑 가능) */}
          <div className="preview-section">
            <div className="generated-terms-content" style={{ outline: 'none' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
                {title || '계약서 제목'}
              </h3>

              {/* 편집기: contentEditable */}
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
