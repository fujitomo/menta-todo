import MainLayout from "@/components/pages/MainLayout";
import { User } from "@/types/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert, Box, Button, Snackbar, TextField, Typography } from "@mui/material";
import Cookies from 'js-cookie';
import Link from "next/link";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";
import { useAPIAuth } from "../hooks/apis/useAPIAuth";

export default function Login() {
  const [message, setMessage] = useState("");
  const rootUrl = process.env.NEXT_PUBLIC_APIROOT;
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);
  const { login } = useAPIAuth();

  //フォーム送信時の処理;
  const onSubmit: SubmitHandler<FormInput> = async () => {
    const response = await login(getValues());
    if (response) {
      switch (response.status) {
        case 200:
          Cookies.set('accessToken', response.data.accesstoken);
          Cookies.set('refreshToken', response.data.refreshtoken);
          window.location.href = "/TodoList";
          break;
        default:
          setMessage("ログイン出来ません。");
          setSnackbarOpen(true);
          break;
      }
    } else {
      setMessage("ログイン出来ません。ネットワークに接続できているかご確認下さい。");;
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // フォームの型
  interface FormInput {
    email: string;
    password: string;
  }

  // バリデーションルール
  const schema = yup.object({
    email: yup
      .string()
      .required("必須です。")
      .email("正しいメールアドレス入力して下さい。"),
    password: yup
      .string()
      .required("必須です。")
      .min(6, "パスワードの文字数が少ないです。")
      //TODO　.$が必要な理由を後で調べる
      .matches(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&].*$/,
        "パスワードには大文字、小文字、数字、記号のすべてを入れてください。"
      ),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<User>({
    resolver: yupResolver(schema),
  });

  return (
    <MainLayout>
      <Box className="bg-white mt-32 w-2/3 text-center mx-auto py-10">
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
          />
          {/* <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="パスワードを保存しますか？"
          /> */}
          <Button
            className="text-2xl w-11/12 bg-[#B29649] hover:bg-[#B29649]  font-base text-black font-bold rounded my-4"
            type="submit"
            fullWidth
            variant="contained"
            onClick={handleSubmit(onSubmit)}
          >
            ログイン
          </Button>
          <Link href="/SignUpForm" legacyBehavior passHref>
            <Button
              className="text-2xl w-11/12 bg-[#B29649] hover:bg-[#B29649]  font-base text-black font-bold rounded mb-10"
              type="submit"
              fullWidth
              variant="contained"
            >
              新規登録
            </Button>
          </Link>

          <Snackbar
            open={isSnackbarOpen}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            autoHideDuration={6000}
            message={message}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity="error"
              className="bg-red-400 text-white"
            >
              {/*　改行処理 */}
              <Typography>
                {message.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </Typography>
            </Alert>
          </Snackbar>

          {/* <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                パスワードを忘れましたか？
              </Link>
            </Grid>
          </Grid> */}
        </Box>
      </Box>
    </MainLayout>
  );
}