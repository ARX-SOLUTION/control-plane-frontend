// Shared TypeScript types for Control Plane frontend

// ─── Auth ───────────────────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  lastLoginAt: string | null
}

// ─── Projects ────────────────────────────────────────────────────────────────
export interface Project {
  id: string
  name: string
  displayName: string
  githubUrl: string | null
  branch: string | null
  buildCommand: string | null
  startCommand: string | null
  healthCheckPath: string | null
  healthCheckInterval: number | null
  appPort: number
  isActive: boolean
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

// ─── Environments ─────────────────────────────────────────────────────────────
export type EnvironmentName = 'dev' | 'stage' | 'prod'

export interface Environment {
  id: string
  projectId: string
  name: EnvironmentName
  displayName: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ─── Env Vars ─────────────────────────────────────────────────────────────────
export interface EnvVar {
  id: string
  environmentId: string
  key: string
  keyVersion: number
  version: number
  isActive: boolean
  createdAt: string
  createdById: string | null
}

export interface EnvVarRevealed extends EnvVar {
  value: string
}

// ─── Deployments ─────────────────────────────────────────────────────────────
export type DeploymentStatus =
  | 'pending'
  | 'cloning'
  | 'building'
  | 'starting'
  | 'health_check'
  | 'switching'
  | 'success'
  | 'failed'
  | 'rolled_back'

export interface Deployment {
  id: string
  environmentId: string
  status: DeploymentStatus
  branch: string | null
  commitHash: string | null
  commitMessage: string | null
  buildLogs: string | null
  deployLogs: string | null
  errorMessage: string | null
  containerName: string | null
  startedAt: string | null
  completedAt: string | null
  deployedById: string | null
  createdAt: string
}

// ─── Databases ───────────────────────────────────────────────────────────────
export type DatabaseType = 'postgres' | 'redis'

export interface Database {
  id: string
  projectId: string
  type: DatabaseType
  name: string
  containerName: string | null
  host: string | null
  port: number | null
  databaseName: string | null
  username: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ─── Domains ─────────────────────────────────────────────────────────────────
export interface Domain {
  id: string
  environmentId: string
  domain: string
  isActive: boolean
  sslEnabled: boolean
  cloudflareZoneId: string | null
  cloudflareRecordId: string | null
  createdAt: string
  updatedAt: string
}

// ─── Backup ───────────────────────────────────────────────────────────────────
export interface BackupFile {
  name: string
  sizeBytes: number
  createdAt: string
}

// ─── API Error ────────────────────────────────────────────────────────────────
export interface ApiErrorBody {
  message: string
  errors?: Record<string, string[]>
}

// ─── WebSocket Events ─────────────────────────────────────────────────────────
export interface LogLine {
  timestamp: string
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
  source: string
  message: string
  traceId?: string
}

export type WsEvent =
  | { type: 'log.line'; projectId: string; line: LogLine }
  | { type: 'deployment.update'; deploymentId: string; status: DeploymentStatus; step?: string }
  | { type: 'metric.tick'; targetId: string; metric: string; value: number; ts: number }
