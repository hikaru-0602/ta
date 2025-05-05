"use client";

import { useEffect, useState } from "react";
import holidays from "../../data/holidays.json";
import AddShiftDialog, { handleAddShift, handleRemoveShift } from "./AddShiftDialog";
import EditShiftDialog, {handleEditShift, handleSaveEditedShift} from "./EditShiftDialog";
import ExportDialog, {handleCloseExportDialog, handleExportSubject} from "./ExportDialog";
import { getYearAndMonth } from "./ExcelData";

export default function Calendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // 選択された日付を管理
  const [workData, setWorkData] = useState<any[]>([]);
  const [filteredWorkData, setFilteredWorkData] = useState<any[]>([]); // フィルタリングされたデータ
  const [shiftData, setShiftData] = useState<any[]>([]); // 初期値を空配列に設定
  const [isDialogOpen, setIsDialogOpen] = useState(false); // ダイアログの状態
  const [userInfo, setUserInfo] = useState<any>(null); // ユーザ情報を管理
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false); // ダイアログの状態
  const [subjectNames, setSubjectNames] = useState<string[]>([]); // 科目名リスト
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // 編集ダイアログの状態
  const [editingShift, setEditingShift] = useState<any>(null); // 編集対象のシフト

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const daysInMonth = Array.from(
    { length: endOfMonth.getDate() },
    (_, i) => new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
  );

  const isHoliday = (date: Date): boolean => {
    const formattedDate = `${date.getMonth() + 1}-${date.getDate()}`;
    return holidays.some((holiday) => holiday.date === formattedDate);
  };


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
    const holiday = isHoliday(date); // 休日判定

    if (holiday) {
      alert("この日は休みのため、操作できません。");
      return; // 処理を終了
    }

    setSelectedDate(date); // クリックされた日付を選択
    setFilteredWorkData(workData); // フィルタリングされたデータを保存
    setIsDialogOpen(true); // ダイアログを開く

    console.log(`選択された日付: ${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`);
  };

  const closeDialog = () => {
    setIsDialogOpen(false); // ダイアログを閉じる
  };

  //時間をDateオブジェクトに変換する関数
  const parseTime = (time: string): Date => {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  //シフトデータを表示するボタンのクリックハンドラー
  const handleShowShiftData = () => {
    alert(JSON.stringify(shiftData, null, 2)); // shiftData をアラートで表示
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
          const holiday = isHoliday(date); // 休日判定

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
                  ? "border-2 border-blue-500" + (isSunday || isSaturday || holiday ? " bg-red-100 dark:bg-red-200" : "") // 今日の日付のスタイル（枠線と土日の背景色）
                  : isSunday || isSaturday || holiday
                  ? "bg-red-100 dark:bg-red-200" // 土日または休日のスタイル（薄い赤色）
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

      <button onClick={getYearAndMonth} style={{ marginBottom: "16px" }}>
        和暦変換して配列を更新
      </button>

      {/* ダイアログのレンダリング部分 */}
      <AddShiftDialog
        isDialogOpen={isDialogOpen}
        selectedDate={selectedDate}
        shiftData={shiftData}
        filteredWorkData={filteredWorkData}
        handleAddShift={handleAddShift}
        handleEditShift={handleEditShift}
        handleRemoveShift={handleRemoveShift}
        closeDialog={closeDialog}
        setShiftData={setShiftData}
        saveShiftsToLocalStorage={saveShiftsToLocalStorage}
        setEditingShift={setEditingShift}
        setIsEditDialogOpen={setIsEditDialogOpen}
      />

      <EditShiftDialog
        isEditDialogOpen={isEditDialogOpen}
        editingShift={editingShift}
        setEditingShift={setEditingShift}
        handleSaveEditedShift={handleSaveEditedShift}
        setIsEditDialogOpen={setIsEditDialogOpen}
        shiftData={shiftData}
        setShiftData={setShiftData}
        saveShiftsToLocalStorage={saveShiftsToLocalStorage}
      />

      <ExportDialog
        isExportDialogOpen={isExportDialogOpen}
        subjectNames={subjectNames}
        handleExportSubject={handleExportSubject}
        handleCloseExportDialog={handleCloseExportDialog}
        shiftData={shiftData}
        currentDate={currentDate}
        setIsExportDialogOpen={setIsExportDialogOpen}
      />
    </div>
  );
}
