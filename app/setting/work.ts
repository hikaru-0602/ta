import { useState } from "react";

//業務情報を管理するためのカスタムフック
export const useWorkInfo = () => {
  //業務情報を管理するための状態を定義
  const [workInfo, setWorkInfo] = useState({
    subject: "", //科目名
    category: "準備等", //業務内容
    schedules: [
      {
        day: "月", //曜日
        periods: ["1限"], //時限
        startTime: "", //開始時刻
        endTime: "", //終了時刻
        breakTime: "", //休憩時間
      },
    ],
    startTime: "", //全体の開始時刻
    endTime: "", //全体の終了時刻
    breakTime: "", //全体の休憩時間
    teacher: "", //担当教員
  });

  //登録された業務データを管理するための状態を定義
  const [workData, setWorkData] = useState<
    {
      id: number; //業務ID
      classname: string; //科目名
      category: string; //業務内容
      teacher: string; //担当教員
      dayofweek: string; //曜日
      schedule: number[]; //時限（数値配列）
      starttime: string; //開始時刻
      endtime: string; //終了時刻
      breaktime: number; //休憩時間（分）
      worktime: string; //勤務時間（フォーマット済み）
    }[]
  >([]);

  //ダイアログの開閉状態を管理するための状態を定義
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  //編集中のスケジュールのインデックスを管理するための状態を定義
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  //データ更新のフラグを管理するための状態を定義
  const [updateFlag, setUpdateFlag] = useState(false);

  //時限ごとの開始時刻と終了時刻を定義
  const periodTimes: Record<"1限" | "2限" | "3限" | "4限" | "5限" | "6限", { start: string; end: string }> = {
    "1限": { start: "09:00", end: "10:30" },
    "2限": { start: "10:40", end: "12:10" },
    "3限": { start: "13:10", end: "14:40" },
    "4限": { start: "14:50", end: "16:20" },
    "5限": { start: "16:30", end: "18:00" },
    "6限": { start: "18:10", end: "19:40" },
  };

  //業務情報の入力フォームの値変更時に呼び出される関数
  const handleWorkChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setWorkInfo((prev) => ({ ...prev, [name]: value }));
  };

  //スケジュールの曜日や時限を変更する関数
  const handleScheduleChange = (
    index: number,
    field: "day" | "periods",
    value: string | string[]
  ) => {
    const updatedSchedules = [...workInfo.schedules];

    // indexが有効かどうかを確認
    if (!updatedSchedules[index]) {
      console.error(`Invalid index: ${index}`);
      return;
    }

    if (field === "day" && typeof value === "string") {
      updatedSchedules[index][field] = value;
    } else if (field === "periods" && Array.isArray(value)) {
      // 時限を並び替える処理
      const sortedPeriods = value.sort((a, b) => {
        const periodOrder = ["1限", "2限", "3限", "4限", "5限", "6限"];
        return periodOrder.indexOf(a) - periodOrder.indexOf(b);
      });
      updatedSchedules[index][field] = sortedPeriods;
    }

    setWorkInfo((prev) => ({ ...prev, schedules: updatedSchedules }));
  };

  //スケジュールの開始時刻、終了時刻、休憩時間を編集する関数
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

  //スケジュール編集を保存する関数
  const saveScheduleTimeEdit = () => {
    setEditingIndex(null); //編集モードを終了
  };

  //勤務時間を計算する関数
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

  //新しいスケジュールを追加する関数
  const addSchedule = () => {
    setWorkInfo((prev) => ({
      ...prev,
      schedules: [
        ...prev.schedules,
        { day: "月曜日", periods: ["1限"], startTime: "", endTime: "", breakTime: "" },
      ],
    }));
  };

  //スケジュールを削除する関数
  const removeSchedule = (index: number) => {
    const updatedSchedules = workInfo.schedules.filter((_, i) => i !== index);
    setWorkInfo((prev) => ({ ...prev, schedules: updatedSchedules }));
  };

  //時限から開始時刻、終了時刻、休憩時間を計算する関数
  const calculateStartEndTimes = (periods: string[]) => {
    if (periods.length === 0) return { startTime: "", endTime: "", breakTime: 0 };

    const startTime = periodTimes[periods[0] as "1限" | "2限" | "3限" | "4限" | "5限" | "6限"].start;
    const endTime = periodTimes[periods[periods.length - 1] as "1限" | "2限" | "3限" | "4限" | "5限" | "6限"].end;

    //休憩時間を計算
    let totalBreakTime = 0;
    for (let i = 0; i < periods.length - 1; i++) {
      const currentEnd = periodTimes[periods[i] as "1限" | "2限" | "3限" | "4限" | "5限" | "6限"].end;
      const nextStart = periodTimes[periods[i + 1] as "1限" | "2限" | "3限" | "4限" | "5限" | "6限"].start;

      //時間を分に変換して差を計算
      const [currentEndHour, currentEndMinute] = currentEnd.split(":").map(Number);
      const [nextStartHour, nextStartMinute] = nextStart.split(":").map(Number);
      const breakTime = (nextStartHour * 60 + nextStartMinute) - (currentEndHour * 60 + currentEndMinute);

      totalBreakTime += breakTime;
    }

    return { startTime, endTime, breakTime: totalBreakTime };
  };

  //新しい業務を追加または更新する関数
  const addWork = (workid: number) => {
    const updatedWorkData = workData.map((work) => {
      if (work.id === workid) {
        // workid が一致する場合、入力内容でデータを更新
        return {
          ...work,
          classname: workInfo.subject,
          category: workInfo.category,
          teacher: workInfo.teacher,
          dayofweek: workInfo.schedules[0].day, // 最初のスケジュールの曜日を使用
          schedule: workInfo.schedules[0].periods.map((period) => parseInt(period[0], 10)), // 時限を数値配列に変換
          starttime: workInfo.schedules[0].startTime,
          endtime: workInfo.schedules[0].endTime,
          breaktime: Number(workInfo.schedules[0].breakTime),
          worktime: `${calculateWorkingTime(
            workInfo.schedules[0].startTime,
            workInfo.schedules[0].endTime,
            Number(workInfo.schedules[0].breakTime)
          ).hours}時間${calculateWorkingTime(
            workInfo.schedules[0].startTime,
            workInfo.schedules[0].endTime,
            Number(workInfo.schedules[0].breakTime)
          ).minutes}分`,
        };
      }
      return work; // 一致しない場合はそのまま
    });

    // 新しいデータを追加する場合
    if (!workData.some((work) => work.id === workid)) {
      const newWorkData = workInfo.schedules.map((schedule) => {
        const { startTime, endTime, breakTime } = calculateStartEndTimes(schedule.periods);
        const { hours, minutes } = calculateWorkingTime(
          schedule.startTime || startTime,
          schedule.endTime || endTime,
          Number(schedule.breakTime) || breakTime
        );

        return {
          id: workid,
          classname: workInfo.subject,
          category: workInfo.category,
          teacher: workInfo.teacher,
          dayofweek: schedule.day,
          schedule: schedule.periods.map((period) => parseInt(period[0], 10)),
          starttime: schedule.startTime || startTime,
          endtime: schedule.endTime || endTime,
          breaktime: Number(schedule.breakTime) || breakTime,
          worktime: `${hours}時間${minutes}分`,
        };
      });

      updatedWorkData.push(...newWorkData);
    }

    setWorkData(updatedWorkData);

    // ローカルストレージに保存
    localStorage.setItem("workData", JSON.stringify(updatedWorkData));

    // 業務情報を初期化
    setWorkInfo({
      subject: "",
      category: "準備等", // 初期値をリセット
      schedules: [{ day: "月曜日", periods: ["1限"], startTime: "", endTime: "", breakTime: "" }],
      startTime: "",
      endTime: "",
      breakTime: "",
      teacher: "",
    });
    setIsDialogOpen(false);
  };

  //業務データを削除する関数
  const handleDeleteWork = (index: number) => {
    const updatedWorkData = workData.filter((_, i) => i !== index);
    setWorkData(updatedWorkData);

    //ローカルストレージを更新
    localStorage.setItem("workData", JSON.stringify(updatedWorkData));

    //強制的に再レンダリングを促す
    setUpdateFlag((prev) => !prev);
  };

  //ローカルストレージから業務データを読み込む関数
  const loadWorkDataFromLocalStorage = () => {
    const savedData = localStorage.getItem("workData");
    if (savedData) {
      setWorkData(JSON.parse(savedData));
    }
  };

  //idを生成する関数
  const generateUniqueId = () => {
    let id: number;
    do {
      id = Math.floor(100 + Math.random() * 900); //100〜999のランダムな3桁の数字を生成
    } while (workData.some((work) => work.id === id)); //重複がないか確認
    return id;
  };

  //フックが返すオブジェクト
  return {
    workInfo, //業務情報の状態
    setWorkInfo, //業務情報を直接更新する関数
    workData, //登録された業務データの状態
    setWorkData, //業務データを直接更新する関数
    isDialogOpen, //ダイアログの開閉状態
    setIsDialogOpen, //ダイアログの開閉状態を更新する関数
    editingIndex, //編集中のスケジュールのインデックス
    setEditingIndex, //編集中のインデックスを更新する関数
    updateFlag, //データ更新のフラグ
    setUpdateFlag, //データ更新フラグを更新する関数
    handleWorkChange, //業務情報の入力フォーム変更時のハンドラー
    handleScheduleChange, //スケジュールの曜日や時限変更時のハンドラー
    handleScheduleTimeEdit, //スケジュールの時刻編集時のハンドラー
    saveScheduleTimeEdit, //スケジュール編集を保存する関数
    addSchedule, //新しいスケジュールを追加する関数
    removeSchedule, //スケジュールを削除する関数
    calculateWorkingTime, //勤務時間を計算する関数
    calculateStartEndTimes, //時限から開始時刻、終了時刻、休憩時間を計算する関数
    addWork, //新しい業務を追加または更新する関数
    handleDeleteWork, //業務データを削除する関数
    loadWorkDataFromLocalStorage, //ローカルストレージから業務データを読み込む関数
    periodTimes, //時限ごとの開始時刻と終了時刻
    generateUniqueId, //ユニークなIDを生成する関数
  };
};