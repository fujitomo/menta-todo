import { TodoState } from "@/recoilAtoms/recoilState";
import { DateRange } from "@mui/x-date-pickers-pro";
import dayjs from "dayjs";


type SearchConditions = {
  title?: string | null;
  description?: string | null;
  dateStartRange?:DateRange<dayjs.Dayjs> | null;
  dateEndRange?: DateRange<dayjs.Dayjs> | null;
  tagExists?: boolean | null;
  tags?: string[] | undefined | null;
  currentState?: TodoState  | null;
  attachmentsExists?: boolean | null;
}

type TodoDetail = {
  todoId?: string;
  title: string;
  description?: string;
  dateStart?:Date;
  dateEnd?: Date;
  tagExists?: boolean;
  tags?: string[];
  currentState?: string;
  attachments?: File[];
  color: string;
}

export type { TodoDetail, SearchConditions, TodoState }
