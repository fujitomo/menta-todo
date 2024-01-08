// hooks/useSignUpForm.js
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAPI } from "@/hooks/useAPI";
import { useRecoilValue } from "recoil";
import { State, notificationsState } from "@/recoilAtoms/recoilState";
import { useNotifications } from "@/hooks/useNotifications";
import { User } from "@/types/auth";

export const useLogin = () => {
  const { login } = useAPI();
  const notification = useRecoilValue(notificationsState);
  const notifications = useNotifications();
  const schema = getValidationSchema();
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<User>({
    defaultValues: { onetimepassword: ' ' },
    // @ts-ignore
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (notification.state === State.SUCCESS) {
      window.location.href = "/TodoList";
    }
  }, [notification.state]);

  //フォーム送信時の処理;
  const onSubmit = async () => {
    await login(getValues().email, getValues().password);
  };

  const handleCloseSnackbar = () => {
    notifications.closeModal();
  };

  return {
    register,
    setValue,
    handleSubmit,
    errors ,
    getValues,
    onSubmit,
    notification,
    notifications,
    handleCloseSnackbar,
  };
};

const getValidationSchema = () => {
  return yup.object({
    // バリデーションルール
    email: yup
      .string()
      .required("必須です。")
      .email("正しいメールアドレス入力して下さい。"),
    password: yup
      .string()
      .required("必須です。")
      .min(6, "パスワードの文字数が少ないです。")
      //TODO　.$が必要な理由を後で調べる
      .matches(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&].*$/,
        "パスワードには大文字、小文字、数字、記号のすべてを入れてください。"
      ),
  });
};
