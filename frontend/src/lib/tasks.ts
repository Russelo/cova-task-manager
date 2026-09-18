import api from './api'

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

export interface TaskPage {
  content: Task[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface TaskListParams {
  status?: TaskStatus
  search?: string
  page?: number
  size?: number
}

export interface TaskInput {
  title: string
  description: string
  status: TaskStatus
}

export async function listTasks(params: TaskListParams, signal?: AbortSignal): Promise<TaskPage> {
  const { data } = await api.get<TaskPage>('/tasks', { params, signal })
  return data
}

export async function createTask(input: TaskInput): Promise<Task> {
  const { data } = await api.post<Task>('/tasks', input)
  return data
}

export async function updateTask(id: string, input: TaskInput): Promise<Task> {
  const { data } = await api.put<Task>(`/tasks/${id}`, input)
  return data
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`)
}
