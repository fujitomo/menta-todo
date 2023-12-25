import { useRouter } from 'next/router';
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAPI } from "@/hooks/useAPI";
import { useRecoilValue } from "recoil";
import { State, notificationsState } from "@/recoilAtoms/recoilState";
import { useNotifications } from "@/hooks/useNotifications";
import { UpdatePassword } from "@/types/auth";
import Cookies from "js-cookie";
import { useState } from "react";

const getValidationSchema = () => {
  let schema: { [key: string]: any } = {
    oldPassword: yup.string()
      .required("入力必須です。")
      .min(6, "文字数が少ないです。6文字以上入力して下さい.")
      .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&].*$/, "パスワードには大文字、小文字、数字、記号のすべてを含んで下さい."),
    newPassword: yup.string()
      .required("入力必須です。")
      .min(6, "文字数が少ないです。6文字以上入力して下さい.")
      .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&].*$/, "パスワードには大文字、小文字、数字、記号のすべてを含んで下さい."),
    checkPassword: yup.string()
      .required("入力必須です。")
      .oneOf([yup.ref('newPassword'), ''], '新しいパスワードと一致しません'),
  };

  return yup.object(schema);
};

export const useUpLoginPassword = () => {
  const { updatePassword } = useAPI();
  const notification = useRecoilValue(notificationsState);
  const notifications = useNotifications();
  const [openDialog, setOpenDialog] = useState(false);

  const schema = getValidationSchema();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePassword>({
    resolver: yupResolver(schema),
  });
  
  const router = useRouter();

  const onSubmit = async (formData: UpdatePassword) => {
    try {
      const accessToken = Cookies.get("accessToken");
      const refreshToken = Cookies.get("refreshToken");
      await updatePassword(accessToken, refreshToken, formData);
      if (notification.state === State.SUCCESS) {
        router.push("/TodoList");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleConfirmAction = (action: () => void) => () => {
    action();
    setOpenDialog(false);
  };

  const handleOpenDialog = () => async () => {
    // バリデーション成功
    setOpenDialog(true);
  };

  return {
    register,
    handleSubmit,
    errors,
    notifications,
    openDialog,
    handleOpenDialog,
    handleDialogClose,
    handleConfirmAction,
    onSubmit
  };
};