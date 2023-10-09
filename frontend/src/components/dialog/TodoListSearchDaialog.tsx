
import { SearchConditions } from "@/types/todos";
import { yupResolver } from "@hookform/resolvers/yup";
import { Autocomplete, Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import 'dayjs/locale/ja'; // 日本語のロケールをインポート
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { useAPI } from "../hooks/useAPI";
import { notificationsState } from "@/recoilAtoms/recoilState";
import LoadingButton from "@mui/lab/LoadingButton";
import { useRecoilValue } from "recoil";
import { useNotifications } from "@/hooks/useNotifications";
import { useRouter } from "next/router";
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import Cookies from "js-cookie";

interface TodoListSearchModalProps {
  open: boolean;
  onClose: () => void;
}

export const TodoListSearchModal: React.FC<TodoListSearchModalProps> = ({ open, onClose }) => {
  const existence = [
    { label: "有り", existence: true },
    { label: '無し', existence: false },
  ];

  const stateAttachments = [
    { label: "保留", state: "保留" },
    { label: "作業中", state: "作業中" },
    { label: "完了", state: "完了" },
    { label: "待機中", state: "待機中" },
  ];

  const tags = [
    { name: 'Hawaii' },
    { name: 'Bali' },
    { name: 'Fiji' },
  ];

  const stateProps = {
    options: stateAttachments,
    getOptionLabel: (option: any) => option.label,
  };

  const existenceProps = {
    options: existence,
    getOptionLabel: (option: any) => option.label,
  };

  const getValidationSchema = () => {
    let schema: { [key: string]: any } = {
      tags: yup.string().required("入力必須です。"),
      password: yup.string().required("入力必須です。").min(6, "文字数が少ないです。6文字以上入力して下さい.").matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&].*$/, "パスワードには大文字、小文字、数字、記号のすべてを含んで下さい."),
    };

    return yup.object(schema);
  };

  const notifications = useNotifications();

  const schema = getValidationSchema();
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SearchConditions>({
    resolver: yupResolver(schema),
  });


  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isTagsActive, setIsTagsActive] = useState(false);

  const handleTagChange = (event: React.SyntheticEvent, newValue: string[]) => {
    if (newValue.length <= 10) {
      setSelectedTags(newValue);
      setErrorText(null);
    } else {
      setErrorText("最大10個まで選択できます。");
    }
  };


  const handleExistenceChange = (event: React.SyntheticEvent, newValue: string) => {
    if (newValue === '有り') {
      setIsTagsActive(true);
    } else {
      setIsTagsActive(false);
    }
  };

  return (
    <Dialog
      open={open}
      // onClose={handleCloseAuthModal}
      className="bg-base_color"
      maxWidth="lg" // 最大幅を設定
    >
      <DialogTitle className="bg-header_color font-black">検索条件</DialogTitle>
      <DialogContent className="bg-base_color overflow-hidden">
        <Box className="bg-white w-[1100px] my-8 p-8">
          <TextField
            className="pointer-events-auto"
            margin="dense"
            fullWidth
            id="title"
            label="タイトル"
            type="title"
            {...register("title")}
            error={"title" in errors}
            helperText={
              <Box component="span" className="text-base text-red-500">
                {errors.title?.message}
              </Box>
            }
          // disabled={notifications.isLoading()}
          />
          <TextField
            className="pointer-events-auto"
            margin="dense"
            fullWidth
            id="description"
            label="説明"
            type="description"
            {...register("description")}
            error={"title" in errors}
            helperText={
              <Box component="span" className="text-base text-red-500">
                {errors.title?.message}
              </Box>
            }
          />
          <Box className="flex space-x-4">
            <Autocomplete
              className="w-48"
              {...existenceProps}
              id="disable-close-on-select-1"
              renderInput={(params) => (
                <TextField {...params} label="タグの有無" variant="standard" {...register("tagExists")} />
              )}
              onChange={(event, newValue) => {
                if (newValue !== null) {
                  // タグの有無が選択された場合の処理
                  handleExistenceChange(event, newValue.label);
                } else {
                  // タグの有無がクリアされた場合の処理
                  handleExistenceChange(event, '');
                }
              }}
            />
            <Autocomplete
              multiple
              freeSolo // 入力を許可
              disabled={!isTagsActive}
              id="tags-outlined"
              className="w-[1164px] ml-11 h-40"
              options={tags.map(option => option.name)}
              {...register("tagExists")}
              value={selectedTags}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  label="タグ（最大10個）"
                  placeholder="タグを選択または入力"
                  error={!!errorText}
                  helperText={errorText}
                />
              )}
              onChange={handleTagChange}
            />
          </Box>

          <Box className="flex space-x-4">
            <Autocomplete
              className="w-48"
              {...existenceProps}
              id="disable-close-on-select-1"
              renderInput={(params) => (
                <TextField {...params} label="添付ファイルの有無" variant="standard" />
              )}
            />
            <Autocomplete
              className="w-48 ml-11"
              {...stateProps}
              id="disable-close-on-select-1"
              renderInput={(params) => (
                <TextField {...params} label="状態" variant="standard" />
              )}
            />
          </Box>
          <Box display="flex" gap="18px" className="my-7">
            <LocalizationProvider dateAdapter={AdapterDayjs} dateFormats={{ monthAndYear: "YYYY年 MM月", monthShort: "MM月" }} adapterLocale="ja">
              <DateRangePicker className="w-[500px]" localeText={{ start: '開始日（開始）', end: '開始日（終了）' }} />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs} dateFormats={{ monthAndYear: "YYYY年 MM月", monthShort: "MM月" }} adapterLocale="ja">
              <DateRangePicker className="w-[500px]" localeText={{ start: '完了日（開始）', end: '完了日（終了）' }} />
            </LocalizationProvider>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className="bg-base_color">
        <Box className="bg-base_color mx-11 space-x-2">
          <LoadingButton
            className="pointer-events-auto bg-[#B29649] hover:bg-[#B29649]  font-base text-black font-bold rounded"
          >
            検索
          </LoadingButton>
          <LoadingButton
            className="pointer-events-auto bg-[#B29649] hover:bg-[#B29649]  font-base text-black font-bold rounded"
          // onClick={}
          // loading={notifications.isLoading()}
          >
            クリア
          </LoadingButton>
        </Box>
        <LoadingButton
          className="pointer-events-auto bg-[#B29649] hover:bg-[#B29649]  font-base text-black font-bold rounded"
          onClick={onClose}
        // loading={notifications.isLoading()}
        >
          閉じる
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}