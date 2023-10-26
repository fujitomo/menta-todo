import { DateRange } from "@mui/x-date-pickers-pro";
import dayjs from "dayjs";

type Status = '待機中' | '次に対応' | '進行中' | '完了'

type SearchConditions = {
  title?: string | undefined | null;
  description?: string | undefined | null;
  startDateRange?:DateRange<dayjs.Dayjs> | null;
  completeDateRange?: DateRange<dayjs.Dayjs> | null;
  tagExists?: boolean | undefined | null | string;
  tagMatch?: string[] | undefined | null;
  status?: Status  | undefined | null;
  attachmentsExists?: boolean | undefined | null;
}

export type { SearchConditions, Status }
