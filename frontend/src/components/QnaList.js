import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { getAllQuestions } from '../api/qna';
import './QnaList.css';

const QnaList = () => {
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const { user } = useOutletContext();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchQuestions = async (page) => {
            setLoading(true);
            try {
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
    }, [currentPage]);

    const handleWriteClick = () => {
        if (user) {
            navigate('/qna/write');
        } else {
            alert('로그인이 필요합니다.');
            navigate('/login', { state: { from: location } });
        }
    };

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
        const pageLimit = 5;
        let startPage = Math.max(0, currentPage - Math.floor(pageLimit / 2));
        let endPage = Math.min(totalPages - 1, startPage + pageLimit - 1);

        if (endPage - startPage + 1 < pageLimit) {
            startPage = Math.max(0, endPage - pageLimit + 1);
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages.map(page => (
            <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={currentPage === page}
                className={currentPage === page ? 'active-page' : ''}
            >
                {page + 1}
            </button>
        ));
    };

    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="qna-container">
            <h1>질문 게시판</h1>
            <div className="list-header">
                <p className="total-posts-count">
                    {pageData && `${pageData.totalElements}개의 게시물`}
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
                        pageData.content.map((q) => {
                            const postDate = new Date(q.createdAt);
                            const now = new Date();
                            const diffHours = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
                            const isNew = diffHours < 24;

                            return (
                                <tr key={q.id}>
                                    <td className="qna-title-cell">
                                        <Link to={`/qna/${q.id}`}>{q.title}</Link>
                                        {q.answerCount > 0 && (
                                            <span className="answer-count">
                                                [{q.answerCount}]
                                            </span>
                                        )}
                                        {isNew && <span className="new-badge">N</span>}
                                    </td>
                                    <td>{q.authorName}</td>
                                    <td>{postDate.toLocaleDateString()}</td>
                                    <td>{q.viewCount || 0}</td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="4">게시글이 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>

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
};

export default QnaList;
