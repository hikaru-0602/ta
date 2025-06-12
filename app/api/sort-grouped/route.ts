import Database from 'better-sqlite3';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET() {
  try {
    // データベースファイルのパスを取得
    const dbPath = path.join(process.cwd(), 'syllabus.db');
    const db = new Database(dbPath, { readonly: true });

    // sort_groupedテーブルからデータを取得
    const stmt = db.prepare('SELECT * FROM sort_grouped ORDER BY LessonId');
    const data = stmt.all();

    db.close();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'データベースエラーが発生しました' },
      { status: 500 }
    );
  }
}