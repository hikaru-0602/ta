import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider, getToken } from 'firebase/app-check'


//怖いから".env"に入れといた
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};


if (!getApps()?.length) {
  initializeApp(firebaseConfig);
  console.log("Firebase initialized");
}

export const auth = getAuth();
console.log("Firebase Auth initialized", auth);
export const db = getFirestore();

export const firebase = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// FIREBASE_APPCHECK_DEBUG_TOKEN の定義(TypeScript用)
declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
  }
}

// AppCheck 初期化処理
if (typeof document !== 'undefined') {
  // 1.デバック環境用設定
  if (process.env.NODE_ENV === 'development') {
    window.self.FIREBASE_APPCHECK_DEBUG_TOKEN = true // デバッグ用文字列の生成
  }
  // 2.AppCheck 初期化
  const appCheck = initializeAppCheck(firebase, {
    provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''),
    isTokenAutoRefreshEnabled: true,
  })
  // 3.AppCheck　結果 ＆ トークン確認
  getToken(appCheck)
    .then(() => {
      console.log('AppCheck:Success')
    })
    .catch((error) => {
      console.log(error.message)
    })
}