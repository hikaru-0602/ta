export type Shift = {
  filter(arg0: (shift: unknown) => boolean): unknown;
  id: number;
  month: number;
  day: number;
  label: string;
  teacher: string;
  classname: string;
  category: string;
  starttime: string;
  endtime: string;
  breaktime: number;
};

export type UserInfo = {
  id: string;
  name: string;
  name_kana: string;
  grade: string;
  value: string;
  hourlyWage: number;
};

export type WorkData = {
  id: number; // 業務ID
  label: string; // ラベル名
  classname: string; // 科目名
  category: string; // 業務内容
  teacher: string; // 担当教員
  dayofweek: string; // 曜日
  schedule: number[]; // 時限（数値配列）
  starttime: string; // 開始時刻 ("HH:mm"形式)
  endtime: string; // 終了時刻 ("HH:mm"形式)
  breaktime: number; // 休憩時間（分）
  worktime: string; // 実働時間（フォーマット済み）
};