import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { listNotifications, markNotificationRead } from '../../features/notifications/api'

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'ahora'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  return `hace ${Math.floor(hours / 24)} d`
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: listNotifications,
    refetchInterval: 30_000,
  })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleItemClick(id: string, isRead: boolean) {
    if (!isRead) {
      await markNotificationRead(id)
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  }

  const unreadCount = data?.unreadCount ?? 0

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-ink-soft hover:bg-sand/60 hover:text-ink"
      >
        <Bell className="h-4.5 w-4.5" strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay-dark px-1 text-[10px] font-semibold text-cream">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-20 mt-2 w-80 rounded-2xl border border-sand-dark/60 bg-white shadow-premium"
          >
            <div className="border-b border-sand-dark/60 px-4 py-3 text-sm font-medium text-ink">
              Notificaciones
            </div>
            <div className="max-h-80 overflow-y-auto">
              {!data || data.items.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-ink-soft">
                  No hay notificaciones todavía.
                </p>
              ) : (
                data.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id, item.isRead)}
                    className="flex w-full items-start gap-2 border-b border-sand-dark/40 px-4 py-3 text-left text-sm last:border-0 hover:bg-sand/40"
                  >
                    {!item.isRead && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />}
                    <div className={item.isRead ? 'pl-3.5 text-ink-soft' : 'text-ink'}>
                      <p>{item.message}</p>
                      <p className="mt-0.5 text-xs text-ink-soft">{timeAgo(item.createdAt)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
