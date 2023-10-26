import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useNotifications } from '../useNotifications';
import { todoListState } from '@/recoilAtoms/recoilState';

export const useSortingPopover = () => {
  const notifications = useNotifications();

  const currentTodoList = useRecoilValue(todoListState);
  const setTodoListState = useSetRecoilState(todoListState);
  const sortTodoListCompleteDate = () => {
      const sortedTodoList = [...currentTodoList].sort((a, b) => {
          const dateA = new Date(a.dateEnd).getTime();
          const dateB = new Date(b.dateEnd).getTime();
          return dateB - dateA;
      });

      setTodoListState(sortedTodoList);
  }

  const sortTodoListTitle = () => {
      const sortedTodoList = [...currentTodoList].sort((a, b) => {
          const titleA = a.title.toLowerCase();
          const titleB = b.title.toLowerCase();
          return titleA.localeCompare(titleB);
        });
      setTodoListState(sortedTodoList);
  }


  function handleItemClick(value: string, onClose: () => void) {
    switch (value) {
      case 'sortDate':
        sortTodoListCompleteDate();
        break;
      case 'sortTitle':
        sortTodoListTitle();
        break;
      default:
        break;
    }
    onClose();
  }
  return { handleItemClick };
};