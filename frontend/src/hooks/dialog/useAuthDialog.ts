import { SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { User } from "@/types/auth";
import { EMAIL_MODE, State, notificationsState } from "@/recoilAtoms/recoilState";
import { useNotifications } from "@/hooks/useNotifications";
import Cookies from "js-cookie";
import { useAPI } from "@/hooks/useAPI";
import { useRecoilValue } from "recoil";

const getValidationSchema = () => {
    let schema: { [key: string]: any } = {};
    schema.onetimepassword = yup.string().required("入力必須です.");
    return yup.object(schema);
};

export const useAuthDialog = (email_mode: EMAIL_MODE) => {
    const notification = useRecoilValue(notificationsState);
    const notifications = useNotifications();
    const { createUser, emailAuthentication, updateEmailAuthentication } = useAPI();

    const schema = getValidationSchema();
    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors },
        getValues
    } = useForm<User>({
        defaultValues: { onetimepassword: '' },
        resolver: yupResolver(schema),
    });

    const onSubmitEmailAuthentication = async () => {
        const accessToken = Cookies.get('accessToken');
        const refreshToken = Cookies.get('refreshToken');
        if(email_mode === EMAIL_MODE.AUTHENTICATION){
            await emailAuthentication(accessToken, refreshToken, getValues().onetimepassword);
        } else{
            await updateEmailAuthentication(accessToken, refreshToken, getValues().onetimepassword);
        }
    };

    const onSubmitCreateUser: SubmitHandler<User> = async () => {
        await createUser(getValues());
    };

    const handleCloseAuthModal = () => {
        notifications.confirmed({ id: 'snackbar', state: State.PROSSING });
    };

    const isOpenAuthModal = () => {
        return notification.state === State.SUCCESS || notification.state === State.ERROR2;
    }

    return {
        register,
        setValue,
        handleSubmit,
        errors,
        onSubmitEmailAuthentication,
        onSubmitCreateUser,
        handleCloseAuthModal,
        isOpenAuthModal,
        notifications,
    };
};