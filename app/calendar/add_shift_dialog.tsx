import React, { useState } from "react";
import { WorkData, Shift } from "../types"; //業務データの型をインポート
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/lib/firebase";
import { getAuth } from "firebase/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAlert } from "../components/AlertProvider";

//時間をDateオブジェクトに変換する関数
export const parseTime = (time: string): Date => {
  const [hours, minutes] = time.split(":").map(Number); //時間と分を分割して数値に変換
  const date = new Date(); //現在の日付を基準に新しいDateオブジェクトを作成
  date.setHours(hours, minutes, 0, 0); //時間と分を設定
  return date; //変換したDateオブジェクトを返す
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

  return Math.max(0, workTimeMinutes); // 負の値を防ぐ
};

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

// 週の合計勤務時間を計算する関数（新しいシフトを含む）
const calculateWeeklyWorkTimeWithNewShift = (
  selectedDate: Date,
  shiftData: Shift[],
  newWork: WorkData
): { totalMinutes: number; formattedTime: string } => {
  const weekStart = getWeekStart(selectedDate);
  const weekEnd = getWeekEnd(selectedDate);

  // 週の範囲内の既存シフトデータを取得
  const weeklyShifts = shiftData.filter((shift) => {
    const shiftDate = new Date(shift.year, shift.month - 1, shift.day);
    return shiftDate >= weekStart && shiftDate <= weekEnd;
  });

  // 既存シフトの合計時間を計算
  let totalMinutes = 0;
  weeklyShifts.forEach((shift) => {
    totalMinutes += calculateShiftWorkTime(shift);
  });

  // 新しいシフトの実働時間を計算
  const newShiftStartMinutes = timeToMinutes(newWork.starttime);
  const newShiftEndMinutes = timeToMinutes(newWork.endtime);
  const newShiftBreakMinutes = newWork.breaktime || 0;
  const newShiftWorkTime = Math.max(0, newShiftEndMinutes - newShiftStartMinutes - newShiftBreakMinutes);

  // 新しいシフトを含めた合計時間
  totalMinutes += newShiftWorkTime;

  return {
    totalMinutes,
    formattedTime: minutesToTimeFormat(totalMinutes)
  };
};

export const saveWorkDataToFirestore = async (uid: string, shift: Shift) => {
  const ref = doc(
    db,
    `users/${uid}/shifts/${shift.year}_${shift.month}_${shift.day}_${shift.id}`
  );
  await setDoc(ref, shift, { merge: true });
};

const deleteWorkDataFromFirestore = async (
  uid: string,
  year: number,
  month: number,
  day: number,
  id: number
) => {
  const ref = doc(db, `users/${uid}/shifts/${year}_${month}_${day}_${id}`);
  await deleteDoc(ref);
};

