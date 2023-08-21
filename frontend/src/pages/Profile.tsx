
import MainLayout from "@/components/pages/MainLayout";
import { checkLogin, redirectToLogin } from "@/utils/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Typography } from "@mui/material";
import { parse } from "cookie";
import 'dayjs/locale/ja'; // 日本語のロケールをインポート
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import React from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";


export default function Profile(): JSX.Element {
  const [value, setValue] = React.useState<Date | null>(null);
  const handleChange = (newValue: Date | null) => {
    setValue(newValue);
  };

  // // フォームの型
  interface FormInput {
    username: string;
    avatarname: string;
    varsday: Date;
  }

  // バリデーションルール
  const schema = yup.object({
    // email: yup
    //   .string()
    //   .required("必須だよ")
    //   .email("正しいメールアドレス入力してね"),
    // password: yup
    //   .string()
    //   .required("必須だよ")
    //   .min(6, "少ないよ")
    //   //TODO　.$が必要な理由を後で調べる
    //   .matches(
    //     /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&].*$/,
    //     "パスワードには大文字、小文字、数字、記号のすべてを入れてください。"
    //   ),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: yupResolver(schema),
  });


  return (
    <MainLayout>
      <Box className="bg-white mt-10 w-11/12 mx-auto pl-10 py-10 text-left">
        <Typography className="text-4xl text-center">プロフィール登録</Typography>

      </Box>

    </MainLayout >
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

const styles = {
  mobiledialogprops: {
    '.PrivatePickersToolbar-dateTitleContainer .MuiTypography-root': {
      fontSize: '1.5rem'
    }
  }
}
