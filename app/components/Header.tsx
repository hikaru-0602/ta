"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../firebase/context/auth"; // 認証情報を取得
import { login, logout } from "../firebase/lib/auth"; // ログイン・ログアウト関数をインポート
import { useAlert } from './AlertProvider';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const user = useAuth(); // 現在のユーザー情報を取得
  const { showAlert } = useAlert();

  const handleLogin = async () => {
    if (isLoading) return; // 既にローディング中の場合は何もしない

    try {
      setIsLoading(true);
      const result = await login();
      if (result) {
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
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-50">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-lg font-bold text-foreground">勤務表アプリ</h1>
        <button
          className="sm:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="sr-only">Toggle menu</span>
          <div className="w-6 h-0.5 bg-foreground mb-1"></div>
          <div className="w-6 h-0.5 bg-foreground mb-1"></div>
          <div className="w-6 h-0.5 bg-foreground"></div>
        </button>
        <nav
          className={`${
            isOpen ? "block" : "hidden"
          } sm:flex sm:items-center sm:gap-4`}
        >
          <Link
            href="/"
            className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          >
            勤務表
          </Link>
          <Link
            href="/setting"
            className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          >
            仕事
          </Link>
        </nav>
        {/* ログイン・ログアウトボタン */}
        <div className="ml-4">
          {user === null ? (
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-md font-medium transition-colors ${
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
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors font-medium"
            >
              ログアウト
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
