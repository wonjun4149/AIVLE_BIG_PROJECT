import axios from 'axios';
import { auth } from '../firebase'; // Firebase auth import 추가

const API_BASE_URL = 'http://localhost:8088'; // API Gateway URL

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Axios 요청 인터셉터: 모든 요청에 인증 토큰을 추가합니다.
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
 * 모든 질문 목록을 가져옵니다.
 */
export const getAllQuestions = async () => {
    try {
        const response = await apiClient.get('/qna');
        return response.data;
    } catch (error) {
        console.error("Error fetching questions:", error);
        throw error;
    }
};

/**
 * 새로운 질문을 등록합니다.
 * @param {object} questionData - { title, content, authorId, authorName }
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
 * ID로 특정 질문의 상세 정보를 가져옵니다.
 * @param {string} id - 질문 ID
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
 * ID로 특정 질문을 삭제합니다.
 * @param {string} id - 질문 ID
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
 * 특정 질문에 새로운 답변(댓글)을 등록합니다.
 * @param {string} questionId - 질문 ID
 * @param {string} content - 답변 내용
 */
export const createAnswer = async (questionId, content) => {
    try {
        const response = await apiClient.post(`/qna/${questionId}/answers`, content, {
            headers: { 'Content-Type': 'text/plain' } // 일반 텍스트로 전송
        });
        return response.data;
    } catch (error) {
        console.error(`Error creating answer for question ${questionId}:`, error);
        throw error;
    }
};
