import { useState, useCallback } from "react";
import { db } from "../firebase/lib/firebase";
import { doc, getDoc, setDoc } from "@firebase/firestore";
import { getAuth } from "firebase/auth";

export const useUserInfo = () => {
  //ユーザー情報を管理するための状態を定義
  const [userInfo, setUserInfo] = useState({
    name: "",
    name_kana: "",
    value: "1",
    id: "",
  });

  //入力フォームの値変更時に呼び出される関数。入力された値をuserInfoに反映する
  const handleUserChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  }, []);

  //学年選択時に呼び出される関数。学年に応じて時給を更新する
  const handleGradeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const gradeValue = e.target.value;
    //userInfoを更新
    setUserInfo((prev) => ({
      ...prev,
      value: gradeValue,
    }));
  }, []);

  //ユーザー情報をローカルストレージに保存する関数
  const saveUserInfoToLocalStorage = useCallback(() => {
    //slocalStorage.removeItem("userInfo"); // 既存の情報を削除
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    //alert(JSON.stringify(userInfo)); //保存した情報をアラートで表示
  }, [userInfo]);

  //ローカルストレージからユーザー情報を読み込む関数
  const loadUserInfoFromLocalStorage = useCallback(() => {
    const savedUserInfo = localStorage.getItem("userInfo");
    if (savedUserInfo) {
      setUserInfo(JSON.parse(savedUserInfo));
    }
  }, []);

  const fetchUserInfoFromFirestore = useCallback(async () => {
    const uid = getAuth().currentUser?.uid;
    console.log("uid", uid);
    if (!uid) return;
    const ref = doc(db, `users/${uid}`);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      // name, name_kana, value, id のいずれかのフィールドが存在する場合のみ処理
      if (
      "name" in data ||
      "name_kana" in data ||
      "value" in data ||
      "id" in data
      ) {
      const { name = "", name_kana = "", value = "1", id = "" } = data;
      setUserInfo({ name, name_kana, value, id });
      localStorage.setItem("userInfo", JSON.stringify({ name, name_kana, value, id }));
      }
    }
  }, []);

  // Firestoreにユーザー情報を保存する関数
  const saveUserInfoToFirestore = useCallback(async (uid: string) => {
    const ref = doc(db, `users/${uid}`);
    const { name, name_kana, id, value } = userInfo;
    await setDoc(ref, {
      name: name ?? "",
      name_kana: name_kana ?? "",
      id: id ?? "",
      value: value ?? "1",
    }, { merge: true });
  }, [userInfo]);

  //ユーザー情報を登録する関数
  const handleUserRegister = useCallback(async (uid?: string) => {
    const savedUserInfo = localStorage.getItem("userInfo");
    const parsedUserInfo = savedUserInfo ? JSON.parse(savedUserInfo) : null;

    if (!parsedUserInfo || (userInfo.name !== parsedUserInfo.name || userInfo.name_kana !== parsedUserInfo.name_kana || userInfo.value !== parsedUserInfo.value || userInfo.id !== parsedUserInfo.id)) {
      console.log("ユーザー情報が変更されました。Firestoreに保存します。");
      saveUserInfoToLocalStorage();
      if (uid) {
        console.log("Firestoreにユーザー情報を保存します。");
        await saveUserInfoToFirestore(uid);
      }
    }else {
    }
  }, [userInfo, saveUserInfoToLocalStorage, saveUserInfoToFirestore]);

  //フックが返すオブジェクト
  return {
    userInfo, //ユーザー情報の状態
    setUserInfo, //ユーザー情報を直接更新する関数
    handleUserChange, //入力フォームの値変更時のハンドラー
    handleGradeChange, //学年選択時のハンドラー
    saveUserInfoToLocalStorage, //ユーザー情報をローカルストレージに保存する関数
    loadUserInfoFromLocalStorage, //ローカルストレージからユーザー情報を読み込む関数
    fetchUserInfoFromFirestore, //Firestoreからユーザー情報を取得する関数
    handleUserRegister, //ユーザー情報を登録する関数
  };
};
