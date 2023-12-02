import { transitionTodoDetail } from './../../recoilAtoms/recoilState';
import { use, useState } from "react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import { useAPI } from "../useAPI";
import { EXISTENCE_OPTIONS, STATE_ATTACHMENTS } from "@/utils/utils";
import { DateRange } from "@mui/x-date-pickers-pro";

import { useNotifications } from "../useNotifications";
import { useRecoilState } from "recoil";
import { SearchConditions, searchConditionsState } from "@/recoilAtoms/recoilState";

export const useTodoListSearchDialog = () => {

  // モーダルの表示状態を管理
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const [searchConditions, setSearchConditions] = useRecoilState(searchConditionsState);
  // const updateSearchConditions = (newConditions: SearchConditions | ((currVal: SearchConditions) => SearchConditions)) => {
  //   setSearchConditions(newConditions);
  // };

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
      title: searchConditions.title,
      description: searchConditions.description,
      dateStartRange: [searchConditions.dateStartRange[0], searchConditions.dateStartRange[1]],
      dateEndRange: [searchConditions.dateEndRange[0], searchConditions.dateEndRange[1]],
      tagExists: searchConditions.tagExists,
      tags: searchConditions.tags,
      currentState: searchConditions.currentState,
      attachmentsExists: searchConditions.attachmentsExists,
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
  const [dateStartRange, setDateStartRange] = useState<DateRange<dayjs.Dayjs>>([null, null]);
  const [dateEndRange, setDateEndRange] = useState<DateRange<dayjs.Dayjs>>([null, null]);

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

  //フォーム送信時の処理
  const onSubmit = async (onClose: () => void) => {
    try {
      console.log("searchConditions", searchConditions);
      setSearchConditions(getValues());
      const accessToken = Cookies.get("accessToken");
      const refreshToken = Cookies.get("refreshToken");
      // APIエンドポイントからデータを取得
      await getTodoList(accessToken, refreshToken, getValues());
      console.log(searchConditions);
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
      setValue("tags", newValue);
      setErrorText(null);
    } else {
      setSelectedTags(newValue.slice(0, 10));
      setValue("tags", newValue.slice(0, 10));
      setErrorText("最大10個まで選択できます。");
    }
  };

  // 値の変更を処理する関数
  const handleValueChange = (field: any, _event: React.SyntheticEvent, value: any) => {
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
    setDateStartRange([null, null]);
    setDateEndRange([null, null]);
    setSelectedTags([]);
    setTagExists(null);
    setAttachmentsExists(null);
    setState(null);
    setErrorText(null);

    // setSearchConditions({
    //   title: null,
    //   description: null,
    //   dateStartRange: [null, null],
    //   dateEndRange: [null, null],
    //   tagExists: null,
    //   tags: null,
    //   currentState: null,
    //   attachmentsExists: null
    // });

  };

  return {
    handleShouldOpenSearchModal,
    isShouldOpenSearchModal,
    register,
    handleSubmit,
    errors,
    setValue,
    getValues,
    reset,
    onSubmit,
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
    dateEndRange,
    tagExists,
    attachmentsExists,
    setTagExists,
    setAttachmentsExists,
    state,
    setState,
    setDateStartRange,
    dateStartRange,
    setDateEndRange,
    notifications,
    searchConditions
  };
};