import { SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAPI } from "@/hooks/useAPI";
import { useRecoilValue } from "recoil";
import { State, notificationsState } from "@/recoilAtoms/recoilState";
import { useNotifications } from "@/hooks/useNotifications";
import { User } from "@/types/auth";
import Cookies from "js-cookie";

const getValidationSchema = () => {
  let schema: { [key: string]: any } = {
    email: yup.string().required("入力必須です。").email("正しいメールアドレスを入力して下さい。"),
  };
  return yup.object(schema);
};

export const useUpDateMailAddress = () => {
  const { updateEmail } = useAPI();
  const notification = useRecoilValue(notificationsState);
  const notifications = useNotifications();

  const schema = getValidationSchema();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<User>({
    resolver: yupResolver(schema),
  });

  const onSubmitUpdateEmail: SubmitHandler<User> = async () => {
    const accessToken = Cookies.get("accessToken");
    const refreshToken = Cookies.get("refreshToken");
    await updateEmail(accessToken, refreshToken, getValues().email);
  };

  const isDialogOpen = () => {
    return (notification.state === State.SUCCESS || notification.state === State.ERROR2) || (notification.state === State.SUCCESS2);
  };

  return {
    register,
    handleSubmit,
    errors,
    onSubmitUpdateEmail,
    isDialogOpen,
    notifications
  };
};


