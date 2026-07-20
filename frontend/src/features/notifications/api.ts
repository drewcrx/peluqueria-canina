import { api } from '../../lib/api'

export interface NotificationItem {
  id: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface NotificationsResult {
  unreadCount: number
  items: NotificationItem[]
}

export async function listNotifications(): Promise<NotificationsResult> {
  const { data } = await api.get<NotificationsResult>('/notifications')
  return data
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.post(`/notifications/${id}/read`)
}
