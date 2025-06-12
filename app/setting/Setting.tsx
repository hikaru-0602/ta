"use client";

import { useState, useEffect } from "react";
import { useUserInfo } from "./user_setting";
import { useWorkInfo } from "./work_setting";
import WorkDialog from "./work_dialog";
import { useAuth } from "../firebase/context/auth";
import { useLoginContext } from "../firebase/context/LoginContext";
import { getAuthEmail } from "../firebase/lib/auth";
import { getAuth } from "firebase/auth";
import { gradeInfoMap } from "../types";
import { useAlert } from "../components/AlertProvider";
import { Button } from "@/components/ui/button";

export default function Work() {
  //ユーザ情報のカスタムフックを使用
  const {
    userInfo,
    handleUserChange,
    handleGradeChange,
    //loadUserInfoFromLocalStorage,
    fetchUserInfoFromFirestore,
    handleUserRegister,
    setUserInfo,
  } = useUserInfo();

  //仕事情報のカスタムフックを使用
  const {
    workInfo,
    workData,
    isDialogOpen,
    setIsDialogOpen,
    editingIndex,
    setEditingIndex,
    handleWorkChange,
    handleScheduleChange,
    handleScheduleTimeEdit,
    saveScheduleTimeEdit,
    fetchWorkDataFromFirestore,
    removeSchedule,
    calculateWorkingTime,
    calculateStartEndTimes,
    addWork,
    handleDeleteWork,
    loadWorkDataFromLocalStorage,
    generateUniqueId,
    initworkInfo,
  } = useWorkInfo();

  const [id, setId] = useState<number>(100);
  const user = useAuth(); //認証情報を取得
  const [isUserInfoOpen, setIsUserInfoOpen] = useState(true); // 折りたたみ状態を管理
  const { isLoginTriggered } = useLoginContext(); //ログイン状態を取得
  const auth = getAuth();
  const uid = auth.currentUser?.uid;
  const { showAlert } = useAlert();

  //初期化時にローカルストレージからデータを読み込む
  useEffect(() => {
    //saveUserInfoToLocalStorage();
    fetchUserInfoFromFirestore();
    fetchWorkDataFromFirestore();
    //loadUserInfoFromLocalStorage();
    loadWorkDataFromLocalStorage();
    initworkInfo();
    setIsDialogOpen(false);
    //saveUserInfoToLocalStorage();
  }, [uid]);

  useEffect(() => {
    if (user && isLoginTriggered) {
      const auth = getAuthEmail();
      setUserInfo((prev) => ({
        ...prev,
        id: auth ?? "",
      }));
    }
  }, [isLoginTriggered, user]);

  return (
    <>
      <div className="w-full h-full flex flex-col items-center justify-start max-w-[1200px]">
        {/* 中央揃えのタイトル */}
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-3xl font-extrabold mb-6 text-foreground tracking-wide">
            仕事情報入力
          </h1>
        </div>
        <form
          className="w-full max-w-2xl space-y-8"
          onSubmit={(e) => e.preventDefault()} // デフォルト動作を防ぐ
        >
          {/* ユーザ情報 */}
          <div className="space-y-6 bg-card text-card-foreground p-8 rounded-lg border border-border">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsUserInfoOpen(!isUserInfoOpen)} // 折りたたみ状態を切り替え
            >
              <h2 className="text-2xl font-semibold text-foreground">
                ユーザ情報
              </h2>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                {isUserInfoOpen ? "▲" : "▼"}{" "}
                {/* 折りたたみ状態に応じてアイコンを変更 */}
              </button>
            </div>
            {isUserInfoOpen && ( // 折りたたみ状態が開いている場合のみ表示
              <div>
                {/* 氏名とふりがな */}
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block mb-2 font-medium text-foreground">
                      氏名
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={!user ? "" : userInfo.name ?? ""}
                      onChange={handleUserChange}
                      placeholder="例: 山田 太郎"
                      onFocus={(e) => {
                        if (!user) {
                          showAlert("認証エラー", "ログインしてください。");
                          e.target.blur();
                        }
                      }}
                      className="w-full p-3 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors mb-2"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-2 font-medium text-foreground">
                      ふりがな
                    </label>
                    <input
                      type="text"
                      name="name_kana"
                      value={!user ? "" : userInfo.name_kana ?? ""}
                      onChange={handleUserChange}
                      placeholder="例: やまだ たろう"
                      onFocus={(e) => {
                        if (!user) {
                          showAlert("認証エラー", "ログインしてください。");
                          e.target.blur();
                        }
                      }}
                      className="w-full p-3 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors mb-2"
                    />
                  </div>
                </div>
                {/* 学年と学籍番号 */}
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block mb-2 font-medium text-foreground">
                      学年
                    </label>
                    <select
                      name="grade"
                      value={!user ? "" : userInfo.value ?? "1"}
                      onChange={handleGradeChange}
                      onMouseDown={(e) => {
                        if (!user) {
                          e.preventDefault(); // デフォルトのフォーカスを防ぐ
                          showAlert("認証エラー", "ログインしてください。");
                        }
                      }}
                      className="w-full p-3 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                    >
                      {Object.entries(gradeInfoMap).map(([val, info]) => (
                        <option key={val} value={val}>
                          {info.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block mb-2 font-medium text-foreground">
                      学籍番号
                    </label>
                    <input
                      type="text"
                      name="id"
                      value={!user ? "" : userInfo.id}
                      onChange={handleUserChange}
                      placeholder="例: 1234567"
                      onFocus={(e) => {
                        if (!user) {
                          showAlert("認証エラー", "ログインしてください。");
                          e.target.blur();
                        }
                      }}
                      className="w-full p-3 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                    />
                  </div>
                </div>
                {/* 時給表示 */}
                <div>
                  <label className="block mb-2 font-medium text-foreground">
                    時給
                  </label>
                  <p className="text-lg font-bold text-foreground">
                    {user && userInfo.value
                      ? `${gradeInfoMap[userInfo.value].wage}円`
                      : "    円"}
                  </p>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => {
                      if (!user) {
                        showAlert("認証エラー", "ログインしてください。");
                        return;
                      } else if (
                        userInfo.name === "" &&
                        userInfo.name_kana === "" &&
                        userInfo.value === "" &&
                        userInfo.id === ""
                      ) {
                        showAlert("入力エラー", "入力に不備があります。");
                        return;
                      }
                      showAlert("登録完了", "登録しました。");
                      handleUserRegister(uid);
                    }}
                  >
                    登録
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 仕事リスト */}
          <div className="space-y-6 bg-card text-card-foreground p-8 rounded-lg border border-border">
            <div className="flex justify-start items-center space-x-8">
              <h2 className="text-2xl font-semibold text-foreground border-b pb-4">
                登録済みの仕事
              </h2>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  if (!user) {
                    showAlert("認証エラー", "ログインしてください。");
                    return;
                  }
                  const uniqueId = generateUniqueId();
                  setId(uniqueId);
                  setIsDialogOpen(true);
                }}
                className="mb-4"
              >
                追加
              </Button>
            </div>
            {user && (
              <ul className="space-y-4">
                {workData.map((work, index) => (
                  <li
                    key={index}
                    className="p-4 bg-background border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0 mr-4 overflow-hidden">
                        <p className="text-lg font-bold text-foreground truncate whitespace-nowrap">
                          <span className="text-sm text-muted-foreground">ラベル:</span>{" "}
                          <span title={work.label || "（ラベルなし）"}>
                            {work.label || "（ラベルなし）"}
                          </span>
                        </p>
                        <p className="text-sm font-bold text-foreground truncate whitespace-nowrap">
                          <span className="text-muted-foreground">科目名:</span>{" "}
                          <span title={work.classname || "（未設定）"}>
                            {work.classname || "（未設定）"}
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground truncate whitespace-nowrap">
                          業務内容: {work.category}
                        </p>
                        <p className="text-sm text-muted-foreground truncate whitespace-nowrap">
                          <span>教員名:</span>{" "}
                          <span title={work.teacher || "（未設定）"}>
                            {work.teacher || "（未設定）"}
                          </span>
                        </p>
                        <div className="flex space-x-4 overflow-hidden">
                          <p className="text-sm text-muted-foreground truncate whitespace-nowrap">
                            曜日:{" "}
                            {work.dayofweek === "" ? "なし" : work.dayofweek}
                          </p>
                          <p className="text-sm text-muted-foreground truncate whitespace-nowrap">
                            時限:{" "}
                            {work.schedule && work.schedule.length > 0
                              ? work.schedule.join(", ") + "限"
                              : "なし"}
                          </p>
                        </div>
                        <div className="flex space-x-4 overflow-hidden">
                          <p className="text-sm text-muted-foreground truncate whitespace-nowrap">
                            時刻: {work.starttime}~{work.endtime}
                          </p>
                          <p className="text-sm text-muted-foreground truncate whitespace-nowrap">
                            休憩: {work.breaktime}分
                          </p>
                          <p className="text-sm text-muted-foreground truncate whitespace-nowrap">
                            実働: {work.worktime}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 flex-shrink-0">
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            setId(work.id);
                            setIsDialogOpen(true);
                          }}
                          variant="link"
                          size="sm"
                          className="text-primary hover:text-primary/80 p-0 h-auto"
                        >
                          編集
                        </Button>
                        <Button
                          onClick={() => handleDeleteWork(index)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive/80 p-1 h-auto"
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
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {!user && (
              <p className="text-muted-foreground">
                ログインしてください
              </p>
            )}
          </div>
        </form>

        {/* ダイアログ */}
        <WorkDialog
          isDialogOpen={isDialogOpen}
          workInfo={workInfo}
          workData={workData}
          workid={id}
          setIsDialogOpen={setIsDialogOpen}
          handleWorkChange={handleWorkChange}
          handleScheduleChange={handleScheduleChange}
          handleScheduleTimeEdit={handleScheduleTimeEdit}
          removeSchedule={removeSchedule}
          calculateStartEndTimes={calculateStartEndTimes}
          calculateWorkingTime={calculateWorkingTime}
          addWork={() => addWork(id)}
          initworkInfo={initworkInfo}
          editingIndex={editingIndex}
          setEditingIndex={setEditingIndex}
          saveScheduleTimeEdit={saveScheduleTimeEdit}
        />
      </div>
    </>
  );
}
