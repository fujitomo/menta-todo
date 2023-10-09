import { atom } from 'recoil';

export interface Notification  {
  id: string;
  loading: boolean;
  state: string;
  message: string;
  closeTimer: number;
}

export const enum State {
  STANDBY = 'STANDBY',
  PROSSING = 'PROSSING',
  SUCCESS = 'SUCCESS',
  SUCCESS2 = 'SUCCESS2',
  ERROR = 'ERROR',
  ERROR2 = 'ERROR2',
}

export const notificationsState = atom<Notification>({
  key: 'notificationsState',
  default: {
    id: "",
    loading: false,
    state: State.STANDBY,
    message: '',
    closeTimer: 6000
  },
});

export interface TodoCard {
  userId: string;
  todoId: string;
  title: string;
  description: string;
  dateStart: Date,
  dateEnd: Date;
  tags: string[],
  attachments: any[],
  color: string,
  currentState: TodoState,
  completedDate: Date,
  createDate: Date

}

export enum TodoState {
  PENDING = "保留",
  WORKING = "作業中",
  COMPLETED = "完了",
  WAITING = "待機中"
}

export const todoListState = atom<TodoCard[]>({
  key: 'todoState',
  default: [
  ],
});



