import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Trash2, Bell, HardDrive, Shield, RefreshCw } from 'lucide-react'
import { useTestNotificationsMutation } from '@/features/notifications/hooks'
import {
  useBackupsQuery,
  useTriggerBackupMutation,
  useDeleteBackupMutation,
} from '@/features/backup/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { api } from '@/lib/api'
import { formatRelativeTime, formatBytes } from '@/lib/utils'
import type { BackupFile } from '@/types'

// ─── Schemas ─────────────────────────────────────────────────────────────────

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

type ChangePasswordInput = z.infer<typeof changePasswordSchema>

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-fg-muted">{icon}</span>
        <div>
          <h2 className="text-base font-semibold text-fg">{title}</h2>
          <p className="text-sm text-fg-muted">{description}</p>
        </div>
      </div>
      <div className="bg-bg-1 border border-border rounded-lg">{children}</div>
    </section>
  )
}

// ─── Delete backup confirm ────────────────────────────────────────────────────

function DeleteBackupDialog({
  name,
  onConfirm,
  onClose,
  isPending,
}: {
  name: string
  onConfirm: () => void
  onClose: () => void
  isPending: boolean
}) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Backup</DialogTitle>
          <DialogDescription>
            Delete <code className="font-mono text-sm">{name}</code>? This cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" loading={isPending} onClick={onConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  // ── Change password ──
  const {
    register: registerPwd,
    handleSubmit: handlePwdSubmit,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })
  const [pwdPending, setPwdPending] = React.useState(false)

  const onChangePassword = async (data: ChangePasswordInput) => {
    setPwdPending(true)
    try {
      await api('/auth/password', {
        method: 'PUT',
        json: { currentPassword: data.currentPassword, newPassword: data.newPassword },
      })
      toast.success('Password changed successfully')
      resetPwd()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setPwdPending(false)
    }
  }

  // ── Notifications ──
  const { mutate: testNotifications, isPending: testingNotifications } =
    useTestNotificationsMutation()

  const handleTestNotifications = () => {
    testNotifications(undefined, {
      onSuccess: () => toast.success('Test notification sent successfully'),
      onError: (err: unknown) =>
        toast.error(err instanceof Error ? err.message : 'Failed to send test notification'),
    })
  }

  // ── Backups ──
  const { data: backups = [], isLoading: backupsLoading } = useBackupsQuery()
  const { mutate: triggerBackup, isPending: backingUp } = useTriggerBackupMutation()
  const { mutate: deleteBackup, isPending: deletingBackup } = useDeleteBackupMutation()
  const [deleteTarget, setDeleteTarget] = React.useState<BackupFile | null>(null)

  const handleTriggerBackup = () => {
    triggerBackup(undefined, {
      onSuccess: () => toast.success('Backup triggered successfully'),
      onError: (err: unknown) =>
        toast.error(err instanceof Error ? err.message : 'Failed to trigger backup'),
    })
  }

  const handleDeleteBackup = () => {
    if (!deleteTarget) return
    deleteBackup(deleteTarget.name, {
      onSuccess: () => {
        toast.success('Backup deleted')
        setDeleteTarget(null)
      },
      onError: (err: unknown) =>
        toast.error(err instanceof Error ? err.message : 'Failed to delete backup'),
    })
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-fg">Settings</h1>
        <p className="text-sm text-fg-muted">System administration settings</p>
      </div>

      <div className="max-w-2xl space-y-8">
        {/* ── Account ── */}
        <Section
          icon={<Shield className="h-5 w-5" />}
          title="Account"
          description="Manage your admin credentials"
        >
          <form onSubmit={handlePwdSubmit(onChangePassword)} className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                invalid={!!pwdErrors.currentPassword}
                {...registerPwd('currentPassword')}
              />
              {pwdErrors.currentPassword && (
                <p className="text-xs text-danger">{pwdErrors.currentPassword.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                invalid={!!pwdErrors.newPassword}
                {...registerPwd('newPassword')}
              />
              {pwdErrors.newPassword && (
                <p className="text-xs text-danger">{pwdErrors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                invalid={!!pwdErrors.confirmPassword}
                {...registerPwd('confirmPassword')}
              />
              {pwdErrors.confirmPassword && (
                <p className="text-xs text-danger">{pwdErrors.confirmPassword.message}</p>
              )}
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={pwdPending} size="sm">
                Change Password
              </Button>
            </div>
          </form>
        </Section>

        {/* ── Notifications ── */}
        <Section
          icon={<Bell className="h-5 w-5" />}
          title="Notifications"
          description="Test and configure notification channels"
        >
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-fg">Send Test Notification</p>
              <p className="text-xs text-fg-muted mt-0.5">
                Verify your notification channels (email, Slack, etc.) are configured correctly
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTestNotifications}
              loading={testingNotifications}
            >
              <Bell className="h-3.5 w-3.5" />
              Test
            </Button>
          </div>
        </Section>

        {/* ── Backups ── */}
        <Section
          icon={<HardDrive className="h-5 w-5" />}
          title="Backups"
          description="Database and configuration backups"
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-fg">Backup Files</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleTriggerBackup}
                loading={backingUp}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Trigger Backup
              </Button>
            </div>

            {backupsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : backups.length === 0 ? (
              <p className="text-sm text-fg-muted text-center py-6">
                No backups found. Click "Trigger Backup" to create one.
              </p>
            ) : (
              <div className="divide-y divide-border rounded-md border border-border overflow-hidden">
                {backups.map((backup) => (
                  <div
                    key={backup.name}
                    className="flex items-center justify-between px-4 py-2.5 bg-bg-0 hover:bg-bg-2 transition-colors"
                  >
                    <div>
                      <code className="text-xs font-mono text-fg">{backup.name}</code>
                      <p className="text-xs text-fg-subtle mt-0.5">
                        {formatBytes(backup.sizeBytes)} ·{' '}
                        {formatRelativeTime(backup.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(backup)}
                      className="text-danger hover:text-danger"
                      aria-label="Delete backup"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* ── Integrations ── */}
        <Section
          icon={<Shield className="h-5 w-5" />}
          title="Integrations"
          description="Configured external services (read from environment)"
        >
          <div className="p-5 space-y-3">
            {[
              { label: 'Grafana', key: 'GRAFANA_URL', description: 'Metrics dashboard' },
              { label: 'GitHub', key: 'GITHUB_TOKEN', description: 'Repository access for webhooks' },
              { label: 'SMTP', key: 'SMTP_HOST', description: 'Email notifications' },
              { label: 'Slack', key: 'SLACK_WEBHOOK_URL', description: 'Slack notifications' },
              { label: 'Cloudflare', key: 'CLOUDFLARE_API_TOKEN', description: 'DNS automation' },
            ].map((integration) => (
              <div
                key={integration.key}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-fg">{integration.label}</p>
                  <p className="text-xs text-fg-subtle mt-0.5">{integration.description}</p>
                </div>
                <code className="text-xs font-mono bg-bg-2 px-1.5 py-0.5 rounded text-fg-muted">
                  {integration.key}
                </code>
              </div>
            ))}
            <p className="text-xs text-fg-subtle pt-2">
              These integrations are configured via environment variables on the server.
              Refer to the deployment documentation for setup instructions.
            </p>
          </div>
        </Section>
      </div>

      {deleteTarget && (
        <DeleteBackupDialog
          name={deleteTarget.name}
          onConfirm={handleDeleteBackup}
          onClose={() => setDeleteTarget(null)}
          isPending={deletingBackup}
        />
      )}
    </>
  )
}
