import React, { useEffect } from "react";
import { useCallback } from "react";

interface WorkDialogProps {
  isDialogOpen: boolean;
  workInfo: {
    label: string;
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
  workData: {
    id: number; //業務ID
    label: string; //ラベル名
    classname: string; //科目名
    category: string; //業務内容
    teacher: string; //担当教員
    dayofweek: string; //曜日
    schedule: number[]; //時限（数値配列）
    starttime: string; //開始時刻
    endtime: string; //終了時刻
    breaktime: number;
    worktime: string;
  }[];
  setIsDialogOpen: (open: boolean) => void;
  handleWorkChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleScheduleChange: (
    index: number,
    field: "day" | "periods",
    value: string | string[],
    editing: boolean
  ) => void;
  handleScheduleTimeEdit: (
    index: number,
    field: "startTime" | "endTime" | "breakTime",
    value: string
  ) => void;
  addSchedule: () => void;
  removeSchedule: (index: number) => void;
  calculateStartEndTimes: (periods: string[]) => {
    startTime: string;
    endTime: string;
    breakTime: number;
  };
  calculateWorkingTime: (
    startTime: string,
    endTime: string,
    breakTime: number
  ) => { hours: number; minutes: number };
  addWork: (workid: number) => void;
  initworkInfo: () => void;
  editingIndex: number | null;
  setEditingIndex: (index: number | null) => void;
  saveScheduleTimeEdit: () => void;
  workid: number;
}

const WorkDialog: React.FC<WorkDialogProps> = ({
  isDialogOpen,
  workInfo,
  workData,
  workid,
  setIsDialogOpen,
  handleWorkChange,
  handleScheduleChange,
  handleScheduleTimeEdit,
  addSchedule,
  removeSchedule,
  calculateStartEndTimes,
  calculateWorkingTime,
  addWork,
  setEditingIndex,
  initworkInfo,
}) => {
  const checkWorkIdExists = useCallback(() => {
    if (!isDialogOpen) return; // ダイアログが開いていない場合は早期リターン
    const exists = workData.some((work) => work.id === workid);
    return exists;
  }, [workid, workData]);

  const adjustTime = (time: string, adjustment: number): string => {
    const [hour, minute] = time.split(":").map(Number);
    const totalMinutes = hour * 60 + minute + adjustment;

    const adjustedHour = Math.floor(totalMinutes / 60);
    const adjustedMinute = totalMinutes % 60;

    // 時間を "HH:MM" フォーマットで返す
    return `${String(adjustedHour).padStart(2, "0")}:${String(
      adjustedMinute
    ).padStart(2, "0")}`;
  };

  // workInfoを更新するuseEffect
  useEffect(() => {
    if (!isDialogOpen) return; // ダイアログが開いていない場合は早期リターン

    const existingWork = workData.find((work) => work.id === workid);
    if (!existingWork) return;

    setEditingIndex(workid);
    handleWorkChange({
      target: { name: "label", value: existingWork.label },
    } as React.ChangeEvent<HTMLInputElement>);
    handleWorkChange({
      target: { name: "subject", value: existingWork.classname },
    } as React.ChangeEvent<HTMLInputElement>);
    handleWorkChange({
      target: { name: "category", value: existingWork.category },
    } as React.ChangeEvent<HTMLSelectElement>);
    handleWorkChange({
      target: { name: "teacher", value: existingWork.teacher },
    } as React.ChangeEvent<HTMLInputElement>);
    handleScheduleChange(0, "day", existingWork.dayofweek, false);
    handleScheduleChange(
      0,
      "periods",
      existingWork.schedule.map((period) => `${period}限`),
      false
    );
    handleScheduleTimeEdit(0, "startTime", existingWork.starttime);
    handleScheduleTimeEdit(0, "endTime", existingWork.endtime);
    handleScheduleTimeEdit(0, "breakTime", String(existingWork.breaktime));

    console.log("変更", existingWork.classname);
  }, [isDialogOpen, workid, workData, setEditingIndex]);

  if (!isDialogOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">
          {checkWorkIdExists() ? "編集" : "仕事を追加"}
        </h2>
        <div>
          <label className="block mb-1 font-medium">ラベル名</label>
          <input
            type="text"
            name="label"
            value={workInfo.label || ""}
            onChange={handleWorkChange}
            className="w-full p-2 border rounded"
          />
        </div>
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
              <option value="(準備等)">(準備等)</option>
              <option value="(授業)">(授業)</option>
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
            const { startTime, endTime, breakTime } = calculateStartEndTimes(
              schedule.periods
            );
            const { hours, minutes } = calculateWorkingTime(
              schedule.startTime || startTime,
              schedule.endTime || endTime,
              Number(schedule.breakTime)
            );

            return (
              <div key={index} className="flex flex-col space-y-2">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block mb-1 font-medium">曜日</label>
                    <select
                      value={schedule.day}
                      onChange={(e) =>
                        handleScheduleChange(index, "day", e.target.value, true)
                      }
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
                      {["1限", "2限", "3限", "4限", "5限", "6限"].map(
                        (period) => (
                          <label
                            key={period}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              value={period}
                              checked={schedule.periods.includes(period)}
                              onChange={() => {
                                const selectedPeriods =
                                  schedule.periods.includes(period)
                                    ? schedule.periods.filter(
                                        (p) => p !== period
                                      )
                                    : [...schedule.periods, period];
                                handleScheduleChange(
                                  index,
                                  "periods",
                                  selectedPeriods,
                                  true
                                );
                              }}
                              className="form-checkbox"
                            />
                            <span>{period}</span>
                          </label>
                        )
                      )}
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
                  <div className="flex items-center space-x-2">
                    <p>開始時間: {schedule.startTime || startTime}</p>
                    <button
                      onClick={() =>
                        handleScheduleTimeEdit(
                          index,
                          "startTime",
                          adjustTime(schedule.startTime || startTime, -10)
                        )
                      }
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      -10分
                    </button>
                    <button
                      onClick={() =>
                        handleScheduleTimeEdit(
                          index,
                          "startTime",
                          adjustTime(schedule.startTime || startTime, 10)
                        )
                      }
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +10分
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p>終了時間: {schedule.endTime || endTime}</p>
                    <button
                      onClick={() =>
                        handleScheduleTimeEdit(
                          index,
                          "endTime",
                          adjustTime(schedule.endTime || endTime, -10)
                        )
                      }
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      -10分
                    </button>
                    <button
                      onClick={() =>
                        handleScheduleTimeEdit(
                          index,
                          "endTime",
                          adjustTime(schedule.endTime || endTime, 10)
                        )
                      }
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +10分
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p>休憩時間: {schedule.breakTime || 0}分</p>
                    <button
                      onClick={() => {
                        handleScheduleTimeEdit(
                          index,
                          "breakTime",
                          String(
                            Math.max(
                              0,
                              Number(schedule.breakTime || breakTime) - 10
                            )
                          )
                        );
                      }}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      -10分
                    </button>
                    <button
                      onClick={() =>
                        handleScheduleTimeEdit(
                          index,
                          "breakTime",
                          `${Number(schedule.breakTime || breakTime) + 10}`
                        )
                      }
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +10分
                    </button>
                  </div>
                  <p>
                    実働時間: {hours}時間{minutes}分
                  </p>
                </div>
              </div>
            );
          })}
          {!checkWorkIdExists() && (
            <button
              onClick={addSchedule}
              className="text-blue-500 hover:text-blue-700"
            >
              + スケジュールを追加
            </button>
          )}
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={() => {
              setIsDialogOpen(false);
              initworkInfo();
            }}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            キャンセル
          </button>
          <button
            onClick={() => addWork(workid)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {checkWorkIdExists() ? "更新" : "登録"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkDialog;
