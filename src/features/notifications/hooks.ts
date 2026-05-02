import { useMutation } from '@tanstack/react-query'
import { testNotifications } from './api'

export function useTestNotificationsMutation() {
  return useMutation({
    mutationFn: testNotifications,
  })
}
