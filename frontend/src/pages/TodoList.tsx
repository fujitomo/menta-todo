
import MainLayout from "@/components/pages/MainLayout";
import { checkLogin, redirectToLogin } from "@/utils/utils";
import { Box, Button, Fab, Grid, Link, Typography } from "@mui/material";
import { parse } from "cookie";
import 'dayjs/locale/ja'; // 日本語のロケールをインポート
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import React from "react";
import { useTodoList } from "@/hooks/pages/useTodoList";
import { TodoCard, TodoState } from "@/recoilAtoms/recoilState";
import AddIcon from "@mui/icons-material/Add";
import { SortingPopover } from "@/components/Popover/SortingPopover";
import { TodoListSearchModal } from "@/components/dialog/TodoListSearchDaialog";
import { useTodoListSearchDialog } from "@/hooks/dialog/useTodoListSearchDialog";

export default function TodoList() {
  
  const {
    getAnchorEl,
    handleOpenPopover,
    isOpenSortingPopover,
    handleSortButtonClick,
  } = useTodoList();

  const {
    handleShouldOpenSearchModal,
    isShouldOpenSearchModal
  } = useTodoListSearchDialog();

  const todoListNotifications = useTodoList();

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
        <TodoCardList className="mt-1" />
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
    Object.entries(TodoState).forEach(([, value]) => {
      todoStatesArray.push(value);
    })

    return (
      <Grid container spacing={4} className={className}>
        {todoStatesArray.map((sectionTitle, index) => (
          <Grid item key={index}  sm={4} md={4} lg={4} xl={3}>
            <Typography variant="h4" align="center" className="mb-5">
              {sectionTitle}
            </Typography>
            <Box className="max-h-[420px] overflow-y-auto">
              {todoListNotifications.getTodoCardList(sectionTitle).map((todo) => (
                <TodoCard key={todo.todoId} todo={todo} />
              ))}
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  }

  function TodoCard({ todo }: { todo: TodoCard }) {
    return (
      <Box className="text-black border p-2 mb-4 w-full" style={{
        backgroundColor: todo.color === null ? 'white' : todo.color}} >
        <Box className="text-s mb-2"> {todo.title}：{todo.description.length > 31 ? todo.description.slice(0, 29) + "..." : todo.description}</Box>
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