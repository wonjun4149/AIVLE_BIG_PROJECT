// src/api/qna.js
import axios from 'axios';
import { auth } from '../firebase'; // Firebase 인증 추가

// ✅ API URL 결정 함수
const getApiUrl = () => {
    // 1️⃣ Cloud Run URL이 있으면 최우선 사용
    if (process.env.REACT_APP_CLOUD_RUN_QNA_API_BASE_URL) {
        return process.env.REACT_APP_CLOUD_RUN_QNA_API_BASE_URL;
    }

    // 2️⃣ 로컬 개발 기본 URL
    return 'http://localhost:8088';
};

// ✅ Axios 인스턴스 생성
const apiClient = axios.create({
    baseURL: getApiUrl(),
    headers: {
        'Content-Type': 'application/json',
    }
});

// ✅ Axios 요청 인터셉터: Firebase 토큰 자동 추가
apiClient.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        try {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        } catch (error) {
            console.error("Error getting auth token: ", error);
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

/**
<<<<<<< HEAD
 * ✅ 모든 질문 목록을 가져옵니다.
=======
 * 모든 질문 목록을 페이지별로 가져옵니다.
 * @param {number} page - 페이지 번호 (0부터 시작)
 * @param {number} size - 페이지당 게시글 수
>>>>>>> 775a33f (게시판 수정작업)
 */
export const getAllQuestions = async (page = 0, size = 10) => {
    try {
        const response = await apiClient.get(`/qna?page=${page}&size=${size}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching questions:", error);
        throw error;
    }
};

/**
 * ✅ 새로운 질문을 등록합니다.
 */
export const createQuestion = async (questionData) => {
    try {
        const response = await apiClient.post('/qna', questionData);
        return response.data;
    } catch (error) {
        console.error("Error creating question:", error);
        throw error;
    }
};

/**
 * ✅ ID로 특정 질문의 상세 정보를 가져옵니다.
 */
export const getQuestionById = async (id) => {
    try {
        const response = await apiClient.get(`/qna/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching question with id ${id}:`, error);
        throw error;
    }
};

/**
 * ✅ ID로 특정 질문을 삭제합니다.
 */
export const deleteQuestion = async (id) => {
    try {
        await apiClient.delete(`/qna/${id}`);
    } catch (error) {
        console.error(`Error deleting question with id ${id}:`, error);
        throw error;
    }
};

/**
 * ✅ 특정 질문에 새로운 답변(댓글)을 등록합니다.
 */
export const createAnswer = async (questionId, content) => {
    try {
        const response = await apiClient.post(`/qna/${questionId}/answers`, content, {
            headers: { 'Content-Type': 'text/plain' }
        });
        return response.data;
    } catch (error) {
        console.error(`Error creating answer for question ${questionId}:`, error);
        throw error;
    }
};

/**
 * ID로 특정 질문을 수정합니다.
 * @param {string} id - 질문 ID
 * @param {object} questionData - { title, content }
 */
export const updateQuestion = async (id, questionData) => {
    try {
        await apiClient.put(`/qna/${id}`, questionData);
    } catch (error) {
        console.error(`Error updating question with id ${id}:`, error);
        throw error;
    }
};

/**
 * 이미지 파일을 백엔드 서버를 통해 업로드합니다.
 * @param {File} imageFile - 업로드할 이미지 파일
 */
export const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
        const response = await apiClient.post('/qna/upload-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; // { "imageUrl": "..." }
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};
