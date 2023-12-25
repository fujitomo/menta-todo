import { useRecoilState, useRecoilValue } from 'recoil';
import { Transition, searchConditionsState, todoListState, TransitionDetail } from '@/recoilAtoms/recoilState';
import React, { useState } from 'react';
import Cookies from "js-cookie";
import { useAPI } from "@/hooks/useAPI";

export const useTodoList = () => {
     const { getTodoList, deleteTodo, stanbyNotification } = useAPI();
     const [, setValue] = useState<Date | null>(null);
     const todoList = useRecoilValue(todoListState);
     const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
     const [isSortingPopover, setSortingPopover] = useState(false);
     const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
     const [searchConditions] = useRecoilState(searchConditionsState);
     // 使用しないtransitionDetailも定義しないとエラーが表示される
     const [transitionDetail, setTransitionDetail] = useRecoilState(TransitionDetail);
     const [openDialog, setOpenDialog] = useState(false);
     const [todoId, setTodoId] = useState("");

     // コンポーネントがマウントされた際にカード情報を取得
     React.useEffect(() => {
          console.log('カード情報を取得します');
          fetchCards();
     }, [searchConditions]);

     // カード情報をAPIから取得する関数
     const fetchCards = async () => {
          try {
               const accessToken = Cookies.get("accessToken");
               const refreshToken = Cookies.get("refreshToken");
               // APIエンドポイントからデータを取得（エンドポイントを適切に変更してください）
               await getTodoList(accessToken, refreshToken, searchConditions);
               // if (response) {
               //   setCards(response.data);
               // }
          } catch (error) {
               console.error('カード情報の取得に失敗しました:', error);
          }
     };

     const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
          setSortingPopover(!isSortingPopover);
          setAnchorEl(event.currentTarget);
     };

     const getTodoCardList = (sectionTitle: string) => {
          return todoList.filter((todo) => todo.currentState === sectionTitle);
     };

     const handleChange = (newValue: Date | null) => {
          setValue(newValue);
     };

     const handleSortButtonClick = () => {
          // ポップオーバーを閉じる
          setSortingPopover(false);
     };

     const isOpenSortingPopover = () => {
          return isSortingPopover;
     };

     const getAnchorEl = () => {
          return anchorEl;
     };

     const handleShouldOpenSearchModal = () => {
          setIsSearchModalOpen(!isSearchModalOpen);
     };

     const handleCreateLink = () => {
          setTransitionDetail(() => ({
               TransitionDetail: Transition.CREATE,
               todoId: null,
          }));
          stanbyNotification();
     };

     const handleUpdateLink = (updateTodoId: string) => {
          setTransitionDetail(() => ({
               TransitionDetail: Transition.UPDATE,
               todoId: updateTodoId,
          }));
          stanbyNotification();
     };

     const handleDialogClose = () => {
          setOpenDialog(false);
     };

     const handleDialogOpen = (deleteTodoId: string) => {
          setTodoId(deleteTodoId);
          setOpenDialog(true);
     };

     const handleConfirmAction = (action: () => void) => () => {
          action();
          setOpenDialog(false);
     };

     const onDelete = async () => {
          try {
               console.error('TODD登録に失敗しました:');
               const accessToken = Cookies.get("accessToken");
               const refreshToken = Cookies.get("refreshToken");
               await deleteTodo(accessToken, refreshToken, todoId);
               await getTodoList(accessToken, refreshToken, searchConditions);
               setOpenDialog(false);
          } catch (error) {
               console.error('TODD登録に失敗しました:', error);
          }
     };

     return {
          getTodoCardList,
          handleChange,
          handleSortButtonClick,
          isOpenSortingPopover,
          handleOpenPopover,
          getAnchorEl,
          handleShouldOpenSearchModal,
          searchConditions,
          handleCreateLink,
          openDialog,
          setOpenDialog,
          handleDialogClose,
          handleConfirmAction,
          onDelete,
          handleDialogOpen,
          handleUpdateLink
     };
};
