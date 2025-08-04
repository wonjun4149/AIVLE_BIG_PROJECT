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
};

export default QnaList;