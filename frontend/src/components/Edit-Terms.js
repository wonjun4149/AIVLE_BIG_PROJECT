import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useOutletContext, useLocation, useNavigate, useParams } from 'react-router-dom';
import { updateContract } from '../api/term';
import LoadingSpinner from './LoadingSpinner';

const TERM_SERVICE_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:8088'
    : 'https://term-service-902267887946.us-central1.run.app';

function EditTerms() {
  const { user, authLoading } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { termId } = useParams();

  const isEditMode = !!termId;

  const getInitialData = () => {
    if (isEditMode) return location.state?.contract;
    try {
      const saved = sessionStorage.getItem('draftPayload');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  };

  const initialData = getInitialData();

  const [title, setTitle] = useState(() => {
    if (!initialData) return '';
    if (isEditMode) return initialData.title || '';
    return `${initialData.meta?.productName || ''} 이용 약관`;
  });
  const [memo, setMemo] = useState(initialData?.memo || '');
  const [termsContent, setTermsContent] = useState(initialData?.content || initialData?.terms || '');
  const [createdAt, setCreatedAt] = useState(() => {
    if (!initialData) return '';
    const dateToSet = initialData.createdAt ? new Date(initialData.createdAt) : new Date();
    return dateToSet.toISOString().split('T')[0];
  });
  const [metaInfo, setMetaInfo] = useState(() => {
    if (!initialData) return {};
    if (isEditMode) {
      return {
        companyName: initialData.userCompany,
        category: initialData.category,
        productName: initialData.productName,
        requirements: initialData.requirement,
      };
    }
    return initialData.meta || {};
  });

  const editorRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false); // 저장 성공 상태 추가

  useEffect(() => {
    if (!authLoading && !user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  // 데이터 없을 시 리디렉션 (저장 성공 시에는 실행되지 않도록 수정)
  useEffect(() => {
    if (!authLoading && !initialData && !submissionSuccess) {
      alert('계약서 데이터가 없습니다. 이전 페이지로 돌아갑니다.');
      navigate(isEditMode ? `/contracts/${termId}` : '/create-terms');
    }
  }, [authLoading, initialData, submissionSuccess, navigate, isEditMode, termId]);

  useEffect(() => {
    if (editorRef.current) {
      const initialContent = initialData?.content || initialData?.terms || '';
      if (editorRef.current.innerText !== initialContent) {
        editorRef.current.innerText = initialContent;
      }
    }
  }, [initialData]);

  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      setTermsContent(editorRef.current.innerText);
    }
  }, []);

  const onClickSave = useCallback(async () => {
    if (!user || !title || !termsContent) {
      alert('제목과 본문은 비어 있을 수 없습니다.');
      return;
    }
    setSaving(true);

    try {
      let finalTermId;
      if (isEditMode) {
        const payload = { title, content: termsContent, memo };
        const updatedTerm = await updateContract(termId, payload);
        finalTermId = updatedTerm.id;
        alert('수정이 완료되었습니다.');
      } else {
        const idToken = await user.getIdToken();
        const payload = {
          title,
          category: metaInfo.category,
          productName: metaInfo.productName,
          content: termsContent,
          requirement: metaInfo.requirements,
          userCompany: metaInfo.companyName,
          termType: 'AI_DRAFT',
          memo,
        };
        const res = await fetch(`${TERM_SERVICE_BASE_URL}/terms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `저장 실패: ${res.status}`);
        }
        const newTerm = await res.json();
        finalTermId = newTerm.id;
        sessionStorage.removeItem('draftPayload');
        alert('저장이 완료되었습니다.');
      }
      
      setSubmissionSuccess(true); // 저장 성공 상태로 변경
      navigate(`/contracts/${finalTermId}`); // 상세 페이지로 이동

    } catch (e) {
      console.error(e);
      alert(`저장 실패: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }, [user, title, termsContent, memo, isEditMode, termId, navigate, metaInfo]);

  if (authLoading || !initialData) {
    return <LoadingSpinner />;
  }

  return (
    <div className="App">
      <main className="terms-main">
        <div className="terms-container">
          <div className="form-section">
            <div className="form-container">
              <div className="form-group">
                <label className="form-label">계약서 이름</label>
                <input type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} disabled={saving} />
              </div>
              <div className="form-group">
                <label className="form-label">{isEditMode ? '최초 생성일' : '생성일'}</label>
                <input type="date" className="form-input" value={createdAt} readOnly disabled />
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
                  <div>회사명: {metaInfo.companyName || '-'}</div>
                  <div>카테고리: {metaInfo.category || '-'}</div>
                  <div>상품명: {metaInfo.productName || '-'}</div>
                </div>
              </div>
              <button onClick={onClickSave} className="ai-draft-btn" disabled={saving}>
                {saving ? '저장 중...' : (isEditMode ? '수정 완료' : '계약서 저장')}
              </button>
            </div>
          </div>
          <div className="preview-section">
            <div className="generated-terms-content">
              <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>{title}</h3>
              <div ref={editorRef} onInput={handleEditorInput} contentEditable suppressContentEditableWarning style={{ whiteSpace: 'pre-wrap', border: '1px solid #e0e0e0', padding: '1rem' }} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EditTerms;
