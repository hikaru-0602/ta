# 📋 TA 勤務管理システム

[![CI](https://github.com/YOUR_USERNAME/ta/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/ta/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

大学の TA（ティーチングアシスタント）業務の勤務管理を効率化する Web アプリケーションです。

## 🎯 主な機能

- 📅 **勤務スケジュール管理**: カレンダー形式でシフトを一覧表示
- ⏰ **勤務時間計算**: 開始・終了・休憩時間から実働時間を自動計算
- 💰 **給料計算**: 学年別時給と労働時間から月間給料を自動計算
- 📊 **月間統計**: 科目別の勤務時間と収入を集計表示
- 📄 **データエクスポート**: Excel ファイルとして勤務データを出力

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 15 + React 19 + TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: Firebase Firestore
- **テスト**: Jest + React Testing Library
- **CI/CD**: GitHub Actions

## 🧪 テスト

このプロジェクトには包括的なテストスイートが含まれています：

```bash
# テストの実行
npm run test

# テストをwatch モードで実行
npm run test:watch

# カバレッジ付きでテスト実行
npm run test:ci
```

### テストカバレッジ

- **7 つのテストスイート**
- **49 個のテストケース**
- 時間計算、UI コンポーネント、フォーム、給料計算など全領域をカバー

## 🚀 開発環境のセットアップ

1. リポジトリをクローン:

```bash
git clone https://github.com/YOUR_USERNAME/ta.git
cd ta
```

2. 依存関係をインストール:

```bash
npm install
```

3. 環境変数を設定:

```bash
cp .env.example .env.local
# .env.local にFirebaseの設定を記入
```

4. 開発サーバーを起動:

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションにアクセスできます。

## 📋 利用可能なスクリプト

- `npm run dev` - 開発サーバーを起動
- `npm run build` - プロダクション用ビルドを作成
- `npm run start` - プロダクションサーバーを起動
- `npm run lint` - ESLint でコードをチェック
- `npm run type-check` - TypeScript 型チェックを実行
- `npm run test` - テストを実行
- `npm run test:watch` - テストを watch モードで実行
- `npm run test:ci` - CI 用テスト（カバレッジ付き）

## 💰 給料計算システム

学年別の時給設定に基づいて自動計算：

| 学年        | 時給    |
| ----------- | ------- |
| 学部 1 年生 | 1010 円 |
| 学部 2 年生 | 1020 円 |
| 学部 3 年生 | 1030 円 |
| 学部 4 年生 | 1040 円 |
| 修士 1 年生 | 1200 円 |
| 修士 2 年生 | 1210 円 |
| 博士 1 年生 | 1400 円 |
| 博士 2 年生 | 1410 円 |
| 博士 3 年生 | 1420 円 |

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。
