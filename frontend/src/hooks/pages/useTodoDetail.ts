// hooks/useSignUpForm.js
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAPI } from "@/hooks/useAPI";
import { useRecoilState, useRecoilValue } from "recoil";
import { State, TodoState, Transition, notificationsState, searchConditionsState, transitionTodoDetail } from "@/recoilAtoms/recoilState";
import { useNotifications } from "@/hooks/useNotifications";
import { STATE_ATTACHMENTS } from "@/utils/utils";
import Cookies from "js-cookie";
import { TodoDetail } from "@/types/todos";
import { useRouter } from 'next/router';

export const useTodoDetail = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const notification = useRecoilValue(notificationsState);
  const notifications = useNotifications();
  const [errorText, setErrorText] = useState<string | null>(null);
  const [state, setState] = useState<{ label: string; value: string } | null>({ label: TodoState.WAITING, value: TodoState.WAITING });
  const transition = useRecoilValue(transitionTodoDetail);
  // 日付範囲の状態を管理
  const [dateStart, setDateStart] = useState<Date | null>();
  const [dateEnd, setDateEnd] = useState<Date | undefined>();
  const [openDialog, setOpenDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [tmpFiles, setTmpFiles] = useState<File[] | undefined>();
  const router = useRouter();
  const [isDescriptionFocused, setDescriptionFocused] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [todoId, setTodoId] = useState("");
  const [isTitleFocused, setTitleIsFocused] = useState(false);

  // バリデーションルール
  const schema = yup.object().shape({
    title: yup
      .string()
      .required("必須です。"),
    currentState: yup
      .string()
      .required("必須です。"),
    dateStart: yup
      .date()
      .nullable() // null または undefined を許可
      .typeError("有効な日付を入力してください。"), // 無効な日付の場合のエラーメッセージ
    dateEnd: yup
      .date()
      .nullable() // null または undefined を許可
      .typeError("有効な日付を入力してください。") // 無効な日付の場合のエラーメッセージ
      .when("dateStart", (dateStart, schema) => {
        // dateStart が有効な日付である場合のみ、min メソッドを適用
        return (dateStart && !isNaN(new Date(dateStart[0]).getTime()))
          ? schema.min(dateStart, "終了日は開始日以降である必須があります。")
          : schema;
      })
  });

  // API関連の処理を行うカスタムフック
  const { createTodo, getTodoDatail, updateTodo } = useAPI();

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    getValues,
    trigger,
    reset,
  } = useForm<TodoDetail>({
    defaultValues: {
      title: undefined,
      description: undefined,
      dateStart: undefined,
      dateEnd: undefined,
      tags: [],
      currentState: TodoState.WAITING,
      attachments: [],
      color: "#FFFFFF",
    },
    resolver: yupResolver(schema),
  });

  // オプションの状態を管理
  const stateProps = {
    options: STATE_ATTACHMENTS,
    getOptionLabel: (option: any) => option.label,
  };

  const handleFocus = () => setDescriptionFocused(true);
  const handleBlur = (e: { target: { value: string | any[]; }; }) => {
    setDescriptionFocused(false);
    setHasContent(e.target.value.length > 0);
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
  const [] = useRecoilState(searchConditionsState);
  useEffect(() => {
    if (notification.state === State.SUCCESS) {
      router.push('/TodoList');
    }

  }, [notification.state]);

  useEffect(() => {
    if (transition.transitionTodoDetail === Transition.CREATE) {
      setTitle("登録");
    } else {
      setTitle("更新");

      const fetchData = async () => {
        const accessToken = Cookies.get("accessToken");
        const refreshToken = Cookies.get("refreshToken");
        return await getTodoDatail(accessToken, refreshToken, transition.todoId ? transition.todoId : "");
      };

      fetchData().then(async (todoDetail) => {
        reset({
          ...todoDetail,
        });
        handleTagChange(todoDetail.tags || []);
        handleBlur({ target: { value: todoDetail.description ?? "" } });
        setDateStart(todoDetail.dateStart ? new Date(todoDetail.dateStart) : undefined);
        handleDateChange("dateStart", todoDetail.dateStart ?? undefined);

        setDateEnd(todoDetail.dateEnd ? new Date(todoDetail.dateEnd) : undefined);
        console.log("DateEnd", dateEnd)
        handleDateChange("dateEnd", todoDetail.dateEnd ?? undefined);
        handleValueChange("currentState", todoDetail.currentState ?? "");
        setState({ label: todoDetail.currentState ?? "", value: todoDetail.currentState ?? "" });
        setTodoId(todoDetail.todoId ?? "");
        handleValueChange("color", todoDetail.color);

        const todoAttachments = todoDetail.attachments ?? [];
        const tmpFiles: File[] = [];
        // 添字0から4までの要素に対して処理を行う
        for (let i = 0; i < Math.min(todoAttachments.length, 5); i++) {
          const attachment = todoAttachments[i];
          if (attachment instanceof File) {
            handleFileChange(`attachments[${i}]`, attachment);
            console.log(`todoAttachments[${i}]`, attachment);
            tmpFiles.push(attachment);
          }
          setTmpFiles(tmpFiles);
        }
      });
    }
  }, []);

  //フォーム送信時の処理
  const onSubmit = async (todoDetail: TodoDetail) => {
    try {
      const accessToken = Cookies.get("accessToken");
      const refreshToken = Cookies.get("refreshToken");
      // APIエンドポイントからデータを取得（エンドポイントを適切に変更してください）
      if (transition.transitionTodoDetail === Transition.CREATE) {
          await createTodo(accessToken, refreshToken, todoDetail);
      }else{
        await updateTodo(accessToken, refreshToken, todoDetail);
      }
    } catch (error) {
      console.error('TODD登録に失敗しました:', error);
    }
  };

  const onTrigger = async (filedName: string) => {
    trigger(filedName as keyof TodoDetail);
  };

  const handleCloseSnackbar = () => {
    notifications.closeModal();
  };

  // 値の変更を処理する関数
  const handleValueChange = (field: any, value: any) => {
    if (value !== undefined && value !== null) {
      setValue(field, value);
    } else {
      setValue(field, null);
    }
  };

  // ファイルの変更を処理する関数
  const handleFileChange = (field: any, value: File) => {
    setValue(field, value);
  };

  // タグの選択状態を変更する関数
  const handleTagChange = (newValue: string[]) => {
    if (newValue.length <= 10) {
      setSelectedTags(newValue);
      setValue("tags", newValue);
      setErrorText(null);
    } else {
      setSelectedTags(newValue.slice(0, 10));
      setValue("tags", newValue.slice(0, 10));
      setErrorText("最大10個まで選択できます。");
    }
  };

  // 日付範囲の変更を処理する関数
  const handleDateChange = (field: any, values: any) => {
    setValue(field, values);
  };

  // ファイルアップロードハンドラーを生成する関数
  const createChangeHandler = (event: any, index: number) => {
    if (event.target.files !== null) {
      handleFileChange(`attachments[${index}]`, event?.target?.files?.[0]);
    }
  };

  return {
    register,
    setValue,
    handleSubmit,
    errors,
    getValues,
    onSubmit,
    notification,
    notifications,
    handleCloseSnackbar,
    formState: { errors },
    selectedTags,
    setSelectedTags,
    errorText,
    handleValueChange,
    handleTagChange,
    stateProps,
    state,
    setState,
    handleFileChange,
    dateStart,
    setDateStart,
    dateEnd,
    setDateEnd,
    handleDateChange,
    onTrigger,
    handleDialogClose,
    handleConfirmAction,
    openDialog,
    handleOpenDialog,
    createChangeHandler,
    title,
    handleBlur,
    hasContent,
    handleFocus,
    setTmpFiles,
    tmpFiles,
    todoId,
    isTitleFocused,
    setTitleIsFocused,
    isDescriptionFocused
  };
};

