import { State, notificationsState } from "@/recoilAtoms/recoilState";
import { useNotifications } from "@/hooks/useNotifications";
import { useRecoilValue } from "recoil";

export const useMessageSnackbar = () => {
    const notification = useRecoilValue(notificationsState);

    const {
        confirmed,
      } = useNotifications();

    const isOpenMessageSnackbar = () => {
        return notification.state === State.ERROR || notification.state === State.ERROR2;
    }
    const handleCloseSnackbar = () => {
        // モーダルを閉じる ※messageも渡さないとSnackbarが消えるときに空白のSnackbarが1瞬表示される
        confirmed({ id: 'snackbar', state: State.PROSSING, message: notification.message });
    };

    return {
        isOpenMessageSnackbar,
        handleCloseSnackbar,
    };
};