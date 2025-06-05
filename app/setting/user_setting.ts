import { useState, useCallback, useEffect } from "react";
import { db } from "../firebase/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "@firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export const useUserInfo = () => {
  //ユーザー情報を管理するための状態を定義
  const [userInfo, setUserInfo] = useState({
    name: "",
    name_kana: "",
    value: "1",
    id: "",
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // 認証状態を監視してからFirestoreのリアルタイム監視を開始
  useEffect(() => {
    const auth = getAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // ユーザーがログインしている場合のみデータ監視を開始
        const unsubscribeSnapshot = onSnapshot(
          doc(db, `users/${user.uid}`),
          (doc) => {
            if (doc.exists()) {
              const data = doc.data();
              if (
                "name" in data ||
                "name_kana" in data ||
                "value" in data ||
                "id" in data
              ) {
                const { name = "", name_kana = "", value = "1", id = "" } = data;
                setUserInfo({ name, name_kana, value, id });
              }
            }
            setIsInitialized(true);
          },
          (error) => {
            console.error("ユーザー情報の監視エラー:", error);
            setIsInitialized(true);
          }
        );

        // 認証状態が変更されたときにFirestore監視を停止
        return unsubscribeSnapshot;
      } else {
        // ログアウト時は初期状態に戻す
        setUserInfo({
          name: "",
          name_kana: "",
          value: "1",
          id: "",
        });
        setIsInitialized(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

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

  //ユーザー情報をローカルストレージに保存する関数（互換性のため残すが、実際はFirestoreに保存）
  const saveUserInfoToLocalStorage = useCallback(async () => {
    const uid = getAuth().currentUser?.uid;
    if (uid) {
      await saveUserInfoToFirestore(uid);
    }
  }, [userInfo]);

  //ローカルストレージからユーザー情報を読み込む関数（互換性のため残すが、実際はFirestoreから取得）
  const loadUserInfoFromLocalStorage = useCallback(() => {
    // リアルタイム監視により自動で最新データが取得されるため、何もしない
    // 既存コードとの互換性のため関数は残す
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
    if (uid) {
      console.log("Firestoreにユーザー情報を保存します。");
      await saveUserInfoToFirestore(uid);
    }
  }, [userInfo, saveUserInfoToFirestore]);

  //フックが返すオブジェクト
  return {
    userInfo, //ユーザー情報の状態
    setUserInfo, //ユーザー情報を直接更新する関数
    handleUserChange, //入力フォームの値変更時のハンドラー
    handleGradeChange, //学年選択時のハンドラー
    saveUserInfoToLocalStorage, //ユーザー情報をローカルストレージに保存する関数（Firestore保存に変更）
    loadUserInfoFromLocalStorage, //ローカルストレージからユーザー情報を読み込む関数（互換性のため残す）
    fetchUserInfoFromFirestore, //Firestoreからユーザー情報を取得する関数
    handleUserRegister, //ユーザー情報を登録する関数
    isInitialized, //データ初期化完了フラグ
  };
};
