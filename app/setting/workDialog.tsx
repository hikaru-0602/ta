import React from "react";

interface WorkDialogProps {
  isDialogOpen: boolean;
  workInfo: {
    subject: string;
    category: string;
    teacher: string;
    schedules: {
      day: string;
      periods: string[];
      startTime: string;
      endTime: string;
      breakTime: string;
    }[];
  };
  setIsDialogOpen: (open: boolean) => void;
  handleWorkChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleScheduleChange: (index: number, field: "day" | "periods", value: string | string[]) => void;
  handleScheduleTimeEdit: (index: number, field: "startTime" | "endTime" | "breakTime", value: string) => void;
  addSchedule: () => void;
  removeSchedule: (index: number) => void;
  calculateStartEndTimes: (periods: string[]) => { startTime: string; endTime: string; breakTime: number };
  calculateWorkingTime: (startTime: string, endTime: string, breakTime: number) => { hours: number; minutes: number };
  addWork: () => void;
  editingIndex: number | null;
  setEditingIndex: (index: number | null) => void;
  saveScheduleTimeEdit: () => void;
}

const WorkDialog: React.FC<WorkDialogProps> = ({
  isDialogOpen,
  workInfo,
  setIsDialogOpen,
  handleWorkChange,
  handleScheduleChange,
  handleScheduleTimeEdit,
  addSchedule,
  removeSchedule,
  calculateStartEndTimes,
  calculateWorkingTime,
  addWork,
  editingIndex,
  setEditingIndex,
  saveScheduleTimeEdit,
}) => {
  if (!isDialogOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">仕事を追加</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">科目名</label>
            <input
              type="text"
              name="subject"
              value={workInfo.subject}
              onChange={handleWorkChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">業務内容</label>
            <select
              name="category"
              value={workInfo.category}
              onChange={handleWorkChange}
              className="w-full p-2 border rounded"
            >
              <option value="準備等">準備等</option>
              <option value="授業">授業</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">教員名</label>
            <input
              type="text"
              name="teacher"
              value={workInfo.teacher}
              onChange={handleWorkChange}
              className="w-full p-2 border rounded"
            />
          </div>
          {workInfo.schedules.map((schedule, index) => {
            const { startTime, endTime, breakTime } = calculateStartEndTimes(schedule.periods);
            const { hours, minutes } = calculateWorkingTime(
              schedule.startTime || startTime,
              schedule.endTime || endTime,
              Number(schedule.breakTime) || breakTime
            );

            return (
              <div key={index} className="flex flex-col space-y-2">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block mb-1 font-medium">曜日</label>
                    <select
                      value={schedule.day}
                      onChange={(e) => handleScheduleChange(index, "day", e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="月">月曜日</option>
                      <option value="火">火曜日</option>
                      <option value="水">水曜日</option>
                      <option value="木">木曜日</option>
                      <option value="金">金曜日</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 font-medium">時限</label>
                    <div className="flex flex-wrap gap-2">
                      {["1限", "2限", "3限", "4限", "5限", "6限"].map((period) => (
                        <label key={period} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            value={period}
                            checked={schedule.periods.includes(period)}
                            onChange={(e) => {
                              const selectedPeriods = schedule.periods.includes(period)
                                ? schedule.periods.filter((p) => p !== period)
                                : [...schedule.periods, period];
                              handleScheduleChange(index, "periods", selectedPeriods);
                            }}
                            className="form-checkbox"
                          />
                          <span>{period}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => removeSchedule(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    削除
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  <p>開始時間: {schedule.startTime || startTime}</p>
                  <p>終了時間: {schedule.endTime || endTime}</p>
                  <p>休憩時間: {schedule.breakTime || breakTime}分</p>
                  <p>
                    実働時間: {hours}時間{minutes}分
                  </p>
                </div>
              </div>
            );
          })}
          <button onClick={addSchedule} className="text-blue-500 hover:text-blue-700">
            + スケジュールを追加
          </button>
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={() => setIsDialogOpen(false)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            キャンセル
          </button>
          <button
            onClick={addWork}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            登録
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkDialog;