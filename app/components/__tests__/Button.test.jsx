/*
 * 📚 このファイルは「ボタンコンポーネント」のテストです
 *
 * 【何をテストしているか】
 * - ボタンが正しく表示されるか
 * - ボタンをクリックした時に正しく動作するか
 * - 無効化されたボタンがクリックできないか
 *
 * 【なぜテストが必要か】
 * - ユーザーが操作する重要な部品だから
 * - ボタンが動かない = アプリが使えない
 * - 色々な状態（有効/無効）で正しく動くか確認が必要
 *
 * 【テストの流れ】
 * 1. 画面にボタンを表示
 * 2. ボタンを探して見つかるか確認
 * 3. ボタンをクリックして期待した動作をするか確認
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// テスト用のシンプルなButtonコンポーネント
const Button = ({ children, onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      {children}
    </button>
  );
};

describe('Button コンポーネント', () => {
  test('ボタンが正しくレンダリングされる', () => {
    /*
     * 🧪 このテストでは：
     * 1. 「クリック」と書かれたボタンを画面に表示
     * 2. そのボタンが実際に画面に存在するか確認
     *
     * 💡 なぜこのテストが重要？
     * - 基本中の基本：ボタンが表示されないと何もできない
     * - コンポーネントが正しく描画されているかの確認
     */
    render(<Button>クリック</Button>);

    // ボタンが表示されているかチェック
    const button = screen.getByText('クリック');
    expect(button).toBeInTheDocument();
  });

  test('クリックイベントが正しく動作する', () => {
    /*
     * 🧪 このテストでは：
     * 1. クリック時に呼ばれる関数の「ダミー」を作成
     * 2. ボタンをクリック
     * 3. ダミー関数が1回呼ばれたか確認
     *
     * 💡 なぜこのテストが重要？
     * - ボタンをクリックしても何も起きないバグを防ぐ
     * - イベントハンドラーが正しく動作するかの確認
     */
    // モック関数を作成（ダミーの関数）
    const mockClick = jest.fn();

    render(<Button onClick={mockClick}>クリック</Button>);

    const button = screen.getByText('クリック');
    fireEvent.click(button);

    // クリック関数が1回呼ばれたかチェック
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  test('無効化されたボタンはクリックできない', () => {
    /*
     * 🧪 このテストでは：
     * 1. disabled=true のボタンを作成
     * 2. ボタンが無効化状態になっているか確認
     * 3. クリックしても関数が呼ばれないか確認
     *
     * 💡 なぜこのテストが重要？
     * - 処理中や条件未満の時にボタンを無効化する機能
     * - 誤操作防止のため、無効時は本当にクリックできないか確認
     */
    const mockClick = jest.fn();

    render(<Button onClick={mockClick} disabled={true}>クリック</Button>);

    const button = screen.getByText('クリック');
    expect(button).toBeDisabled();

    fireEvent.click(button);

    // クリック関数が呼ばれていないかチェック
    expect(mockClick).not.toHaveBeenCalled();
  });
});