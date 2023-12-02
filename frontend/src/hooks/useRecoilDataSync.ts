import { useRecoilValue, useSetRecoilState } from 'recoil';
import { notificationsState, State, TodoCard, todoListState } from '@/recoilAtoms/recoilState';

//useAPIから取得したデータをRecoil管理している状態に同期する
//※useTodoList等で行うとエラーになる。エラー原因はuseNotificationsに関わる処理が無限再帰にコールされるため。
export const useRecoilDataSync = () => {

    const setTodoListState = useSetRecoilState(todoListState);
    const setTodoCardList = ({
        todoCardList
    }: {
        todoCardList: TodoCard[];
    }) => {
        setTodoListState(todoCardList);
    }
    


    return { setTodoCardList };
};
