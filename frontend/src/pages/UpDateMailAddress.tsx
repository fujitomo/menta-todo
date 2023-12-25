import {
  Box,
  TextField,
  Typography
} from "@mui/material";
import Link from "next/link";
import React from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import { useUpDateMailAddress } from "@/hooks/pages/useUpDateMailAddress";
import { AuthModal } from "@/components/dialog/AuthDialog";
import { CompleteDialog } from "@/components/dialog/CompleteDialog";
import { EMAIL_MODE } from "@/recoilAtoms/recoilState";
import { loginCheckRedirect } from "@/utils/utils";
import 'dayjs/locale/ja'; // 日本語のロケールをインポート
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";

export default function UpDateMailAdress() {

  const {
    register,
    handleSubmit,
    errors,
    onSubmitUpdateEmail,
    isDialogOpen,
    notifications,
  } = useUpDateMailAddress();

  return (
    <Box className="bg-white mt-20 w-2/3 text-center mx-auto py-10">
      <Typography className="text-4xl mb-10">メールアドレス更新</Typography>
      <Box
        className="w-5/6 mx-auto"
        component="form"
        //onSubmit={handleSubmit}
        noValidate
      >
        <TextField
          className="w-11/12 mb-10"
          color="success"
          required
          inputProps={{ maxLength: 40, className: "text-2xl" }}
          label="メールアドレス"
          type="email"
          {...register("email")}
          error={"email" in errors}
          helperText={
            <Box component="span" className="text-base text-red-500">
              {errors.email?.message}
            </Box>
          }
          disabled={notifications.isLoading()}
        />

        <LoadingButton
          className={`text-2xl w-11/12 bg-[#B29649] hover:bg-[#B29649] font-base text-black font-bold rounded my-4 ${isDialogOpen() ? 'pointer-events-none' : ''}`}
          type="submit"
          fullWidth
          disabled={notifications.isLoading()}
          variant="contained"
          onClick={handleSubmit(onSubmitUpdateEmail)}
          loading={notifications.isLoading()}
        >
          ワンタイムパスワード発行
        </LoadingButton>
        <Link href="/TodoList" legacyBehavior passHref>
          <LoadingButton
            className={`text-2xl w-11/12 bg-[#B29649] hover:bg-[#B29649] font-base text-black font-bold rounded my-4 ${isDialogOpen() ? 'pointer-events-none' : ''}`}
            variant="contained"
            disabled={notifications.isLoading()}>
            戻る
          </LoadingButton>
        </Link>
        <AuthModal email_mode={EMAIL_MODE.UPDATE} />
        <CompleteDialog />
      </Box>
    </Box>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{}>> {
  return loginCheckRedirect(context);
}