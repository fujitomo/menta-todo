import { SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { User } from "@/types/auth";
import { State, notificationsState } from "@/recoilAtoms/recoilState";
import { useNotifications } from "@/hooks/useNotifications";
import Cookies from "js-cookie";
import { useAPI } from "@/hooks/useAPI";
import { useRecoilValue } from "recoil";

const getValidationSchema = () => {
    let schema: { [key: string]: any } = {};
    schema.onetimepassword = yup.string().required("入力必須です.");
    return yup.object(schema);
};

export const useAuthDialog = () => {
    const notification = useRecoilValue(notificationsState);
    const notifications = useNotifications();
    const { createUser, emailAuthentication } = useAPI();

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
        console.log("test")
        const accessToken = Cookies.get('accessToken');
        console.log(accessToken);
        await emailAuthentication(accessToken ?? undefined, getValues().onetimepassword);
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