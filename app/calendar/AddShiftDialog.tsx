import React from "react";

export const parseTime = (time: string): Date => {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const handleAddShift = (
  work: any,
  selectedDate: Date | null,
  shiftData: any[],
  setShiftData: Function,
  saveShiftsToLocalStorage: Function
) => {
  if (!selectedDate) return;

  const shiftsForDate = shiftData.filter(
    (shift) =>
      shift.month === selectedDate.getMonth() + 1 &&
      shift.day === selectedDate.getDate()
  );

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
    alert("このシフトは既存のシフトと時間が重複しています。");
    return;
  }

  const shiftCountForDate = shiftsForDate.length;
  if (shiftCountForDate >= 2) {
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

export const handleRemoveShift = (
  id: string,
  month: number,
  day: number,
  shiftData: any[],
  setShiftData: Function,
  saveShiftsToLocalStorage: Function
) => {
  const updatedShifts = shiftData.filter(
    (shift) => !(shift.id === id && shift.month === month && shift.day === day)
  );

  setShiftData(updatedShifts);
  saveShiftsToLocalStorage(updatedShifts);
};

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
}: any) {
  return (
    isDialogOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">仕事リスト</h2>
          <h3 className="text-lg font-semibold mb-2">-- 追加 --</h3>
          <ul>
            {shiftData
              .filter(
                (shift: { month: any; day: any }) =>
                  selectedDate &&
                  shift.month === selectedDate.getMonth() + 1 &&
                  shift.day === selectedDate.getDate()
              )
              .map(
                (
                  shift: {
                    starttime: string;
                    endtime: string;
                    label: string;
                    id: any;
                    month: any;
                    day: any;
                  },
                  index: React.Key | null | undefined
                ) => (
                  <li key={index} className="mb-2 flex justify-between">
                    {shift.starttime}~{shift.endtime} {shift.label}
                    <button
                      onClick={() => handleEditShift(shift, setEditingShift, setIsEditDialogOpen)}
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
                )
              )}
          </ul>
          <h3 className="text-lg font-semibold mt-4 mb-2">-- 一覧 --</h3>
          <ul>
            {filteredWorkData
              .filter(
                (work: { classname: any; starttime: any; endtime: any; dayofweek: any }) =>
                  !shiftData.some(
                    (shift: {
                      classname: any;
                      starttime: any;
                      endtime: any;
                      dayofweek: any;
                      month: any;
                      day: any;
                    }) =>
                      shift.classname === work.classname &&
                      shift.starttime === work.starttime &&
                      shift.endtime === work.endtime &&
                      shift.dayofweek === work.dayofweek &&
                      selectedDate &&
                      shift.month === selectedDate.getMonth() + 1 &&
                      shift.day === selectedDate?.getDate()
                  )
              )
              .map(
                (
                  work: { starttime: string; endtime: string; label: string },
                  index: React.Key | null | undefined
                ) => (
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
                )
              )}
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