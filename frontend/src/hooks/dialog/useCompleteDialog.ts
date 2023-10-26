import { SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { User } from "@/types/auth";
import { State, notificationsState } from "@/recoilAtoms/recoilState";
import { useNotifications } from "@/hooks/useNotifications";
import Cookies from "js-cookie";
import { useAPI } from "@/hooks/useAPI";
import { useRouter } from "next/router";
import { useRecoilValue } from "recoil";

const getValidationSchema = (isOpenAuthModal: boolean) => {
    let schema: { [key: string]: any } = {};
    // modalが開く時に必須チェックが入るので開いてからバリデーションをセットする
    // if (isOpenAuthModal) {
    schema.onetimepassword = yup.string().required("入力必須です.");
    // }
    return yup.object(schema);
};

export const useCompleteDialog = () => {
    const notification = useRecoilValue(notificationsState);
    const notifications = useNotifications();
    const router = useRouter();

    const isOpenCompleteModal = () => {
        return notification.state === State.SUCCESS2;
    }

    const onSubmitCompleteClose = () => {
        router.push("/Profile");
    };


    return {
        isOpenCompleteModal,
        onSubmitCompleteClose,
        notifications
    };
};