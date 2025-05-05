import React from "react";
import { formatShiftDataForExcel, handleCheckRowsAndOutput } from "./excel_data";

//選択された科目名のシフトデータをエクスポートする関数
export const handleExportSubject = (
  selectedSubject: string, //選択された科目名
  currentDate: Date, //現在の日付
  shiftData: any[], //シフトデータ
  setIsExportDialogOpen: Function //ダイアログを閉じる関数
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
    (shift) => shift.month === currentDate.getMonth() + 1
  );

  //選択された科目名に一致するシフトをフィルタリング
  const filteredShifts = currentMonthShifts.filter(
    (shift) => shift.classname === selectedSubject
  );

  //JSON形式で出力
  const jsonOutput = JSON.stringify(filteredShifts, null, 2); //シフトデータをJSON形式に変換
  console.log(jsonOutput); //JSONデータをコンソールに出力
  alert(`選択された科目名のシフトデータ:\n${jsonOutput}`); //JSONデータをアラートで表示

  setIsExportDialogOpen(false); //ダイアログを閉じる
};

//選択された科目名のシフトデータを統一してエクスポートする関数
export const handleExportSubjectWithUnifiedShifts = (
  selectedSubject: string, // 選択された科目名
  currentDate: Date, // 現在の日付
  shiftData: any[], // シフトデータ
  setIsExportDialogOpen: Function // ダイアログを閉じる関数
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

  // 現在の月のシフトデータを取得
  const currentMonthShifts = shiftData.filter(
    (shift) => shift.month === currentDate.getMonth() + 1
  );

  // 選択された科目名に一致するシフトをフィルタリング
  const filteredShifts = currentMonthShifts.filter(
    (shift) => shift.classname === selectedSubject
  );

  // 日付ごとにシフトをグループ化
  const groupedShifts: { [date: string]: any[] } = {};
  filteredShifts.forEach((shift) => {
    const dateKey = shift.date; // シフトの日付をキーにする
    if (!groupedShifts[dateKey]) {
      groupedShifts[dateKey] = [];
    }
    groupedShifts[dateKey].push(shift);
  });

  // シフトを統一
  const unifiedShifts: any[] = [];
  Object.keys(groupedShifts).forEach((dateKey) => {
    const shifts = groupedShifts[dateKey];
    if (shifts.length === 1) {
      unifiedShifts.push(shifts[0]); // シフトが1つだけの場合はそのまま追加
    } else {
      // シフトが複数ある場合は統一
      const earliestStart = shifts.reduce((earliest, shift) =>
        shift.starttime < earliest ? shift.starttime : earliest
      , shifts[0].starttime);

      const latestEnd = shifts.reduce((latest, shift) =>
        shift.endtime > latest ? shift.endtime : latest
      , shifts[0].endtime);

      const totalBreakTime = shifts.reduce((total, shift) => {
        const start = new Date(`1970-01-01T${shift.starttime}:00`);
        const end = new Date(`1970-01-01T${shift.endtime}:00`);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60); // シフトの時間（分）
        return total + duration + shift.breaktime;
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

  // 必要に応じてExcelに書き込む処理を追加
  console.log("Excel用フォーマット済みデータ:", formattedData);

  // JSON形式で出力
  const jsonOutput = JSON.stringify(unifiedShifts, null, 2);
  console.log(jsonOutput);
  alert(`統一されたシフトデータ:\n${jsonOutput}`);

  setIsExportDialogOpen(false); // ダイアログを閉じる
};

//エクスポートダイアログを閉じる関数
export const handleCloseExportDialog = (setIsExportDialogOpen: Function) => {
  setIsExportDialogOpen(false); //ダイアログを閉じる
};

//ExportDialogコンポーネント
export default function ExportDialog({
  isExportDialogOpen, //エクスポートダイアログが開いているかどうかの状態
  subjectNames, //科目名のリスト
  currentDate, //現在の日付
  shiftData, //シフトデータ
  setIsExportDialogOpen, //ダイアログを閉じる関数
}: any) {
  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleCheckRowsAndOutput(file);
    }
  };

  const handleListClick = async (subject: string) => {
    try {
      // public ディレクトリに配置したファイルを取得
      const response = await fetch("/R7_5月分実施報告書 (1).xlsx");
      if (!response.ok) {
        throw new Error("Excelファイルの取得に失敗しました。");
      }

      const arrayBuffer = await response.arrayBuffer();
      const file = new File([arrayBuffer], "R7_5月分実施報告書 (1).xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Excelファイルの読み取り処理を実行
      await handleCheckRowsAndOutput(file);

      alert(`科目「${subject}」のデータを処理しました。`);
    } catch (error) {
      console.error("リストタップ時の処理に失敗しました:", error);
      alert("リストタップ時の処理に失敗しました。");
    }
  };

  return (
    isExportDialogOpen && ( //ダイアログが開いている場合のみ表示
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">科目名を選択してください</h2>
          <ul>
            {subjectNames.map((subject: string, index: number) => (
              <li
                key={index}
                onClick={() => {
                  handleListClick(subject);
                  formatShiftDataForExcel(shiftData);
                }} // リストタップ時に処理を実行
                className="mb-2 p-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
              >
                {subject}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleCloseExportDialog(setIsExportDialogOpen)} //ダイアログを閉じる
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            閉じる
          </button>
        </div>
      </div>
    )
  );
}