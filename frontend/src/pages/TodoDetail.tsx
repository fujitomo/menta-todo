import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import Link from "next/link";
import React, { useState } from "react";
import LoadingButton from '@mui/lab/LoadingButton';
import { TodoDetail } from "@/types/todos";
import { useTodoDetail } from "@/hooks/pages/useTodoDetail";
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import { FileUpload } from "@/components/other/FileUpload";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import 'dayjs/locale/ja';
import ColorPickerComponent from "@/components/other/ColorPicker";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";

import { checkLogin, redirectToLogin } from "@/utils/utils";
import { parse } from "cookie";
import 'dayjs/locale/ja'; // 日本語のロケールをインポート
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";


const BUTTON_CLASSNAME = "px-4 py-2 text-2xl w-[8%] bg-[#B29649] hover:bg-[#B29649] font-base text-black font-bold rounded my-4 mx-2";

class DateAdapter extends AdapterDateFns {
  // 参考サイトの実装例よりも、端折っているが、日曜始まりが固定なら以下で十分。
  getWeekdays = (): string[] => ['日', '月', '火', '水', '木', '金', '土'];
}

export default function TodoDetail() {

  const {
    register,
    handleSubmit,
    errors,
    notifications,
    selectedTags,
    onSubmit,
    errorText,
    handleValueChange,
    handleTagChange,
    stateProps,
    state,
    setState,
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
    getValues,
    createChangeHandler,
    title,
    handleBlur,
    isFocused,
    hasContent,
    handleFocus,
    tmpFiles,
    isTitleValue
  } = useTodoDetail();


  const textFieldStyles = {
    '& .MuiInput-underline:after': {
      borderBottomColor: 'green', // フォーカス時のみ下線の色を緑に
    },
    '& label.Mui-focused': {
      color: 'green', // フォーカス時のみラベルの色を緑に
    },
  };

  const getDatePickerStyles = (error: any) => ({
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset': {
        borderColor: error ? 'red' : 'green',
        color: error ? 'red' : 'green',
      },
      ...(error && {
        '& fieldset': {
          borderColor: 'red',
        },
        '&:hover fieldset': {
          borderColor: 'red',
        },
      }),
    },
    '& label.Mui-focused': {
      color: error ? 'red' : 'green',
    },
    ...(error && {
      "& label": { color: "red" },
      " .Mui": { color: "red" },
    }),
  });

  const FileUploadComponents = () => {

    // ファイルアップロードコンポーネントの配列
    const fileUploads = [
      { label: '添付ファイル１' },
      { label: '添付ファイル２' },
      { label: '添付ファイル３' },
      { label: '添付ファイル４' },
      { label: '添付ファイル５' },
    ];

    // ファイルアップロードコンポーネントをマップしてレンダリング
    return (
      <>
        {fileUploads.map((file, index) => {
          if (index % 2 === 0) {
            return (
              <Box key={"attachments[" + (index) + "]"} className="flex">
                <Box className="mr-4">
                  <FileUpload
                    label={file.label}
                                value={getValues()?.attachments?.[index]?.name ?? ''}
                                tmpFile={tmpFiles?.[index] ?? undefined}
                                onChange={(event) => {
                                  createChangeHandler(event, index);
                                }}
                              />
                            </Box>
                            {/* Check if there is a next item in the array before rendering it */}
                            {fileUploads[index + 1] && (
                  <Box>
                    <FileUpload
                      label={fileUploads[index + 1].label}
                      value={getValues()?.attachments?.[index + 1]?.name ?? ''}
                      tmpFile={tmpFiles?.[index + 1] ?? undefined}
                      onChange={(event) => {
                        createChangeHandler(event, index + 1);
                      }}
                    // displayFile={getValues(fileUploads[index + 1].name) || undefined}
                    />
                  </Box>
                )}
              </Box>
            );
          }
        })}
      </>
    );
  };

  return (
    <>
      <Box className="bg-white w-[90%] mx-auto mt-10">
        <Typography className="text-4xl py-10 text-center">
          TODO{title}
        </Typography>
        <Box className=" w-[95%]  mx-auto pt-2 overflow-y-auto h-[53vh]">
          <Box
            className="w-11/12 flex flex-col gap-4  h-[720px]">
            <TextField
              className="w-full"
              color="success"
              required
              inputProps={{ maxLength: 40, className: "text-2xl" }}
              label="タイトル"
              type="title"
              {...register("title")}
              error={"title" in errors}
              InputLabelProps={{ shrink: isTitleValue }}
              helperText={
                <Box component="span" className="text-base text-red-500">
                  {errors.title?.message}
                </Box>
              }
              disabled={notifications.isLoading()}
            />

            <Box className="h-20 relative h-auto">
              <label
                className={`bg-white absolute left-2 top-4 w-10 transition-all duration-300 ease-in-out ${isFocused ? 'transform -translate-y-7 scale-75 text-green-700' :
                  hasContent ? 'transform -translate-y-7 scale-75' :
                    'transform translate-y-0'
                  }`}
              >
                説明
              </label>
              <BaseTextareaAutosize
                className="
          w-full
          py-3 px-4
          rounded-lg
          border-2
          focus:border-green-700
          focus:ring-blue-400
          focus:border-2
          hover:border-black
          hover:border
          focus:outline-none
        "
                onFocus={handleFocus}
                {...register("description")}
                onBlur={handleBlur}
                placeholder=" "
                maxLength={2000}
                minRows={2}
                disabled={notifications.isLoading()}
              ></BaseTextareaAutosize>
            </Box>

            <FileUploadComponents />

            <Box className="flex">
              <LocalizationProvider dateAdapter={DateAdapter} dateFormats={{ monthAndYear: "yyyy年 MM月", monthShort: "MM月" }}>
                <Box className="flex flex-col mr-16">
                  <DatePicker
                    className="w-55"
                    sx={getDatePickerStyles(errors.dateStart?.message)}
                    format="yyyy年MM月dd日"
                    value={dateStart}
                    onChange={(newValue) => {
                      setDateStart(newValue ?? undefined);
                      handleDateChange("dateStart", newValue ?? undefined);
                      onTrigger("dateStart");
                      onTrigger("dateEnd");
                    }}
                    label="開始日"
                    disabled={notifications.isLoading()}
                  />
                  {errors.dateStart?.message && (
                    <span className="text-base text-red-500">
                      {errors.dateStart.message}
                    </span>
                  )}
                </Box>

                <Box className="flex flex-col">
                  <DatePicker
                    className="w-55"
                    sx={getDatePickerStyles(errors.dateEnd?.message)}
                    format="yyyy年MM月dd日"
                    value={dateEnd}
                    onChange={(newValue) => {
                      setDateEnd(newValue ?? undefined);
                      handleDateChange("dateEnd", newValue ?? undefined);
                      onTrigger("dateEnd");
                    }}
                    label="終了日"
                    disabled={notifications.isLoading()}
                  />
                  {errors.dateEnd?.message && (
                    <span className="text-base text-red-500">
                      {errors.dateEnd.message}
                    </span>
                  )}
                </Box>
              </LocalizationProvider>
            </Box>
            <Autocomplete
              multiple
              freeSolo // 入力を許可
              disabled={notifications.isLoading()}
              id="tags-outlined"
              className="w-[1164px]"
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
              }}
              sx={textFieldStyles} options={[]} />
            <Box className="flex space-x-4">
              <Autocomplete
                className="w-48"
                {...stateProps}
                id="disable-close-on-select-1"
                value={state}
                sx={{
                  '& .MuiInput-underline:after': {
                    borderBottomColor: errors.dateStart?.message ? 'red' : 'green', // フォーカス時の下線の色
                  },
                  '& label.Mui-focused': {
                    color: errors.dateStart?.message ? 'red' : 'green', // フォーカス時のラベルの色
                  },
                  ...(errors.dateStart?.message && {
                    '& .MuiInput-underline:before': {
                      borderBottomColor: 'red', // 通常時の下線の色
                    },
                    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                      borderBottomColor: 'red', // ホバー時の下線の色
                    },
                    "& label": { color: "red" },
                    " .Mui": { color: "red" },
                  }),
                }}
                renderInput={(params) => (
                  <TextField {...params} label="状態" variant="standard" required
                    className="border-red-500"
                    helperText={
                      <Box component="span" className="text-base text-red-500">
                        {errors.currentState?.message}
                      </Box>
                    } />
                )}
                onChange={(_event, newValue) => {
                  console.log(newValue);
                  handleValueChange("currentState", newValue?.value);
                  setState(newValue);
                  onTrigger("currentState");
                }}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                disabled={notifications.isLoading()}
              />
              <ColorPickerComponent
                onChange={(newValue) => {
                  handleValueChange("color", newValue);
                }}
                disabled={notifications.isLoading()}
                value={getValues(("color"))}
              />

            </Box>
          </Box>
        </Box>
      </Box>
      <Box display="flex" justifyContent="right" className="w-[95.5%]">
        <LoadingButton
          className={`${BUTTON_CLASSNAME}`}
          type="submit"
          variant="contained"
          onClick={handleOpenDialog()}
          disabled={notifications.isLoading()}
        >
          {title}
        </LoadingButton>
        <Link href="/TodoList" legacyBehavior passHref>
          <LoadingButton
            className={`${BUTTON_CLASSNAME} `}
            variant="contained"
            disabled={notifications.isLoading()}>
            戻る
          </LoadingButton>
        </Link>
      </Box>
      <ConfirmDialog
        open={openDialog}
        handleClose={handleDialogClose}
        title="確認"
        content={`${title}処理を実行してもよろしいですか？`}
        confirmAction={handleConfirmAction(handleSubmit(onSubmit))}
      />
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{}>> {
  const { req, res } = context;
  try {
    const cookies = parse(req.headers.cookie || '');
    const { isLogin, newToken } = await checkLogin(cookies.accessToken, cookies.refreshToken);

    if (!isLogin) return redirectToLogin();

    if (newToken) {
      res.setHeader('Set-Cookie', `accessToken=${newToken}; Path=/; HttpOnly; Secure`);
    }

    return { props: {} };
  } catch (err) {
    return redirectToLogin();
  }
}
