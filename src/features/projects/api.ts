import { api } from '@/lib/api'
import type { Project } from '@/types'
import type { CreateProjectInput, UpdateProjectInput } from './schemas'

export function listProjects() {
  return api<Project[]>('/projects')
}

export function getProject(id: string) {
  return api<Project>(`/projects/${id}`)
}

export function createProject(data: CreateProjectInput) {
  return api<Project>('/projects', { method: 'POST', json: data })
}

export function updateProject(id: string, data: UpdateProjectInput) {
  return api<Project>(`/projects/${id}`, { method: 'PATCH', json: data })
}

export function deleteProject(id: string) {
  return api(`/projects/${id}`, { method: 'DELETE' })
}
