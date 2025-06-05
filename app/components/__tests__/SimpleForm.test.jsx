/*
 * 📚 このファイルは「フォーム入力」のテストです
 *
 * 【何をテストしているか】
 * - フォームが正しく表示されるか
 * - 入力欄に文字を入力できるか
 * - 送信ボタンを押した時に正しいデータが送られるか
 *
 * 【なぜテストが必要か】
 * - フォームはユーザーがデータを入力する重要な機能
 * - 入力できない/送信できない = データ登録ができない
 * - 様々な入力パターンで正しく動作するか確認が必要
 *
 * 【テストの流れ】
 * 1. フォームを画面に表示
 * 2. 入力欄を見つけて文字を入力
 * 3. 送信ボタンを押して期待したデータが送られるか確認
 */

import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// テスト用のシンプルなフォームコンポーネント
const SimpleForm = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">名前</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前を入力"
        />
      </div>
      <div>
        <label htmlFor="email">メール</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールを入力"
        />
      </div>
      <button type="submit">送信</button>
    </form>
  );
};

describe('SimpleForm コンポーネント', () => {
  test('フォームが正しくレンダリングされる', () => {
    /*
     * 🧪 このテストでは：
     * 1. フォームを画面に表示
     * 2. 名前欄、メール欄、送信ボタンが存在するか確認
     *
     * 💡 なぜこのテストが重要？
     * - フォームの基本的な構造が正しいか確認
     * - 必要な入力欄が全て表示されているか確認
     */
    render(<SimpleForm onSubmit={jest.fn()} />);

    expect(screen.getByLabelText('名前')).toBeInTheDocument();
    expect(screen.getByLabelText('メール')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '送信' })).toBeInTheDocument();
  });

  test('入力フィールドに文字を入力できる', async () => {
    /*
     * 🧪 このテストでは：
     * 1. フォームを表示
     * 2. 名前欄に「田中太郎」を入力
     * 3. メール欄に「tanaka@example.com」を入力
     * 4. 入力した内容が正しく表示されているか確認
     *
     * 💡 なぜこのテストが重要？
     * - ユーザーが文字を入力できるかの基本的な動作確認
     * - 入力した内容が正しく保存されているか確認
     */
    const user = userEvent.setup();
    render(<SimpleForm onSubmit={jest.fn()} />);

    const nameInput = screen.getByLabelText('名前');
    const emailInput = screen.getByLabelText('メール');

    await user.type(nameInput, '田中太郎');
    await user.type(emailInput, 'tanaka@example.com');

    expect(nameInput).toHaveValue('田中太郎');
    expect(emailInput).toHaveValue('tanaka@example.com');
  });

  test('フォーム送信時に正しいデータが渡される', async () => {
    /*
     * 🧪 このテストでは：
     * 1. 送信時に呼ばれる関数のダミーを作成
     * 2. 名前とメールを入力
     * 3. 送信ボタンをクリック
     * 4. ダミー関数に正しいデータが渡されたか確認
     *
     * 💡 なぜこのテストが重要？
     * - フォームの送信機能が正しく動作するか確認
     * - 入力したデータが正確に次の処理に渡されるか確認
     */
    const mockSubmit = jest.fn();
    const user = userEvent.setup();

    render(<SimpleForm onSubmit={mockSubmit} />);

    const nameInput = screen.getByLabelText('名前');
    const emailInput = screen.getByLabelText('メール');
    const submitButton = screen.getByRole('button', { name: '送信' });

    await user.type(nameInput, '田中太郎');
    await user.type(emailInput, 'tanaka@example.com');
    await user.click(submitButton);

    expect(mockSubmit).toHaveBeenCalledWith({
      name: '田中太郎',
      email: 'tanaka@example.com'
    });
  });

  test('空のフォームでも送信できる', async () => {
    /*
     * 🧪 このテストでは：
     * 1. 何も入力せずに送信ボタンをクリック
     * 2. 空のデータが正しく送信されるか確認
     *
     * 💡 なぜこのテストが重要？
     * - 必須入力チェックがない場合の動作確認
     * - 空データでもシステムがクラッシュしないか確認
     */
    const mockSubmit = jest.fn();
    const user = userEvent.setup();

    render(<SimpleForm onSubmit={mockSubmit} />);

    const submitButton = screen.getByRole('button', { name: '送信' });
    await user.click(submitButton);

    expect(mockSubmit).toHaveBeenCalledWith({
      name: '',
      email: ''
    });
  });
});