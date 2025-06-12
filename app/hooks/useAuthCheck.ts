import { useAuth } from '../firebase/context/auth';
import { useAlert } from '../components/AlertProvider';

export const useAuthCheck = () => {
  const auth = useAuth();
  const { showAlert } = useAlert();

  const checkAuth = (): boolean => {
    if (!auth.user) {
      showAlert('認証エラー', 'ログインしてください。');
      return false;
    }
    return true;
  };

  return { checkAuth, isAuthenticated: !!auth.user };
};