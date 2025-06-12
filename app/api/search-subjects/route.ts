import Database from 'better-sqlite3';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    // データベースファイルのパスを取得
    const dbPath = path.join(process.cwd(), 'syllabus.db');
    const db = new Database(dbPath, { readonly: true });

    // 授業名で部分一致検索（大文字小文字を区別しない）
    const stmt = db.prepare(`
      SELECT DISTINCT 授業名, LessonId, 担当教員名
      FROM sort_grouped
      WHERE 授業名 LIKE ?
      ORDER BY 授業名
      LIMIT 10
    `);

    const searchTerm = `%${query}%`;
    const data = stmt.all(searchTerm);

    db.close();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: '検索エラーが発生しました' },
      { status: 500 }
    );
  }
}