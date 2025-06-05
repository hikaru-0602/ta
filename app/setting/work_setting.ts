import { useState, useCallback, useEffect } from "react";
import { WorkData } from "../types";
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

//業務情報を管理するためのカスタムフック
export const useWorkInfo = () => {
  //業務情報を管理するための状態を定義
  const [workInfo, setWorkInfo] = useState({
    label: "", //仕事のラベル
    subject: "", //科目名
    category: "(準備等)", //業務内容
    schedules: [
      {
        day: "", //曜日
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
      label: string; //仕事のラベル
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

  // 認証状態を監視してからFirestoreの業務データをリアルタイムで取得
  useEffect(() => {
    const auth = getAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // ユーザーがログインしている場合のみデータ監視を開始
        const unsubscribeSnapshot = onSnapshot(
          collection(db, `users/${user.uid}/works`),
          (snapshot) => {
            const works = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: Number(doc.data().id) || Number(doc.id)
            })) as WorkData[];
            setWorkData(works);
            console.log("業務データをFirestoreから取得しました。", works);
          },
          (error) => {
            console.error("業務データの監視エラー:", error);
          }
        );

        // 認証状態が変更されたときにFirestore監視を停止
        return unsubscribeSnapshot;
      } else {
        // ログアウト時は初期状態に戻す
        setWorkData([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  //時限ごとの開始時刻と終了時刻を定義
  const periodTimes = {
    "1限": { start: "09:00", end: "10:30" },
    "2限": { start: "10:40", end: "12:10" },
    "3限": { start: "13:10", end: "14:40" },
    "4限": { start: "14:50", end: "16:20" },
    "5限": { start: "16:30", end: "18:00" },
    "6限": { start: "18:10", end: "19:40" },
  };

  //業務情報の入力フォーム変更時のハンドラー
  const handleWorkChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setWorkInfo((prev) => ({ ...prev, [name]: value }));
  }, []);

  //スケジュールの曜日や時限変更時のハンドラー
  const handleScheduleChange = useCallback((
    index: number,
    field: "day" | "periods",
    value: string | string[]
  ) => {
    setWorkInfo((prev) => {
      const updatedSchedules = [...prev.schedules];
      updatedSchedules[index] = { ...updatedSchedules[index], [field]: value };
      return { ...prev, schedules: updatedSchedules };
    });
  }, []);

  //スケジュールの時刻編集時のハンドラー
  const handleScheduleTimeEdit = useCallback((index: number, field: "startTime" | "endTime" | "breakTime", value: string) => {
    setWorkInfo((prev) => {
      const updatedSchedules = [...prev.schedules];
      updatedSchedules[index] = { ...updatedSchedules[index], [field]: value };
      return { ...prev, schedules: updatedSchedules };
    });
  }, []);

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
    const workingMinutes = Math.max(
      0,
      endTotalMinutes - startTotalMinutes - breakTime //休憩時間が 0 の場合もそのまま計算
    );

    return {
      hours: Math.floor(workingMinutes / 60),
      minutes: workingMinutes % 60,
    };
  };

  //時限から開始時刻、終了時刻、休憩時間を計算する関数
  const calculateStartEndTimes = (periods: string[]) => {
    if (periods.length === 0) {
      return {
        startTime: "09:00", // デフォルト開始時間
        endTime: "10:00", // デフォルト終了時間
        breakTime: 0, // デフォルト休憩時間
      };
    }

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

  const saveWorkDataToFirestore = async (uid: string, work: WorkData) => {
    const ref = doc(db, `users/${uid}/works/${work.id}`);
    await setDoc(ref, work, { merge: true });
  };

  //業務データをFirestoreから取得する関数（互換性のため残すが、リアルタイム監視により自動取得）
  const fetchWorkDataFromFirestore = useCallback(async () => {
    // リアルタイム監視により自動で最新データが取得されるため、何もしない
    // 既存コードとの互換性のため関数は残す
  }, []);

  //新しい業務を追加または更新する関数
  const addWork = async (workid: number) => {
    const updatedWorkData = workData.map((existWorkData) => {
      if (existWorkData.id === workid) {
        // 更新時の時間計算
        const { startTime, endTime } = calculateStartEndTimes(workInfo.schedules[0].periods);
        const finalStartTime = workInfo.schedules[0].startTime || startTime;
        const finalEndTime = workInfo.schedules[0].endTime || endTime;
        const finalBreakTime = Number(workInfo.schedules[0].breakTime);

        const { hours, minutes } = calculateWorkingTime(finalStartTime, finalEndTime, finalBreakTime);

        const updated = {
          ...existWorkData,
          label: workInfo.label,
          classname: workInfo.subject,
          category: workInfo.category,
          teacher: workInfo.teacher,
          dayofweek: workInfo.schedules[0].day,
          schedule: workInfo.schedules[0].periods.map((period) => parseInt(period[0], 10)),
          starttime: finalStartTime,
          endtime: finalEndTime,
          breaktime: finalBreakTime,
          worktime: `${hours}時間${minutes}分`,
        };

        const uid = getAuth().currentUser?.uid;
        //ここで新しいデータをFirestoreに保存
        if (uid) {
          saveWorkDataToFirestore(uid, updated);
        }

        return updated;
      }
      return existWorkData;
    });

    //新しいデータを追加する場合
    if (!workData.some((work) => work.id === workid)) {
      const newWorkData = workInfo.schedules.map((schedule) => {
        const { startTime, endTime, breakTime } = calculateStartEndTimes(schedule.periods);
        const finalStartTime = schedule.startTime || startTime;
        const finalEndTime = schedule.endTime || endTime;
        const finalBreakTime = Number(schedule.breakTime) || breakTime;

        const { hours, minutes } = calculateWorkingTime(finalStartTime, finalEndTime, finalBreakTime);

        return {
          id: workid,
          label: workInfo.label,
          classname: workInfo.subject,
          category: workInfo.category,
          teacher: workInfo.teacher,
          dayofweek: schedule.day,
          schedule: schedule.periods.map((period) => parseInt(period[0], 10)),
          starttime: finalStartTime,
          endtime: finalEndTime,
          breaktime: finalBreakTime,
          worktime: `${hours}時間${minutes}分`, // 実働時間を計算して設定
        };
      });

      updatedWorkData.push(...newWorkData);
      console.log("新しい業務データを追加しました。", newWorkData);
      const uid = getAuth().currentUser?.uid;
      if (uid) {
        for (const work of newWorkData) {
          await saveWorkDataToFirestore(uid, work);
        }
      }

    }

    setWorkData(updatedWorkData);

    // 業務情報を初期化
    initworkInfo();
    setIsDialogOpen(false);
  };

  const deleteWorkDataFromFirestore = async (uid: string, workId: number) => {
    const ref = doc(db, `users/${uid}/works/${workId}`);
    await deleteDoc(ref);
  };

  //業務データを削除する関数
  const handleDeleteWork = async (index: number) => {
    const deletedWork = workData[index];
    if (!deletedWork) return;

    const updatedWorkData = workData.filter((_, i) => i !== index);
    setWorkData(updatedWorkData);

    // Firestoreからも削除
    const uid = getAuth().currentUser?.uid;
    if (uid && deletedWork.id !== undefined) {
      await deleteWorkDataFromFirestore(uid, deletedWork.id);
    }

    // 強制的に再レンダリングを促す
    setUpdateFlag((prev) => !prev);
  };

  //ローカルストレージから業務データを読み込む関数（互換性のため残すが、リアルタイム監視により自動取得）
  const loadWorkDataFromLocalStorage = useCallback(() => {
    // リアルタイム監視により自動で最新データが取得されるため、何もしない
    // 既存コードとの互換性のため関数は残す
  }, []);

  //idを生成する関数
  const generateUniqueId = () => {
    let id: number;
    do {
      id = Math.floor(100 + Math.random() * 900); //100〜999のランダムな3桁の数字を生成
    } while (workData.some((work) => work.id === id)); //重複がないか確認
    return id;
  };

  //業務情報を初期化する関数
  const initworkInfo = useCallback(() => {
    setWorkInfo({
      label: "",
      subject: "",
      category: "(準備等)", // 初期値をリセット
      schedules: [{ day: "", periods: ["1限"], startTime: "", endTime: "", breakTime: "" }],
      startTime: "",
      endTime: "",
      breakTime: "",
      teacher: "",
    });
  }, []);

  //スケジュールを削除する関数
  const removeSchedule = (index: number) => {
    const updatedSchedules = workInfo.schedules.filter((_, i) => i !== index);
    setWorkInfo((prev) => ({ ...prev, schedules: updatedSchedules }));
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
    removeSchedule, //スケジュールを削除する関数
    calculateWorkingTime, //勤務時間を計算する関数
    calculateStartEndTimes, //時限から開始時刻、終了時刻、休憩時間を計算する関数
    fetchWorkDataFromFirestore, //業務データをFirestoreから取得する関数（互換性のため残す）
    addWork, //新しい業務を追加または更新する関数
    handleDeleteWork, //業務データを削除する関数
    loadWorkDataFromLocalStorage, //ローカルストレージから業務データを読み込む関数（互換性のため残す）
    periodTimes, //時限ごとの開始時刻と終了時刻
    generateUniqueId, //ユニークなIDを生成する関数
    initworkInfo, //業務情報を初期化する関数
  };
};