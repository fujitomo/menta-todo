import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAPI } from "@/hooks/useAPI";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { State, Transition, notificationsState, TransitionDetail, Profile, profileValues } from "@/recoilAtoms/recoilState";
import { useNotifications } from "@/hooks/useNotifications";
import Cookies from "js-cookie";
import { useRouter } from 'next/router';
import { Profile as typeProfile } from "@/types/profile";

export const useProfile = () => {
  const notification = useRecoilValue(notificationsState);
  const notifications = useNotifications();
  const transition = useRecoilValue(TransitionDetail);
  // 日付範囲の状態を管理
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [mode, setMode] = useState("");
  const [tmpFile, setTmpFile] = useState<File | undefined>(undefined);
  const [tmpFileName, setTmpFileName] = useState<string | undefined>(undefined);
  const router = useRouter();
  const [isTitleFocused, setTitleIsFocused] = useState(false);
  const setProfileValues = useSetRecoilState(profileValues);
  const [transitionDetail, setTransitionDetail] = useRecoilState(TransitionDetail);

  // バリデーションルール
  const schema = yup.object().shape({
    userName: yup
      .string()
      .required("必須です。"),
    birthday: yup
      .date()
      .nullable() // null または undefined を許可
      .typeError("有効な日付を入力してください。"), // 無効な日付の場合のエラーメッセージ
  });

  // API関連の処理を行うカスタムフック
  const { createProfile, getProfile, updateProfile } = useAPI();

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    getValues,
    trigger,
  } = useForm<typeProfile>({
    defaultValues: {
      userName: undefined,
      birthday: undefined,
      attachment: undefined,
    },
    // @ts-ignore
    resolver: yupResolver(schema),
  });

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleConfirmAction = (action: () => void) => () => {
    action();
    setOpenDialog(false);
  };

  const handleOpenDialog = () => async () => {
    setOpenDialog(true);
  };

  // useEffect(() => {
  //   if (notification.state === State.SUCCESS2) {
  //     router.push('/TodoList');
  //   }

  // }, [notification.state]);

  useEffect(() => {
    const fetchData = async () => {
      const profile: typeProfile | { data: null; message: string } | null | undefined = await getProfile(accessToken, refreshToken);
      return profile;
    };
    const accessToken = Cookies.get("accessToken");
    const refreshToken = Cookies.get("refreshToken");
    fetchData().then(async (profileData) => {
      console.log("test", profileData)
      if (!profileData) {
        setMode("登録");
        setTransitionDetail(() => ({
          TransitionDetail: Transition.CREATE,
          todoId: null,
        }));
      } else {
        setMode("更新");
        if(profileData.attachment) {
          setTmpFileName("登録済みファイル");
        }
        setTransitionDetail(() => ({
          TransitionDetail: Transition.UPDATE,
          todoId: null,
        }));
        setValue("userName", profileData?.userName ?? "");
        setBirthday(profileData?.birthday ? new Date(profileData?.birthday) : null);
        handleDateChange("birthday", profileData?.birthday ?? null);
        setTmpFile(profileData?.attachment);
        handleFileChange("attachment", profileData?.attachment);
      }
    });
  }, []);

  //フォーム送信時の処理
  const onSubmit = async (profile: typeProfile) => {
    try {
      const accessToken = Cookies.get("accessToken");
      const refreshToken = Cookies.get("refreshToken");
      // APIエンドポイントからデータを取得（エンドポイントを適切に変更してください）
      if (transition.TransitionDetail === Transition.CREATE) {
        await createProfile(accessToken, refreshToken, profile);
      } else {
        console.log("test", profile)
        await updateProfile(accessToken, refreshToken, profile);
      }
    } catch (error) {
      console.error(`Profile ${mode} に失敗しました:`, error);
    }

    const accessToken = Cookies.get("accessToken");
    const refreshToken = Cookies.get("refreshToken");
    if (accessToken !== undefined || refreshToken !== undefined) {
      const fetchData = async () => {
        const profile: typeProfile | { data: null; message: string } | null | undefined = await getProfile(accessToken, refreshToken);
        return profile;
      };

      fetchData().then(async (profileData) => {
        if (profileData) {
          const values: Profile = {
            attachmentURL: window.URL.createObjectURL(profileData.attachment? profileData.attachment : new Blob()),
            userName: profileData.userName,
            email: profileData.email ? profileData.email : ""
          }
          setProfileValues(values);
        }
      });
    }

    router.push("/TodoList");

  };

  const onTrigger = async (filedName: string) => {
    trigger(filedName as keyof typeProfile);
  };

  // ファイルの変更を処理する関数
  const handleFileChange = (field: any, value: File) => {
    setValue(field, value);
  };

  // 日付範囲の変更を処理する関数
  const handleDateChange = (field: any, values: any) => {
    setValue(field, values);
  };

  // ファイルアップロードハンドラーを生成する関数
  const createChangeHandler = (event: any) => {
    if (event.target.files !== null) {
      handleFileChange(`attachment`, event?.target?.files?.[0]);
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    getValues,
    onSubmit,
    notifications,
    birthday,
    setBirthday,
    handleDateChange,
    onTrigger,
    handleDialogClose,
    handleConfirmAction,
    openDialog,
    handleOpenDialog,
    createChangeHandler,
    mode,
    tmpFile,
    isTitleFocused,
    setTitleIsFocused,
    tmpFileName
  };
};
