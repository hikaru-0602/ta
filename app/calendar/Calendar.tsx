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
import { useAuth } from "../firebase/context/auth";
import { Shift, WorkData } from "../types";
import { useUserInfo } from "../setting/user_setting";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/lib/firebase";
import { useAlert } from "../components/AlertProvider";
import MonthlyStats from "../components/MonthlyStats";
import { Button } from "@/components/ui/button";

export default function Calendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); //選択された日付を管理
  const [workData, setWorkData] = useState<WorkData[]>([]);
  const [filteredWorkData, setFilteredWorkData] = useState<WorkData[]>([]); //フィルタリングされたデータ
  const [shiftData, setShiftData] = useState<Shift[]>([]); //初期値を空配列に設定
  const [isDialogOpen, setIsDialogOpen] = useState(false); //ダイアログの状態
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); //編集ダイアログの状態
  const [editingShift, setEditingShift] = useState<Shift | null>(null); //編集対象のシフト
  const [holidays, setHolidays] = useState<{ [date: string]: string }>({});
  const user = useAuth();
  const { showAlert } = useAlert();

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
  const saveShiftsToLocalStorage = () => {
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
      showAlert("認証エラー", "ログインしてください。");
      return;
    }

    const holiday = isHoliday(date); //休日判定
    const isSunday = date.getDay() === 0; //日曜日
    const isSaturday = date.getDay() === 6; //土曜日

    if (holiday || isSunday || isSaturday) {
      showAlert("操作制限", "この日は休みのため、操作できません。");
      return; //処理を終了
    }

    setSelectedDate(date); //クリックされた日付を選択
    setFilteredWorkData(workData); //フィルタリングされたデータを保存
    setIsDialogOpen(true); //ダイアログを開く
  };

  const closeDialog = () => {
    setIsDialogOpen(false); //ダイアログを閉じる
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center padding lg:ml-20 mr-20">
      <div className="flex items-center justify-center mb-4 w-full max-w-[1200px]">
        <div className="flex items-center space-x-4">
          <Button
            onClick={handlePrevMonth}
            variant="secondary"
          >
            前の月
          </Button>
          <h2 className="text-2xl font-bold text-foreground">
            {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
          </h2>
          <Button
            onClick={handleNextMonth}
            variant="secondary"
          >
            次の月
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center w-full max-w-[1200px]">
        {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
          <div key={day} className="font-bold text-2xl text-foreground">
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
              className={`p-6 rounded-md text-xl cursor-pointer relative hover:bg-accent hover:text-accent-foreground transition-colors ${
                isToday
                  ? "border-2 border-ring" +
                    (isSunday || isSaturday || holiday
                      ? " bg-destructive/10 text-destructive"
                      : " bg-card text-card-foreground")
                  : isSunday || isSaturday || holiday
                  ? "bg-destructive/10 text-destructive"
                  : "bg-card text-card-foreground border border-border"
              }`}
            >
              {date.getDate()}
              {shiftCount > 0 && user && (
                <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {shiftCount}
                </div>
              )}
            </div>
          );
        })}
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

      {/* 月間統計コンポーネントを追加 */}
      <MonthlyStats currentDate={currentDate} shiftData={shiftData} />
    </div>
  );
}
