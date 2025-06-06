import React, { useEffect } from "react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";

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
  }, [workid, workData, isDialogOpen]);

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

  useEffect(() => {
    if (!isDialogOpen) return;

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
  }, [isDialogOpen, workid, workData]);

  if (!isDialogOpen) return null;

  const backDialog = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsDialogOpen(false);
      initworkInfo();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={backDialog}
    >
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg w-full max-w-md border border-border">
        <h2 className="text-xl font-bold mb-4 text-center text-foreground">
          {checkWorkIdExists() ? "編集" : "仕事を追加"}
        </h2>
        <div>
          <label className="block mb-1 font-medium text-foreground">
            ラベル名
          </label>
          <input
            type="text"
            name="label"
            value={workInfo.label || ""}
            onChange={handleWorkChange}
            className="w-full p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
          />
        </div>
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-foreground">
              科目名
            </label>
            <input
              type="text"
              name="subject"
              value={workInfo.subject}
              onChange={handleWorkChange}
              className="w-full p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
            />
          </div>
          <div className="flex space-x-4 items-end">
            <div className="flex-1 max-w-[140px]">
              <label className="block mb-1 text-foreground">
                業務内容
              </label>
              <select
                name="category"
                value={workInfo.category}
                onChange={handleWorkChange}
                className="w-full p-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
              >
                <option value="(準備等)">(準備等)</option>
                <option value="(授業)">(授業)</option>
              </select>
            </div>
            <div className="flex-1 max-w-[180px]">
              <label className="block mb-1 font-medium text-foreground">
                教員名
              </label>
              <input
                type="text"
                name="teacher"
                value={workInfo.teacher}
                onChange={handleWorkChange}
                className="w-full p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
              />
            </div>
          </div>
          {workInfo.schedules.map((schedule, index) => {
            const { startTime, endTime } = calculateStartEndTimes(
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
                    <label className="block mb-1 font-medium text-foreground">曜日</label>
                    <select
                      value={schedule.day}
                      onChange={(e) =>
                        handleScheduleChange(index, "day", e.target.value, true)
                      }
                      className="w-full p-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                    >
                      <option value="">なし</option>
                      <option value="月曜日">月曜日</option>
                      <option value="火曜日">火曜日</option>
                      <option value="水曜日">水曜日</option>
                      <option value="木曜日">木曜日</option>
                      <option value="金曜日">金曜日</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 font-medium text-foreground">時限</label>
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
                            <span className="text-foreground">{period}</span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2 mb-2">
                    <p className="text-foreground">
                      開始時間:
                    </p>
                    <div className="flex items-center space-x-1">
                      <input
                        type="text"
                        maxLength={2}
                        value={(schedule.startTime || startTime).split(":")[0]} // 時
                        onChange={(e) => {
                          const newHour = e.target.value
                            .replace(/[^\d０-９]/g, "")
                            .replace(
                              /[０-９]/g,
                              (s) =>
                                String.fromCharCode(
                                  s.charCodeAt(0) - 65248
                                ).slice(0, 2) // 2桁に制限
                            );
                          const newTime = `${newHour}:${
                            (schedule.startTime || startTime).split(":")[1]
                          }`;
                          handleScheduleTimeEdit(index, "startTime", newTime);
                        }}
                        onBlur={(e) => {
                          // フォーカスが外れたタイミングで2桁に整形
                          const formattedHour = e.target.value.padStart(2, "0");
                          const newTime = `${formattedHour}:${
                            (schedule.startTime || startTime).split(":")[1]
                          }`;
                          handleScheduleTimeEdit(index, "startTime", newTime);
                        }}
                        className="w-12 p-1 border border-input rounded-md text-center bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                      />
                      <span className="text-foreground">
                        :
                      </span>
                      <input
                        type="text"
                        maxLength={2}
                        value={(schedule.startTime || startTime).split(":")[1]} // 分
                        onChange={(e) => {
                          const newMinute = e.target.value
                            .replace(/[^\d０-９]/g, "")
                            .replace(/[０-９]/g, (s) =>
                              String.fromCharCode(s.charCodeAt(0) - 65248)
                            );
                          const newTime = `${
                            (schedule.startTime || startTime).split(":")[0]
                          }:${newMinute}`;
                          handleScheduleTimeEdit(index, "startTime", newTime);
                        }}
                        onBlur={(e) => {
                          // フォーカスが外れたタイミングで2桁に整形
                          const formattedMinute = e.target.value.padStart(
                            2,
                            "0"
                          );
                          const newTime = `${
                            (schedule.startTime || startTime).split(":")[0]
                          }:${formattedMinute}`;
                          handleScheduleTimeEdit(index, "startTime", newTime);
                        }}
                        className="w-12 p-1 border border-input rounded-md text-center bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        handleScheduleTimeEdit(
                          index,
                          "startTime",
                          adjustTime(schedule.startTime || startTime, -10)
                        );
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      -10分
                    </Button>
                    <Button
                      onClick={() =>
                        handleScheduleTimeEdit(
                          index,
                          "startTime",
                          adjustTime(schedule.startTime || startTime, 10)
                        )
                      }
                      variant="secondary"
                      size="sm"
                    >
                      +10分
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <p className="text-foreground">
                      終了時間:
                    </p>
                    <div className="flex items-center space-x-1">
                      <input
                        type="text"
                        maxLength={2}
                        value={(schedule.endTime || endTime).split(":")[0]} // 時
                        onChange={(e) => {
                          const newHour = e.target.value
                            .replace(/[^\d０-９]/g, "")
                            .replace(/[０-９]/g, (s) =>
                              String.fromCharCode(s.charCodeAt(0) - 65248)
                            );
                          const newTime = `${newHour}:${
                            (schedule.endTime || endTime).split(":")[1]
                          }`;
                          handleScheduleTimeEdit(index, "endTime", newTime);
                        }}
                        onBlur={(e) => {
                          // フォーカスが外れたタイミングで2桁に整形
                          const formattedHour = e.target.value.padStart(2, "0");
                          const newTime = `${formattedHour}:${
                            (schedule.endTime || endTime).split(":")[1]
                          }`;
                          handleScheduleTimeEdit(index, "endTime", newTime);
                        }}
                        className="w-12 p-1 border border-input rounded-md text-center bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                      />
                      <span className="text-foreground">
                        :
                      </span>
                      <input
                        type="text"
                        maxLength={2}
                        value={(schedule.endTime || endTime).split(":")[1]} // 分
                        onChange={(e) => {
                          const newMinute = e.target.value
                            .replace(/[^\d０-９]/g, "")
                            .replace(/[０-９]/g, (s) =>
                              String.fromCharCode(s.charCodeAt(0) - 65248)
                            );
                          const newTime = `${
                            (schedule.endTime || endTime).split(":")[0]
                          }:${newMinute}`;
                          handleScheduleTimeEdit(index, "endTime", newTime);
                        }}
                        onBlur={(e) => {
                          // フォーカスが外れたタイミングで2桁に整形
                          const formattedMinute = e.target.value.padStart(
                            2,
                            "0"
                          );
                          const newTime = `${
                            (schedule.endTime || endTime).split(":")[0]
                          }:${formattedMinute}`;
                          handleScheduleTimeEdit(index, "endTime", newTime);
                        }}
                        className="w-12 p-1 border border-input rounded-md text-center bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                      />
                    </div>
                    <Button
                      onClick={() =>
                        handleScheduleTimeEdit(
                          index,
                          "endTime",
                          adjustTime(schedule.endTime || endTime, -10)
                        )
                      }
                      variant="secondary"
                      size="sm"
                    >
                      -10分
                    </Button>
                    <Button
                      onClick={() =>
                        handleScheduleTimeEdit(
                          index,
                          "endTime",
                          adjustTime(schedule.endTime || endTime, 10)
                        )
                      }
                      variant="secondary"
                      size="sm"
                    >
                      +10分
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <p className="text-foreground">
                      休憩時間:
                    </p>
                    <div className="flex items-center space-x-1">
                      <input
                        type="text"
                        value={schedule.breakTime || "0"} // 初期値を0に設定
                        onChange={(e) => {
                          // 全角数字を半角に変換し、数字以外を除去、最大3桁に制限
                          const newBreakTime = e.target.value
                            .replace(/[^\d０-９]/g, "") // 数字以外を除去
                            .replace(/[０-９]/g, (s) =>
                              String.fromCharCode(s.charCodeAt(0) - 65248)
                            ) // 全角を半角に変換
                            .slice(0, 3); // 最大3桁に制限
                          handleScheduleTimeEdit(
                            index,
                            "breakTime",
                            newBreakTime
                          );
                        }}
                        onBlur={(e) => {
                          // フォーカスが外れたタイミングで数値を整形（必要なら0を補完）
                          const formattedBreakTime = e.target.value || "0";
                          handleScheduleTimeEdit(
                            index,
                            "breakTime",
                            formattedBreakTime
                          );
                        }}
                        className="w-12 p-1 border border-input rounded-md text-center bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                      />
                      <span className="text-foreground">
                        分
                      </span>
                    </div>
                    <Button
                      onClick={() => {
                        handleScheduleTimeEdit(
                          index,
                          "breakTime",
                          String(
                            Math.max(0, Number(schedule.breakTime || 0) - 10)
                          )
                        );
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      -10分
                    </Button>
                    <Button
                      onClick={() =>
                        handleScheduleTimeEdit(
                          index,
                          "breakTime",
                          String(Number(schedule.breakTime || 0) + 10)
                        )
                      }
                      variant="secondary"
                      size="sm"
                    >
                      +10分
                    </Button>
                  </div>
                  <p className="text-foreground">
                    実働時間: {hours}時間{minutes}分
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          <Button
            onClick={() => {
              setIsDialogOpen(false);
              initworkInfo();
            }}
            variant="secondary"
          >
            キャンセル
          </Button>
          <Button
            onClick={() => addWork(workid)}
          >
            {checkWorkIdExists() ? "更新" : "登録"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkDialog;
