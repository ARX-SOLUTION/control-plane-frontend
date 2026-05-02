import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z
    .string()
    .regex(/^[a-z0-9-]{1,255}$/, 'Must be 1–255 lowercase alphanumeric characters or hyphens'),
  displayName: z.string().min(1).max(255),
  githubUrl: z.string().url().optional(),
  branch: z.string().optional().default('main'),
  buildCommand: z.string().optional(),
  startCommand: z.string().optional(),
  healthCheckPath: z.string().optional().default('/'),
  healthCheckInterval: z.number().int().min(10).max(300).optional(),
  appPort: z.number().int().optional().default(3000),
})

export const updateProjectSchema = createProjectSchema.partial()

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
