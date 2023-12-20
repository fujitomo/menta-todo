import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export const useUpdatePopover = () => {
  const router = useRouter();

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
    onClose();
    router.push('/Login');
  }

  return {
    handleItemClick,
    handleLogout
  };
};