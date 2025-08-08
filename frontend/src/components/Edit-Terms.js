import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useOutletContext, useParams, Link } from 'react-router-dom';
import './Edit-Terms.css';

function EditTerms() {
  const { user, authLoading } = useOutletContext();
  const navigate = useNavigate();
  const { termId } = useParams();
  const location = useLocation();

  // location.state로 전달된 값 (생성 직후 이동 시)
  const initial = (location && location.state) || {};

  const [contractName, setContractName] = useState(initial.title || '');
  const [createdDate, setCreatedDate] = useState(initial.createdAt || '');
  const [memo, setMemo] = useState('');
  const [content, setContent] = useState(initial.content || '');
  const [loading, setLoading] = useState(!initial.content); // state 없으면 GET 시도
  const [error, setError] = useState('');

  // 기본 TERM 서비스 베이스 URL (백엔드 Term 서비스 직접 호출)
  const TERM_SERVICE_BASE_URL =
    process.env.REACT_APP_TERM_SERVICE_BASE_URL || 'http://localhost:8083';

  // 최초 생성일이 없으면 오늘 날짜로 세팅 (YYYY-MM-DD)
  useEffect(() => {
    if (!createdDate) {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setCreatedDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [createdDate]);

  // 새로고침 등으로 state가 없을 때, Term 서비스에서 조회
  useEffect(() => {
    const fetchIfNeeded = async () => {
      if (initial.content) return;
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
        if (!res.ok) {
          throw new Error('약관 조회에 실패했습니다.');
        }
        const data = await res.json();
        setContractName(data.title || '');
        setContent(data.content || '');
        // createdAt 필드명 대응
        const cAt =
          data.createdAt ||
          (data.data && data.data.createdAt) ||
          '';
        setCreatedDate(cAt || createdDate);
      } catch (e) {
        console.error(e);
        setError(e.message || '조회 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termId, user]);

  const handleSave = async () => {
    if (!user || !user.uid) {
      alert('사용자 인증 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }
    if (!contractName) {
      alert('계약서 이름을 입력해주세요.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const res = await fetch(`${TERM_SERVICE_BASE_URL}/terms/${termId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-authenticated-user-uid': user.uid,
        },
        body: JSON.stringify({
          title: contractName,
          memo: memo,
          // 필요한 경우 createdDate를 서버 스키마에 맞춰 전달
          createdAt: createdDate,
          // content는 여기서 수정하지 않으므로 제외 (원하면 포함 가능)
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || '계약서 저장 중 오류가 발생했습니다.');
      }

      alert('계약서가 저장되었습니다.');
      // 저장 후 목록으로 이동하거나, 현재 페이지 유지
      // navigate('/terms'); // 필요시 주석 해제
    } catch (e) {
      console.error(e);
      alert(e.message || '저장 중 오류가 발생했습니다.');
      setError(e.message || '저장 오류');
    } finally {
      setLoading(false);
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
                  disabled
                />
                <small className="help-text">최초 생성일은 자동 설정됩니다.</small>
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

          {/* 우측: 약관 미리보기 */}
          <div className="preview-section">
            <div className="preview-placeholder">
              {loading ? (
                <p className="blinking-text">약관을 불러오는 중입니다...</p>
              ) : content ? (
                <div className="generated-terms-content">
                  <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
                    {contractName || '약관 미리보기'}
                  </h3>
                  <pre>{content}</pre>
                </div>
              ) : (
                <p>약관 내용이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EditTerms;
