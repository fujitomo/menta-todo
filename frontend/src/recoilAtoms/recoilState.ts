import dayjs from 'dayjs';
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
  SUCCESS_EMAIL_AUTENTICATION = 'SUCCESS_EMAIL_AUTENTICATION',
  SUCCESS_PASSWORD = 'SUCCESS_PASSWORD',
  ERROR = 'ERROR',
  ERROR_EMAIL_AUTENTICATION = 'EMAIL_AUTENTICATION',
}


export const enum EMAIL_MODE {
    ADD = 'STANDBY',
    UPDATE = 'PROSSING',
    AUTHENTICATION = 'AUTHENTICATION',
}

export const notificationsState = atom<Notification>({
  key: 'notificationsState',
  default: {
    id: '',
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
  PENDING = '保留',
  WORKING = '作業中',
  COMPLETED = '完了',
  WAITING = '待機中'
}

export const todoListState = atom<TodoCard[]>({
  key: 'todoList',
  default: [
  ],
});

export const displayAvatar = atom<boolean>({
  key: 'displayAvatar',
  default: false,
});

// 検索条件のインターフェース
export interface SearchConditions {
  title: string | null;
  description: string | null;
  dateStartRange: [dayjs.Dayjs | null, dayjs.Dayjs | null];
  dateEndRange: [dayjs.Dayjs | null, dayjs.Dayjs | null];
  tagExists: boolean | null;
  tags: string[] | null;
  currentState: TodoState | null;
  attachmentsExists: boolean | null;
}

// 検索条件のためのRecoil State
export const searchConditionsState = atom<SearchConditions>({
  key: 'searchConditionsState',
  default: {
    title: null,
    description: null,
    dateStartRange: [null, null],
    dateEndRange: [null, null],
    tagExists: null,
    tags: null,
    currentState: null,
    attachmentsExists: null,
  },
});

export enum  Transition {
  CREATE = '登録',
  UPDATE = '更新',
}

export interface TransitionDetail {
  TransitionDetail: Transition | null;
  todoId: string | null;
}

export const TransitionDetail = atom<TransitionDetail>({
  key: 'TransitionDetail',
  default: {
    TransitionDetail: null,
    todoId: null,
  },
});


export interface Profile {
  userName: string;
  email: string;
  birthday?: Date;
  attachmentURL?: string;
}

export const profileValues = atom<Profile>({
  key: 'profileState',
  default: {
    userName: '',
    email: '',
    attachmentURL: '',
  },
});


