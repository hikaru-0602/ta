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
    addSchedule,
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
          <h1 className="text-3xl font-extrabold mb-6 text-gray-800 tracking-wide dark:text-white">
            仕事情報入力
          </h1>
        </div>
        <form
          className="w-full max-w-2xl space-y-8"
          onSubmit={(e) => e.preventDefault()} // デフォルト動作を防ぐ
        >
          {/* ユーザ情報 */}
          <div className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsUserInfoOpen(!isUserInfoOpen)} // 折りたたみ状態を切り替え
            >
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                ユーザ情報
              </h2>
              <button className="text-gray-500 dark:text-gray-400">
                {isUserInfoOpen ? "▲" : "▼"}{" "}
                {/* 折りたたみ状態に応じてアイコンを変更 */}
              </button>
            </div>
            {isUserInfoOpen && ( // 折りたたみ状態が開いている場合のみ表示
              <div>
                {/* 氏名とふりがな */}
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
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
                          alert("ログインしてください。");
                          e.target.blur();
                        }
                      }}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition mb-2 dark:bg-gray-700 dark:text-gray-200"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
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
                          alert("ログインしてください。");
                          e.target.blur();
                        }
                      }}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition mb-2 dark:bg-gray-700 dark:text-gray-200"
                    />
                  </div>
                </div>
                {/* 学年と学籍番号 */}
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                      学年
                    </label>
                    <select
                      name="grade"
                      value={!user ? "" : userInfo.value ?? "1"}
                      onChange={handleGradeChange}
                      onMouseDown={(e) => {
                        if (!user) {
                          e.preventDefault(); // デフォルトのフォーカスを防ぐ
                          alert("ログインしてください。");
                        }
                      }}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition dark:bg-gray-700 dark:text-gray-200"
                    >
                      {Object.entries(gradeInfoMap).map(([val, info]) => (
                        <option key={val} value={val}>
                          {info.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
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
                          alert("ログインしてください。");
                          e.target.blur();
                        }
                      }}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition dark:bg-gray-700 dark:text-gray-200"
                    />
                  </div>
                </div>
                {/* 時給表示 */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                    時給
                  </label>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {user && userInfo.value
                      ? `${gradeInfoMap[userInfo.value].wage}円`
                      : "    円"}
                  </p>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => {
                      if (!user) {
                        alert("ログインしてください。");
                        return;
                      } else if (
                        userInfo.name === "" &&
                        userInfo.name_kana === "" &&
                        userInfo.value === "" &&
                        userInfo.id === ""
                      ) {
                        alert("入力に不備があります。");
                        return;
                      }
                      alert("登録しました。");
                      handleUserRegister(uid);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    登録
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 仕事リスト */}
          <div className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-start items-center space-x-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 border-b pb-4">
                登録済みの仕事
              </h2>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (!user) {
                    alert("ログインしてください。");
                    return;
                  }
                  const uniqueId = generateUniqueId();
                  setId(uniqueId);
                  setIsDialogOpen(true);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition mb-4"
              >
                追加
              </button>
            </div>
            {user && (
              <ul className="space-y-4">
                {workData.map((work, index) => (
                  <li
                    key={index}
                    className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                          ラベル: {work.label}
                        </p>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                          科目名: {work.classname}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          業務内容: {work.category}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          教員名: {work.teacher}
                        </p>
                        <div className="flex space-x-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            曜日:{" "}
                            {work.dayofweek === "" ? "なし" : work.dayofweek}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            時限:{" "}
                            {work.schedule && work.schedule.length > 0
                              ? work.schedule.join(", ") + "限"
                              : "なし"}
                          </p>
                        </div>
                        <div className="flex space-x-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            時刻: {work.starttime}~{work.endtime}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            休憩: {work.breaktime}分
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            実働: {work.worktime}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setId(work.id);
                          setIsDialogOpen(true);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDeleteWork(index)}
                        className="text-red-500 hover:text-red-700 ml-4"
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
                  </li>
                ))}
              </ul>
            )}
            {!user && (
              <p className="text-gray-500 dark:text-gray-400">
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
          addSchedule={addSchedule}
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
