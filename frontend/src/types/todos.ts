type Status = '待機中' | '次に対応' | '進行中' | '完了'

type PostTodos = {
  todo_id: string
  title: string
  description?: string
  start_day?: Date
  end_day?: Date
  tags?: string[]
  status: Status
  color: string
  attachments?: File[]
  created_at: Date
  updated_at?: Date
}

type FetchTodos = {
  todo_id: string
  title: string
  description?: string
  start_day?: string
  end_day?: string
  tags?: string[]
  status: Status
  color: string
  attachments?: string[]
  created_at: string
  updated_at?: string
}

type TodoFilterParams = {
  title?: string
  description?: string
  start_day?: Date
  end_day?: Date
  tag_exists?: boolean
  tag_match?: string[]
  status?: Status
  attachments_exists?: boolean
}

export type { PostTodos, FetchTodos, Status, TodoFilterParams }
