"use client";

import { useEffect, useState } from "react";
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
import { Shift, WorkData } from "../types";
import { useUserInfo } from "../setting/user_setting";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/lib/firebase";

export default function Calendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); //選択された日付を管理
  const [workData, setWorkData] = useState<WorkData[]>([]);
  const [filteredWorkData, setFilteredWorkData] = useState<WorkData[]>([]); //フィルタリングされたデータ
  const [shiftData, setShiftData] = useState<Shift[]>([]); //初期値を空配列に設定
  const [isDialogOpen, setIsDialogOpen] = useState(false); //ダイアログの状態
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false); //ダイアログの状態
  const [subjectNames, setSubjectNames] = useState<string[]>([]); //科目名リスト
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); //編集ダイアログの状態
  const [editingShift, setEditingShift] = useState<Shift | null>(null); //編集対象のシフト
  const [holidays, setHolidays] = useState<{ [date: string]: string }>({});
  const user = useAuth();

  const { loadUserInfoFromLocalStorage } = useUserInfo();

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

  // 週の開始日（月曜日）を取得する関数
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 月曜日を週の開始とする
    return new Date(d.setDate(diff));
  };

  // 週の終了日（日曜日）を取得する関数
  const getWeekEnd = (date: Date): Date => {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  };

  // 時刻文字列（HH:MM）を分に変換する関数
  const timeToMinutes = (time: string): number => {
    if (!time || !time.includes(':')) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return 0;
    return hours * 60 + minutes;
  };

  // 分を時間:分の形式に変換する関数
  const minutesToTimeFormat = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}時間${minutes}分`;
  };

  // シフト1件の実働時間を計算する関数
  const calculateShiftWorkTime = (shift: Shift): number => {
    const startMinutes = timeToMinutes(shift.starttime);
    const endMinutes = timeToMinutes(shift.endtime);
    const breakMinutes = shift.breaktime || 0;

    // 実働時間 = 終了時刻 - 開始時刻 - 休憩時間
    const workTimeMinutes = endMinutes - startMinutes - breakMinutes;

    console.log(`シフト計算: ${shift.starttime}-${shift.endtime}, 休憩:${breakMinutes}分 → 実働:${workTimeMinutes}分`);

    return Math.max(0, workTimeMinutes); // 負の値を防ぐ
  };

  // 週の合計勤務時間を計算する関数
  const calculateWeeklyWorkTime = (date: Date): { totalMinutes: number; formattedTime: string; weekRange: string; details: string[] } => {
    const weekStart = getWeekStart(date);
    const weekEnd = getWeekEnd(date);

    // 週の範囲内のシフトデータを取得
    const weeklyShifts = shiftData.filter((shift) => {
      const shiftDate = new Date(shift.year, shift.month - 1, shift.day);
      return shiftDate >= weekStart && shiftDate <= weekEnd;
    });

    let totalMinutes = 0;
    const details: string[] = [];

    weeklyShifts.forEach((shift) => {
      const workTimeMinutes = calculateShiftWorkTime(shift);
      totalMinutes += workTimeMinutes;

      const formattedWorkTime = minutesToTimeFormat(workTimeMinutes);
      details.push(`${shift.month}/${shift.day} ${shift.starttime}-${shift.endtime} (休憩${shift.breaktime || 0}分) → ${formattedWorkTime}`);
    });

    const weekRangeStr = `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;

    return {
      totalMinutes,
      formattedTime: minutesToTimeFormat(totalMinutes),
      weekRange: weekRangeStr,
      details
    };
  };

  // 日付をタップして週の勤務時間を表示する関数
  const handleShowWeeklyWorkTime = (date: Date) => {
    if (!user) {
      alert("ログインしてください。");
      return;
    }

    const { formattedTime, weekRange, details } = calculateWeeklyWorkTime(date);

    let message = `週の合計勤務時間\n期間: ${weekRange}\n合計: ${formattedTime}`;

    if (details.length > 0) {
      message += '\n\n詳細:\n' + details.join('\n');
    } else {
      message += '\n\nこの週にシフトはありません。';
    }

    alert(message);
  };

  const isHoliday = (date: Date): boolean => {
    //ローカルタイムゾーンの日付を YYYY-MM-DD 形式に変換
    const formattedDate = date
      .toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-"); //"YYYY/MM/DD" を "YYYY-MM-DD" に変換

    return holidays.hasOwnProperty(formattedDate);
  };
  const uid = getAuth().currentUser?.uid;

  // 認証状態を監視してからFirestoreからシフトデータをリアルタイムで取得
  useEffect(() => {
    const auth = getAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // ユーザーがログインしている場合のみデータ監視を開始
        const unsubscribeSnapshot = onSnapshot(
          collection(db, `users/${user.uid}/shifts`),
          (snapshot) => {
            const shifts = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: Number(doc.data().id) || Number(doc.id)
            })) as Shift[];
            setShiftData(shifts);
            console.log("シフトデータをFirestoreから取得しました。", shifts);
          },
          (error) => {
            console.error("シフトデータの監視エラー:", error);
          }
        );

        // 認証状態が変更されたときにFirestore監視を停止
        return unsubscribeSnapshot;
      } else {
        // ログアウト時は初期状態に戻す
        setShiftData([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 認証状態を監視してからFirestoreから業務データをリアルタイムで取得
  useEffect(() => {
    const auth = getAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // ユーザーがログインしている場合のみデータ監視を開始
        const unsubscribeSnapshot = onSnapshot(
          collection(db, `users/${user.uid}/works`),
          (snapshot) => {
            const works = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: Number(doc.data().id) || Number(doc.id)
            })) as WorkData[];
            setWorkData(works);
          },
          (error) => {
            console.error("業務データの監視エラー:", error);
          }
        );

        // 認証状態が変更されたときにFirestore監視を停止
        return unsubscribeSnapshot;
      } else {
        // ログアウト時は初期状態に戻す
        setWorkData([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // 祝日データ取得
    const fetchHolidays = async () => {
      try {
        const response = await fetch(
          "https://holidays-jp.github.io/api/v1/date.json"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch holidays");
        }
        const data = await response.json();
        setHolidays(data);
      } catch (error) {
        console.error("Error fetching holidays:", error);
      }
    };
    fetchHolidays();
  }, []);

  useEffect(() => {
    //月が変更されたときに選択日をリセット
    loadUserInfoFromLocalStorage(); //ユーザー情報をローカルストレージから読み込む
  }, [workData]); // loadUserInfoFromLocalStorageの依存関係を削除

  // ローカルストレージ保存関数（互換性のため残すが、実際はFirestoreで自動保存）
  const saveShiftsToLocalStorage = (shifts: Shift[]) => {
    // リアルタイム監視により自動で保存されるため、何もしない
    // 既存コードとの互換性のため関数は残す
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
    setSelectedDate(null); //月を変更したら選択をリセット
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
    setSelectedDate(null); //月を変更したら選択をリセット
  };

  const handleDateClick = (date: Date) => {
    if (!user) {
      alert("ログインしてください。");
      return;
    }

    const holiday = isHoliday(date); //休日判定
    const isSunday = date.getDay() === 0; //日曜日
    const isSaturday = date.getDay() === 6; //土曜日

    if (holiday || isSunday || isSaturday) {
      alert("この日は休みのため、操作できません。");
      return; //処理を終了
    }

    setSelectedDate(date); //クリックされた日付を選択
    setFilteredWorkData(workData); //フィルタリングされたデータを保存
    setIsDialogOpen(true); //ダイアログを開く
  };

  const closeDialog = () => {
    setIsDialogOpen(false); //ダイアログを閉じる
  };

  //シフト出力ボタンのクリックハンドラー
  const handleOpenExportDialog = async () => {
    if (!user) {
      alert("ユーザ情報を登録してください");
      return;
    }

    // Firestoreからユーザー情報を取得
    const uid = getAuth().currentUser?.uid;
    if (!uid) {
      alert("ログインしてください");
      return;
    }

    try {
      const userRef = doc(db, `users/${uid}`);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert("ユーザ情報を登録してください");
        return;
      }

      const userData = userSnap.data();

      if (
        !userData ||
        !userData.id || //falsy値（空文字、null、undefined、0など）を弾く
        !userData.name ||
        !userData.value ||
        !userData.name_kana
      ) {
        alert("ユーザ情報を登録してください");
        return;
      }

      //現在の月のシフトデータを取得
      const currentMonthShifts = shiftData.filter(
        (shift) =>
          shift.year === currentDate.getFullYear() &&
          shift.month === currentDate.getMonth() + 1
      );

      //科目名のリストを取得（重複を排除）
      const uniqueSubjectNames = Array.from(
        new Set(currentMonthShifts.map((shift) => shift.classname))
      );

      setSubjectNames(uniqueSubjectNames); //科目名リストを状態に保存
      setIsExportDialogOpen(true); //ダイアログを開く
    } catch (error) {
      console.error("エラーが発生しました:", error);
      alert("エラーが発生しました。後でもう一度お試しください。");
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center padding lg:ml-20 mr-20">
      <div className="flex items-center justify-center mb-4 w-full max-w-[1200px] space-x-4">
        <button
          onClick={handlePrevMonth}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          前の月
        </button>
        <h2 className="text-2xl font-bold dark:text-white">
          {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
        </h2>
        <button
          onClick={handleNextMonth}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          次の月
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center w-full max-w-[1200px]">
        {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
          <div key={day} className="font-bold text-2xl">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center w-full max-w-[1200px] mt-4">
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
              shift.year === date.getFullYear() &&
              shift.month === date.getMonth() + 1 &&
              shift.day === date.getDate()
          ).length;

          return (
            <div
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className={`p-6 rounded text-xl cursor-pointer relative hover:bg-gray-300 dark:bg-gray-600 ${
                selectedDate?.toDateString() === date.toDateString()
                  ? "bg-green-500 text-white"
                  : isToday
                  ? "border-2 border-blue-500" +
                    (isSunday || isSaturday || holiday
                      ? " bg-red-100 dark:bg-red-200"
                      : "")
                  : isSunday || isSaturday || holiday
                  ? "bg-red-100 dark:bg-red-200 text-black"
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              {date.getDate()}
              {shiftCount > 0 && user && (
                <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {shiftCount}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ボタンエリア */}
      <div className="flex space-x-4 mt-6">
        <button
          onClick={handleOpenExportDialog}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition font-bold"
        >
          Excel出力
        </button>
      </div>

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
