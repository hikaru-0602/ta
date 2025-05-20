import React from "react";
import { Shift } from "../types"; //業務データの型をインポート

//編集対象のシフトを設定し、編集ダイアログを開く関数
export const handleEditShift = (
  shift: Shift, //編集対象のシフトデータ
  setEditingShift: (shift: Shift) => void, //編集対象のシフトを設定する関数
  setIsEditDialogOpen: (isOpen: boolean) => void //編集ダイアログを開く関数
) => {
  setEditingShift(shift); //編集対象のシフトを設定
  setIsEditDialogOpen(true); //編集ダイアログを開く
};

//編集されたシフトを保存する関数
export const handleSaveEditedShift = (
  editingShift: Shift, //編集されたシフトデータ
  shiftData: Shift[], //既存のシフトデータ
  setShiftData: (shift: Shift[]) => void, //シフトデータを更新する関数
  saveShiftsToLocalStorage: (shift: Shift[]) => void, //シフトデータをlocalStorageに保存する関数
  setIsEditDialogOpen: (isOpen: boolean) => void //編集ダイアログを閉じる関数
) => {
  console.log("handleSaveEditedShift called"); //関数が呼び出されたことを確認するためのログ
  if (!editingShift) return; //編集対象がない場合は処理を終了

  // 日付と科目名が一致するシフトデータのみ更新
  console.log("Editing Shift:", editingShift); //編集対象のシフトデータをログに出力
  const updatedShifts = shiftData.map((shift) =>
    shift.day === editingShift.day && shift.id === editingShift.id
      ? { ...shift, ...editingShift } // 編集内容を反映
      : shift
  );

  setShiftData(updatedShifts); //状態を更新
  console.log("Updated Shifts:", updatedShifts); //更新後のシフトデータをログに出力
  saveShiftsToLocalStorage(updatedShifts); //localStorageに保存
  setIsEditDialogOpen(false); //編集ダイアログを閉じる
};

interface EditShiftDialogProps {
  isEditDialogOpen: boolean; // 編集ダイアログが開いているかどうかの状態
  editingShift: Shift | null; // 編集対象のシフトデータ
  setEditingShift: (shift: Shift) => void; // 編集対象のシフトを設定する関数
  handleSaveEditedShift: (
    editingShift: Shift,
    shiftData: Shift[],
    setShiftData: (shifts: Shift[]) => void,
    saveShiftsToLocalStorage: (shifts: Shift[]) => void,
    setIsEditDialogOpen: (isOpen: boolean) => void
  ) => void; // 編集されたシフトを保存する関数
  setIsEditDialogOpen: (isOpen: boolean) => void; // 編集ダイアログを閉じる関数
  shiftData: Shift[]; // 既存のシフトデータ
  setShiftData: (shifts: Shift[]) => void; // シフトデータを更新する関数
  saveShiftsToLocalStorage: (shifts: Shift[]) => void; // シフトデータをlocalStorageに保存する関数
}

export default function EditShiftDialog({
  isEditDialogOpen,
  editingShift,
  setEditingShift,
  handleSaveEditedShift,
  setIsEditDialogOpen,
  shiftData,
  setShiftData,
  saveShiftsToLocalStorage,
}: EditShiftDialogProps) {
  //休憩時間を10分刻みに丸める関数
  const roundToNearestTen = (value: number) => {
    return Math.max(0, Math.round(value / 10) * 10); //10分刻みに丸める
  };

  //休憩時間を増減させる関数
  const adjustBreakTime = (adjustment: number) => {
    if (!editingShift) return;
    const currentBreakTime = Number(editingShift.breaktime) || 0; //現在の休憩時間を取得
    const newBreakTime = Math.max(0, currentBreakTime + adjustment); //0未満にならないように調整
    setEditingShift({
      ...editingShift,
      breaktime: roundToNearestTen(newBreakTime), //丸めて設定
    });
  };

  const backDialog = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsEditDialogOpen(false); //ダイアログを閉じる
    }
  };

  return (
    isEditDialogOpen &&
    editingShift && (
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={backDialog} //ダイアログの外側をクリックしたら閉じる
      >
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
          <h2 className="text-lg sm:text-xl font-bold mb-4">シフトを編集</h2>
          <form>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">科目名</label>
              <input
                type="text"
                value={editingShift.classname} //現在の科目名を表示
                onChange={(e) =>
                  setEditingShift({
                    ...editingShift,
                    classname: e.target.value, //科目名を更新
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">業務内容</label>
              <select
                value={editingShift.category} //現在の業務内容を表示
                onChange={(e) =>
                  setEditingShift({
                    ...editingShift,
                    category: e.target.value, //業務内容を更新
                  })
                }
                className="w-full p-2 border rounded"
              >
                <option value="(授業)">(授業)</option>
                <option value="(準備等)">(準備等)</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">開始時間</label>
              <input
                type="time"
                value={editingShift.starttime} //現在の開始時間を表示
                onChange={(e) =>
                  setEditingShift({
                    ...editingShift,
                    starttime: e.target.value, //開始時間を更新
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">終了時間</label>
              <input
                type="time"
                value={editingShift.endtime} //現在の終了時間を表示
                onChange={(e) =>
                  setEditingShift({
                    ...editingShift,
                    endtime: e.target.value, //終了時間を更新
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                休憩時間(分)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustBreakTime(-10)} //10分減らす
                  className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                >
                  -10分
                </button>
                <span className="text-lg">
                  {editingShift.breaktime || 0} 分
                </span>
                <button
                  type="button"
                  onClick={() => adjustBreakTime(10)} //10分増やす
                  className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                >
                  +10分
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">担当教員</label>
              <input
                type="text"
                value={editingShift.teacher} //現在の担当教員を表示
                onChange={(e) =>
                  setEditingShift({
                    ...editingShift,
                    teacher: e.target.value, //担当教員を更新
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
          </form>
          <div className="flex justify-end">
            <button
              onClick={() => setIsEditDialogOpen(false)} //編集ダイアログを閉じる
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mr-2"
            >
              キャンセル
            </button>
            <button
              onClick={() =>
                handleSaveEditedShift(
                  editingShift,
                  shiftData,
                  setShiftData,
                  saveShiftsToLocalStorage,
                  setIsEditDialogOpen
                )
              } //編集内容を保存
              className="px-4 py-2 text-sm sm:text-base bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    )
  );
}
