<<<<<<< HEAD
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
=======
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { getAllQuestions } from '../api/qna';
import './QnaList.css';

const QnaList = () => {
    const [pageData, setPageData] = useState(null); // 초기 상태를 null로 변경
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 상태 추가
    const { user } = useOutletContext();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchQuestions = async (page) => {
            setLoading(true);
            try {
                // 페이지와 사이즈를 함께 전달 (기본 사이즈 10)
                const data = await getAllQuestions(page, 10);
                setPageData(data);
            } catch (err) {
                setError('질문을 불러오는 데 실패했습니다.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions(currentPage);
    }, [currentPage]); // currentPage가 변경될 때마다 API 다시 호출
>>>>>>> 775a33f (게시판 수정작업)

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

<<<<<<< HEAD
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
=======
    const handlePageChange = (newPage) => {
        if (pageData && newPage >= 0 && newPage < pageData.totalPages) {
            setCurrentPage(newPage);
        }
    };

    const renderPagination = () => {
        if (!pageData || pageData.totalPages <= 1) {
            return null;
        }

        const totalPages = pageData.totalPages;
        const currentPageNumber = currentPage + 1; // 1-indexed
        let pages = [];

        const pageLimit = 5;
        let startPage = Math.max(1, currentPageNumber - Math.floor(pageLimit / 2));
        let endPage = startPage + pageLimit - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - pageLimit + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (startPage > 1) {
            pages.unshift('...');
            pages.unshift(1);
        }
        
        if (endPage < totalPages) {
            pages.push('...');
            pages.push(totalPages);
        }
        
        pages = [...new Set(pages)];

        return pages.map((page, index) => {
            if (page === '...') {
                return <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>;
            }
            return (
                <button
                    key={page}
                    onClick={() => handlePageChange(page - 1)}
                    disabled={currentPage === page - 1}
                    className={currentPage === page - 1 ? 'active-page' : ''}
                >
                    {page}
                </button>
            );
        });
    };

    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="qna-container">
            <h1>질문 게시판</h1>
            <div className="list-header">
                <p className="total-posts-count">
                    {pageData ? `${pageData.totalElements}개의 게시물` : '게시물을 불러오는 중...'}
                </p>
                <button onClick={handleWriteClick} className="write-question-btn">질문 작성하기</button>
            </div>
            <table className="qna-table">
                <thead>
                    <tr>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>작성일</th>
                        <th>조회수</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                                <div className="loading-spinner"></div>
                            </td>
                        </tr>
                    ) : pageData && pageData.content.length > 0 ? (
                        pageData.content.map((q) => (
                            <tr key={q.id}>
                                <td><Link to={`/qna/${q.id}`}>{q.title}</Link></td>
                                <td>{q.authorName}</td>
                                <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                                <td>{q.viewCount || 0}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">게시글이 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* 페이지네이션 컨트롤 */}
            <div className="pagination-controls">
                <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={!pageData || currentPage === 0}
                >
                    이전
                </button>
                {renderPagination()}
                <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={!pageData || pageData.last}
                >
                    다음
                </button>
            </div>
        </div>
    );
>>>>>>> 775a33f (게시판 수정작업)
};

export default QnaList;