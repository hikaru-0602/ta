"use client";

import Header from "../components/Header";
import { useState, useEffect } from "react";

export default function Work() {
  const [userInfo, setUserInfo] = useState({
    name: "",
    furigana: "",
    grade: "1年",
    studentId: "",
    accountStatus: "未登録",
  });

  const [workInfo, setWorkInfo] = useState({
    subject: "",
    schedules: [{ day: "月曜日", periods: ["1限"], startTime: "", endTime: "", breakTime: "" }],
    startTime: "",
    endTime: "",
    breakTime: "",
    teacher: "",
  });

  const [workData, setWorkData] = useState<
    {
      classname: string;
      teacher: string;
      dayofweek: string;
      schedule: number[];
      starttime: string;
      endtime: string;
      breaktime: number;
      worktime: string;
    }[]
  >([]);

  interface Work {
    subject: string;
    schedules: { day: string; periods: string[] }[];
    startTime: string;
    endTime: string;
    breakTime: string;
  }

  const [workList, setWorkList] = useState<Work[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const periodTimes: Record<"1限" | "2限" | "3限" | "4限" | "5限" | "6限", { start: string; end: string }> = {
    "1限": { start: "09:00", end: "10:30" },
    "2限": { start: "10:40", end: "12:10" },
    "3限": { start: "13:10", end: "14:40" },
    "4限": { start: "14:50", end: "16:20" },
    "5限": { start: "16:30", end: "18:00" },
    "6限": { start: "18:10", end: "19:40" },
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleWorkChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setWorkInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (
    index: number,
    field: "day" | "periods",
    value: string | string[]
  ) => {
    const updatedSchedules = [...workInfo.schedules];
    if (field === "day" && typeof value === "string") {
      updatedSchedules[index][field] = value;
    } else if (field === "periods" && Array.isArray(value)) {
      // 時限を並び替える処理を追加
      const sortedPeriods = value.sort((a, b) => {
        const periodOrder = ["1限", "2限", "3限", "4限", "5限", "6限"];
        return periodOrder.indexOf(a) - periodOrder.indexOf(b);
      });
      updatedSchedules[index][field] = sortedPeriods;
    }
    setWorkInfo((prev) => ({ ...prev, schedules: updatedSchedules }));
  };

  const handleScheduleTimeEdit = (
    index: number,
    field: "startTime" | "endTime" | "breakTime",
    value: string
  ) => {
    const updatedSchedules = workInfo.schedules.map((schedule, i) =>
      i === index ? { ...schedule, [field]: value } : schedule
    );
    setWorkInfo((prev) => ({ ...prev, schedules: updatedSchedules }));
  };

  const saveScheduleTimeEdit = () => {
    setEditingIndex(null); // 編集モードを終了
  };

  const calculateWorkingTime = (startTime: string, endTime: string, breakTime: number) => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    const workingMinutes = endTotalMinutes - startTotalMinutes - breakTime;
    return {
      hours: Math.floor(workingMinutes / 60),
      minutes: workingMinutes % 60,
    };
  };

  const addSchedule = () => {
    setWorkInfo((prev) => ({
      ...prev,
      schedules: [
        ...prev.schedules,
        { day: "月曜日", periods: ["1限"], startTime: "", endTime: "", breakTime: "" },
      ],
    }));
  };

  const removeSchedule = (index: number) => {
    const updatedSchedules = workInfo.schedules.filter((_, i) => i !== index);
    setWorkInfo((prev) => ({ ...prev, schedules: updatedSchedules }));
  };

  const calculateStartEndTimes = (periods: string[]) => {
    if (periods.length === 0) return { startTime: "", endTime: "", breakTime: 0 };

    const startTime = periodTimes[periods[0] as "1限" | "2限" | "3限" | "4限" | "5限" | "6限"].start;
    const endTime = periodTimes[periods[periods.length - 1] as "1限" | "2限" | "3限" | "4限" | "5限" | "6限"].end;

    // 休憩時間を計算
    let totalBreakTime = 0;
    for (let i = 0; i < periods.length - 1; i++) {
      const currentEnd = periodTimes[periods[i] as "1限" | "2限" | "3限" | "4限" | "5限" | "6限"].end;
      const nextStart = periodTimes[periods[i + 1] as "1限" | "2限" | "3限" | "4限" | "5限" | "6限"].start;

      // 時間を分に変換して差を計算
      const [currentEndHour, currentEndMinute] = currentEnd.split(":").map(Number);
      const [nextStartHour, nextStartMinute] = nextStart.split(":").map(Number);
      const breakTime = (nextStartHour * 60 + nextStartMinute) - (currentEndHour * 60 + currentEndMinute);

      totalBreakTime += breakTime;
    }

    return { startTime, endTime, breakTime: totalBreakTime };
  };

  const addWork = () => {
    const newWorkData = workInfo.schedules.map((schedule) => {
      const { startTime, endTime, breakTime } = calculateStartEndTimes(schedule.periods);
      const { hours, minutes } = calculateWorkingTime(
        schedule.startTime || startTime,
        schedule.endTime || endTime,
        Number(schedule.breakTime) || breakTime
      );

      return {
        classname: workInfo.subject,
        teacher: workInfo.teacher,
        dayofweek: schedule.day,
        schedule: schedule.periods.map((period) => parseInt(period[0], 10)), // "1限" → 1 のように変換
        starttime: schedule.startTime || startTime,
        endtime: schedule.endTime || endTime,
        breaktime: Number(schedule.breakTime) || breakTime,
        worktime: `${hours}時間${minutes}分`,
      };
    });

    const updatedWorkData = [...workData, ...newWorkData];
    setWorkData(updatedWorkData);

    // ローカルストレージに自動保存
    localStorage.setItem("workData", JSON.stringify(updatedWorkData));
    //alert("仕事が登録され、自動保存されました！");

    // 入力フォームをリセット
    setWorkInfo({
      subject: "",
      schedules: [{ day: "月曜日", periods: ["1限"], startTime: "", endTime: "", breakTime: "" }],
      startTime: "",
      endTime: "",
      breakTime: "",
      teacher: "",
    });
    setIsDialogOpen(false);
  };

  // 仕事リストを保存
  const saveWorkDataToLocalStorage = () => {
    localStorage.setItem("workData", JSON.stringify(workData));
    //alert("仕事リストを保存しました！");
  };

  // 仕事リストを読み込む
  const loadWorkDataFromLocalStorage = () => {
    const savedData = localStorage.getItem("workData");
    if (savedData) {
      setWorkData(JSON.parse(savedData));
      //alert("仕事リストを読み込みました！");
    } else {
      //alert("保存された仕事リストが見つかりません。");
    }
  };

  useEffect(() => {
    loadWorkDataFromLocalStorage();
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-100 to-gray-300">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-800 tracking-wide">
          仕事情報入力
        </h1>
        <form className="w-full max-w-2xl space-y-8">
          {/* ユーザ情報 */}
          <div className="space-y-6 bg-white p-8 rounded-lg shadow-xl border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4">
              ユーザ情報
            </h2>
            <div>
              <label className="block mb-2 font-medium text-gray-700">氏名</label>
              <input
                type="text"
                name="name"
                value={userInfo.name}
                onChange={handleUserChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700">ふりがな</label>
              <input
                type="text"
                name="furigana"
                value={userInfo.furigana}
                onChange={handleUserChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700">学年</label>
              <select
                name="grade"
                value={userInfo.grade}
                onChange={handleUserChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="1">学部１年生</option>
                <option value="2">学部２年生</option>
                <option value="3">学部３年生</option>
                <option value="4">学部４年生</option>
                <option value="5">博士（前期）課程１年</option>
                <option value="6">博士（前期）課程２年</option>
                <option value="7">博士（後期）課程１年</option>
                <option value="8">博士（後期）課程２年</option>
                <option value="9">博士（後期）課程３年</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700">学籍番号</label>
              <input
                type="text"
                name="studentId"
                value={userInfo.studentId}
                onChange={handleUserChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* 仕事リスト */}
          <div className="space-y-6 bg-white p-8 rounded-lg shadow-xl border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4">
              登録済みの仕事
            </h2>
            <ul className="space-y-6">
              {workData.map((work, index) => (
                <li
                  key={index}
                  className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-gray-800">
                      科目名: {work.classname}
                    </p>
                    <button
                      onClick={() => {
                        // 指定した要素を削除
                        const updatedWorkData = workData.filter((_, i) => i !== index);
                        setWorkData(updatedWorkData);

                        // ローカルストレージを更新
                        localStorage.setItem("workData", JSON.stringify(updatedWorkData));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-600">教員名: {work.teacher}</p>
                    <p className="text-sm text-gray-600">曜日: {work.dayofweek}</p>
                    <p className="text-sm text-gray-600">
                      時限: {work.schedule.join(", ")}限
                    </p>
                    <p className="text-sm text-gray-600">開始時間: {work.starttime}</p>
                    <p className="text-sm text-gray-600">終了時間: {work.endtime}</p>
                    <p className="text-sm text-gray-600">休憩時間: {work.breaktime}分</p>
                    <p className="text-sm text-gray-600">実働時間: {work.worktime}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </form>

        {/* 仕事追加ボタン */}
        <button
          onClick={() => setIsDialogOpen(true)}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-600 transition"
        >
          仕事追加
        </button>

        {/* workData 出力ボタン */}
        <button
          onClick={() => alert(`現在のworkData: ${JSON.stringify(workData, null, 2)}`)}
          className="fixed bottom-8 left-8 bg-gradient-to-r from-green-500 to-teal-500 text-white p-4 rounded-full shadow-lg hover:from-green-600 hover:to-teal-600 transition"
        >
          データ出力
        </button>

        {/* ダイアログ */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            {/* ...既存のダイアログ内容... */}
          </div>
        )}
      </div>

      {/* ダイアログ */}
      {isDialogOpen && (
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

                const adjustTime = (time: string, minutes: number) => {
                  const [hour, min] = time.split(":").map(Number);
                  const totalMinutes = hour * 60 + min + minutes;
                  const adjustedHour = Math.floor((totalMinutes + 1440) % 1440 / 60); // 24時間制で調整
                  const adjustedMinutes = (totalMinutes + 1440) % 1440 % 60;
                  return `${String(adjustedHour).padStart(2, "0")}:${String(adjustedMinutes).padStart(2, "0")}`;
                };

                return (
                  <div key={index} className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-4">
                      {/* 曜日選択 */}
                      <div className="flex-1">
                        <label className="block mb-1 font-medium">曜日</label>
                        <select
                          value={schedule.day}
                          onChange={(e) =>
                            handleScheduleChange(index, "day", e.target.value)
                          }
                          className="w-full p-2 border rounded"
                        >
                          <option value="月曜日">月曜日</option>
                          <option value="火曜日">火曜日</option>
                          <option value="水曜日">水曜日</option>
                          <option value="木曜日">木曜日</option>
                          <option value="金曜日">金曜日</option>
                        </select>
                      </div>

                      {/* 時限選択 */}
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

                      {/* 削除ボタン */}
                      <button
                        onClick={() => removeSchedule(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        削除
                      </button>
                    </div>

                    {/* 時間表示または編集モード */}
                    {editingIndex === index ? (
                      <div className="flex flex-col space-y-2">
                        <div>
                          <label className="block mb-1 font-medium">開始時間</label>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                handleScheduleTimeEdit(index, "startTime", adjustTime(schedule.startTime || startTime, -10))
                              }
                              className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                            >
                              -10分
                            </button>
                            <input
                              type="time"
                              value={schedule.startTime || startTime}
                              onChange={(e) =>
                                handleScheduleTimeEdit(index, "startTime", e.target.value)
                              }
                              className="w-full p-2 border rounded"
                            />
                            <button
                              onClick={() =>
                                handleScheduleTimeEdit(index, "startTime", adjustTime(schedule.startTime || startTime, 10))
                              }
                              className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                            >
                              +10分
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block mb-1 font-medium">終了時間</label>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                handleScheduleTimeEdit(index, "endTime", adjustTime(schedule.endTime || endTime, -10))
                              }
                              className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                            >
                              -10分
                            </button>
                            <input
                              type="time"
                              value={schedule.endTime || endTime}
                              onChange={(e) =>
                                handleScheduleTimeEdit(index, "endTime", e.target.value)
                              }
                              className="w-full p-2 border rounded"
                            />
                            <button
                              onClick={() =>
                                handleScheduleTimeEdit(index, "endTime", adjustTime(schedule.endTime || endTime, 10))
                              }
                              className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                            >
                              +10分
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block mb-1 font-medium">休憩時間 (分)</label>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                handleScheduleTimeEdit(index, "breakTime", String(Number(schedule.breakTime || breakTime) - 10))
                              }
                              className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                            >
                              -10分
                            </button>
                            <input
                              type="number"
                              value={schedule.breakTime || breakTime}
                              onChange={(e) =>
                                handleScheduleTimeEdit(index, "breakTime", e.target.value)
                              }
                              className="w-full p-2 border rounded"
                            />
                            <button
                              onClick={() =>
                                handleScheduleTimeEdit(index, "breakTime", String(Number(schedule.breakTime || breakTime) + 10))
                              }
                              className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                            >
                              +10分
                            </button>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingIndex(null)} // キャンセルボタンで編集モードを終了
                            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                          >
                            キャンセル
                          </button>
                          <button
                            onClick={saveScheduleTimeEdit} // 保存ボタン
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            保存
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        <p>開始時間: {schedule.startTime || startTime}</p>
                        <p>終了時間: {schedule.endTime || endTime}</p>
                        <p>休憩時間: {schedule.breakTime || breakTime}分</p>
                        <p>
                          実働時間: {hours}時間{minutes}分
                        </p>
                        <button
                          onClick={() => setEditingIndex(index)}
                          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          編集
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 編集モードでない場合のみスケジュール追加ボタンを表示 */}
              {editingIndex === null && (
                <button
                  onClick={addSchedule}
                  className="text-blue-500 hover:text-blue-700"
                >
                  + スケジュールを追加
                </button>
              )}
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              {editingIndex === null && ( // 編集モードでない場合のみ表示
                <>
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    キャンセル
                  </button>
                    <button
                    onClick={() => {
                      addWork();
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                    登録
                    </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}