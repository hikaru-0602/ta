import Database from 'better-sqlite3';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectName = searchParams.get('subject');

    if (!subjectName) {
      return NextResponse.json(
        { error: '科目名が指定されていません' },
        { status: 400 }
      );
    }

    // データベースファイルのパスを取得
    const dbPath = path.join(process.cwd(), 'syllabus.db');
    const db = new Database(dbPath, { readonly: true });

    // 指定された科目の担当教員名を取得
    const stmt = db.prepare('SELECT 担当教員名 FROM sort_grouped WHERE 授業名 = ? AND 担当教員名 IS NOT NULL AND 担当教員名 != ""');
    const rows = stmt.all(subjectName) as { 担当教員名: string }[];

    db.close();

    // カンマ区切りの教員名を分割して重複を除去
    const teacherSet = new Set<string>();

    rows.forEach(row => {
      const teachers = row.担当教員名.split(',').map(teacher => teacher.trim());
      teachers.forEach(teacher => {
        if (teacher) {
          teacherSet.add(teacher);
        }
      });
    });

    // 配列に変換してソート
    const teacherList = Array.from(teacherSet).sort((a, b) =>
      a.localeCompare(b, 'ja', { numeric: true, sensitivity: 'base' })
    );

    return NextResponse.json(teacherList.map(teacher => ({ 担当教員名: teacher })));
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'データベースエラーが発生しました' },
      { status: 500 }
    );
  }
}