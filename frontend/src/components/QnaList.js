import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { getAllQuestions } from '../api/qna';
import './QnaList.css'; // CSS 파일을 나중에 생성하겠습니다.

const QnaList = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useOutletContext(); // 레이아웃에서 user 정보 가져오기
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const data = await getAllQuestions();
                setQuestions(data);
            } catch (err) {
                setError('질문을 불러오는 데 실패했습니다.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    const handleWriteClick = () => {
        if (user) {
            navigate('/qna/write');
        } else {
            alert('로그인이 필요합니다.');
            navigate('/login', { state: { from: location } });
        }
    };

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="qna-container">
            <h1>질문 게시판</h1>
            <button onClick={handleWriteClick} className="write-question-btn">질문 작성하기</button>
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
                        questions.map((q, index) => (
                            <tr key={q.id}>
                                <td>{index + 1}</td>
                                <td>
                                    <Link to={`/qna/${q.id}`}>{q.title}</Link>
                                </td>
                                <td>{q.authorName}</td>
                                <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                                <td>{q.viewCount || 0}</td>
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
