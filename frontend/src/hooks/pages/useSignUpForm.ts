import { SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAPI } from "@/hooks/useAPI";
import { useRecoilValue } from "recoil";
import { State, notificationsState } from "@/recoilAtoms/recoilState";
import { useNotifications } from "@/hooks/useNotifications";
import { User } from "@/types/auth";

const getValidationSchema = () => {
  let schema: { [key: string]: any } = {
    email: yup.string().required("入力必須です。").email("正しいメールアドレスを入力して下さい。"),
    password: yup.string().required("入力必須です。").min(6, "文字数が少ないです。6文字以上入力して下さい.").matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&].*$/, "パスワードには大文字、小文字、数字、記号のすべてを含んで下さい."),
  };

  return yup.object(schema);
};

export const useSignUpForm = () => {
  const { createUser } = useAPI();
  const notification = useRecoilValue(notificationsState);
  const notifications = useNotifications();

  const schema = getValidationSchema();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<User>({
    defaultValues: { onetimepassword: '' },
    resolver: yupResolver(schema),
  });

  const onSubmitCreateUser: SubmitHandler<User> = async () => {
    await createUser(getValues());
  };

  const isDialogOpen = () => {
    return (notification.state === State.SUCCESS || notification.state === State.ERROR2) || (notification.state === State.SUCCESS2);
};

  return {
    register,
    handleSubmit,
    errors,
    onSubmitCreateUser,
    isDialogOpen,
    notifications,
  };
};