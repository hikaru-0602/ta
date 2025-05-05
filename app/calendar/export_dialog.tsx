import React from "react";

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
  return (
    isExportDialogOpen && ( //ダイアログが開いている場合のみ表示
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">科目名を選択してください</h2>
          <ul>
            {subjectNames.map((subject: string, index: number) => (
              <li
                key={index} //リストアイテムのキー
                onClick={() =>
                  handleExportSubject(subject, currentDate, shiftData, setIsExportDialogOpen)
                } //科目名をエクスポート
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