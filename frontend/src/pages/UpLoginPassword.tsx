import {
  Box,
  TextField,
  Typography
} from "@mui/material";
import Link from "next/link";
import React from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import { useUpLoginPassword } from "@/hooks/pages/useUpLoginPassword";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { loginCheckRedirect } from "@/utils/utils";
import 'dayjs/locale/ja'; // 日本語のロケールをインポート

export default function UpLoginPassword() {

  const {
    register,
    handleSubmit,
    errors,
    notifications,
    openDialog,
    handleDialogClose,
    handleConfirmAction,
    handleOpenDialog,
    onSubmit
  } = useUpLoginPassword();

  return (
    <>
      <Box className="bg-white mt-20 w-2/3 text-center mx-auto py-10">
        <Typography className="text-4xl mb-10">ログインパスワード更新</Typography>
        <Box
          className="w-5/6 mx-auto"
          component="form"
          noValidate
        >
          <TextField
            className="w-11/12 mb-3"
            color="success"
            required
            inputProps={{ maxLength: 40, className: "text-2xl" }}
            label="更新前パスワード"
            type="password"
            {...register("oldPassword")}
            error={"oldPassword" in errors}
            helperText={
              <Box component="span" className="text-base text-red-500">
                {errors.oldPassword?.message}
              </Box>
            }
            disabled={notifications.isLoading()}
          />

          <TextField
            className="w-11/12 mb-3"
            color="success"
            required
            inputProps={{ maxLength: 40, className: "text-2xl" }}
            label="更新後パスワード"
            type="password"
            {...register("newPassword")}
            error={"newPassword" in errors}
            helperText={
              <Box component="span" className="text-base text-red-500">
                {errors.newPassword?.message}
              </Box>
            }
            disabled={notifications.isLoading()}
          />
          <TextField
            className="w-11/12 mb-3"
            color="success"
            required
            inputProps={{ maxLength: 40, className: "text-2xl" }}
            label="更新後パスワード確認"
            type="password"
            {...register("checkPassword")}
            error={"checkPassword" in errors}
            helperText={
              <Box component="span" className="text-base text-red-500">
                {errors.checkPassword?.message}
              </Box>
            }
            disabled={notifications.isLoading()}
          />

          <LoadingButton
            className={`text-2xl w-11/12 bg-[#B29649] hover:bg-[#B29649] font-base text-black font-bold rounded my-2}`}
            disabled={notifications.isLoading()}
            variant="contained"
            onClick={handleOpenDialog()}
            loading={notifications.isLoading()}
          >
            更新
          </LoadingButton>
          <Link href="/TodoList" legacyBehavior passHref>
            <LoadingButton
              className={`text-2xl w-11/12 bg-[#B29649] hover:bg-[#B29649] font-base text-black font-bold rounded my-4`}
              variant="contained"
              disabled={notifications.isLoading()}>
              戻る
            </LoadingButton>
          </Link>
        </Box>
      </Box>
      <ConfirmDialog
        open={openDialog}
        handleClose={handleDialogClose}
        title="確認"
        content={`更新処理を実行してもよろしいですか？`}
        confirmAction={handleConfirmAction(handleSubmit(onSubmit))}
      />
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{}>> {
  return loginCheckRedirect(context);
}