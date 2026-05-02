import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listBackups, triggerBackup, deleteBackup } from './api'

export function useBackupsQuery() {
  return useQuery({
    queryKey: ['backups'],
    queryFn: listBackups,
  })
}

export function useTriggerBackupMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: triggerBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] })
    },
  })
}

export function useDeleteBackupMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => deleteBackup(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] })
    },
  })
}
