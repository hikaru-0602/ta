import React from "react";
import { WorkData, Shift } from "../types"; //業務データの型をインポート

//時間をDateオブジェクトに変換する関数
export const parseTime = (time: string): Date => {
  const [hours, minutes] = time.split(":").map(Number); //時間と分を分割して数値に変換
  const date = new Date(); //現在の日付を基準に新しいDateオブジェクトを作成
  date.setHours(hours, minutes, 0, 0); //時間と分を設定
  return date; //変換したDateオブジェクトを返す
};

//シフトを追加する関数
export const handleAddShift = (
  work: WorkData, //追加するシフトデータ
  selectedDate: Date | null, //選択された日付
  shiftData: Shift[], //既存のシフトデータ
  setShiftData: (shifts: Shift[]) => void, //シフトデータを更新する関数
  saveShiftsToLocalStorage: (shifts: Shift[]) => void //シフトデータをlocalStorageに保存する関数
) => {
  if (!selectedDate) return; //日付が選択されていない場合は処理を終了

  //選択された日付のシフトを取得
  const shiftsForDate: Shift[] = shiftData.filter(
    (shift) =>
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
    alert("このシフトは既存のシフトと時間が重複しています。"); //重複している場合はアラートを表示
    return; //処理を終了
  }

  //1日のシフト数が2件以上の場合はエラー
  const shiftCountForDate = shiftsForDate.length;
  if (shiftCountForDate >= 2) {
    alert("働き過ぎ"); //エラーを表示
    return; //処理を終了
  }

  //新しいシフトデータを作成
  const newShift: Shift = {
    id: work.id, // 必須プロパティを明示的に設定
    month: selectedDate.getMonth() + 1, //月を設定
    day: selectedDate.getDate(), //日を設定
    label: work.label, //ラベル名を設定
    classname: work.classname,
    category: work.category,
    starttime: work.starttime,
    endtime: work.endtime,
    breaktime: work.breaktime,
    teacher: work.teacher,
    filter: () => [], // 型定義に合わせてダミー関数を追加
  };

  //シフトデータを更新
  const updatedShifts = [...shiftData, newShift];
  setShiftData(updatedShifts); //状態を更新
  saveShiftsToLocalStorage(updatedShifts); //localStorageに保存
};

//シフトを削除する関数
export const handleRemoveShift = (
  id: number, //削除するシフトのID
  month: number, //削除するシフトの月
  day: number, //削除するシフトの日
  shiftData: Shift[], //既存のシフトデータ
  setShiftData: (shifts: Shift[]) => void, //シフトデータを更新する関数
  saveShiftsToLocalStorage: (shifts: Shift[]) => void //シフトデータをlocalStorageに保存する関数
) => {
  //指定されたシフトを除外した新しいシフトデータを作成
  const updatedShifts = shiftData.filter(
    (shift) => !(shift.id === id && shift.month === month && shift.day === day)
  );

  setShiftData(updatedShifts); //状態を更新
  saveShiftsToLocalStorage(updatedShifts); //localStorageに保存
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
  return (
    isDialogOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded shadow-lg w-full max-w-xs sm:max-w-md">
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
                    onClick={() =>
                      handleEditShift(
                        shift,
                        setEditingShift,
                        setIsEditDialogOpen
                      )
                    }
                    className="ml-2 px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    編集
                  </button>
                  <button
                    onClick={() =>
                      handleRemoveShift(
                        shift.id,
                        shift.month,
                        shift.day,
                        shiftData,
                        setShiftData,
                        saveShiftsToLocalStorage
                      )
                    }
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
                      shift.label === work.label &&
                      shift.id === work.id &&
                      selectedDate &&
                      shift.month === selectedDate.getMonth() + 1 &&
                      shift.day === selectedDate.getDate()
                    /*
                      shift.classname === work.classname &&
                      shift.starttime === work.starttime &&
                      shift.endtime === work.endtime &&
                      shift.label === work.label &&
                      selectedDate &&
                      shift.month === selectedDate.getMonth() + 1 &&
                      shift.day === selectedDate.getDate()
                    */
                  )
              )
              .map((work, index) => (
                <li key={index} className="mb-2 flex justify-between">
                  {work.starttime}~{work.endtime} {work.label}
                  <button
                    onClick={() =>
                      handleAddShift(
                        work,
                        selectedDate,
                        shiftData,
                        setShiftData,
                        saveShiftsToLocalStorage
                      )
                    }
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
    )
  );
}