//シフトを追加する関数
export const handleAddShift = (
  work: WorkData, //追加するシフトデータ
  selectedDate: Date | null, //選択された日付
  shiftData: Shift[], //既存のシフトデータ
  setShiftData: (shifts: Shift[]) => void, //シフトデータを更新する関数
  saveShiftsToLocalStorage: (shifts: Shift[]) => void //シフトデータをlocalStorageに保存する関数（互換性のため残す）
) => {
  if (!selectedDate) return; //日付が選択されていない場合は処理を終了

  // 週の勤務時間チェック（8時間制限）
  const { totalMinutes, formattedTime } = calculateWeeklyWorkTimeWithNewShift(
    selectedDate,
    shiftData,
    work
  );

  if (totalMinutes > 8 * 60) { // 8時間 = 480分
    // Note: この関数はコンポーネント外で定義されているため、alertは使用しません
    // 実際のアラート表示はhandleAddShiftWithAlert()で行われます
    // alert(`週の勤務時間が8時間を超えます。\n現在の週の合計予定時間: ${formattedTime}\nシフトを追加できません。`);
    return; //処理を終了
  }

  //選択された日付のシフトを取得
  const shiftsForDate: Shift[] = shiftData.filter(
    (shift) =>
      shift.year === selectedDate.getFullYear() &&
      shift.month === selectedDate.getMonth() + 1 &&
      shift.day === selectedDate.getDate()
  );

  //新しいシフトが既存のシフトと時間が重複しているか確認
  const isOverlapping = shiftsForDate.some((shift) => {
    const newStart = parseTime(work.starttime); //新しいシフトの開始時間
    const newEnd = parseTime(work.endtime); //新しいシフトの終了時間
    const existingStart = parseTime(shift.starttime); //既存シフトの開始時間
    const existingEnd = parseTime(shift.endtime); //既存シフトの終了時間

    //時間が重複しているか判定
    return (
      (newStart >= existingStart && newStart < existingEnd) || //新しい開始時間が既存の範囲内
      (newEnd > existingStart && newEnd <= existingEnd) || //新しい終了時間が既存の範囲内
      (newStart <= existingStart && newEnd >= existingEnd) //新しいシフトが既存の範囲を完全に包含
    );
  });

  if (isOverlapping) {
    // Note: この関数はコンポーネント外で定義されているため、alertは使用しません
    // 実際のアラート表示はhandleAddShiftWithAlert()で行われます
    // alert("このシフトは既存のシフトと時間が重複しています。");
    return; //処理を終了
  }

  //1日のシフト数が2件以上の場合はエラー
  const shiftCountForDate = shiftsForDate.length;
  if (shiftCountForDate >= 2) {
    // Note: この関数はコンポーネント外で定義されているため、alertは使用しません
    // 実際のアラート表示はhandleAddShiftWithAlert()で行われます
    // alert("働き過ぎ");
    return; //処理を終了
  }

  //新しいシフトデータを作成
  const newShift: Shift = {
    id: work.id, // 必須プロパティを明示的に設定
    year: selectedDate.getFullYear(), //年を設定
    month: selectedDate.getMonth() + 1, //月を設定
    day: selectedDate.getDate(), //日を設定
    label: work.label, //ラベル名を設定
    classname: work.classname,
    category: work.category,
    starttime: work.starttime,
    endtime: work.endtime,
    breaktime: work.breaktime,
    teacher: work.teacher,
  };

  //シフトデータを更新
  const uid = getAuth().currentUser?.uid;
  console.log("uid", uid);
  if (uid) {
    console.log("Firestoreにシフトデータを保存します。", newShift);
    saveWorkDataToFirestore(uid, newShift); //Firestoreに保存
  }
  const updatedShifts = [...shiftData, newShift];
  setShiftData(updatedShifts); //状態を更新
  // リアルタイム監視により自動保存されるため、localStorageへの保存は不要
};

//シフトを削除する関数
export const handleRemoveShift = (
  id: number, //削除するシフトのID
  year: number, //削除するシフトの年
  month: number, //削除するシフトの月
  day: number, //削除するシフトの日
  shiftData: Shift[], //既存のシフトデータ
  setShiftData: (shifts: Shift[]) => void, //シフトデータを更新する関数
  saveShiftsToLocalStorage: (shifts: Shift[]) => void //シフトデータをlocalStorageに保存する関数（互換性のため残す）
) => {
  //指定されたシフトを除外した新しいシフトデータを作成
  const updatedShifts = shiftData.filter(
    (shift) =>
      !(
        shift.id === id &&
        shift.year === year &&
        shift.month === month &&
        shift.day === day
      )
  );

  const uid = getAuth().currentUser?.uid;
  if (uid) {
    deleteWorkDataFromFirestore(uid, year, month, day, id);
  }

  setShiftData(updatedShifts); //状態を更新
  // リアルタイム監視により自動保存されるため、localStorageへの保存は不要
};

interface AddShiftDialogProps {
  isDialogOpen: boolean;
  selectedDate: Date | null;
  shiftData: Shift[];
  filteredWorkData: WorkData[];
  handleAddShift: (
    work: WorkData,
    selectedDate: Date | null,
    shiftData: Shift[],
    setShiftData: (shifts: Shift[]) => void,
    saveShiftsToLocalStorage: (shifts: Shift[]) => void
  ) => void;
  handleEditShift: (
    shift: Shift,
    setEditingShift: (shift: Shift) => void,
    setIsEditDialogOpen: (isOpen: boolean) => void
  ) => void;
  handleRemoveShift: (
    id: number,
    year: number,
    month: number,
    day: number,
    shiftData: Shift[],
    setShiftData: (shifts: Shift[]) => void,
    saveShiftsToLocalStorage: (shifts: Shift[]) => void
  ) => void;
  closeDialog: () => void;
  setShiftData: (shifts: Shift[]) => void;
  saveShiftsToLocalStorage: (shifts: Shift[]) => void;
  setEditingShift: (shift: Shift) => void;
  setIsEditDialogOpen: (isOpen: boolean) => void;
}

