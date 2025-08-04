import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { getQuestionById, deleteQuestion, createAnswer, updateQuestion, uploadImage } from '../api/qna';
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
    const effectRan = useRef(false);
    const fileInputRef = useRef(null);

    // 수정 모드 상태
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedContent, setEditedContent] = useState('');
    const [editedImageUrl, setEditedImageUrl] = useState(null);
    const [newImageFile, setNewImageFile] = useState(null); // 새로 선택한 이미지 파일
    const [isUploading, setIsUploading] = useState(false);

    const fetchQuestion = async () => {
        try {
            const data = await getQuestionById(id);
            setQuestion(data);
        } catch (err) {
            setError('질문 상세 정보를 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (effectRan.current === false) {
            fetchQuestion();
            return () => { effectRan.current = true; };
        }
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm('정말로 이 질문을 삭제하시겠습니까?')) {
            try {
                await deleteQuestion(id);
                alert('질문이 삭제되었습니다.');
                navigate('/qna');
            } catch (err) {
                alert('질문 삭제에 실패했습니다.');
            }
        }
    };

    const handleAnswerSubmit = async (e) => {
        e.preventDefault();
        if (!newAnswer.trim()) return;
        try {
            await createAnswer(id, newAnswer);
            setNewAnswer('');
            fetchQuestion();
        } catch (err) {
            alert('댓글 등록에 실패했습니다.');
        }
    };

    const handleEdit = () => {
        setEditedTitle(question.title);
        setEditedContent(question.content);
        setEditedImageUrl(question.imageUrl);
        setNewImageFile(null); // 수정 모드 진입 시 새 파일 선택 초기화
        setIsEditing(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드할 수 있습니다.');
                e.target.value = null;
                return;
            }
            setNewImageFile(file);
            // 파일 선택 시 미리보기 URL 생성
            setEditedImageUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!editedTitle.trim() || !editedContent.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }
        setIsUploading(true);
        let finalImageUrl = editedImageUrl;

        try {
            // 1. 새로운 이미지 파일이 선택되었다면, 업로드
            if (newImageFile) {
                const uploadResponse = await uploadImage(newImageFile);
                finalImageUrl = uploadResponse.imageUrl;
            }
            
            // 2. 질문 수정 API 호출
            await updateQuestion(id, { title: editedTitle, content: editedContent, imageUrl: finalImageUrl });
            
            setIsEditing(false);
            fetchQuestion();
            alert('질문이 성공적으로 수정되었습니다.');

        } catch (err) {
            alert('질문 수정에 실패했습니다.');
        } finally {
            setIsUploading(false);
        }
    };

    if (error) return <div>{error}</div>;
    if (!question) return null; // 데이터가 로드되기 전까지는 아무것도 렌더링하지 않음

    const isAuthor = user && user.uid === question.authorId;

    return (
        <div className="qna-detail-container">
            {isEditing ? (
                <div className="edit-mode">
                    <input type="text" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} className="edit-title-input" />
                    <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="edit-content-textarea" rows="15"></textarea>
                    
                    <div className="form-group">
                        <label>이미지 첨부</label>
                        {editedImageUrl && (
                            <div className="edit-image-preview">
                                <img src={editedImageUrl} alt="이미지 미리보기" />
                                <button onClick={() => { setEditedImageUrl(null); setNewImageFile(null); }} className="remove-image-btn">이미지 삭제</button>
                            </div>
                        )}
                        <div className="file-upload-wrapper">
                            <button type="button" className="file-select-btn" onClick={() => fileInputRef.current.click()}>파일 선택</button>
                            <span className="file-name-display">{newImageFile ? newImageFile.name : '새 이미지 선택 안 함'}</span>
                        </div>
                        <input type="file" onChange={handleFileChange} accept="image/png, image/jpeg" style={{ display: 'none' }} ref={fileInputRef} />
                    </div>

                    <div className="actions">
                        <button onClick={() => setIsEditing(false)} className="cancel-btn" disabled={isUploading}>취소</button>
                        <button onClick={handleSave} className="save-btn" disabled={isUploading}>
                            {isUploading ? '저장 중...' : '저장'}
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="question-header">
                        <h1>{question.title}</h1>
                        <div className="question-meta">
                            <span>작성자: {question.authorName}</span>
                            <span>작성일: {new Date(question.createdAt).toLocaleString()}</span>
                            <span>조회수: {question.viewCount || 0}</span>
                        </div>
                    </div>
                    <div className="question-content">
                        {question.imageUrl && <img src={question.imageUrl} alt="첨부 이미지" className="question-image" />}<div dangerouslySetInnerHTML={{ __html: question.content.replace(/\n/g, '<br />') }} />
                    </div>
                    <div className="actions">
                        <Link to="/qna" className="list-btn">목록으로</Link>
                        {isAuthor && (
                            <>
                                <button onClick={handleEdit} className="edit-btn">수정</button>
                                <button onClick={handleDelete} className="delete-btn">삭제</button>
                            </>
                        )}
                    </div>
                    <div className="answers-section">
                        <h2>댓글 {question.answers ? question.answers.length : 0}개</h2>
                        {user ? (
                            <form onSubmit={handleAnswerSubmit} className="answer-form">
                                <textarea value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} placeholder="댓글을 입력하세요..." rows="3"></textarea>
                                <button type="submit">댓글 등록</button>
                            </form>
                        ) : (
                            <div className="login-prompt-box" onClick={() => navigate('/login', { state: { from: location } })}>
                                <p>댓글을 작성하려면 로그인이 필요합니다.</p>
                                <span>로그인 페이지로 이동</span>
                            </div>
                        )}
                        <div className="answers-list">
                            {question.answers && question.answers.map(answer => (
                                <div key={answer.id} className="answer-item">
                                    <div className="answer-meta">
                                        <strong>{answer.authorName}</strong>
                                        <span>{new Date(answer.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p>{answer.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default QnaDetail;