import { useRouter } from 'next/router';
import Cookies from "js-cookie";
import { useNotifications } from '../useNotifications';
import { State } from '@/recoilAtoms/recoilState';

export const useUpdatePopover = () => {
  const router = useRouter();
  const notifications = useNotifications();

  function handleItemClick(value: string, onClose: () => void) {
    switch (value) {
      case 'profile':
        router.push('/Profile');
        break;
      case 'updateEmail':
        router.push('/UpDateMailAddress');
        break;
      case 'updatePassword':
          router.push('/UpLoginPassword');
        break;
      default:
        break;
    }
    onClose();
  }

  const handleLogout = (onClose: () => void) => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    notifications.confirmed({ id: "useUpdatePopover", state: State.STANDBY });
    onClose();
    router.push('/Login');
  }

  return {
    handleItemClick,
    handleLogout
  };
};