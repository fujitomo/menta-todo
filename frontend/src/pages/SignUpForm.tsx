import {
  Box,
  TextField,
  Typography
} from "@mui/material";
import Link from "next/link";
import React from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import { useSignUpForm } from "@/hooks/pages/useSignUpForm";
import { AuthModal } from "@/components/dialog/AuthDialog";
import { CompleteDialog } from "@/components/dialog/CompleteDialog";
import { EMAIL_MODE } from "@/recoilAtoms/recoilState";

export default function SignUpForm() {

  const {
    register,
    handleSubmit,
    errors,
    onSubmitCreateUser,
    isDialogOpen,
    notifications,
  } = useSignUpForm();

  return (
      <Box className="bg-white mt-20 w-2/3 text-center mx-auto py-10">
        <Typography className="text-4xl mb-10">新規登録</Typography>
        <Box
          className="w-5/6 mx-auto"
          component="form"
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

          <TextField
            className="w-11/12 mb-10"
            color="success"
            required
            autoComplete="current-password"
            inputProps={{ maxLength: 63, className: "text-2xl" }}
            label="パスワード"
            type="password"
            {...register("password")}
            error={"password" in errors}
            helperText={
              <Box component="span" className="text-base text-red-500">
                {errors.password?.message}
              </Box>
            }
            disabled={notifications.isLoading()}
          />

          <LoadingButton
            href="/SignUpForm"
            className={`text-2xl w-11/12 bg-[#B29649] hover:bg-[#B29649] font-base text-black font-bold rounded my-4 ${isDialogOpen() ? 'pointer-events-none' : ''}`}
            type="submit"
            fullWidth
            disabled={notifications.isLoading()}
            variant="contained"
            onClick={handleSubmit(onSubmitCreateUser)}
            loading={notifications.isLoading()}
          >
            ワンタイムパスワード発行
          </LoadingButton>
          <Box className="text-right">
            <Link
              href="/Login"
              legacyBehavior
              passHref
            >
              <a className={`text-xl transition-transform duration-300 ease-in-out transform hover:scale-105 hover:text-blue-500 ${isDialogOpen() ? 'pointer-events-none' : ''}`}>
                ログインはこちら
              </a>
            </Link>
          </Box>
          <AuthModal emailMode={ EMAIL_MODE.AUTHENTICATION } />
          <CompleteDialog />
        </Box>
      </Box>
  );


}
