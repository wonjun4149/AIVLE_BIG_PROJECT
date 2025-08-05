// src/api/point.js
import axios from 'axios';
import { auth } from '../firebase';

// ✅ API URL 결정 함수
const getApiUrl = () => {
    // Cloud Run 환경 변수가 있으면 최우선 사용
    if (process.env.REACT_APP_CLOUD_RUN_POINT_API_BASE_URL) {
        return process.env.REACT_APP_CLOUD_RUN_POINT_API_BASE_URL;
    }
    // 로컬 개발 환경에서는 gateway 주소 사용
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
 * ✅ 특정 사용자의 포인트를 조회합니다.
 */
export const getUserPoints = async (uid) => {
    try {
        // Gateway 라우팅 경로에 맞게 /api/points/{uid} 사용
        const response = await apiClient.get(`/api/points/${uid}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user points:", error);
        throw error;
    }
};

/**
 * ✅ 특정 사용자의 포인트를 충전합니다. (결제 연동은 시뮬레이션)
 */
export const chargeUserPoints = async (uid, amount) => {
    try {
        const response = await apiClient.post(`/api/points/${uid}/charge`, { amount });
        return response.data;
    } catch (error) {
        console.error("Error charging points:", error);
        throw error;
    }
};
