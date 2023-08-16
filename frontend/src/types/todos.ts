type Status = '待機中' | '次に対応' | '進行中' | '完了'

type Todo = {
  user_id: string
  todo_id: string
  title: string
  description?: string
  date_start?: Date
  date_end?: Date
  tags?: string[]
  current_state: Status
  color: string
  attachments?: File[]
  create_date: Date
  update_date?: Date
  completed_date?: Date
}

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

export type { FetchTodos, PostTodos, Status, Todo, TodoFilterParams }

