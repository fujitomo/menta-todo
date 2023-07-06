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
  Typography,
} from "@mui/material";
import { SubmitHandler, useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";
import { User } from "@/types/auth";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { SyntheticEvent, useState } from "react";
import * as yup from "yup";
import { useAPIAuth } from "../hooks/apis/useAPIAuth";

export default function SignUpForm() {
  // const router = useRouter();
  // const { login, setLogin } = useContext(LoginContext);

  //ログイン時ページ遷移用
  // const navigate = useNavigate();
  // useEffect(() => {
  //   var localLogin = localStorage.getItem("login");
  //   if (localLogin || login) {
  //     navigate("/");
  //   }
  // }, [login, navigate]);

  //TODO バリデーションをフックに分離する？
  const rootUrl = process.env.NEXT_PUBLIC_APIROOT;

  const { createUser, emailAuthentication } = useAPIAuth();

  const [isModalOpen, setModalOpen] = useState(false);
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { setValue } = useForm<User>();

  const handleCloseModal = () => {
    // モーダルを閉じる
    setModalOpen(false);
  };

  const handleCloseSnackbar = (event: SyntheticEvent<Element, Event>) => {
    setSnackbarOpen(false);
  };

  const [isLoading, setLoading] = useState(false);

  //フォーム送信時の処理
  const onSubmitCreateUser: SubmitHandler<User> = async () => {
    setValue("onetimepassword", "");
    setLoading(true);
    console.log(getValues());
    const response = await createUser(rootUrl, getValues());
    console.log("レスポンス：", response);
    if (response) {
      console.log(response.status);
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
        console.log("ワンタイムパスワード発行に成功しました:", response);
        console.log("accesstken:", response.data.accesstoken);
        localStorage.setItem("accessToken", response.data.accesstoken);
        setSnackbarOpen(false);
        setModalOpen(true);
      }
    } else {
      console.error("ワンタイムパスワード発行に失敗しました。");
      setMessage("404エラー:サーバーに接続できません。");
      setSnackbarOpen(true);
    }
    setLoading(false);
  };

  //TODO ワンタイムパスワード認証
  const onSubmitEmailAuthentication: SubmitHandler<User> = async () => {
    console.log(getValues());
    const response = await emailAuthentication(
      rootUrl,
      getValues().onetimepassword
    );
    if (response) {
      console.log(response.status);
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
        return;
      }

      // ユーザー作成成功時の処理
      console.log("ユーザ本登録に成功しました:", response);
      localStorage.setItem("accessToken", response.data.accessToken);
      setModalOpen(true);
      return;
    } else {
      console.error("ワンタイムパスワード発行に失敗しました。");
      setMessage("404エラー:サーバーに接続できません。");
      setSnackbarOpen(true);
    }
    // モーダルを閉じる
    //setModalOpen(false);
  };

  // const handleCloseSnackbar = (
  //   event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  // ) => {
  //   setSnackbarOpen(false);
  // };

  // モーダル外部のクリックイベントを停止（クリックするとモーダルが閉じるので）
  const handleOverlayClick = (event: any) => {
    // ダイアログ外部のクリックイベントを停止
    event.stopPropagation();
  };

  //フォーム送信時の処理

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
      //TODO　.$が必要な理由を後で調べる
      .matches(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&].*$/,
        "パスワードには大文字、小文字、数字、記号のすべてを含んで下さい。"
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
          {/* <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="パスワードを保存しますか？"
          /> */}

          <Button
            href="/SignUpForm"
            className="text-2xl w-11/12 bg-[#B29649] hover:bg-[#B29649]  font-base text-black font-bold rounded mb-10"
            type="submit"
            fullWidth
            disabled={isLoading}
            variant="contained"
            onClick={handleSubmit(onSubmitCreateUser)}
          >
            ワンタイムパスワード発行
          </Button>

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
              {message}
            </Alert>
          </Snackbar>

          <div className="overlay" onClick={handleOverlayClick}>
            <Dialog
              open={isModalOpen}
              onClose={handleCloseModal}
              className="pointer-events-none"
            >
              <DialogTitle>ワンタイムパスワード入力</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  メールアドレスに届いたパスワードを入力して下さい。
                </DialogContentText>
                <TextField
                  className="pointer-events-auto"
                  autoFocus
                  margin="dense"
                  id="onetimepassword"
                  label="ワンタイムパスワード"
                  type="onetimepassword"
                  fullWidth
                  variant="standard"
                  {...register("onetimepassword")}
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
                  onClick={handleCloseModal}
                >
                  閉じる
                </Button>
              </DialogActions>
            </Dialog>
          </div>

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
