"use client";

import Calendar from "./calendar/Calendar";
import Setting from "./setting/Setting";
import { useAuth } from "./firebase/context/auth";
import { login, logout } from "./firebase/lib/auth";
import { useLoginContext } from "./firebase/context/LoginContext";
import { useState, useEffect } from "react";
import { AlertProvider, useAlert } from "./components/AlertProvider";

function AppContent() {
  const user = useAuth();
  const { setIsLoginTriggered } = useLoginContext();
  const [isLoading, setIsLoading] = useState(false);
  const { showAlert } = useAlert();

  // システムのダークモード設定を監視
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // システム設定に応じてダークモードを自動切り替え
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // 初期設定
    if (mediaQuery.matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // システム設定の変更を監視
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // クリーンアップ
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  const handleLogin = async () => {
    if (isLoading) return; // 既にローディング中の場合は何もしない

    try {
      setIsLoading(true);
      const result = await login();
      if (result) {
        setIsLoginTriggered(true);
        console.log('ログイン処理が完了しました');
      }
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      console.error('ログインに失敗しました:', error);
      // cancelled-popup-request エラーの場合はユーザーに通知しない
      if (firebaseError.code !== 'auth/cancelled-popup-request' &&
          firebaseError.code !== 'auth/popup-closed-by-user') {
        showAlert('ログインエラー', 'ログインに失敗しました。再度お試しください。');
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="py-5 flex justify-end pr-8">
        {!user ? (
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isLoading
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {isLoading ? 'ログイン中...' : '学内アカウントログイン'}
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:bg-destructive/90 transition-colors"
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

export default function Home() {
  return (
    <AlertProvider>
      <AppContent />
    </AlertProvider>
  );
}
