import { State, notificationsState } from "@/recoilAtoms/recoilState";
import { useNotifications } from "@/hooks/useNotifications";
import { useRouter } from "next/router";
import { useRecoilValue } from "recoil";

export const useCompleteDialog = () => {
    const notification = useRecoilValue(notificationsState);
    const notifications = useNotifications();
    const router = useRouter();

    const isOpenCompleteModal = () => {
        return notification.state === State.SUCCESS2;
    }

    const onSubmitCompleteClose = () => {
        router.push("/TodoList");
    };

    return {
        isOpenCompleteModal,
        onSubmitCompleteClose,
        notifications
    };
};