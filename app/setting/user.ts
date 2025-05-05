import { useState } from "react";

export const useUserInfo = () => {
  //ユーザー情報を管理するための状態を定義
  const [userInfo, setUserInfo] = useState({
    name: "",
    name_kana: "",
    grade: "学部１年生",
    value: "1",
    id: "",
    hourlyWage: 1010,
  });

  //入力フォームの値変更時に呼び出される関数。入力された値をuserInfoに反映する
  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  //学年選択時に呼び出される関数。学年に応じて時給を更新する
  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const gradeValue = e.target.value;
    const gradeText = e.target.options[e.target.selectedIndex].text;

    //学年ごとの時給をマッピング
    const hourlyWageMap: Record<string, number> = {
      "1": 1010,
      "2": 1020,
      "3": 1030,
      "4": 1040,
      "5": 1050,
      "6": 1090,
      "7": 1140,
      "8": 1160,
      "9": 1170,
    };

    //userInfoを更新
    setUserInfo((prev) => ({
      ...prev,
      grade: gradeText,
      value: gradeValue,
      hourlyWage: hourlyWageMap[gradeValue],
    }));
  };

  //ユーザー情報をローカルストレージに保存する関数
  const saveUserInfoToLocalStorage = () => {
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    alert(JSON.stringify(userInfo)); //保存した情報をアラートで表示
  };

  //ローカルストレージからユーザー情報を読み込む関数
  const loadUserInfoFromLocalStorage = () => {
    const savedUserInfo = localStorage.getItem("userInfo");
    if (savedUserInfo) {
      setUserInfo(JSON.parse(savedUserInfo));
    }
  };

  //ユーザー情報を登録する関数
  const handleUserRegister = () => {
    saveUserInfoToLocalStorage();
    //alert(`ユーザ情報を登録しました！\n時給: ${userInfo.hourlyWage}円`);
  };

  //フックが返すオブジェクト
  return {
    userInfo, //ユーザー情報の状態
    setUserInfo, //ユーザー情報を直接更新する関数
    handleUserChange, //入力フォームの値変更時のハンドラー
    handleGradeChange, //学年選択時のハンドラー
    saveUserInfoToLocalStorage, //ユーザー情報をローカルストレージに保存する関数
    loadUserInfoFromLocalStorage, //ローカルストレージからユーザー情報を読み込む関数
    handleUserRegister, //ユーザー情報を登録する関数
  };
};
