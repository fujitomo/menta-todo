import MainLayout from "@/components/pages/MainLayout";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useContext } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";
import Link from "next/link";
import { useRouter } from "next/router";
import * as yup from "yup";
import { LoginContext } from "../components/shared/LoginProvider";

export default function Login() {
  const router = useRouter();
  const { login, setLogin } = useContext(LoginContext);

  //ログイン時ページ遷移用
  // const navigate = useNavigate();
  // useEffect(() => {
  //   var localLogin = localStorage.getItem("login");
  //   if (localLogin || login) {
  //     navigate("/");
  //   }
  // }, [login, navigate]);

  //TODO バリデーションをフックに分離する？

  //フォーム送信時の処理;
  const onSubmit: SubmitHandler<SampleFormInput> = (data: any) => {
    // バリデーションチェックOK！なときに行う処理を追加
    setLogin(true);
    localStorage.setItem("login", "true");
  };

  // フォームの型
  interface SampleFormInput {
    email: string;
    name: string;
    password: string;
  }

  // バリデーションルール
  const schema = yup.object({
    email: yup
      .string()
      .required("必須だよ")
      .email("正しいメールアドレス入力してね"),
    password: yup
      .string()
      .required("必須だよ")
      .min(6, "少ないよ")
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
  } = useForm<SampleFormInput>({
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
              href="/SignUpForm"
              className="text-2xl w-11/12 bg-[#B29649] hover:bg-[#B29649]  font-base text-black font-bold rounded mb-10"
              type="submit"
              fullWidth
              variant="contained"
              // onClick={handleSignUpButtonClick}
              // onClick={handleSubmit(onSubmit)}
            >
              新規登録
            </Button>
          </Link>

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
