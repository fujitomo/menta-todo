import { State, notificationsState, profileValues } from "@/recoilAtoms/recoilState";
import { useNotifications } from "@/hooks/useNotifications";
import { useRouter } from "next/router";
import { useRecoilValue, useResetRecoilState } from "recoil";
import { useEffect } from "react";

export const useCompleteDialog = () => {
    const notification = useRecoilValue(notificationsState);
    const notifications = useNotifications();
    const router = useRouter();

    useEffect(() => {
        notifications.confirmed({ id: "useCompleteDialog", state: State.PROSSING });
    }, []);

    const isOpenCompleteModal = () => {
        return notification.state === State.SUCCESS_EMAIL_AUTENTICATION;
    }

    const onSubmitCompleteClose = () => {
        console.log("onSubmitCompleteClose");
        //前回ログインユーザのプロフィール情報が残るのでリセット
        router.push("/TodoList");
    };

    return {
        isOpenCompleteModal,
        onSubmitCompleteClose,
        notifications
    };
};