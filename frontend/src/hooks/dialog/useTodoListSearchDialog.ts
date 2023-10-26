import { useState } from "react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import { useAPI } from "../useAPI";
import { EXISTENCE_OPTIONS, STATE_ATTACHMENTS } from "@/utils/utils";
import { DateRange } from "@mui/x-date-pickers-pro";
import { SearchConditions } from "@/types/todos";
import { useNotifications } from "../useNotifications";

export const useTodoListSearchDialog = () => {
  // モーダルの表示状態を管理
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // API関連の処理を行うカスタムフック
  const { getTodoList } = useAPI();

  // フォームの状態を管理
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<SearchConditions>({
    defaultValues: {
      title: null,
      description: null,
      startDateRange: [null, null],
      completeDateRange: [null, null],
      tagExists: null,
      tagMatch: null,
      status: null,
      attachmentsExists: null,
    },
  });

  const notifications = useNotifications();

  // タグの有無の状態を管理
  const isTagsActive = watch("tagExists");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [errorText, setErrorText] = useState<string | null>(null);

  // オプションの状態を管理
  const stateProps = {
    options: STATE_ATTACHMENTS,
    getOptionLabel: (option: any) => option.label,
  };

  const existenceProps = {
    options: EXISTENCE_OPTIONS,
    getOptionLabel: (option: any) => option.label,
  };

  // 日付範囲の状態を管理
  const [startDateRange, setStartDateRange] = useState<DateRange<dayjs.Dayjs>>([null, null]);
  const [completeDateRange, setCompleteDateRange] = useState<DateRange<dayjs.Dayjs>>([null, null]);

  // タグの有無、添付ファイルの有無、ステータスの状態を管理
  const [tagExists, setTagExists] = useState<{ label: string; value: boolean | undefined } | null>(null);
  const [attachmentsExists, setAttachmentsExists] = useState<{ label: string; value: boolean | undefined } | null>(null);
  const [state, setState] = useState<{ label: string; value: boolean | undefined } | null>(null);

  // モーダルの表示/非表示を切り替える関数
  const handleShouldOpenSearchModal = () => {
    setIsSearchModalOpen(!isSearchModalOpen);
  };

  // モーダルの表示状態を返す関数
  const isShouldOpenSearchModal = () => {
    return isSearchModalOpen;
  };

  // 検索を実行する関数
  const handleSearch = async (onClose: () => void) => {
    try {
      console.log(getValues());
      const accessToken = Cookies.get("accessToken");
      const refreshToken = Cookies.get("refreshToken");
      // APIエンドポイントからデータを取得
      await getTodoList(accessToken, refreshToken, getValues());
    } catch (error) {
      console.error('カード情報の取得に失敗しました:', error);
    }
    setIsSearchModalOpen(!isSearchModalOpen);
    onClose();
  };

  // タグの選択状態を変更する関数
  const handleTagChange = (newValue: string[]) => {
    if (newValue.length <= 10) {
      setSelectedTags(newValue);
      setValue("tagMatch", newValue);
      setErrorText(null);
    } else {
      setSelectedTags(newValue.slice(0, 10));
      setValue("tagMatch", newValue.slice(0, 10));
      setErrorText("最大10個まで選択できます。");
    }
  };

  // 値の変更を処理する関数
  const handleValueChange = (field: any, event: React.SyntheticEvent, value: any) => {
    if (value !== undefined && value !== null) {
      setValue(field, value.value);
    } else {
      setValue(field, null);
    }
  };

  // 日付範囲の変更を処理する関数
  const handleDateChange = (field: any, values: any) => {
    setValue(field, values);
  }

  // フォームのリセットを行う関数
  const handleClear = () => {
    reset();
    setStartDateRange([null, null]);
    setCompleteDateRange([null, null]);
    setSelectedTags([]);
    setTagExists(null);
    setAttachmentsExists(null);
    setState(null);
    setErrorText(null);
  };

  return {
    handleShouldOpenSearchModal,
    isShouldOpenSearchModal,
    register,
    handleSubmit,
    errors,
    setValue,
    getValues,
    watch,
    reset,
    handleSearch,
    handleTagChange,
    isTagsActive,
    selectedTags,
    errorText,
    setErrorText,
    setSelectedTags,
    handleValueChange,
    handleDateChange,
    handleClear,
    stateProps,
    existenceProps,
    completeDateRange,
    tagExists,
    attachmentsExists,
    setTagExists,
    setAttachmentsExists,
    state,
    setState,
    setStartDateRange,
    startDateRange,
    setCompleteDateRange,
    notifications
  };
};