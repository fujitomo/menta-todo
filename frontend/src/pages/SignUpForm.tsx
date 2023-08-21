import MainLayout from "@/components/pages/MainLayout";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  Snackbar,
  TextField,
  Typography
} from "@mui/material";
import { SubmitHandler, useForm } from "react-hook-form";
import Link from "next/link";
import { User } from "@/types/auth";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import React, { useState } from "react";
import * as yup from "yup";
import { useAPI } from "../hooks/apis/useAPI";


export default function SignUpForm() {

  const { createUser, emailAuthentication } = useAPI();

  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isComplateModalOpen, setComplateModalOpen] = useState(false);
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleCloseComplateModal = () => {
    // モーダルを閉じる
    setComplateModalOpen(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const [isLoading, setLoading] = useState(false);

  const router = useRouter(); // ルーターを取得

  // モーダル外部のクリックイベントを停止（クリックするとモーダルが閉じるので）
  const handleOverlayClick = (event: any) => {
    // ダイアログ外部のクリックイベントを停止
    event.stopPropagation();
  };

  const onSubmitCompleteClose = () => {
    setComplateModalOpen(false);
    console.log("Profile画面に遷移します。");
    router.push("/Profile");
  };

  // バリデーションルール
  const schema = yup.object({
    email: yup
      .string()
      .required("入力必須です。")
      .email("正しいメールアドレスを入力して下さい。"),
    password: yup
      .string()
      .required("入力必須です。")
      .min(6, "文字数が少ないです。6文字以上入力して下さい。")
      .matches(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&].*$/,
        "パスワードには大文字、小文字、数字、記号のすべてを含んで下さい。"
      ),
    onetimepassword: yup
      .string()
      .required("入力必須です。"),
  });
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<User>({
    defaultValues: { onetimepassword: ' ' },
    resolver: yupResolver(schema),
  });

  const onSubmitEmailAuthentication: SubmitHandler<User> = async () => {
    let accessToken = Cookies.get('accessToken');
    const response = await emailAuthentication(
      accessToken ?? undefined,
      getValues().onetimepassword
    );

    if (response) {
      if (response.status !== 200) {
        if (response.status === 409) {
          setMessage(`${response.status}エラー：既に登録されています。`); // あなたのエラーメッセージを設定します
        } else if (response.status === 401) {
          setMessage(
            `${response.status}エラー：ワンタイムパスワードを間違えている可能性があります。\n
            または、ワンタイムパスワードの1日あたりの生成回数上限に達している可能性があります。`
          );
        } else {
          setMessage(`${response.status}エラー`);
        }
        setSnackbarOpen(true);
        return;
      }

      // ユーザー作成成功時の処理
      Cookies.set('accessToken', response.data.accesstoken);
      Cookies.set('refreshToken', response.data.refreshtoken);
      setAuthModalOpen(false);
      setComplateModalOpen(true);
      return;
    } else {
      setMessage("404エラー:サーバーに接続できません。");
      setSnackbarOpen(true);
    }
  };

  //フォーム送信時の処理
  const onSubmitCreateUser: SubmitHandler<User> = async () => {
    setLoading(true);
    const response = await createUser(getValues());
    if (response) {
      if (response.status !== 200) {
        if (response.status === 409) {
          setMessage(`${response.status}エラー：既に登録されています。`); // あなたのエラーメッセージを設定します
        } else if (response.status === 401) {
          setMessage(
            `${response.status}エラー：このメールアドレスではワンタイムパスワードの1日あたの生成回数上限に達しています。`
          );
        } else {
          setMessage(`${response.status}エラー`);
        }
        setSnackbarOpen(true);
      } else {
        // ユーザー作成成功時の処理
        Cookies.set('accessToken', response.data.accesstoken);
        console.log(Cookies.get('accessToken'));
        setSnackbarOpen(false);
        setAuthModalOpen(true);
        setValue("onetimepassword", "");
      }
    } else {
      setMessage("404エラー:サーバーに接続できません。");
      setSnackbarOpen(true);
    }
    setLoading(false);
  };

  const handleCloseAuthModal = () => {
    // onetimepassword フィールドの値を空に設定
    // モーダルを閉じる
    setValue("onetimepassword", "aaaa");
    setAuthModalOpen(false);
  };

  return (
    <MainLayout>
      <Box className="bg-white mt-20 w-2/3 text-center mx-auto py-10">
        <Typography className="text-4xl mb-10">新規登録</Typography>
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

          <Button
            href="/SignUpForm"
            className={`text-2xl w-11/12 bg-[#B29649] hover:bg-[#B29649] font-base text-black font-bold rounded my-4 ${(isAuthModalOpen || isComplateModalOpen) ? 'pointer-events-none' : ''}`}
            type="submit"
            fullWidth
            disabled={isLoading}
            variant="contained"
            onClick={handleSubmit(onSubmitCreateUser)}
          >
            ワンタイムパスワード発行
          </Button>
          <Box className="text-right">
            <Link
              href="/Login"
              legacyBehavior
              passHref
            >
              <a className="text-xl transition-transform duration-300 ease-in-out transform hover:scale-105 hover:text-blue-500">
                ログインはこちら
              </a>
            </Link>
          </Box>

          <MessageSnackbar />
          <AuthModal />
          <CompleteModal />

        </Box>
      </Box>
    </MainLayout >
  );

  function MessageSnackbar() {
    return (
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
    )
  }

  function AuthModal() {
    return (
      <Dialog
        open={isAuthModalOpen}
        onClose={handleCloseAuthModal}
        className="pointer-events-none z-{1000}"
      >
        <DialogTitle>ワンタイムパスワード入力</DialogTitle>
        <DialogContent>
          <DialogContentText>
            メールアドレスに届いたパスワードを入力して下さい。
          </DialogContentText>
          <TextField
            className="pointer-events-auto"
            autoFocus
            required
            margin="dense"
            fullWidth
            id="onetimepassword"
            label="ワンタイムパスワード"
            variant="standard"
            type="onetimepassword"
            {...register("onetimepassword")}
            error={"onetimepassword" in errors}
            helperText={
              <Box component="span" className="text-base text-red-500">
                {errors.onetimepassword?.message}
              </Box>
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            className="pointer-events-auto bg-[#B29649] hover:bg-[#B29649]  font-base text-black font-bold rounded"
            onClick={handleSubmit(onSubmitEmailAuthentication)}
          >
            実行
          </Button>
          <Button
            className="pointer-events-auto bg-[#B29649] hover:bg-[#B29649]  font-base text-black font-bold rounded"
            onClick={handleCloseAuthModal}
          >
            閉じる
          </Button>
        </DialogActions>
      </Dialog >
    );
  }

  function CompleteModal() {
    return (
      <Dialog
        open={isComplateModalOpen}
        onClose={handleCloseComplateModal}
        className="pointer-events-none"
        disableEnforceFocus={false}
      >
        <DialogTitle>ユーザー登録・認証完了</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ユーザー登録・認証が完了しました。<br />
            次回よりログイン画面からログインして下さい。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            className="pointer-events-auto bg-[#B29649] hover:bg-[#B29649]  font-base text-black font-bold rounded"
            onClick={onSubmitCompleteClose}
          >
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
