import React from "react";
import {
  formatShiftDataForExcel,
  getYearAndMonth,
  getUserData,
  getteacherData,
} from "./excel_data";
import { replaceAllData } from "./export_to_excel";
import { Shift } from "../types"; //業務データの型をインポート

interface ExportDialogProps {
  isExportDialogOpen: boolean; // ダイアログの開閉状態
  subjectNames: string[]; // 科目名のリスト
  currentDate: Date; // 現在の日付
  shiftData: Shift[]; // シフトデータ
  setIsExportDialogOpen: (isOpen: boolean) => void; // ダイアログを閉じる関数
  handleExportSubject: (
    selectedSubject: string,
    currentDate: Date,
    shiftData: Shift[],
    setIsExportDialogOpen: (isOpen: boolean) => void
  ) => void; // 科目をエクスポートする関数
  handleCloseExportDialog: (
    setIsExportDialogOpen: (isOpen: boolean) => void
  ) => void; // ダイアログを閉じる関数
}

export const getHolidaysInMonth = async (
  year: number,
  month: number
): Promise<number[]> => {
  const holidays: number[] = [];
  const date = new Date(year, month - 1, 1); // 月は0から始まるため、-1する

  // 祝日データを取得
  let holidayData: { [date: string]: string } = {};
  try {
    const response = await fetch(
      "https://holidays-jp.github.io/api/v1/date.json"
    );
    if (response.ok) {
      holidayData = await response.json();
    } else {
      console.error("祝日データの取得に失敗しました");
    }
  } catch (error) {
    console.error("祝日データの取得中にエラーが発生しました:", error);
  }

  while (date.getMonth() === month - 1) {
    const dayOfWeek = date.getDay(); // 0: 日曜日, 6: 土曜日

    // ローカルタイムゾーンの日付を YYYY-MM-DD 形式に変換
    const formattedDate = date
      .toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-"); // "YYYY/MM/DD" を "YYYY-MM-DD" に変換

    // 土日または祝日を判定
    if (dayOfWeek === 0 || dayOfWeek === 6 || holidayData[formattedDate]) {
      holidays.push(date.getDate());
    }
    date.setDate(date.getDate() + 1); // 次の日に進む
  }

  return holidays;
};

//選択された科目名のシフトデータをエクスポートする関数
export const handleExportSubject = (
  selectedSubject: string, //選択された科目名
  currentDate: Date, //現在の日付
  shiftData: Shift[], //シフトデータ
  setIsExportDialogOpen: (isOpen: boolean) => void //ダイアログを閉じる関数
) => {
  if (!currentDate || !(currentDate instanceof Date)) {
    console.error("currentDate is not defined or not a valid Date object."); //エラーをコンソールに出力
    alert("現在の日付が正しく設定されていません。"); //エラーをアラートで表示
    return; //処理を終了
  }

  if (!shiftData || !Array.isArray(shiftData)) {
    console.error("shiftData is not defined or not an array."); //エラーをコンソールに出力
    alert("シフトデータが正しく読み込まれていません。"); //エラーをアラートで表示
    return; //処理を終了
  }

  //現在の月のシフトデータを取得
  const currentMonthShifts = shiftData.filter(
    (shift) =>
      shift.year === currentDate.getFullYear() &&
      shift.month === currentDate.getMonth() + 1
  );

  //選択された科目名に一致するシフトをフィルタリング
  const filteredShifts = currentMonthShifts.filter(
    (shift) => shift.classname === selectedSubject
  );

  //JSON形式で出力
  const jsonOutput = JSON.stringify(filteredShifts, null, 2); //シフトデータをJSON形式に変換
  //console.log(jsonOutput); //JSONデータをコンソールに出力
  alert(`選択された科目名のシフトデータ:\n${jsonOutput}`); //JSONデータをアラートで表示

  setIsExportDialogOpen(false); //ダイアログを閉じる
};

