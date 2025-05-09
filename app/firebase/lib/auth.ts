import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  UserCredential,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase'; //認証情報を取得


export const login = (): Promise<UserCredential> => { //ログイン
  const provider = new GoogleAuthProvider(); //Googleの認証情報を取得
  //return signInWithRedirect(auth, provider);
  return signInWithPopup(auth, provider); //ポップアップで認証
};

export const logout = (): Promise<void> => { //ログアウト
  return signOut(auth); //ログアウト
};