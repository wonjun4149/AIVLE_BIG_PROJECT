import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuestion } from '../api/qna';
import './QnaWrite.css'; // CSS 파일을 나중에 생성하겠습니다.

const QnaWrite = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        // 백엔드에서 헤더를 통해 사용자 정보를 처리하므로 제목과 내용만 보냅니다.
        const questionData = { title, content };

        try {
            await createQuestion(questionData);
            alert('질문이 성공적으로 등록되었습니다.');
            navigate('/qna'); // 목록 페이지로 이동
        } catch (error) {
            alert('질문 등록에 실패했습니다.');
            console.error(error);
        }
    };

    return (
        <div className="qna-write-container">
            <h1>질문 작성</h1>
            <form onSubmit={handleSubmit} className="qna-write-form">
                <div className="form-group">
                    <label htmlFor="title">제목</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="content">내용</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="내용을 입력하세요"
                        rows="10"
                    ></textarea>
                </div>
                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/qna')}>취소</button>
                    <button type="submit">등록</button>
                </div>
            </form>
        </div>
    );
};

export default QnaWrite;
