import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';

const QnaList = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ API URL
  const getApiUrl = () => {
    if (process.env.REACT_APP_CLOUD_RUN_QNA_API_BASE_URL) {
      return process.env.REACT_APP_CLOUD_RUN_QNA_API_BASE_URL + '/qna';
    }
    return '/qna';
  };

  // ✅ QnA 목록 불러오기 (토큰 추가)
  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      let token = '';

      if (user) {
        token = await user.getIdToken();
      }

      const response = await fetch(getApiUrl(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }) // 🔹 토큰 헤더 추가
        }
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('질문 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="qna-container">
      <h1>질문 게시판</h1>
      <button onClick={() => window.location.href = '/qna/write'}>질문 작성하기</button>
      <table className="qna-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>조회수</th>
          </tr>
        </thead>
        <tbody>
          {questions.length > 0 ? (
            questions.map((qna, index) => (
              <tr key={qna.id}>
                <td>{index + 1}</td>
                <td><Link to={`/qna/${qna.id}`}>{qna.title}</Link></td>
                <td>{qna.authorName}</td>
                <td>{new Date(qna.createdAt).toLocaleDateString()}</td>
                <td>{qna.viewCount || 0}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">게시글이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default QnaList;