//選択された科目名のシフトデータを統一してエクスポートする関数
export const exportData = async (
  selectedSubject: string, // 選択された科目名
  currentDate: Date, // 現在の日付
  shiftData: Shift[], // シフトデータ
  setIsExportDialogOpen: (isOpen: boolean) => void // ダイアログを閉じる関数
) => {
  if (!currentDate || !(currentDate instanceof Date)) {
    console.error("currentDate is not defined or not a valid Date object.");
    alert("現在の日付が正しく設定されていません。");
    return;
  }

  if (!shiftData || !Array.isArray(shiftData)) {
    console.error("shiftData is not defined or not an array.");
    alert("シフトデータが正しく読み込まれていません。");
    return;
  }

  const savedUserInfo = localStorage.getItem("userInfo");
  const userInfo = savedUserInfo ? JSON.parse(savedUserInfo) : null;
  if (!userInfo) {
    alert("ユーザ情報を登録してください");
    return;
  }

  // 現在の月のシフトデータを取得
  const currentMonthShifts = shiftData.filter(
    (shift) =>
      shift.year === currentDate.getFullYear() &&
      shift.month === currentDate.getMonth() + 1
  );

  // 選択された科目名に一致するシフトをフィルタリング
  const filteredShifts = currentMonthShifts.filter(
    (shift) => shift.classname === selectedSubject
  );

  let teacher = "";
  for (const shift of filteredShifts) {
    if (shift.teacher) {
      teacher = shift.teacher;
      break;
    }
  }
  //console.log("teacher:", teacher); / / デバッグ用;

  // 日付ごとにシフトをグループ化
  const groupedShifts: { [date: string]: Shift[] } = {};
  filteredShifts.forEach((shift) => {
    const dateKey = shift.day; // シフトの日付をキーにする
    if (!groupedShifts[dateKey]) {
      groupedShifts[dateKey] = [];
    }
    groupedShifts[dateKey].push(shift);
    //alert(`シフトデータをグループ化しました: ${dateKey}`); // デバッグ用
    //console.log(`シフトデータをグループ化しました: ${dateKey}`, groupedShifts[dateKey]); // デバッグ用
  });

  // シフトを統一
  const unifiedShifts: Shift[] = [];
  Object.keys(groupedShifts).forEach((dateKey) => {
    const shifts = groupedShifts[dateKey];
    if (shifts.length === 1) {
      unifiedShifts.push(shifts[0]); // シフトが1つだけの場合はそのまま追加
    } else {
      // シフトが複数ある場合は統一
      const earliestStart = shifts.reduce(
        (earliest, shift) =>
          shift.starttime < earliest ? shift.starttime : earliest,
        shifts[0].endtime
      );

      const latestEnd = shifts.reduce(
        (latest, shift) => (shift.endtime > latest ? shift.endtime : latest),
        shifts[0].endtime
      );

      const totalBreakTime = shifts.reduce((total, shift) => {
        const earliestEnd = shifts.reduce(
          (earliest, shift) =>
            shift.endtime < earliest ? shift.endtime : earliest,
          shifts[0].endtime
        ); // 早い方のシフトの終了時間

        const latestStart = shifts.reduce(
          (latest, shift) =>
            shift.starttime > latest ? shift.starttime : latest,
          shifts[0].starttime
        ); // 遅い方のシフトの開始時間

        const start = new Date(`1970-01-01T${latestStart}:00`);
        const end = new Date(`1970-01-01T${earliestEnd}:00`);
        const duration = (start.getTime() - end.getTime()) / (1000 * 60); // 休憩時間（分）

        return total + Math.max(0, duration) + shift.breaktime; // 負の値を防ぐために Math.max を使用
      }, 0);

      // 統一されたデータをそれぞれのシフトに適用
      shifts.forEach((shift) => {
        unifiedShifts.push({
          ...shift,
          starttime: earliestStart,
          endtime: latestEnd,
          breaktime: totalBreakTime,
        });
      });
    }
  });

  // シフトデータをフォーマット
  const formattedData = formatShiftDataForExcel(unifiedShifts);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const holidays = getHolidaysInMonth(year, month); // 祝日を取得
  const yearMonthArray = getYearAndMonth(year, month); // 和暦と月を含む配列を取得

  const userDataArrays = getUserData(userInfo); // ユーザデータを取得

  const teacherDataArrays = getteacherData({ name: teacher }); // 教員データを取得

  // 必要に応じてExcelに書き込む処理を追加
  //console.log("Excel用フォーマット済みデータ:", formattedData);

  // JSON形式で出力
  const jsonOutput = JSON.stringify(unifiedShifts, null, 2);
  console.log(jsonOutput);
  //alert(`統一されたシフトデータ:\n${jsonOutput}`);

  if (formattedData && yearMonthArray && userDataArrays && teacherDataArrays) {
    replaceAllData(
      formattedData,
      yearMonthArray,
      userDataArrays,
      teacherDataArrays,
      currentDate.getFullYear(),
      await holidays
    );
  }

  setIsExportDialogOpen(false); // ダイアログを閉じる
};

//エクスポートダイアログを閉じる関数
export const handleCloseExportDialog = (
  setIsExportDialogOpen: (isOpen: boolean) => void
) => {
  setIsExportDialogOpen(false); //ダイアログを閉じる
};

//ExportDialogコンポーネント
export default function ExportDialog({
  isExportDialogOpen, // エクスポートダイアログが開いているかどうかの状態
  subjectNames, // 科目名のリスト
  currentDate, // 現在の日付
  shiftData, // シフトデータ
  setIsExportDialogOpen, // ダイアログを閉じる関数
}: ExportDialogProps) {
  return (
    isExportDialogOpen && ( // ダイアログが開いている場合のみ表示
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded shadow-lg w-96 max-h-[80vh] overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">出力する科目を選択</h2>
          <ul>
            {subjectNames.map((subject: string, index: number) => (
              <li
                key={index}
                onClick={() =>
                  exportData(
                    subject,
                    currentDate,
                    shiftData,
                    setIsExportDialogOpen
                  )
                }
                className="mb-2 p-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
              >
                {subject || "科目名がありません"}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setIsExportDialogOpen(false)}
            className="mt-4 p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            キャンセル
          </button>
        </div>
      </div>
    )
  );
}
