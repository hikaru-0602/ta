import React from "react";

export const handleEditShift = (
  shift: any,
  setEditingShift: Function,
  setIsEditDialogOpen: Function
) => {
  setEditingShift(shift); // 編集対象のシフトを設定
  setIsEditDialogOpen(true); // 編集ダイアログを開く
};

export const handleSaveEditedShift = (
  editingShift: any,
  shiftData: any[],
  setShiftData: Function,
  saveShiftsToLocalStorage: Function,
  setIsEditDialogOpen: Function
) => {
  if (!editingShift) return;

  // 編集対象のシフトを更新
  const updatedShifts = shiftData.map((shift) =>
    shift.id === editingShift.id ? editingShift : shift
  );

  setShiftData(updatedShifts); // 状態を更新
  saveShiftsToLocalStorage(updatedShifts); // localStorageに保存
  setIsEditDialogOpen(false); // 編集ダイアログを閉じる
};

export default function EditShiftDialog({
  isEditDialogOpen,
  editingShift,
  setEditingShift,
  handleSaveEditedShift,
  setIsEditDialogOpen,
  shiftData,
  setShiftData,
  saveShiftsToLocalStorage,
}: any) {
  // 休憩時間を10分刻みに丸める関数
  const roundToNearestTen = (value: number) => {
    return Math.max(0, Math.round(value / 10) * 10); // 10分刻みに丸める
  };

  // 休憩時間を増減させる関数
  const adjustBreakTime = (adjustment: number) => {
    const currentBreakTime = Number(editingShift.breaktime) || 0;
    const newBreakTime = Math.max(0, currentBreakTime + adjustment); // 0未満にならないように調整
    setEditingShift({
      ...editingShift,
      breaktime: roundToNearestTen(newBreakTime), // 丸めて設定
    });
  };

  return (
    isEditDialogOpen &&
    editingShift && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">シフトを編集</h2>
          <form>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">科目名</label>
              <input
                type="text"
                value={editingShift.classname}
                onChange={(e) =>
                  setEditingShift({
                    ...editingShift,
                    classname: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">業務内容</label>
              <select
                value={editingShift.category}
                onChange={(e) =>
                  setEditingShift({
                    ...editingShift,
                    category: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              >
                <option value="授業">授業</option>
                <option value="準備等">準備等</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">開始時間</label>
              <input
                type="time"
                value={editingShift.starttime}
                onChange={(e) =>
                  setEditingShift({
                    ...editingShift,
                    starttime: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">終了時間</label>
              <input
                type="time"
                value={editingShift.endtime}
                onChange={(e) =>
                  setEditingShift({
                    ...editingShift,
                    endtime: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">休憩時間 (分)</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustBreakTime(-10)} // 10分減らす
                  className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                >
                  -10分
                </button>
                <span className="text-lg">{editingShift.breaktime || 0} 分</span>
                <button
                  type="button"
                  onClick={() => adjustBreakTime(10)} // 10分増やす
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
                value={editingShift.teacher}
                onChange={(e) =>
                  setEditingShift({
                    ...editingShift,
                    teacher: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
          </form>
          <div className="flex justify-end">
            <button
              onClick={() => setIsEditDialogOpen(false)}
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
              }
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    )
  );
}