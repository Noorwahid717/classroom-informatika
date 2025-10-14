"use client";

import { useEffect, useRef, useState } from 'react'

export interface NotificationData {
  type: string
  message: string
  data?: Record<string, unknown>
  timestamp: string
}

export function useSSENotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    // Connect to SSE endpoint
    const connectSSE = () => {
      try {
        const eventSource = new EventSource('/api/notifications/sse')
        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
          console.log('SSE connection opened')
          setIsConnected(true)
        }

        eventSource.onmessage = (event) => {
          try {
            const data: NotificationData = JSON.parse(event.data)
            
            // Skip heartbeat messages from showing as notifications
            if (data.type === 'heartbeat') {
              return
            }

            console.log('Received SSE message:', data)
            
            if (data.type === 'connected') {
              console.log('Connected to real-time notifications')
              return
            }

            // Add new notification
            setNotifications(prev => {
              const newNotifications = [data, ...prev].slice(0, 50) // Keep only last 50
              return newNotifications
            })

            // Increment unread count for new contacts
            if (data.type === 'new_contact') {
              setUnreadCount(prev => prev + 1)
              
              // Show browser notification if permission granted
              if (Notification.permission === 'granted') {
                new Notification('Pesan Baru - GEMA Admin', {
                  body: `${data.data?.name}: ${data.data?.preview}`,
                  icon: '/gema.svg',
                  tag: 'new-contact'
                })
              }
            }
          } catch (error) {
            console.error('Error parsing SSE data:', error)
          }
        }

        eventSource.onerror = (error) => {
          console.error('SSE connection error:', error)
          setIsConnected(false)
          
          // Reconnect after 5 seconds
          setTimeout(() => {
            if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
              connectSSE()
            }
          }, 5000)
        }

      } catch (error) {
        console.error('Failed to connect to SSE:', error)
        setIsConnected(false)
      }
    }

    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }

    connectSSE()

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [])

  const markAsRead = () => {
    setUnreadCount(0)
  }

  const clearNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  return {
    notifications,
    isConnected,
    unreadCount,
    markAsRead,
    clearNotifications
  }
}
