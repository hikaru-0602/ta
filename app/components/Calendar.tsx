"use client";

import { useEffect, useState } from "react";

export default function Calendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // 選択された日付を管理
  const [workData, setWorkData] = useState<any[]>([]);
  const [filteredWorkData, setFilteredWorkData] = useState<any[]>([]); // フィルタリングされたデータ
  const [shiftData, setShiftData] = useState<any[]>([]); // 追加されたシフト
  const [isDialogOpen, setIsDialogOpen] = useState(false); // ダイアログの状態
  const [userInfo, setUserInfo] = useState<any>(null); // ユーザ情報を管理
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false); // ダイアログの状態
  const [subjectNames, setSubjectNames] = useState<string[]>([]); // 科目名リスト

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const daysInMonth = Array.from(
    { length: endOfMonth.getDate() },
    (_, i) => new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
  );

  useEffect(() => {
    // クライアントサイドでのみ localStorage を使用
    const savedWorkData = localStorage.getItem("workData");
    const parsedWorkData = savedWorkData ? JSON.parse(savedWorkData) : [];
    setWorkData(parsedWorkData);

    const savedShifts = localStorage.getItem("shiftData");
    const parsedShifts = savedShifts ? JSON.parse(savedShifts) : [];
    setShiftData(parsedShifts);

    // userInfoをlocalStorageから取得
    const savedUserInfo = localStorage.getItem("userInfo");
    const parsedUserInfo = savedUserInfo ? JSON.parse(savedUserInfo) : null;
    setUserInfo(parsedUserInfo);
  }, []);

  const saveShiftsToLocalStorage = (shifts: any[]) => {
    localStorage.setItem("shiftData", JSON.stringify(shifts));
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null); // 月を変更したら選択をリセット
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null); // 月を変更したら選択をリセット
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date); // クリックされた日付を選択

    setFilteredWorkData(workData); // フィルタリングされたデータを保存
    setIsDialogOpen(true); // ダイアログを開く

    // 選択した日を西暦からコンソールログに出力
  console.log(`選択された日付: ${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`);
  };

  const closeDialog = () => {
    setIsDialogOpen(false); // ダイアログを閉じる
  };

  const handleAddShift = (work: any) => {
    if (!selectedDate) return;

    // 選択された日付にすでに追加されているシフトの数を確認
    const shiftCountForDate = shiftData.filter(
      (shift) =>
        shift.month === selectedDate.getMonth() + 1 &&
        shift.day === selectedDate.getDate()
    ).length;

    // シフトが3つ以上の場合は追加を防ぐ
    if (shiftCountForDate ==2) {
      alert("働き過ぎ");
      return;
    }

    const newShift = {
      ...work,
      month: selectedDate.getMonth() + 1,
      day: selectedDate.getDate(),
    };

    const updatedShifts = [...shiftData, newShift];
    setShiftData(updatedShifts);
    saveShiftsToLocalStorage(updatedShifts);
  };

  const handleRemoveShift = (id: string, month: number, day: number) => {
    // 削除対象の id をアラート表示
    //alert(`削除するシフトの id: ${id}`);

    // 選択した日付と id に完全一致するシフトだけを削除
    const updatedShifts = shiftData.filter(
      (shift) =>
        !(shift.id === id && shift.month === month && shift.day === day)
    );

    setShiftData(updatedShifts);
    saveShiftsToLocalStorage(updatedShifts);
  };

  const handleShowShiftData = () => {
    alert(JSON.stringify(shiftData, null, 2)); // shiftData をアラートで表示
  };

  const hasShift = (date: Date) => {
    return shiftData.some(
      (shift) =>
        shift.month === date.getMonth() + 1 && shift.day === date.getDate()
    );
  };

  // シフト出力ボタンのクリックハンドラー
  const handleOpenExportDialog = () => {
    // 現在の月のシフトデータを取得
    const currentMonthShifts = shiftData.filter(
      (shift) => shift.month === currentDate.getMonth() + 1
    );

    // 科目名のリストを取得（重複を排除）
    const uniqueSubjectNames = Array.from(
      new Set(currentMonthShifts.map((shift) => shift.classname))
    );

    setSubjectNames(uniqueSubjectNames); // 科目名リストを状態に保存
    setIsExportDialogOpen(true); // ダイアログを開く
  };

  // 科目名をクリックしたときの処理
  const handleExportSubject = (selectedSubject: string) => {
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

  // ダイアログを閉じる
  const handleCloseExportDialog = () => {
    setIsExportDialogOpen(false);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="flex justify-between items-center mb-4 w-full max-w-[1200px]">
        <button
          onClick={handlePrevMonth}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          前の月
        </button>
        <h2 className="text-2xl font-bold">
          {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
        </h2>
        <button
          onClick={handleNextMonth}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          次の月
        </button>
      </div>
      <div className="grid grid-cols-7 gap-4 text-center w-full max-w-[1200px]">
        {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
          <div key={day} className="font-bold text-lg">
            {day}
          </div>
        ))}
        {Array.from({ length: startOfMonth.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {daysInMonth.map((date) => {
          const isSunday = date.getDay() === 0; // 日曜日
          const isSaturday = date.getDay() === 6; // 土曜日
          const isToday = date.toDateString() === today.toDateString(); // 今日の日付

          // その日に追加されたシフトの数を計算
          const shiftCount = shiftData.filter(
            (shift) => shift.month === date.getMonth() + 1 && shift.day === date.getDate()
          ).length;

          return (
            <div
              key={date.toISOString()}
              onClick={() => handleDateClick(date)} // 日付クリック時の処理
              className={`p-6 rounded text-lg cursor-pointer relative ${
                selectedDate?.toDateString() === date.toDateString()
                  ? "bg-green-500 text-white" // 選択された日付のスタイル
                  : isToday
                  ? "border-2 border-blue-500" + (isSunday || isSaturday ? " bg-red-100 dark:bg-red-200" : "") // 今日の日付のスタイル（枠線と土日の背景色）
                  : isSunday || isSaturday
                  ? "bg-red-100 dark:bg-red-200" // 土日のスタイル（薄い赤色）
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              {date.getDate()}
              {shiftCount > 0 && (
                <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {shiftCount}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* shiftData を表示するボタン */}
      <button
        onClick={handleShowShiftData}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        シフトデータを表示
      </button>

      {/* userInfo を表示するボタン */}
      <button
        onClick={() => alert(JSON.stringify(userInfo, null, 2))} // userInfoをアラート表示
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        ユーザ情報を表示
      </button>

      {/* シフト出力ボタン */}
      <button
        onClick={handleOpenExportDialog}
        className="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        シフト出力
      </button>

      {/* シフト出力ダイアログ */}
      {isExportDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">科目名を選択してください</h2>
            <ul>
              {subjectNames.map((subject, index) => (
                <li
                  key={index}
                  onClick={() => handleExportSubject(subject)} // 科目名クリック時の処理
                  className="mb-2 p-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
                >
                  {subject}
                </li>
              ))}
            </ul>
            <button
              onClick={handleCloseExportDialog}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* ダイアログ */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">仕事リスト</h2>
            <h3 className="text-lg font-semibold mb-2">-- 追加 --</h3>
            <ul>
              {shiftData
                .filter(
                  (shift) =>
                    selectedDate &&
                    shift.month === selectedDate.getMonth() + 1 &&
                    shift.day === selectedDate.getDate()
                )
                .map((shift, index) => (
                  <li key={index} className="mb-2 flex justify-between">
                    {shift.starttime}~{shift.endtime} {shift.label}
                    <button
                      onClick={() => handleRemoveShift(shift.id, shift.month, shift.day)} // 正しい引数を渡す
                      className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      削除
                    </button>
                  </li>
                ))}
            </ul>
            <h3 className="text-lg font-semibold mt-4 mb-2">-- 一覧 --</h3>
            <ul>
              {filteredWorkData
                .filter(
                  (work) =>
                    !shiftData.some(
                      (shift) =>
                        shift.classname === work.classname &&
                        shift.starttime === work.starttime &&
                        shift.endtime === work.endtime &&
                        shift.dayofweek === work.dayofweek &&
                        selectedDate && shift.month === selectedDate.getMonth() + 1 &&
                        shift.day === selectedDate?.getDate()
                    )
                )
                .map((work, index) => (
                  <li key={index} className="mb-2 flex justify-between">
                    {work.starttime}~{work.endtime} {work.label}
                    <button
                      onClick={() => handleAddShift(work)}
                      className="ml-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      追加
                    </button>
                  </li>
                ))}
            </ul>
            <button
              onClick={closeDialog}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}