import {
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase'; //認証情報を取得
import { getAuth } from 'firebase/auth'; //Firebase Authを取得

export const login = (): Promise<UserCredential> => { //ログイン
  const provider = new GoogleAuthProvider(); //Googleの認証情報を取得
  //return signInWithRedirect(auth, provider);
  return signInWithPopup(auth, provider); //ポップアップで認証
};

export const logout = (): Promise<void> => { //ログアウト
  return signOut(auth); //ログアウト
};

export function getAuthEmail(): string | null { //認証情報を取得
  const auth = getAuth().currentUser?.email;
  if (!auth) return null;
  const atIndex = auth.indexOf('@');
  return auth.slice(1, atIndex);
}

export async function loginAndGetAuth() {
  // ログイン処理を呼び出す
  await login();

  return auth;
}