import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { getQuestionById, deleteQuestion, createAnswer } from '../api/qna';
import './QnaDetail.css';

const QnaDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useOutletContext();
    const location = useLocation();
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newAnswer, setNewAnswer] = useState('');
    const effectRan = useRef(false); // API 호출 여부를 추적하는 ref

    const fetchQuestion = async () => {
        try {
            const data = await getQuestionById(id);
            setQuestion(data);
        } catch (err) {
            setError('질문 상세 정보를 불러오는 데 실패했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // StrictMode로 인한 중복 실행 방지
        if (effectRan.current === false) {
            fetchQuestion();

            // cleanup 함수에서 ref를 true로 설정
            return () => {
                effectRan.current = true;
            };
        }
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm('정말로 이 질문을 삭제하시겠습니까?')) {
            try {
                await deleteQuestion(id);
                alert('질문이 삭제되었습니다.');
                navigate('/qna');
            } catch (err) {
                alert('질문 삭제에 실패했습니다. 권한이 없거나 오류가 발생했습니다.');
                console.error(err);
            }
        }
    };

    const handleAnswerSubmit = async (e) => {
        e.preventDefault();
        if (!newAnswer.trim()) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }
        try {
            await createAnswer(id, newAnswer);
            setNewAnswer('');
            // 댓글 등록 후 질문 데이터를 다시 불러와 화면을 갱신합니다.
            fetchQuestion();
        } catch (err) {
            alert('댓글 등록에 실패했습니다.');
            console.error(err);
        }
    };

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!question) {
        return <div>질문을 찾을 수 없습니다.</div>;
    }

    const isAuthor = user && user.uid === question.authorId;

    return (
        <div className="qna-detail-container">
            <div className="question-header">
                <h1>{question.title}</h1>
                <div className="question-meta">
                    <span>작성자: {question.authorName}</span>
                    <span>작성일: {new Date(question.createdAt).toLocaleString()}</span>
                    <span>조회수: {question.viewCount || 0}</span>
                </div>
            </div>
            <div className="question-content" dangerouslySetInnerHTML={{ __html: question.content.replace(/\n/g, '<br />') }} />
            <div className="actions">
                <Link to="/qna" className="list-btn">목록으로</Link>
                {isAuthor && (
                    <button onClick={handleDelete} className="delete-btn">삭제</button>
                )}
            </div>

            <hr />

            {/* 답변(댓글) 섹션 */}
            <div className="answers-section">
                <h2>댓글 {question.answers ? question.answers.length : 0}개</h2>
                {/* 댓글 작성 폼 */}
                {user ? (
                    <form onSubmit={handleAnswerSubmit} className="answer-form">
                        <textarea
                            value={newAnswer}
                            onChange={(e) => setNewAnswer(e.target.value)}
                            placeholder="댓글을 입력하세요..."
                            rows="3"
                        ></textarea>
                        <button type="submit">댓글 등록</button>
                    </form>
                ) : (
                    <div className="login-prompt-box" onClick={() => navigate('/login', { state: { from: location } })}>
                        <p>댓글을 작성하려면 로그인이 필요합니다.</p>
                        <span>로그인 페이지로 이동</span>
                    </div>
                )}
                {/* 댓글 목록 */}
                <div className="answers-list">
                    {question.answers && question.answers.length > 0 ? (
                        question.answers.map(answer => (
                            <div key={answer.id} className="answer-item">
                                <div className="answer-meta">
                                    <strong>{answer.authorName}</strong>
                                    <span>{new Date(answer.createdAt).toLocaleString()}</span>
                                </div>
                                <p>{answer.content}</p>
                            </div>
                        ))
                    ) : (
                        <p>아직 댓글이 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QnaDetail;
