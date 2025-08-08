// src/api/term.js
import axios from 'axios';
import { auth } from '../firebase';

const getApiUrl = () => {
  // 1. Cloud Run 환경 변수가 있으면 최우선으로 사용
  if (process.env.REACT_APP_CLOUD_RUN_TERM_API_BASE_URL) {
    return process.env.REACT_APP_CLOUD_RUN_TERM_API_BASE_URL;
  }
  // 2. 로컬 개발 환경의 기본 URL
  return 'http://localhost:8088';
};

const apiClient = axios.create({
  baseURL: getApiUrl(),
});

// 요청 인터셉터를 사용하여 모든 요청에 Firebase 인증 토큰을 자동으로 추가합니다.
apiClient.interceptors.request.use(
  async (config) => {
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
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 사용자의 모든 계약서 목록을 가져옵니다.
 * (백엔드에 /terms GET 엔드포인트 구현이 필요합니다)
 */
export const getContracts = async () => {
  try {
    const response = await apiClient.get('/terms');
    return response.data;
  } catch (error) {
    console.error('계약서 목록을 가져오는 중 오류가 발생했습니다.', error);
    throw error;
  }
};