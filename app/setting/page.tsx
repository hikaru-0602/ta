"use client";

import Header from "../components/Header";
import { useState, useEffect } from "react";
import { useUserInfo } from "./user_setting";
import { useWorkInfo } from "./work_setting";
import WorkDialog from "./work_dialog";
import { useAuth } from "../firebase/context/auth";
import { login, logout } from "../firebase/lib/auth";

export default function Work() {
  //ユーザ情報のカスタムフックを使用
  const {
    userInfo,
    handleUserChange,
    handleGradeChange,
    loadUserInfoFromLocalStorage,
    handleUserRegister,
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
  //const [id, setId] = useState<number | null>(null);

  //初期化時にローカルストレージからデータを読み込む
  useEffect(() => {
    loadUserInfoFromLocalStorage();
    loadWorkDataFromLocalStorage();
    initworkInfo();
  }, []);

  const signIn = () => {
    login();
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-100 to-gray-300">
        {/* ログインボタンを右上に配置 */}
        <div className="absolute top-4 right-4 mt-16">
          {user === null && (
            <button
              onClick={signIn}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              ログイン
            </button>
          )}
          {user && (
            <button
              onClick={() => {
                logout();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              ログアウト
            </button>
          )}
        </div>

        {/* 中央揃えのタイトル */}
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-3xl font-extrabold mb-6 text-gray-800 tracking-wide mt-16">
            仕事情報入力
          </h1>
        </div>
        <form
          className="w-full max-w-2xl space-y-8"
          onSubmit={(e) => e.preventDefault()} // デフォルト動作を防ぐ
        >
          {/* ユーザ情報 */}
          <div className="space-y-6 bg-white p-8 rounded-lg shadow-xl border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4">
              ユーザ情報
            </h2>
            {/* 氏名とふりがな */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block mb-2 font-medium text-gray-700">
                  氏名
                </label>
                <input
                  type="text"
                  name="name"
                  value={user === null ? "" : userInfo.name}
                  onChange={handleUserChange}
                  placeholder="例: 山田 太郎"
                  onFocus={(e) => {
                    if (user === null) {
                      alert("ログインしてください。");
                      e.target.blur();
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div className="flex-1">
                <label className="block mb-2 font-medium text-gray-700">
                  ふりがな
                </label>
                <input
                  type="text"
                  name="name_kana"
                  value={user === null ? "" : userInfo.name_kana}
                  onChange={handleUserChange}
                  placeholder="例: やまだ たろう"
                  onFocus={(e) => {
                    if (user === null) {
                      alert("ログインしてください。");
                      e.target.blur();
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>
            {/* 学年と学籍番号 */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block mb-2 font-medium text-gray-700">
                  学年
                </label>
                <select
                  name="grade"
                  value={user === null ? "" : userInfo.value}
                  onChange={handleGradeChange}
                  onMouseDown={(e) => {
                    if (user === null) {
                      e.preventDefault(); // デフォルトのフォーカスを防ぐ
                      alert("ログインしてください。");
                    }
                  }}
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
              <div className="flex-1">
                <label className="block mb-2 font-medium text-gray-700">
                  学籍番号
                </label>
                <input
                  type="text"
                  name="id"
                  value={user === null ? "" : userInfo.id}
                  onChange={handleUserChange}
                  placeholder="例: 1234567"
                  onFocus={(e) => {
                    if (user === null) {
                      alert("ログインしてください。");
                      e.target.blur();
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>
            {/* 時給表示 */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                時給
              </label>
              <p className="text-lg font-bold text-gray-800">
                {user === null ? "    円" : `${userInfo.hourlyWage}円`}
              </p>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  if (user === null) {
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
                  handleUserRegister();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                登録
              </button>
            </div>
          </div>

          {/* 仕事リスト */}
          <div className="space-y-6 bg-white p-8 rounded-lg shadow-xl border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4">
              登録済みの仕事
            </h2>
            {user !== null && (
              <ul className="space-y-4">
                {workData.map((work, index) => (
                  <li
                    key={index}
                    className="p-4 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-lg font-bold text-gray-800">
                          ラベル: {work.label}
                        </p>
                        <p className="text-sm font-bold text-gray-800">
                          科目名: {work.classname}
                        </p>
                        <p className="text-sm text-gray-600">
                          業務内容: {work.category}
                        </p>
                        <p className="text-sm text-gray-600">
                          教員名: {work.teacher}
                        </p>
                        <p className="text-sm text-gray-600">
                          曜日: {work.dayofweek}曜日
                        </p>
                        <p className="text-sm text-gray-600">
                          時限: {work.schedule.join(", ")}限
                        </p>
                        <p className="text-sm text-gray-600">
                          時間: {work.starttime} - {work.endtime}
                        </p>
                        <p className="text-sm text-gray-600">
                          休憩: {work.breaktime}分
                        </p>
                        <p className="text-sm text-gray-600">
                          実働: {work.worktime}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          //alert("くりっくされた");
                          //alert(`業務ID: ${work.id}`);
                          setId(work.id);
                          setIsDialogOpen(true);
                        }}
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
            {user === null && (
              <p className="text-gray-500">ログインしてください</p>
            )}
          </div>
        </form>

        {/* 仕事追加ボタン */}
        <button
          onClick={(e) => {
            e.preventDefault();
            if (user === null) {
              alert("ログインしてください。");
              return;
            }
            const uniqueId = generateUniqueId();
            setId(uniqueId);
            setIsDialogOpen(true);
          }}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-600 transition"
        >
          仕事追加
        </button>

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
