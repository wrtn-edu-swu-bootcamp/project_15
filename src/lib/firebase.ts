import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCIBfaiVxmJqDz5ChPl3Jccz94byK8dQrQ",
  authDomain: "finalproject-936cb.firebaseapp.com",
  projectId: "finalproject-936cb",
  storageBucket: "finalproject-936cb.firebasestorage.app",
  messagingSenderId: "710659346279",
  appId: "1:710659346279:web:13935c86b6cc267e5829c2",
  measurementId: "G-GHQ71513SY"
};

// Firebase 앱 초기화 (중복 방지)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Firestore 인스턴스
export const db = getFirestore(app);

// Auth 인스턴스
export const auth = getAuth(app);

// Google 로그인 Provider
export const googleProvider = new GoogleAuthProvider();

export default app;
