import { Box, TextField, Typography } from "@mui/material";
import Link from "next/link";
import React from "react";
import LoadingButton from '@mui/lab/LoadingButton';
import { FileUpload } from "@/components/other/FileUpload";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import 'dayjs/locale/ja';
import ConfirmDialog from "@/components/dialog/ConfirmDialog";

import { checkLogin, redirectToLogin } from "@/utils/utils";
import { parse } from "cookie";
import 'dayjs/locale/ja'; // 日本語のロケールをインポート
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { useProfile } from "@/hooks/pages/useProfile";

class DateAdapter extends AdapterDateFns {
  // TODO: ここで日本語化出来る可能性あり
  //getWeekdays = (): string[] => ['日', '月', '火', '水', '木', '金', '土'];
}

export default function Profile() {
  const {
    register,
    handleSubmit,
    errors,
    notifications,
    onSubmit,
    birthday,
    setBirthday,
    handleDateChange,
    onTrigger,
    handleDialogClose,
    handleConfirmAction,
    openDialog,
    handleOpenDialog,
    getValues,
    createChangeHandler,
    mode,
    tmpFile,
    isTitleFocused,
    setTitleIsFocused,
  } = useProfile();

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

  return (
    <>
      <Box className="bg-white w-[90%] mx-auto mt-10">
        <Typography className="text-4xl py-10 text-center">
          プロフィール{mode}
        </Typography>
        <Box className=" w-[95%]  mx-auto pt-2 overflow-y-auto h-[53vh]">
          <Box
            className="w-11/12 flex flex-col gap-4  h-[320px]">
            <TextField
              className="w-full"
              color="success"
              required
              inputProps={{ maxLength: 40, className: "text-2xl" }}
              label="ユーザ名"
              type="userName"
              {...register("userName")}
              error={"userName" in errors}
              InputLabelProps={{ shrink: !!getValues("userName") || isTitleFocused }}
              helperText={
                <Box component="span" className="text-base text-red-500">
                  {errors.userName?.message}
                </Box>
              }
              onFocus={() => setTitleIsFocused(true)}
              onBlur={() => setTitleIsFocused(false)}
              disabled={notifications.isLoading()}
            />
            <LocalizationProvider dateAdapter={DateAdapter} dateFormats={{ monthAndYear: "yyyy年 MM月", monthShort: "MM月" }}>

              <DatePicker
                sx={getDatePickerStyles(errors.birthday?.message)}
                format="yyyy年MM月dd日"
                value={birthday}
                onChange={(newValue) => {
                  setBirthday(newValue ?? null);
                  handleDateChange("birthday", newValue ?? undefined);
                  onTrigger("birthday");
                }}
                label="誕生日"
                disabled={notifications.isLoading()}
              />
              {errors.birthday?.message && (
                <span className="text-base text-red-500">
                  {errors.birthday.message}
                </span>
              )}
            </LocalizationProvider>
            <Box className="">
              <FileUpload
                label="アイコン画像"
                value={"登録済みアイコン画像"}
                tmpFile={tmpFile} // Fix the assignment here
                onChange={(event) => {
                  createChangeHandler(event);
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
      <Box display="flex" justifyContent="right" className="w-[95.5%]">
        <LoadingButton
          className={"app-button"}
          type="submit"
          variant="contained"
          onClick={handleOpenDialog()}
          disabled={notifications.isLoading()}
        >
          {mode}
        </LoadingButton>
        <Link href="/TodoList" legacyBehavior passHref>
          <LoadingButton
            className={"app-button"}
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
        content={`${mode}処理を実行してもよろしいですか？`}
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
