import { useRecoilValue, useSetRecoilState } from 'recoil';
import { notificationsState, State, TodoCard, todoListState } from '@/recoilAtoms/recoilState';

//useAPIで使用する物。setTodoCardList等を他useAPIを使用するカスタムフックに記述するとエラーになるため、ここに記述
export const useNotifications = () => {
    const setNotificationsState = useSetRecoilState(notificationsState);
    const notification = useRecoilValue(notificationsState);

    const updateState = ({
        id,
        state,
        message = '',
        loading = false,
        closeTimer = 0,
    }: {
        id: string;
        state: State;
        message?: string;
        loading?: boolean;
        closeTimer?: number;
    }) => {
        setNotificationsState({
            id,
            loading,
            state,
            message,
            closeTimer,
        });
    }

    const open = (params: { id: string; state: State; message?: string }) => {
        updateState({ ...params, loading: true });
    }

    const confirmed = (params: { id: string; state: State; message?: string }) => {
        updateState({ ...params, loading: false });
    }

    const rejected = (params: { id: string; state: State; message?: string }) => {
        updateState({ ...params, loading: false, closeTimer: 6000 });
    }

    const closeModal = () => {
        if (notification.state === State.ERROR2) {
            // モーダルを閉じる ※messageも渡さないとSnackbarが消えるときに空白のSnackbarが1瞬表示される
            confirmed({ id: 'snackbar', state: State.SUCCESS, message: notification.message });
        } else {
            confirmed({ id: 'snackbar', state: State.PROSSING, message: notification.message });
        }
    }

    const isLoading = () => {
        return notification.loading;
    }

    const closeTimer = () => {
        return notification.closeTimer;
    };

    const message = () => {
        return notification.message;
    };

    const setTodoListState = useSetRecoilState(todoListState);
    const setTodoCardList = ({
        todoCardList
    }: {
        todoCardList: TodoCard[];
    }) => {
        setTodoListState(todoCardList);
    }

    return { open, confirmed, rejected, closeModal,  isLoading,  closeTimer, message, setTodoCardList };
};
