
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { todoListState, State, TodoCard } from '@/recoilAtoms/recoilState';
import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useAPI } from "@/hooks/useAPI";

export const useTodoListNotifications = () => {
     const setTodoListState = useSetRecoilState(todoListState);
     const { getTodoList } = useAPI();
     const [value, setValue] = React.useState<Date | null>(null);
     const todoList = useRecoilValue(todoListState);
     const [isModalOpen, setIsModalOpen] = useState(false);
     const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
     const [isSortingPopover, setSortingPopover] = useState(false);
     const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

     // コンポーネントがマウントされた際にカード情報を取得
     React.useEffect(() => {
          console.log('カード情報を取得します');
          fetchCards();
     }, []);

     // カード情報をAPIから取得する関数
     const fetchCards = async () => {
          try {
               const accessToken = Cookies.get("accessToken");
               const refreshToken = Cookies.get("refreshToken");
               // APIエンドポイントからデータを取得（エンドポイントを適切に変更してください）
               await getTodoList(accessToken, refreshToken);
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
          setIsSearchModalOpen(!isSearchModalOpen); // モーダルを表示する
     };

     const isShouldOpenSearchModal = () => {
          return isSearchModalOpen; // モーダルを表示する
     };

     const setTodoCardList = ({
         todoCardList
     }: {
         todoCardList: TodoCard[];
     }) => {
         setTodoListState(todoCardList);
     }
 

     return { setTodoCardList,setTodoListState,getTodoCardList, handleChange, handleSortButtonClick, isOpenSortingPopover, handleOpenPopover, getAnchorEl, handleShouldOpenSearchModal, isShouldOpenSearchModal };
};
