import { Box, TextField, Typography } from "@mui/material";
import Link from "next/link";
import React, {  } from "react";
import LoadingButton from '@mui/lab/LoadingButton';
import { useLogin } from "@/hooks/pages/useLogin";

export default function Login() {

  const {
    register,
    handleSubmit,
    errors,
    onSubmit,
    notifications,
  } = useLogin();

  return (
      <Box className="bg-white mt-20 w-2/3 text-center mx-auto py-10">
        <Typography className="text-4xl mb-10">
          ログイン
        </Typography>
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
            autoComplete="email"
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
          {/* <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="パスワードを保存しますか？"
          /> */}
          <LoadingButton
            className="text-2xl w-11/12 bg-[#B29649] hover:bg-[#B29649]  font-base text-black font-bold rounded my-4"
            type="submit"
            fullWidth
            loading={notifications.isLoading()}
            variant="contained"
            onClick={handleSubmit(onSubmit)}
          >
            ログイン
          </LoadingButton>
          <Box className="text-right">
            <Link
              href="/SignUpForm"
              legacyBehavior
              passHref
            >
              <a className={`text-xl transition-transform duration-300 ease-in-out transform hover:scale-105 ${notifications.isLoading() ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-500'}`}
              >
                新規登録はこちら
              </a>
            </Link>
          </Box>
          {/* <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                パスワードを忘れましたか？
              </Link>
            </Grid>
          </Grid> */}
        </Box>
      </Box>
  );
}