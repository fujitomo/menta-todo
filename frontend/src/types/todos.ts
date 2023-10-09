type Status = '待機中' | '次に対応' | '進行中' | '完了'

type SearchConditions = {
  title?: string
  description?: string
  startDay?: Date
  endDay?: Date
  tagExists?: boolean
  tagMatch?: string[]
  status?: Status
  attachmentsExists?: boolean
}

export type { SearchConditions, Status }
