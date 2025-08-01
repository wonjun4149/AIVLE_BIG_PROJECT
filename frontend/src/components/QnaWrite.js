import React, { useState, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { createQuestion, uploadImage } from '../api/qna'; // uploadImage import
import './QnaWrite.css';

const QnaWrite = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { user } = useOutletContext(); // 로그인 사용자 정보

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일(jpg, png 등)만 업로드할 수 있습니다.');
                e.target.value = null;
                setImageFile(null);
                return;
            }
            setImageFile(file);
        }
    };

    const handleFileCancel = () => {
        setImageFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('이미지를 업로드하려면 로그인이 필요합니다.');
            return;
        }
        if (!title || !content) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        setIsUploading(true);
        let imageUrl = null;

        try {
            // 1. 이미지가 있으면 백엔드를 통해 업로드
            if (imageFile) {
                const uploadResponse = await uploadImage(imageFile);
                imageUrl = uploadResponse.imageUrl;
            }

            // 2. 이미지 URL과 함께 질문 생성
            const questionData = { title, content, imageUrl };
            await createQuestion(questionData);
            
            alert('질문이 성공적으로 등록되었습니다.');
            navigate('/qna');

        } catch (error) {
            alert('질문 등록에 실패했습니다.');
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="qna-write-container">
            <h1>질문 작성</h1>
            <form onSubmit={handleSubmit} className="qna-write-form">
                <div className="form-group">
                    <label htmlFor="title">제목</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="content">내용</label>
                    <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows="10"></textarea>
                </div>
                <div className="form-group">
                    <label>이미지 첨부 (선택)</label>
                    <div className="file-upload-wrapper">
                        <button type="button" className="file-select-btn" onClick={() => fileInputRef.current.click()}>
                            파일 선택
                        </button>
                        <span className="file-name-display">
                            {imageFile ? imageFile.name : '선택된 파일 없음'}
                        </span>
                        {imageFile && (
                            <button type="button" className="file-cancel-btn" onClick={handleFileCancel}>
                                X
                            </button>
                        )}
                    </div>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg"
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                    />
                </div>
                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/qna')} disabled={isUploading}>취소</button>
                    <button type="submit" disabled={isUploading}>
                        {isUploading ? '처리 중...' : '등록'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QnaWrite;
