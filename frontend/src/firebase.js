// src/firebase.js
import { initializeApp } from 'firebase/app';
// setPersistence와 browserLocalPersistence를 추가로 임포트합니다.
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAhh1Z4okTMlBnll_qVf8tijV8Z5DiS4lw",
  authDomain: "aivle-team0721.firebaseapp.com",
  databaseURL: "https://aivle-team0721-default-rtdb.firebaseio.com",
  projectId: "aivle-team0721",
  storageBucket: "aivle-team0721.firebasestorage.app",
  messagingSenderId: "902267887946",
  appId: "1:902267887946:web:22e6c9a70fea861955e1b3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // auth 객체를 가져온 후 바로 지속성을 설정합니다.

// --- 이 부분을 추가합니다. ---
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // 지속성 설정 성공 (선택 사항: 콘솔 로그)
    console.log("Firebase Auth persistence set to LOCAL.");
  })
  .catch((error) => {
    // 지속성 설정 실패 시 에러 처리 (필수)
    console.error("Error setting persistence:", error.code, error.message);
  });
// -----------------------------

export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();