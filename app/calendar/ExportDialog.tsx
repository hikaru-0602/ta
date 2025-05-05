import React from "react";

export const handleExportSubject = (
  selectedSubject: string,
  currentDate: Date,
  shiftData: any[],
  setIsExportDialogOpen: Function
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

  // JSON形式で出力
  const jsonOutput = JSON.stringify(filteredShifts, null, 2);
  console.log(jsonOutput);
  alert(`選択された科目名のシフトデータ:\n${jsonOutput}`);

  setIsExportDialogOpen(false); // ダイアログを閉じる
};

export const handleCloseExportDialog = (setIsExportDialogOpen: Function) => {
  setIsExportDialogOpen(false);
};

export default function ExportDialog({
  isExportDialogOpen,
  subjectNames,
  currentDate,
  shiftData,
  setIsExportDialogOpen,
}: any) {
  return (
    isExportDialogOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">科目名を選択してください</h2>
          <ul>
            {subjectNames.map((subject: string, index: number) => (
              <li
                key={index}
                onClick={() =>
                  handleExportSubject(subject, currentDate, shiftData, setIsExportDialogOpen)
                }
                className="mb-2 p-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
              >
                {subject}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleCloseExportDialog(setIsExportDialogOpen)}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            閉じる
          </button>
        </div>
      </div>
    )
  );
}