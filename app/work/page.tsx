"use client";

import Header from "../components/Header";
import { useState } from "react";

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
    schedules: [{ day: "月曜日", periods: ["1限"] }],
    startTime: "",
    endTime: "",
    breakTime: "",
  });

  interface Work {
    subject: string;
    schedules: { day: string; periods: string[] }[];
    startTime: string;
    endTime: string;
    breakTime: string;
  }

  const [workList, setWorkList] = useState<Work[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const periodTimes: Record<"1限" | "2限" | "3限" | "4限" | "5限" | "6限", { start: string; end: string }> = {
    "1限": { start: "09:00", end: "10:30" },
    "2限": { start: "10:40", end: "12:10" },
    "3限": { start: "13:00", end: "14:30" },
    "4限": { start: "14:40", end: "16:10" },
    "5限": { start: "16:20", end: "17:50" },
    "6限": { start: "18:00", end: "19:30" },
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
      updatedSchedules[index][field] = value;
    }
    setWorkInfo((prev) => ({ ...prev, schedules: updatedSchedules }));
  };

  const addSchedule = () => {
    setWorkInfo((prev) => ({
      ...prev,
      schedules: [...prev.schedules, { day: "月曜日", periods: ["1限"] }],
    }));
  };

  const removeSchedule = (index: number) => {
    const updatedSchedules = workInfo.schedules.filter((_, i) => i !== index);
    setWorkInfo((prev) => ({ ...prev, schedules: updatedSchedules }));
  };

  const calculateStartEndTimes = (periods: string[]) => {
    if (periods.length === 0) return { startTime: "", endTime: "" };

    const startTime = periodTimes[periods[0] as "1限" | "2限" | "3限" | "4限" | "5限" | "6限"].start;
    const endTime = periodTimes[periods[periods.length - 1] as "1限" | "2限" | "3限" | "4限" | "5限" | "6限"].end;

    return { startTime, endTime };
  };

  const addWork = () => {
    const { startTime, endTime } = calculateStartEndTimes(
      workInfo.schedules.flatMap((schedule) => schedule.periods)
    );

    setWorkList((prev) => [
      ...prev,
      { ...workInfo, startTime, endTime },
    ]);

    setWorkInfo({
      subject: "",
      schedules: [{ day: "月曜日", periods: ["1限"] }],
      startTime: "",
      endTime: "",
      breakTime: "",
    });
    setIsDialogOpen(false);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">仕事情報入力</h1>
        <form className="w-full max-w-lg space-y-6">
          {/* ユーザ情報 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">ユーザ情報</h2>
            <div>
              <label className="block mb-1 font-medium">氏名</label>
              <input
                type="text"
                name="name"
                value={userInfo.name}
                onChange={handleUserChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">ふりがな</label>
              <input
                type="text"
                name="furigana"
                value={userInfo.furigana}
                onChange={handleUserChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">学年</label>
              <select
                name="grade"
                value={userInfo.grade}
                onChange={handleUserChange}
                className="w-full p-2 border rounded"
              >
                <option value="1年">1年</option>
                <option value="2年">2年</option>
                <option value="3年">3年</option>
                <option value="4年">4年</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">学籍番号</label>
              <input
                type="text"
                name="studentId"
                value={userInfo.studentId}
                onChange={handleUserChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* 仕事リスト */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">登録済みの仕事</h2>
            <ul className="space-y-2">
              {workList.map((work, index) => (
                <li key={index} className="p-4 border rounded shadow">
                  <p>科目名: {work.subject}</p>
                  {work.schedules.map((schedule, i) => (
                    <p key={i}>
                      曜日: {schedule.day}, 時限: {schedule.periods.join(", ")}
                    </p>
                  ))}
                  <p>開始時間: {work.startTime}</p>
                  <p>終了時間: {work.endTime}</p>
                  <p>休憩時間: {work.breakTime}分</p>
                </li>
              ))}
            </ul>
          </div>
        </form>

        {/* 仕事追加ボタン */}
        <button
          onClick={() => setIsDialogOpen(true)}
          className="fixed bottom-8 right-8 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600"
        >
          仕事追加
        </button>

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
                {workInfo.schedules.map((schedule, index) => (
                  <div key={index} className="flex items-center space-x-4">
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
                ))}
                <button
                  onClick={addSchedule}
                  className="text-blue-500 hover:text-blue-700"
                >
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
        )}
      </div>
    </>
  );
}