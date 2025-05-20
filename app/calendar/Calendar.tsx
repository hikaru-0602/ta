"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Next.jsのルーターをインポート
import AddShiftDialog, {
  handleAddShift,
  handleRemoveShift,
} from "./add_shift_dialog";
import EditShiftDialog, {
  handleEditShift,
  handleSaveEditedShift,
} from "./edit_shift_dialog";
import ExportDialog, {
  handleCloseExportDialog,
  handleExportSubject,
} from "./export_dialog";
import { useAuth } from "../firebase/context/auth";
import { Shift, UserInfo, WorkData } from "../types"; // Shift型をインポート

export default function Calendar() {
  const router = useRouter(); // ルーターを初期化
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // 選択された日付を管理
  const [workData, setWorkData] = useState<WorkData[]>([]);
  const [filteredWorkData, setFilteredWorkData] = useState<WorkData[]>([]); // フィルタリングされたデータ
  const [shiftData, setShiftData] = useState<Shift[]>([]); // 初期値を空配列に設定
  const [isDialogOpen, setIsDialogOpen] = useState(false); // ダイアログの状態
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null); // ユーザ情報を管理
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false); // ダイアログの状態
  const [subjectNames, setSubjectNames] = useState<string[]>([]); // 科目名リスト
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // 編集ダイアログの状態
  const [editingShift, setEditingShift] = useState<Shift | null>(null); // 編集対象のシフト
  const [holidays, setHolidays] = useState<{ [date: string]: string }>({});
  const user = useAuth();

  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const daysInMonth = Array.from(
    { length: endOfMonth.getDate() },
    (_, i) => new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
  );

  const isHoliday = (date: Date): boolean => {
    // ローカルタイムゾーンの日付を YYYY-MM-DD 形式に変換
    const formattedDate = date
      .toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-"); // "YYYY/MM/DD" を "YYYY-MM-DD" に変換

    return holidays.hasOwnProperty(formattedDate);
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

    const fetchHolidays = async () => {
      try {
        const response = await fetch(
          "https://holidays-jp.github.io/api/v1/date.json"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch holidays");
        }
        const data = await response.json();
        setHolidays(data); // 祝日データを状態に保存
      } catch (error) {
        console.error("Error fetching holidays:", error);
      }
    };

    fetchHolidays();
  }, []);

  const saveShiftsToLocalStorage = (shifts: Shift[]) => {
    localStorage.setItem("shiftData", JSON.stringify(shifts));
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
    setSelectedDate(null); // 月を変更したら選択をリセット
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
    setSelectedDate(null); // 月を変更したら選択をリセット
  };

  const handleDateClick = (date: Date) => {
    if (user === null) {
      alert("ログインしてください。");
      router.push("/setting"); // 仕事ページにリダイレクト
      return;
    }

    const holiday = isHoliday(date); // 休日判定
    const isSunday = date.getDay() === 0; // 日曜日
    const isSaturday = date.getDay() === 6; // 土曜日

    if (holiday || isSunday || isSaturday) {
      alert("この日は休みのため、操作できません。");
      return; // 処理を終了
    }

    const savedWorkData = localStorage.getItem("workData");
    const parsedWorkData = savedWorkData ? JSON.parse(savedWorkData) : [];
    setWorkData(parsedWorkData);
    setSelectedDate(date); // クリックされた日付を選択
    setFilteredWorkData(workData); // フィルタリングされたデータを保存
    setIsDialogOpen(true); // ダイアログを開く
  };

  const closeDialog = () => {
    setIsDialogOpen(false); // ダイアログを閉じる
  };

  // シフト出力ボタンのクリックハンドラー
  const handleOpenExportDialog = () => {
    if (user === null) {
      alert("ログインしてください。");
      if (
        !userInfo || // userInfoがnullの場合をチェック
        userInfo.id === "" ||
        userInfo.name === "" ||
        userInfo.grade === "" ||
        userInfo.name_kana === ""
      ) {
        alert("ユーザ情報を登録してください");
      }
      router.push("/setting"); // 仕事ページにリダイレクト
      return;
    }

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
    <div className="w-full h-full flex flex-col items-center justify-center">
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
      <div className="grid grid-cols-7 gap-1 text-center">
        {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
          <div key={day} className="font-bold text-lg">
            {day}
          </div>
        ))}
        {Array.from({ length: startOfMonth.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {daysInMonth.map((date) => {
          const isSunday = date.getDay() === 0;
          const isSaturday = date.getDay() === 6;
          const isToday = date.toDateString() === today.toDateString();
          const holiday = isHoliday(date);

          const shiftCount = shiftData.filter(
            (shift) =>
              shift.month === date.getMonth() + 1 &&
              shift.day === date.getDate()
          ).length;

          return (
            <div
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className={`p-6 rounded text-lg cursor-pointer relative ${
                selectedDate?.toDateString() === date.toDateString()
                  ? "bg-green-500 text-white"
                  : isToday
                  ? "border-2 border-blue-500" +
                    (isSunday || isSaturday || holiday
                      ? " bg-red-100 dark:bg-red-200"
                      : "")
                  : isSunday || isSaturday || holiday
                  ? "bg-red-100 dark:bg-red-200"
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              {date.getDate()}
              {shiftCount > 0 && user !== null && (
                <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {shiftCount}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* シフト出力ボタン */}
      <button
        onClick={handleOpenExportDialog}
        className="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        Excel出力
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
