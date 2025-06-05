import React from "react";
import { Shift } from "../types"; //業務データの型をインポート
import { getAuth } from "firebase/auth";
import { saveWorkDataToFirestore } from "./add_shift_dialog"; //Firestoreに保存する関数をインポート

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
    shift.day === editingShift.day &&
    shift.id === editingShift.id &&
    shift.year === editingShift.year &&
    shift.month === editingShift.month
      ? { ...shift, ...editingShift } // 編集内容を反映
      : shift
  );

  setShiftData(updatedShifts); //状態を更新
  const uid = getAuth().currentUser?.uid; //現在のユーザーのUIDを取得
  if (uid) {
    saveWorkDataToFirestore(uid, editingShift);
  }
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

  //休憩時間を増減させる関数

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
          <h2 className="text-lg sm:text-xl font-bold mb-4">
            {editingShift.label || "（ラベルなし）"}シフトを編集
          </h2>
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
            <div className="flex space-x-4 items-end">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  業務内容
                </label>
                <select
                  value={editingShift.category}
                  onChange={(e) =>
                    setEditingShift({
                      ...editingShift,
                      category: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded h-[40px]" // 高さを指定
                >
                  <option value="(授業)">(授業)</option>
                  <option value="(準備等)">(準備等)</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  担当教員
                </label>
                <input
                  type="text"
                  value={editingShift.teacher}
                  onChange={(e) =>
                    setEditingShift({
                      ...editingShift,
                      teacher: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded h-[40px]" // 高さを指定
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">開始時間</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  maxLength={2}
                  value={editingShift.starttime.split(":")[0]} // 時
                  onChange={(e) => {
                    const newHour = e.target.value
                      .replace(/[^\d０-９]/g, "") // 数字以外を除去
                      .replace(/[０-９]/g, (s) =>
                        String.fromCharCode(s.charCodeAt(0) - 65248)
                      ) // 全角を半角に変換
                      .slice(0, 2); // 最大2桁に制限
                    const newTime = `${newHour}:${
                      editingShift.starttime.split(":")[1]
                    }`;
                    setEditingShift({ ...editingShift, starttime: newTime });
                  }}
                  onBlur={(e) => {
                    const formattedHour = e.target.value.padStart(2, "0");
                    const newTime = `${formattedHour}:${
                      editingShift.starttime.split(":")[1]
                    }`;
                    setEditingShift({ ...editingShift, starttime: newTime });
                  }}
                  className="w-12 p-1 border rounded text-center"
                />
                <span>:</span>
                <input
                  type="text"
                  maxLength={2}
                  value={editingShift.starttime.split(":")[1]} // 分
                  onChange={(e) => {
                    const newMinute = e.target.value
                      .replace(/[^\d０-９]/g, "") // 数字以外を除去
                      .replace(/[０-９]/g, (s) =>
                        String.fromCharCode(s.charCodeAt(0) - 65248)
                      ) // 全角を半角に変換
                      .slice(0, 2); // 最大2桁に制限
                    const newTime = `${
                      editingShift.starttime.split(":")[0]
                    }:${newMinute}`;
                    setEditingShift({ ...editingShift, starttime: newTime });
                  }}
                  onBlur={(e) => {
                    const formattedMinute = e.target.value.padStart(2, "0");
                    const newTime = `${
                      editingShift.starttime.split(":")[0]
                    }:${formattedMinute}`;
                    setEditingShift({ ...editingShift, starttime: newTime });
                  }}
                  className="w-12 p-1 border rounded text-center"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">終了時間</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  maxLength={2}
                  value={editingShift.endtime.split(":")[0]} // 時
                  onChange={(e) => {
                    const newHour = e.target.value
                      .replace(/[^\d０-９]/g, "")
                      .replace(/[０-９]/g, (s) =>
                        String.fromCharCode(s.charCodeAt(0) - 65248)
                      )
                      .slice(0, 2);
                    const newTime = `${newHour}:${
                      editingShift.endtime.split(":")[1]
                    }`;
                    setEditingShift({ ...editingShift, endtime: newTime });
                  }}
                  onBlur={(e) => {
                    const formattedHour = e.target.value.padStart(2, "0");
                    const newTime = `${formattedHour}:${
                      editingShift.endtime.split(":")[1]
                    }`;
                    setEditingShift({ ...editingShift, endtime: newTime });
                  }}
                  className="w-12 p-1 border rounded text-center"
                />
                <span>:</span>
                <input
                  type="text"
                  maxLength={2}
                  value={editingShift.endtime.split(":")[1]} // 分
                  onChange={(e) => {
                    const newMinute = e.target.value
                      .replace(/[^\d０-９]/g, "")
                      .replace(/[０-９]/g, (s) =>
                        String.fromCharCode(s.charCodeAt(0) - 65248)
                      )
                      .slice(0, 2);
                    const newTime = `${
                      editingShift.endtime.split(":")[0]
                    }:${newMinute}`;
                    setEditingShift({ ...editingShift, endtime: newTime });
                  }}
                  onBlur={(e) => {
                    const formattedMinute = e.target.value.padStart(2, "0");
                    const newTime = `${
                      editingShift.endtime.split(":")[0]
                    }:${formattedMinute}`;
                    setEditingShift({ ...editingShift, endtime: newTime });
                  }}
                  className="w-12 p-1 border rounded text-center"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                休憩時間(分)
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() =>
                    setEditingShift({
                      ...editingShift,
                      breaktime: Math.max(
                        0,
                        Number(editingShift.breaktime || 0) - 10
                      ),
                    })
                  }
                  className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                >
                  -10分
                </button>
                <input
                  type="text"
                  value={editingShift.breaktime || "0"}
                  onChange={(e) => {
                    const newBreakTime = e.target.value
                      .replace(/[^\d０-９]/g, "")
                      .replace(/[０-９]/g, (s) =>
                        String.fromCharCode(s.charCodeAt(0) - 65248)
                      )
                      .slice(0, 3);
                    setEditingShift({
                      ...editingShift,
                      breaktime: Number(newBreakTime),
                    });
                  }}
                  onBlur={(e) => {
                    const formattedBreakTime = e.target.value || "0";
                    setEditingShift({
                      ...editingShift,
                      breaktime: Number(formattedBreakTime),
                    });
                  }}
                  className="w-12 p-1 border rounded text-center"
                />
                <button
                  type="button"
                  onClick={() =>
                    setEditingShift({
                      ...editingShift,
                      breaktime: Number(editingShift.breaktime || 0) + 10,
                    })
                  }
                  className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                >
                  +10分
                </button>
              </div>
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
