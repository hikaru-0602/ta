import React from "react";
import {
  formatShiftDataForExcel,
  getYearAndMonth,
  getUserData,
  getteacherData,
} from "./excel_data";
import { replaceAllData } from "./export_to_excel";
import { Shift } from "../types"; //業務データの型をインポート
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/lib/firebase";
import { useAlert } from "../components/AlertProvider";

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
export const handleExportSubject = () => {
  // Note: この関数内でshowAlertを使用するには、コンポーネント内で定義し直す必要があります
  console.log("handleExportSubject called - この関数は非推奨になります");
};

//選択された科目名のシフトデータを統一してエクスポートする関数
export const exportData = async () => {
  console.log("exportData called - この関数は非推奨になります");
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
  const { showAlert } = useAlert();

  const exportDataInternal = async (
    selectedSubject: string,
    currentDate: Date,
    shiftData: Shift[],
    setIsExportDialogOpen: (isOpen: boolean) => void
  ) => {
    if (!currentDate || !(currentDate instanceof Date)) {
      console.error("currentDate is not defined or not a valid Date object.");
      showAlert("データエラー", "現在の日付が正しく設定されていません。");
      return;
    }

    if (!shiftData || !Array.isArray(shiftData)) {
      console.error("shiftData is not defined or not an array.");
      showAlert("データエラー", "シフトデータが正しく読み込まれていません。");
      return;
    }

    // Firestoreからユーザー情報を取得
    const uid = getAuth().currentUser?.uid;
    if (!uid) {
      showAlert("認証エラー", "ログインしてください");
      return;
    }

    try {
      const userRef = doc(db, `users/${uid}`);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        showAlert("設定エラー", "ユーザ情報を登録してください");
        return;
      }

      const userData = userSnap.data();
      console.log("userInfo:", userData); // デバッグ用

      // 型安全にユーザー情報を抽出
      const userInfo = {
        name: userData.name || "",
        name_kana: userData.name_kana || "",
        id: userData.id || "",
        value: userData.value || "1"
      };

      if (!userInfo.id || !userInfo.name || !userInfo.value || !userInfo.name_kana) {
        showAlert("設定エラー", "ユーザ情報を登録してください");
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

      // 日付ごとにシフトをグループ化
      const groupedShifts: { [date: string]: Shift[] } = {};
      filteredShifts.forEach((shift) => {
        const dateKey = shift.day; // シフトの日付をキーにする
        if (!groupedShifts[dateKey]) {
          groupedShifts[dateKey] = [];
        }
        groupedShifts[dateKey].push(shift);
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
            shifts[0].starttime
          );

          const latestEnd = shifts.reduce(
            (latest, shift) => (shift.endtime > latest ? shift.endtime : latest),
            shifts[0].endtime
          );

          const totalBreakTimes = shifts.reduce(
            (total, shift) => total + shift.breaktime,
            0
          );

          const earliestEnd = shifts.reduce(
            (earliest, shift) =>
              shift.endtime < earliest ? shift.endtime : earliest,
            shifts[0].endtime
          );

          const latestStart = shifts.reduce(
            (latest, shift) =>
              shift.starttime > latest ? shift.starttime : latest,
            shifts[0].starttime
          );

          const start = new Date(`1970-01-01T${earliestEnd}:00`);
          const end = new Date(`1970-01-01T${latestStart}:00`);
          const overlappingDuration = Math.max(
            0,
            (end.getTime() - start.getTime()) / (1000 * 60) // 分単位
          );

          const finalBreakTime = totalBreakTimes + overlappingDuration; // 合計休憩時間

          // 統一されたデータをそれぞれのシフトに適用
          shifts.forEach((shift) => {
            unifiedShifts.push({
              ...shift,
              starttime: earliestStart,
              endtime: latestEnd,
              breaktime: finalBreakTime,
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

      // JSON形式で出力
      const jsonOutput = JSON.stringify(unifiedShifts, null, 2);
      console.log(jsonOutput);

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
    } catch (error) {
      console.error("エラーが発生しました:", error);
      showAlert("システムエラー", "エラーが発生しました。後でもう一度お試しください。");
      setIsExportDialogOpen(false);
    }
  };

  const backDialog = (e: React.MouseEvent<HTMLDivElement>) => {
    // ダイアログの外側をクリックした場合のみ閉じる
    if (e.target === e.currentTarget) {
      setIsExportDialogOpen(false);
    }
  };

  return (
    isExportDialogOpen && ( // ダイアログが開いている場合のみ表示
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
        onClick={backDialog} // 背景クリックで閉じる
      >
        <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto border border-border">
          <h2 className="text-lg font-bold mb-4 text-foreground">
            出力する科目を選択
          </h2>
          <ul>
            {subjectNames.map((subject: string, index: number) => (
              <li
                key={index}
                onClick={() =>
                  exportDataInternal(
                    subject,
                    currentDate,
                    shiftData,
                    setIsExportDialogOpen
                  )
                }
                className="mb-2 p-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
              >
                {subject || "科目名がありません"}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setIsExportDialogOpen(false)}
            className="mt-4 p-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors w-full"
          >
            キャンセル
          </button>
        </div>
      </div>
    )
  );
}
