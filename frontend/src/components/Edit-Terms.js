// src/components/Edit-Terms.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useOutletContext, useParams, Link } from 'react-router-dom';
import './Edit-Terms.css';

function EditTerms() {
  const { user, authLoading } = useOutletContext();
  const navigate = useNavigate();
  const { termId } = useParams(); // 신규 초안이면 없음
  const location = useLocation();

  // 생성 화면에서 넘겨준 값들 (신규 초안일 때 존재)
  const initial = (location && location.state) || {};

  const [contractName, setContractName] = useState(initial.title || '');
  const [createdDate, setCreatedDate] = useState(initial.createdAt || ''); // 표시용(서버 전송 X)
  const [memo, setMemo] = useState(''); // ✅ memo만 서버 전송
  const [content, setContent] = useState(initial.content || '');
  const [loading, setLoading] = useState(!initial.content && !!termId); // id있고 state없으면 조회
  const [error, setError] = useState('');

  // ✅ Term 서비스 베이스 URL (환경변수 > 호스트 자동 분기)
  const TERM_SERVICE_BASE_URL =
    process.env.REACT_APP_TERM_SERVICE_BASE_URL ||
    (window.location.hostname === 'localhost'
      ? 'http://localhost:8083'
      : 'https://term-service-902267887946.us-central1.run.app');

  // 신규 초안 메타(회사/카테고리 등) — POST 시 예전 스키마 + memo만 추가해서 전달
  const meta = initial.meta || {};

  // 표시용 최초 생성일 기본값(서버 저장 X)
  useEffect(() => {
    if (!createdDate) {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setCreatedDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [createdDate]);

  // 저장된 문서 열기(새로고침 등) → GET
  useEffect(() => {
    const fetchExisting = async () => {
      if (!termId || initial.content) return; // 신규 초안 또는 상태 전달받은 경우 패스
      if (!user || !user.uid) return;
      try {
        setLoading(true);
        const res = await fetch(`${TERM_SERVICE_BASE_URL}/terms/${termId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-authenticated-user-uid': user.uid,
          },
        });
        if (!res.ok) throw new Error('약관 조회에 실패했습니다.');
        const data = await res.json();
        setContractName(data.title || '');
        setContent(data.content || '');
        // createdAt/modifiedAt은 서버 관리. 여기선 표시만.
        if (data.createdAt) {
          const dateStr =
            typeof data.createdAt === 'string' ? data.createdAt.slice(0, 10) : createdDate;
          setCreatedDate(dateStr || createdDate);
        }
        setMemo(data.memo || '');
      } catch (e) {
        console.error(e);
        setError(e.message || '조회 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termId, user]);

  // 저장 버튼: 신규 → POST(예전 스키마 + memo), 기존 → PUT(예전 스키마 + memo)
  const handleSave = async () => {
    if (!user || !user.uid) {
      alert('사용자 인증 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }
    if (!contractName) {
      alert('계약서 이름을 입력해주세요.');
      return;
    }
    if (!content) {
      const ok = window.confirm('약관 내용이 비어 있습니다. 그래도 저장할까요?');
      if (!ok) return;
    }

    try {
      setError('');
      setLoading(true);

      if (termId) {
        // ✅ 기존 문서 업데이트 (title, content, memo만 보냄 — 기존 스키마 + memo)
        const res = await fetch(`${TERM_SERVICE_BASE_URL}/terms/${termId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-authenticated-user-uid': user.uid,
          },
          body: JSON.stringify({
            title: contractName,
            content: content,
            memo: memo || '',
          }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || '계약서 저장 중 오류가 발생했습니다.');
        }
        alert('계약서가 저장되었습니다.');
      } else {
        // ✅ 신규 생성(최초 저장) : 기존 자동저장 스키마에 memo만 추가해서 POST
        const payload = {
          title: contractName,
          content: content,
          category: meta.category,
          productName: meta.productName,
          requirement: meta.requirements,
          userCompany: meta.companyName,
          termType: 'AI_DRAFT',
          memo: memo || '',
        };

        const res = await fetch(`${TERM_SERVICE_BASE_URL}/terms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-authenticated-user-uid': user.uid,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || '계약서 저장(생성) 중 오류가 발생했습니다.');
        }
        const saved = await res.json().catch(() => ({}));
        const newId = saved.id || saved.termId || (saved.data && saved.data.id);

        alert('계약서가 저장되었습니다.');

        // 저장 후 해당 문서의 편집 URL로 이동(이제부터는 PUT 경로)
        if (newId) {
          navigate(`/terms/${newId}/edit`, {
            state: {
              title: contractName,
              content,
              createdAt: createdDate, // 표시용
              memo,
            },
            replace: true,
          });
        }
      }
    } catch (e) {
      console.error(e);
      alert(e.message || '저장 중 오류가 발생했습니다.');
      setError(e.message || '저장 오류');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div>Loading...</div>;

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
          {/* 좌측: 저장/편집 폼 */}
          <div className="form-section">
            <div className="form-container">
              <div className="form-group">
                <label className="form-label">계약서 이름</label>
                <input
                  type="text"
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  className="form-input"
                  placeholder="계약서 이름을 입력하세요"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">최초 생성일</label>
                <input
                  type="date"
                  value={createdDate}
                  onChange={(e) => setCreatedDate(e.target.value)}
                  className="form-input"
                  disabled={loading}
                />
                <small className="help-text">
                  표시용 필드입니다. createdAt/modifiedAt은 서버에서 관리됩니다.
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">수정 메모</label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="form-textarea"
                  placeholder="수정/검토 이력 등을 적어두세요"
                  rows={8}
                  disabled={loading}
                />
              </div>

              <button
                onClick={handleSave}
                className="ai-draft-btn"
                disabled={loading || !contractName}
              >
                {loading ? '저장 중...' : '계약서 저장'}
              </button>

              {error && <p className="error-message" style={{ marginTop: '12px' }}>{error}</p>}
            </div>
          </div>

          {/* 우측: 약관 편집 가능 영역 */}
          <div className="preview-section">
            <div className="preview-placeholder">
              {loading ? (
                <p className="blinking-text">약관을 불러오는 중입니다...</p>
              ) : (
                <div className="generated-terms-content">
                  <h3 style={{ textAlign: 'center', marginBottom: '12px' }}>
                    {contractName || '약관 편집'}
                  </h3>
                  {/* ✍️ 편집 가능한 에디터: Textarea */}
                  <textarea
                    className="terms-editor"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="여기에 약관 내용을 편집하세요"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EditTerms;
