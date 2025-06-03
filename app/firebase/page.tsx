"use client";
import { useAuth } from "./context/auth";
import { login, logout } from "./lib/auth";
import { useState } from "react";

export default function Home() {
  const user = useAuth();
  const [waiting, setWaiting] = useState<boolean>(false);

  const signIn = async () => {
    if (waiting) return; // 既に処理中の場合は何もしない

    setWaiting(true);

    try {
      const result = await login();
      if (result) {
        console.log('ログイン成功:', result);
      }
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      console.error('ログインエラー:', error);
      // cancelled-popup-request エラーの場合はユーザーに通知しない
      if (firebaseError.code !== 'auth/cancelled-popup-request' &&
          firebaseError.code !== 'auth/popup-closed-by-user') {
        alert('ログインに失敗しました。再度お試しください。');
      }
    } finally {
      console.log("finally");
      setWaiting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  return (
    <div>
      <h1>こんにちは</h1>
      {user === null && !waiting && (
        <button
          onClick={signIn}
          disabled={waiting}
          className={waiting ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {waiting ? 'ログイン中...' : 'ログイン'}
        </button>
      )}
      {user && (
        <button
          onClick={handleLogout}
        >
          ログアウト
        </button>
      )}
    </div>
  );
}
