
import { SearchConditions } from "@/types/todos";
import { yupResolver } from "@hookform/resolvers/yup";
import 'dayjs/locale/ja'; // 日本語のロケールをインポート
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";


export const useTodoListSearchDialog = () => {
     const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

     const handleShouldOpenSearchModal = () => {
          setIsSearchModalOpen(!isSearchModalOpen); // モーダルを表示する
     };

     const isShouldOpenSearchModal = () => {
          return isSearchModalOpen; // モーダルを表示する
     };

     // バリデーションルール
     const schema = yup.object({
          startDate: yup
               .date()
               .typeError("正しい日付を入力してください"),
          endDate: yup
               .date()
               .typeError("正しい日付を入力してください"),
     });

     const {
          register,
          handleSubmit,
          formState: { errors },
     } = useForm<SearchConditions>({
          resolver: yupResolver(schema),
     });

     return { handleShouldOpenSearchModal, isShouldOpenSearchModal };
};
