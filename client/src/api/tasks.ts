import type { Category } from "../types/category"
import type { Priority } from "../types/priority"
import type { Status } from "../types/status"
import { request } from "./request"

export type TaskFilters = {
  status: string,
  category: string,
  priority: string,
  sort: string,
  search?: string
}
export type NewTask = {
  title: string,
  description: string,
  location: string,
  category: Category,
  priority: Priority,
  dueDate?: string
}
type CareInput = { status?: Status, caretakerNote?: string }
export type TaskUpdate = NewTask & CareInput

export const getTaskById = (id: string) =>
  request(`/api/tasks/${id}`)

export const getTasks = (filters: TaskFilters) => {
  const params = new URLSearchParams()
  if (filters.status) params.append('status', filters.status)
  if (filters.category) params.append('category', filters.category)
  if (filters.priority) params.append('priority', filters.priority)
  if (filters.sort) params.append('sort', filters.sort)
  if (filters.search) params.append('search', filters.search)
  return request(`/api/tasks?${params}`)
}

export const createTask = (newTask: NewTask) =>
  request("/api/tasks", { method: "POST", body: JSON.stringify(newTask) })

export const updateTask = (id: string, task: TaskUpdate) =>
  request(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(task) })

export const deleteTask = (id: string) =>
  request(`/api/tasks/${id}`, { method: "DELETE" })

