export type Shift = {
  id: number;
  year: number;
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
  value: string;
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

export const gradeInfoMap: Record<string, { label: string; wage: number }> = {
  "1": { label: "学部１年生", wage: 1010 },
  "2": { label: "学部２年生", wage: 1020 },
  "3": { label: "学部３年生", wage: 1030 },
  "4": { label: "学部４年生", wage: 1040 },
  "5": { label: "博士（前期）課程１年", wage: 1050 },
  "6": { label: "博士（前期）課程２年", wage: 1090 },
  "7": { label: "博士（後期）課程１年", wage: 1140 },
  "8": { label: "博士（後期）課程２年", wage: 1160 },
  "9": { label: "博士（後期）課程３年", wage: 1170 },
};