export default function AddShiftDialog({
  isDialogOpen,
  selectedDate,
  shiftData,
  filteredWorkData,
  handleAddShift,
  handleEditShift,
  handleRemoveShift,
  closeDialog,
  setShiftData,
  saveShiftsToLocalStorage,
  setEditingShift,
  setIsEditDialogOpen,
}: AddShiftDialogProps) {
  const { showAlert } = useAlert();

  // バリデーション付きのシフト追加関数
  const handleAddShiftWithAlert = (work: WorkData) => {
    if (!selectedDate) return;

    // 週の勤務時間チェック（8時間制限）
    const { totalMinutes, formattedTime } = calculateWeeklyWorkTimeWithNewShift(
      selectedDate,
      shiftData,
      work
    );

    if (totalMinutes > 8 * 60) { // 8時間 = 480分
      showAlert("勤務時間制限", `週の勤務時間が8時間を超えます。\n現在の週の合計予定時間: ${formattedTime}\nシフトを追加できません。`);
      return;
    }

    //選択された日付のシフトを取得
    const shiftsForDate: Shift[] = shiftData.filter(
      (shift) =>
        shift.year === selectedDate.getFullYear() &&
        shift.month === selectedDate.getMonth() + 1 &&
        shift.day === selectedDate.getDate()
    );

    //新しいシフトが既存のシフトと時間が重複しているか確認
    const isOverlapping = shiftsForDate.some((shift) => {
      const newStart = parseTime(work.starttime);
      const newEnd = parseTime(work.endtime);
      const existingStart = parseTime(shift.starttime);
      const existingEnd = parseTime(shift.endtime);

      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });

    if (isOverlapping) {
      showAlert("時間重複エラー", "このシフトは既存のシフトと時間が重複しています。");
      return;
    }

    //1日のシフト数が2件以上の場合はエラー
    const shiftCountForDate = shiftsForDate.length;
    if (shiftCountForDate >= 2) {
      showAlert("シフト数制限", "働き過ぎ");
      return;
    }

    // エラーがない場合は元のhandleAddShift関数を呼び出し
    handleAddShift(
      work,
      selectedDate,
      shiftData,
      setShiftData,
      saveShiftsToLocalStorage
    );
  };

  const backDialog = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeDialog();
    }
  };

  return (
    <>
      {/* メインダイアログ */}
      {isDialogOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={backDialog}
        >
          <div className="bg-card text-card-foreground p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-xs sm:max-w-md border border-border">
            <h2 className="text-xl font-bold mb-4 text-foreground">仕事リスト</h2>
            <h3 className="text-lg font-semibold mb-2 text-foreground">-- 追加 --</h3>
            <ul>
              {shiftData
                .filter(
                  (shift) =>
                    selectedDate &&
                    shift.year === selectedDate.getFullYear() &&
                    shift.month === selectedDate.getMonth() + 1 &&
                    shift.day === selectedDate.getDate()
                )
                .map((shift, index) => (
                  <li
                    key={index}
                    className="mb-2 flex justify-between items-center"
                  >
                    <div className="flex-1 mr-2 min-w-0">
                      <span className="block text-sm text-muted-foreground">
                        {shift.starttime}~{shift.endtime}
                      </span>
                      <span
                        className="block text-sm font-medium truncate text-foreground"
                        title={shift.label || "（ラベルなし）"}
                      >
                        {shift.label || "（ラベルなし）"}
                      </span>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                      <button
                        onClick={() =>
                          handleEditShift(
                            shift,
                            setEditingShift,
                            setIsEditDialogOpen
                          )
                        }
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 text-xs transition-colors"
                      >
                        編集
                      </button>
                      <button
                        onClick={() =>
                          handleRemoveShift(
                            shift.id,
                            shift.year,
                            shift.month,
                            shift.day,
                            shiftData,
                            setShiftData,
                            saveShiftsToLocalStorage
                          )
                        }
                        className="px-2 py-1 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 text-xs transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
            <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground">-- 一覧 --</h3>
            <ul>
              {filteredWorkData
                .filter(
                  (work) =>
                    !shiftData.some(
                      (shift) =>
                        shift.label === work.label &&
                        shift.id === work.id &&
                        selectedDate &&
                        shift.year === selectedDate.getFullYear() &&
                        shift.month === selectedDate.getMonth() + 1 &&
                        shift.day === selectedDate.getDate()
                    )
                )
                .map((work, index) => (
                  <li key={index} className="mb-2 flex justify-between items-center">
                    <div className="flex-1 mr-2 min-w-0">
                      <span className="block text-sm text-muted-foreground">
                        {work.starttime}~{work.endtime}
                      </span>
                      <span
                        className="block text-sm font-medium truncate text-foreground"
                        title={work.label || "（ラベルなし）"}
                      >
                        {work.label || "（ラベルなし）"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddShiftWithAlert(work)}
                      className="px-2 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-xs flex-shrink-0 transition-colors"
                    >
                      追加
                    </button>
                  </li>
                ))}
            </ul>
            <button
              onClick={closeDialog}
              className="mt-4 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}
