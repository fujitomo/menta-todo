
import { Autocomplete, Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField, styled } from "@mui/material";
import 'dayjs/locale/ja'; // 日本語のロケールをインポート
import React from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { useTodoListSearchDialog } from "@/hooks/dialog/useTodoListSearchDialog";
import { EXISTENCE_OPTIONS, TAGS } from "@/utils/utils";
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';

interface TodoListSearchModalProps {
  open: boolean;
  onClose: ()
    => void;
}

export const TodoListSearchModal: React.FC<TodoListSearchModalProps> = ({ open, onClose }) => {
  const {
    register,
    errors,
    onSubmit,
    handleTagChange,
    isTagsActive,
    selectedTags,
    errorText,
    tagExists,
    handleValueChange,
    setTagExists,
    existenceProps,
    setAttachmentsExists,
    state,
    stateProps,
    setState,
    setDateStartRange,
    dateStartRange,
    handleDateChange,
    dateEndRange,
    setDateEndRange,
    handleClear,
    attachmentsExists,
    notifications,
  } = useTodoListSearchDialog();

  const BUTTON_CLASSNAME = "pointer-events-auto bg-[#B29649] hover:bg-[#B29649] font-base text-black font-bold rounded";

  return (
    <Dialog
      open={open}
      // onClose={handleCloseAuthModal}
      className="bg-base_color"
      maxWidth="lg" // 最大幅を設定
    >
      <DialogTitle className="bg-header_color font-black">検索条件</DialogTitle>
      <DialogContent className="bg-base_color">
        <Box className="bg-white w-[1100px] my-8 p-6 overflow-y-auto">
          <TextField
            margin="dense"
            fullWidth
            id="title"
            label="タイトル"
            type="title"
            {...register("title")}
            inputProps={{ maxLength: 50 }}
            disabled={notifications.isLoading()}
          />
          <Box className="mt-4"></Box>
          <TextField
            margin="dense"
            fullWidth
            id="description"
            label="説明"
            type="description"
            {...register("description")}
            inputProps={{ maxLength: 50 }}
            disabled={notifications.isLoading()}
          />
          {/* <BaseTextareaAutosize
            className="
              w-[1037px]
              py-3 px-4
              rounded-tl-lg rounded-bl-lg
              border-2
              focus:border-blue-500
              focus:ring-blue-400
              hover:border-black
              hover:ring-opacity-50
              focus:outline-none
            "
            {...register("description")}
            placeholder="説明"
            maxLength={2000}
            minRows={2}
          ></BaseTextareaAutosize> */}

          <Box className="flex space-x-4">
            <Autocomplete
              className="w-48"
              options={EXISTENCE_OPTIONS}
              value={tagExists}
              renderInput={(params) => (
                <TextField {...params} label="タグの有無" variant="standard" />
              )}
              onChange={(e, value) => {
                handleValueChange("tagExists", e, value);
                setTagExists(value);
              }}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              disabled={notifications.isLoading()}
            />

            <Autocomplete
              multiple
              freeSolo // 入力を許可
              disabled={!isTagsActive || notifications.isLoading()} // 真偽値を確認
              id="tags-outlined"
              className="w-[1164px] ml-11 h-30"
              // options={TAGS.map(option => option.name)}
              value={selectedTags}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  label="タグ（最大10個）"
                  placeholder="タグを選択または入力"
                  error={!!errorText}
                  helperText={errorText} />
              )}
              onChange={(_event, newValue) => {
                handleTagChange(newValue);
              } } options={[]}            />
          </Box>

          <Box className="mt-1"></Box>

          <Box className="flex space-x-4">
            <Autocomplete
              className="w-48"
              {...existenceProps}
              id="disable-close-on-select-1"
              value={attachmentsExists}
              renderInput={(params) => (
                <TextField {...params} label="添付ファイルの有無" variant="standard" />
              )}
              onChange={(event, value) => {
                handleValueChange("attachmentsExists", event, value);
                setAttachmentsExists(value);
              }}
              isOptionEqualToValue={(option, value) =>
                option && value ? option.value === value.value : false
              }
              disabled={notifications.isLoading()}
            />

            <Autocomplete
              className="w-48 ml-11"
              {...stateProps}
              id="disable-close-on-select-1"
              value={state}
              renderInput={(params) => (
                <TextField {...params} label="状態" variant="standard" />
              )}
              onChange={(event, value) => {
                handleValueChange("status", event, value);
                setState(value);
              }}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              disabled={notifications.isLoading()}
            />
          </Box>

          <Box className="mt-6"></Box>

          <Box display="flex" gap="18px" className="my-5">
            <LocalizationProvider dateAdapter={AdapterDayjs} dateFormats={{ monthAndYear: "YYYY年 MM月", monthShort: "MM月" }} adapterLocale="ja">
              <DateRangePicker
                className="w-[500px]"
                localeText={{ start: '開始日（開始）', end: '開始日（終了）' }}
                value={dateStartRange}
                onChange={(newValue) => {
                  setDateStartRange(newValue);
                  handleDateChange("dateStartRange", newValue);
                }}
                disabled={notifications.isLoading()}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs} dateFormats={{ monthAndYear: "YYYY年 MM月", monthShort: "MM月" }} adapterLocale="ja">
              <DateRangePicker
                className="w-[500px]"
                localeText={{ start: '完了日（開始）', end: '完了日（終了）' }}
                value={dateEndRange}
                onChange={(newValue) => {
                  setDateEndRange(newValue);
                  handleDateChange("dateEndRange", newValue);
                }}
                disabled={notifications.isLoading()}
              />
            </LocalizationProvider>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className="bg-base_color">
        <Box className="bg-base_color mx-11 space-x-2">
          <LoadingButton
            className={BUTTON_CLASSNAME}
            onClick={() => {
              onSubmit(onClose);
            }}
            loading={notifications.isLoading()}
          >
            検索
          </LoadingButton>
          <LoadingButton
            className={BUTTON_CLASSNAME}
            onClick={handleClear}
            loading={notifications.isLoading()}
          >
            クリア
          </LoadingButton>
        </Box>
        <LoadingButton
          className={BUTTON_CLASSNAME}
          onClick={onClose}
          loading={notifications.isLoading()}
        >
          閉じる
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );


}