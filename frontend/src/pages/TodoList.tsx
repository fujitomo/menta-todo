
import MainLayout from "@/components/pages/MainLayout";
import { SearchConditions } from "@/types/todos";
import { checkLogin, redirectToLogin } from "@/utils/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Grid, Link, StandardTextFieldProps, TextField, TextFieldVariants, Typography } from "@mui/material";
import { parse } from "cookie";
import 'dayjs/locale/ja'; // 日本語のロケールをインポート
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { useAPI } from "@/hooks/useAPI";
import Cookies from "js-cookie";
import { useTodoListNotifications } from "@/hooks//pages/useTodoListNotifications";
import { TodoCard, TodoState, notificationsState } from "@/recoilAtoms/recoilState";
import AddIcon from "@mui/icons-material/Add";
import LoadingButton from "@mui/lab/LoadingButton";
import { useRecoilValue } from "recoil";
import { useNotifications } from "@/hooks/useNotifications";
import { useRouter } from "next/router";
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { SortingPopover } from "@/components/Popover/SortingPopover";
import { TodoListSearchModal } from "@/components/dialog/TodoListSearchDaialog";
import { useTodoListSearchDialog } from "@/hooks/dialog/useTodoListSearchModal";

export default function TodoList() {
  const {
    getAnchorEl,
    handleOpenPopover,
    isOpenSortingPopover,
    handleSortButtonClick,
  } = useTodoListNotifications();

  const {
    handleShouldOpenSearchModal,
    isShouldOpenSearchModal
  } = useTodoListSearchDialog();

  const todoListNotifications = useTodoListNotifications();

  return (
    <MainLayout>
      <Grid container className="px-10 mt-5">
        <Grid container className="flex justify-between items-center px-10">
          <Link href="/TodoDetail">
            <Fab
              size="small"
              className="bg-[#a08240] hover:bg-[#a08240] ml-[-45px]"
              aria-label="add"
            >
              <AddIcon />
            </Fab>
          </Link>
          <Grid className="flex mr-[-45px]">
            <Button
              className={`text-2xl bg-[#B29649] hover:bg-[#B29649] font-base text-black font-bold rounded my-4 mx-2`}
              type="submit"
              variant="contained"
              onClick={handleShouldOpenSearchModal}
            >
              検索
            </Button>
            <Button
              className={`text-2xl bg-[#B29649] hover:bg-[#B29649] font-base text-black font-bold rounded my-4 mx-2`}
              variant="contained"
              component="button"
              onClick={(event) => handleOpenPopover(event)}
            >
              並び替え
            </Button>
          </Grid>
        </Grid>
        <TodoCardList className="mt-5" />
      </Grid>

      <TodoListSearchModal open={isShouldOpenSearchModal()} onClose={handleShouldOpenSearchModal} />
      <SortingPopover
        anchorEl={getAnchorEl()}
        onClose={() => { handleSortButtonClick() }}
        open={isOpenSortingPopover()}
      />
    </MainLayout>
  );

  function TodoCardList(props: any) {
    const { className } = props;

    const todoStatesArray: TodoState[] = [];
    Object.entries(TodoState).forEach(([key, value]) => {
      todoStatesArray.push(value);
    })

    return (
      <Grid container spacing={4} className={className}>
        {todoStatesArray.map((sectionTitle, index) => (
          <Grid item key={index} xs={12} sm={6} md={3} lg={3} xl={3}>
            <Typography variant="h4" align="center">
              {sectionTitle}
            </Typography>
            {todoListNotifications.getTodoCardList(sectionTitle).map((todo, todoIndex) => (
              <TodoCard key={todoIndex} todo={todo} />
            ))}
          </Grid>
        ))}
      </Grid>
    );
  }

  function TodoCard({ todo }: { todo: TodoCard }) {
    return (
      <Box className="bg-white text-black border p-4 mb-4 w-full" >
        <Box className="text-s mb-2">{todo.title}：{todo.description}</Box>
        <Box className="flex justify-between items-center"> {/* この行を変更 */}
          <Box /> {/* この行を追加 */}
          <Box className="text-m mb-2">終了日時：{todo && todo.dateEnd ? todo.dateEnd.toLocaleDateString() : '未登録'}</Box> {/* この行を変更 */}
        </Box>
        <Box className="flex justify-end">
          <Button
            className="mr-2"
            variant="contained"
            style={{ backgroundColor: '#53D748', color: 'black' }}
          >
            更新
          </Button>
          <Button
            className="mr-2"
            variant="contained"
            style={{ backgroundColor: '#DE8673', color: 'black' }}
          >
            削除
          </Button>
        </Box>
      </Box >
    );
  }
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