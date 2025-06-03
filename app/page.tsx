"use client";

import Calendar from "./calendar/Calendar";
import Setting from "./setting/Setting";
import { useAuth } from "./firebase/context/auth";
import { login, logout } from "./firebase/lib/auth";
import { useLoginContext } from "./firebase/context/LoginContext";
import { useState } from "react";

export default function Home() {
  const user = useAuth();
  const { setIsLoginTriggered } = useLoginContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (isLoading) return; // 既にローディング中の場合は何もしない

    try {
      setIsLoading(true);
      const result = await login();
      if (result) {
        setIsLoginTriggered(true);
        console.log('ログイン処理が完了しました');
      }
    } catch (error: any) {
      console.error('ログインに失敗しました:', error);
      // cancelled-popup-request エラーの場合はユーザーに通知しない
      if (error.code !== 'auth/cancelled-popup-request' &&
          error.code !== 'auth/popup-closed-by-user') {
        alert('ログインに失敗しました。再度お試しください。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoginTriggered(false);
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="py-5 flex justify-end pr-8">
        {!user ? (
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded transition ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'ログイン中...' : '学内アカウントログイン'}
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            ログアウト
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row items-start justify-center gap-8 px-8">
        <Calendar />
        <Setting />
      </div>
    </div>
  );
}
