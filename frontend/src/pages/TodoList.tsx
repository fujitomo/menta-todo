
import MainLayout from "@/components/pages/MainLayout";
// import { Todo } from "@/types/todos";
import { checkLogin, redirectToLogin } from "@/utils/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import { Grid } from "@mui/material";
import { parse } from "cookie";
import 'dayjs/locale/ja'; // 日本語のロケールをインポート
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { useAPI } from "../hooks/apis/useAPI";

export default function TodoList() {
  const [value, setValue] = React.useState<Date | null>(null);
  const handleChange = (newValue: Date | null) => {
    setValue(newValue);
  };

  // カード情報の状態
  // const [cards, setCards] = useState<Todo[]>([]);
  // const { getTodoList } = useAPIAuth();

  // カード情報をAPIから取得する関数
  // const fetchCards = async () => {
  //   try {
  //     const accessToken = Cookies.get("accessToken");
  //     const refreshToken = Cookies.get("refreshToken");
  //     // APIエンドポイントからデータを取得（エンドポイントを適切に変更してください）
  //     const response = await getTodoList(accessToken, refreshToken);
  //     if (response) {
  //       setCards(response.data);
  //     }
  //   } catch (error) {
  //     console.error('カード情報の取得に失敗しました:', error);
  //   }
  // };

  // コンポーネントがマウントされた際にカード情報を取得
  // React.useEffect(() => {
  //   fetchCards();
  // }, []);

  // // フォームの型
  interface FormInput {
    username: string;
    avatarname: string;
    varsday: Date;
  }

  function handleClick() {
    // ボタンがクリックされたときの処理をここに書く
    console.log('Button clicked!');
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

  const topButtonClasses = "w-40 mr-4  text-2xl bg-[#B29649] hover:bg-[#B29649] font-base text-black font-bold rounded mb-10"
  const cardHeader = "text-4xl mb-4 text-center";

  //   function TodoCard({ todo }: { todo: Todo }) {
  //     return (
  //       < Box className="bg-white text-black border p-4 mb-4 px-25" >
  //         <Box className="text-xs mb-2">{todo.title}：{todo.description}</Box>
  //         <Box className="flex justify-between items-center"> {/* この行を変更 */}
  //           <Box /> {/* この行を追加 */}
  //           <Box className="text-m mb-2">終了日時：{todo.date_end}</Box> {/* この行を変更 */}
  //         </Box>
  //         <Box className="flex justify-end">
  //           <Button
  //             className="mr-2"
  //             variant="contained"
  //             style={{ backgroundColor: '#53D748', color: 'black' }}
  //           >
  //             更新
  //           </Button>
  //           <Button
  //             className="mr-2"
  //             variant="contained"
  //             style={{ backgroundColor: '#DE8673', color: 'black' }}
  //           >
  //             削除
  //           </Button>
  //         </Box>
  //       </Box >
  //     );
  //   }
  return (
    <MainLayout>
      <Grid container className="px-10 mt-5"> {/* Container for horizontal alignment */}

      </Grid >
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



