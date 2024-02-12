import { loginCheckRedirect } from "@/utils/utils";
import { Box, Button, Fab, Grid, Typography } from "@mui/material";
import Link from "next/link";
import "dayjs/locale/ja"; // 日本語のロケールをインポート
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import React from "react";
import { useTodoList } from "@/hooks/pages/useTodoList";
import { TodoCard, TodoState } from "@/recoilAtoms/recoilState";
import AddIcon from "@mui/icons-material/Add";
import { SortingPopover } from "@/components/Popover/SortingPopover";
import { TodoListSearchModal } from "@/components/dialog/TodoListSearchDaialog";
import { useTodoListSearchDialog } from "@/hooks/dialog/useTodoListSearchDialog";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";

export default function TodoList() {
  const {
    getAnchorEl,
    handleOpenPopover,
    isOpenSortingPopover,
    handleSortButtonClick,
    handleCreateLink,
    openDialog,
    handleDialogClose,
    onDelete,
    handleDialogOpen,
    handleUpdateLink,
    getTodoCardList,
  } = useTodoList();

  const { handleShouldOpenSearchModal, isShouldOpenSearchModal } =
    useTodoListSearchDialog();

  return (
    <>
      <Grid className="px-10 mt-5">
        <Grid container className="flex justify-between items-center px-10">
          <Link href="/TodoDetail">
            <Fab
              size="small"
              className="bg-[#a08240] hover:bg-[#a08240] ml-[-45px]"
              aria-label="add"
              onClick={handleCreateLink}
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

      <TodoListSearchModal
        open={isShouldOpenSearchModal()}
        onClose={handleShouldOpenSearchModal}
      />
      <SortingPopover
        anchorEl={getAnchorEl()}
        onClose={() => {
          handleSortButtonClick();
        }}
        open={isOpenSortingPopover()}
      />
      <ConfirmDialog
        open={openDialog}
        handleClose={handleDialogClose}
        title="確認"
        content="削除処理を実行してもよろしいですか？"
        confirmAction={() => onDelete()}
      />
    </>
  );

  function TodoCardList(props: any) {
    const { className } = props;

    const todoStatesArray: TodoState[] = [];
    Object.entries(TodoState).forEach(([, value]) => {
      todoStatesArray.push(value);
    });

    return (
      <Grid container spacing={4} className={className}>
        {todoStatesArray.map((sectionTitle, index) => (
          <Grid item key={index} sm={4} md={4} lg={4} xl={3}>
            <Typography variant="h4" align="center" className="mb-5">
              {sectionTitle}
            </Typography>
            <Box className="max-h-[61vh] overflow-y-auto">
              {getTodoCardList(sectionTitle).map((todo) => (
                <TodoCard key={todo.todoId} todo={todo} />
              ))}
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  }
  function TodoCard({ todo }: { todo: TodoCard }) {
    const backgroundColorClass = todo.color ? `bg-${todo.color}` : 'bg-white';
    return (
      <div
        className={`bg-white p-4 mb-4 w-full shadow-lg rounded-lg`}
        style={{
          backgroundColor: todo.color === null ? 'white' : todo.color
        }}
      >
        <div className="text-xl mb-4">
          {todo.title}：
          {todo.description?.length > 31
            ? `${todo.description.slice(0, 29)}...`
            : todo.description}
        </div>
        <div className="flex justify-between items-center mb-4 text-lg">
          終了日時：
          {todo && todo.dateEnd && todo.dateEnd.getTime() !== 0
            ? todo.dateEnd.toLocaleDateString()
            : "未登録"}
        </div>

        <div className="flex justify-end space-x-2">
          <Link href="/TodoDetail">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={() => handleUpdateLink(todo.todoId)}
            >
              更新
            </button>
          </Link>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={() => handleDialogOpen(todo.todoId)}
          >
            削除
          </button>
        </div>
      </div>
    );
  }
}

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{}>> {
  return loginCheckRedirect(context);
}
